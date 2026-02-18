const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const requestValidation = [
  body('property_id').isInt({ min: 1 }).withMessage('Valid property ID required'),
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category').isIn(['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'cleaning', 'other']).withMessage('Invalid category'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('estimated_cost').optional().isFloat({ min: 0, max: 999999 }).withMessage('Invalid estimated cost')
];

const statusUpdateValidation = [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('actual_cost').optional().isFloat({ min: 0, max: 999999 }).withMessage('Invalid actual cost'),
  body('provider_id').optional().isInt({ min: 1 }).withMessage('Valid provider ID required'),
  body('scheduled_date').optional().isISO8601().withMessage('Valid scheduled date required'),
  body('completed_date').optional().isISO8601().withMessage('Valid completed date required')
];

// Get all maintenance requests (with filters)
router.get('/', [
  query('property_id').optional().isInt({ min: 1 }).withMessage('Valid property ID required'),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('category').optional().isIn(['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'cleaning', 'other']).withMessage('Invalid category'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      property_id,
      status,
      category,
      priority,
      page = 1,
      limit = 20
    } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Filter by user's requests or properties they manage
    if (req.user.role === 'tenant') {
      whereConditions.push('mr.user_id = ?');
      queryParams.push(req.user.id);
    } else if (req.user.role === 'property_manager') {
      whereConditions.push('(mr.user_id = ? OR p.user_id = ?)');
      queryParams.push(req.user.id, req.user.id);
    }
    // Admin can see all requests

    // Apply filters
    if (property_id) {
      whereConditions.push('mr.property_id = ?');
      queryParams.push(property_id);
    }

    if (status) {
      whereConditions.push('mr.status = ?');
      queryParams.push(status);
    }

    if (category) {
      whereConditions.push('mr.category = ?');
      queryParams.push(category);
    }

    if (priority) {
      whereConditions.push('mr.priority = ?');
      queryParams.push(priority);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get requests with related data
    const requestsQuery = `
      SELECT 
        mr.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        u.name as requester_name,
        u.email as requester_email,
        u.phone as requester_phone,
        provider.name as provider_name,
        provider.email as provider_email,
        provider.phone as provider_phone
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN users u ON mr.user_id = u.id
      LEFT JOIN users provider ON mr.provider_id = provider.id
      ${whereClause}
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [requests] = await db.execute(requestsQuery, [...queryParams, parseInt(limit), offset]);

    // Format response
    const formattedRequests = requests.map(request => ({
      ...request,
      estimated_cost: request.estimated_cost ? parseFloat(request.estimated_cost) : null,
      actual_cost: request.actual_cost ? parseFloat(request.actual_cost) : null,
      scheduled_date: request.scheduled_date ? new Date(request.scheduled_date).toISOString() : null,
      completed_date: request.completed_date ? new Date(request.completed_date).toISOString() : null,
      created_at: new Date(request.created_at).toISOString(),
      updated_at: new Date(request.updated_at).toISOString()
    }));

    res.json({
      requests: formattedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single request
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await db.execute(`
      SELECT 
        mr.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        u.name as requester_name,
        u.email as requester_email,
        u.phone as requester_phone,
        provider.name as provider_name,
        provider.email as provider_email,
        provider.phone as provider_phone
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN users u ON mr.user_id = u.id
      LEFT JOIN users provider ON mr.provider_id = provider.id
      WHERE mr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    // Check permissions
    if (req.user.role === 'tenant' && request.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'property_manager' && request.user_id !== req.user.id && request.property_user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Format response
    const formattedRequest = {
      ...request,
      estimated_cost: request.estimated_cost ? parseFloat(request.estimated_cost) : null,
      actual_cost: request.actual_cost ? parseFloat(request.actual_cost) : null,
      scheduled_date: request.scheduled_date ? new Date(request.scheduled_date).toISOString() : null,
      completed_date: request.completed_date ? new Date(request.completed_date).toISOString() : null,
      created_at: new Date(request.created_at).toISOString(),
      updated_at: new Date(request.updated_at).toISOString()
    };

    res.json({ request: formattedRequest });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create maintenance request
router.post('/', requestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      property_id,
      title,
      description,
      category,
      priority = 'medium',
      estimated_cost
    } = req.body;

    // Verify property exists and user has access
    const [properties] = await db.execute(`
      SELECT p.id, p.user_id, p.title as property_title, p.address
      FROM properties p
      WHERE p.id = ?
    `, [property_id]);

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = properties[0];

    // Check permissions
    if (req.user.role === 'tenant' && property.user_id !== req.user.id) {
      // Tenant can only create requests for properties they rent
      // For now, allow any tenant to create requests (you might want to add a rental relationship table)
    }
    if (req.user.role === 'property_manager' && property.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this property' });
    }

    const [result] = await db.execute(`
      INSERT INTO maintenance_requests (
        property_id, user_id, title, description, category, priority, estimated_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [property_id, req.user.id, title, description, category, priority, estimated_cost]);

    const requestId = result.insertId;

    // Get created request with related data
    const [requests] = await db.execute(`
      SELECT 
        mr.*,
        p.title as property_title,
        p.address as property_address,
        p.city as property_city,
        u.name as requester_name,
        u.email as requester_email,
        u.phone as requester_phone
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN users u ON mr.user_id = u.id
      WHERE mr.id = ?
    `, [requestId]);

    // Create notification for property owner
    await db.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      property.user_id,
      'Nueva solicitud de mantenimiento',
      `Se ha creado una nueva solicitud de mantenimiento para ${property.title}`,
      'info',
      'request',
      requestId
    ]);

    res.status(201).json({
      message: 'Maintenance request created successfully',
      request: requests[0]
    });

  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update request status (for property managers and providers)
router.patch('/:id/status', statusUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { status, actual_cost, provider_id, scheduled_date, completed_date } = req.body;

    // Get current request
    const [requests] = await db.execute(`
      SELECT mr.*, p.user_id as property_owner_id
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      WHERE mr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    // Check permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      req.user.role === 'property_manager' && request.property_owner_id === req.user.id ||
      req.user.role === 'provider' && request.provider_id === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare update data
    const updateFields = ['status = ?'];
    const updateParams = [status];

    if (actual_cost !== undefined) {
      updateFields.push('actual_cost = ?');
      updateParams.push(actual_cost);
    }

    if (provider_id !== undefined) {
      updateFields.push('provider_id = ?');
      updateParams.push(provider_id);
    }

    if (scheduled_date !== undefined) {
      updateFields.push('scheduled_date = ?');
      updateParams.push(scheduled_date);
    }

    if (completed_date !== undefined) {
      updateFields.push('completed_date = ?');
      updateParams.push(completed_date);
    }

    updateParams.push(id);

    await db.execute(`
      UPDATE maintenance_requests 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateParams);

    // Get updated request
    const [updatedRequests] = await db.execute(`
      SELECT 
        mr.*,
        p.title as property_title,
        p.address as property_address,
        u.name as requester_name,
        provider.name as provider_name
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN users u ON mr.user_id = u.id
      LEFT JOIN users provider ON mr.provider_id = provider.id
      WHERE mr.id = ?
    `, [id]);

    // Create notification for requester
    await db.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      request.user_id,
      'Solicitud de mantenimiento actualizada',
      `Tu solicitud "${request.title}" ha sido actualizada a estado: ${status}`,
      'info',
      'request',
      id
    ]);

    res.json({
      message: 'Request status updated successfully',
      request: updatedRequests[0]
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign provider to request
router.patch('/:id/assign', [
  body('provider_id').isInt({ min: 1 }).withMessage('Valid provider ID required'),
  body('scheduled_date').optional().isISO8601().withMessage('Valid scheduled date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { provider_id, scheduled_date } = req.body;

    // Get current request
    const [requests] = await db.execute(`
      SELECT mr.*, p.user_id as property_owner_id
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      WHERE mr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    // Check permissions (only property managers and admins can assign)
    if (req.user.role !== 'admin' && req.user.role !== 'property_manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'property_manager' && request.property_owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this property' });
    }

    // Verify provider exists and is available
    const [providers] = await db.execute(`
      SELECT u.id, u.name, p.is_available, p.business_name
      FROM users u
      LEFT JOIN providers p ON u.id = p.user_id
      WHERE u.id = ? AND u.role = 'provider' AND u.active = 1
    `, [provider_id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider not found or not available' });
    }

    const provider = providers[0];
    if (!provider.is_available) {
      return res.status(400).json({ message: 'Provider is not available' });
    }

    // Update request
    await db.execute(`
      UPDATE maintenance_requests 
      SET provider_id = ?, scheduled_date = ?, status = 'in_progress'
      WHERE id = ?
    `, [provider_id, scheduled_date, id]);

    // Get updated request
    const [updatedRequests] = await db.execute(`
      SELECT 
        mr.*,
        p.title as property_title,
        u.name as requester_name,
        provider.name as provider_name
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      LEFT JOIN users u ON mr.user_id = u.id
      LEFT JOIN users provider ON mr.provider_id = provider.id
      WHERE mr.id = ?
    `, [id]);

    // Create notifications
    await db.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      request.user_id,
      'Proveedor asignado',
      `Se ha asignado un proveedor a tu solicitud "${request.title}"`,
      'info',
      'request',
      id
    ]);

    await db.execute(`
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      provider_id,
      'Nueva solicitud asignada',
      `Se te ha asignado una nueva solicitud de mantenimiento`,
      'info',
      'request',
      id
    ]);

    res.json({
      message: 'Provider assigned successfully',
      request: updatedRequests[0]
    });

  } catch (error) {
    console.error('Assign provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete request (only by requester or property manager)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current request
    const [requests] = await db.execute(`
      SELECT mr.*, p.user_id as property_owner_id
      FROM maintenance_requests mr
      LEFT JOIN properties p ON mr.property_id = p.id
      WHERE mr.id = ?
    `, [id]);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    // Check permissions
    const canDelete = 
      req.user.role === 'admin' ||
      req.user.role === 'property_manager' && request.property_owner_id === req.user.id ||
      req.user.role === 'tenant' && request.user_id === req.user.id;

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Can only delete pending requests' 
      });
    }

    await db.execute('DELETE FROM maintenance_requests WHERE id = ?', [id]);

    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
