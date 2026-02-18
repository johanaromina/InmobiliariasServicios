const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Validation rules
const providerValidation = [
  body('business_name').trim().isLength({ min: 2, max: 255 }).withMessage('Business name must be 2-255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('categories').isArray({ min: 1 }).withMessage('At least one category required'),
  body('categories.*').isIn(['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'cleaning', 'maintenance', 'other']).withMessage('Invalid category'),
  body('service_areas').isArray({ min: 1 }).withMessage('At least one service area required'),
  body('service_areas.*').trim().isLength({ min: 2, max: 100 }).withMessage('Service area must be 2-100 characters'),
  body('hourly_rate').optional().isFloat({ min: 0, max: 999999 }).withMessage('Invalid hourly rate'),
  body('is_available').optional().isBoolean().withMessage('is_available must be boolean')
];

// Get all providers (public endpoint)
router.get('/', [
  query('q').optional().trim().isLength({ min: 2 }).withMessage('Search query too short'),
  query('category').optional().isIn(['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'cleaning', 'maintenance', 'other']).withMessage('Invalid category'),
  query('location').optional().trim().isLength({ min: 2 }).withMessage('Location too short'),
  query('min_rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Invalid min rating'),
  query('max_hourly_rate').optional().isFloat({ min: 0 }).withMessage('Invalid max hourly rate'),
  query('available').optional().isBoolean().withMessage('Available must be boolean'),
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
      q,
      category,
      location,
      min_rating,
      max_hourly_rate,
      available,
      page = 1,
      limit = 20
    } = req.query;

    let whereConditions = ['u.role = "provider"', 'u.active = 1'];
    let queryParams = [];

    // Apply filters
    if (q) {
      whereConditions.push('(p.business_name LIKE ? OR p.description LIKE ? OR u.name LIKE ?)');
      const searchTerm = `%${q}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('JSON_CONTAINS(p.categories, ?)');
      queryParams.push(`"${category}"`);
    }

    if (location) {
      whereConditions.push('JSON_CONTAINS(p.service_areas, ?)');
      queryParams.push(`"${location}"`);
    }

    if (min_rating) {
      whereConditions.push('p.rating >= ?');
      queryParams.push(min_rating);
    }

    if (max_hourly_rate) {
      whereConditions.push('p.hourly_rate <= ?');
      queryParams.push(max_hourly_rate);
    }

    if (available !== undefined) {
      whereConditions.push('p.is_available = ?');
      queryParams.push(available === 'true' ? 1 : 0);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get providers with user data
    const providersQuery = `
      SELECT 
        p.*,
        u.name,
        u.email,
        u.phone,
        u.created_at as user_created_at
      FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.rating DESC, p.total_reviews DESC
      LIMIT ? OFFSET ?
    `;

    const [providers] = await db.execute(providersQuery, [...queryParams, parseInt(limit), offset]);

    // Format response
    const formattedProviders = providers.map(provider => ({
      ...provider,
      categories: JSON.parse(provider.categories || '[]'),
      service_areas: JSON.parse(provider.service_areas || '[]'),
      hourly_rate: provider.hourly_rate ? parseFloat(provider.hourly_rate) : null,
      rating: provider.rating ? parseFloat(provider.rating) : 0,
      user_created_at: new Date(provider.user_created_at).toISOString(),
      created_at: new Date(provider.created_at).toISOString(),
      updated_at: new Date(provider.updated_at).toISOString()
    }));

    res.json({
      providers: formattedProviders,
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
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single provider (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [providers] = await db.execute(`
      SELECT 
        p.*,
        u.name,
        u.email,
        u.phone,
        u.created_at as user_created_at
      FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND u.role = 'provider' AND u.active = 1
    `, [id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const provider = providers[0];

    // Get recent reviews
    const [reviews] = await db.execute(`
      SELECT 
        pr.*,
        u.name as reviewer_name,
        mr.title as request_title
      FROM provider_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN maintenance_requests mr ON pr.request_id = mr.id
      WHERE pr.provider_id = ?
      ORDER BY pr.created_at DESC
      LIMIT 10
    `, [provider.user_id]);

    // Format response
    const formattedProvider = {
      ...provider,
      categories: JSON.parse(provider.categories || '[]'),
      service_areas: JSON.parse(provider.service_areas || '[]'),
      hourly_rate: provider.hourly_rate ? parseFloat(provider.hourly_rate) : null,
      rating: provider.rating ? parseFloat(provider.rating) : 0,
      user_created_at: new Date(provider.user_created_at).toISOString(),
      created_at: new Date(provider.created_at).toISOString(),
      updated_at: new Date(provider.updated_at).toISOString(),
      recent_reviews: reviews.map(review => ({
        ...review,
        created_at: new Date(review.created_at).toISOString()
      }))
    };

    res.json({ provider: formattedProvider });

  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get provider reviews
router.get('/:id/reviews', [
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

    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify provider exists
    const [providers] = await db.execute(`
      SELECT user_id FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND u.role = 'provider' AND u.active = 1
    `, [id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const providerUserId = providers[0].user_id;

    // Count total reviews
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM provider_reviews WHERE provider_id = ?',
      [providerUserId]
    );
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get reviews
    const [reviews] = await db.execute(`
      SELECT 
        pr.*,
        u.name as reviewer_name,
        mr.title as request_title
      FROM provider_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN maintenance_requests mr ON pr.request_id = mr.id
      WHERE pr.provider_id = ?
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `, [providerUserId, parseInt(limit), offset]);

    // Format response
    const formattedReviews = reviews.map(review => ({
      ...review,
      created_at: new Date(review.created_at).toISOString()
    }));

    res.json({
      reviews: formattedReviews,
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
    console.error('Get provider reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update provider profile (authenticated)
router.put('/profile', authenticateToken, providerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update their profile' });
    }

    const {
      business_name,
      description,
      categories,
      service_areas,
      hourly_rate,
      is_available
    } = req.body;

    // Check if provider profile exists
    const [existingProviders] = await db.execute(
      'SELECT id FROM providers WHERE user_id = ?',
      [req.user.id]
    );

    if (existingProviders.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Update provider profile
    await db.execute(`
      UPDATE providers SET
        business_name = ?,
        description = ?,
        categories = ?,
        service_areas = ?,
        hourly_rate = ?,
        is_available = ?
      WHERE user_id = ?
    `, [
      business_name,
      description,
      JSON.stringify(categories),
      JSON.stringify(service_areas),
      hourly_rate,
      is_available,
      req.user.id
    ]);

    // Get updated profile
    const [providers] = await db.execute(`
      SELECT 
        p.*,
        u.name,
        u.email,
        u.phone
      FROM providers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `, [req.user.id]);

    const provider = providers[0];

    // Format response
    const formattedProvider = {
      ...provider,
      categories: JSON.parse(provider.categories || '[]'),
      service_areas: JSON.parse(provider.service_areas || '[]'),
      hourly_rate: provider.hourly_rate ? parseFloat(provider.hourly_rate) : null,
      rating: provider.rating ? parseFloat(provider.rating) : 0,
      created_at: new Date(provider.created_at).toISOString(),
      updated_at: new Date(provider.updated_at).toISOString()
    };

    res.json({
      message: 'Provider profile updated successfully',
      provider: formattedProvider
    });

  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get provider's requests (authenticated)
router.get('/my/requests', authenticateToken, [
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
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

    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can access this endpoint' });
    }

    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions = ['mr.provider_id = ?'];
    let queryParams = [req.user.id];

    if (status) {
      whereConditions.push('mr.status = ?');
      queryParams.push(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM maintenance_requests mr
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get requests
    const requestsQuery = `
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
    console.error('Get provider requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get provider statistics (authenticated)
router.get('/my/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is a provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can access this endpoint' });
    }

    // Get provider profile
    const [providers] = await db.execute(`
      SELECT rating, total_reviews, is_available
      FROM providers
      WHERE user_id = ?
    `, [req.user.id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const provider = providers[0];

    // Get request statistics
    const [requestStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_requests,
        AVG(actual_cost) as avg_cost
      FROM maintenance_requests
      WHERE provider_id = ?
    `, [req.user.id]);

    // Get recent reviews
    const [recentReviews] = await db.execute(`
      SELECT 
        pr.rating,
        pr.comment,
        pr.created_at,
        u.name as reviewer_name,
        mr.title as request_title
      FROM provider_reviews pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN maintenance_requests mr ON pr.request_id = mr.id
      WHERE pr.provider_id = ?
      ORDER BY pr.created_at DESC
      LIMIT 5
    `, [req.user.id]);

    // Get monthly earnings (last 6 months)
    const [monthlyEarnings] = await db.execute(`
      SELECT 
        DATE_FORMAT(completed_date, '%Y-%m') as month,
        COUNT(*) as completed_requests,
        SUM(actual_cost) as total_earnings
      FROM maintenance_requests
      WHERE provider_id = ? 
        AND status = 'completed' 
        AND completed_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(completed_date, '%Y-%m')
      ORDER BY month DESC
    `, [req.user.id]);

    res.json({
      profile: {
        rating: provider.rating ? parseFloat(provider.rating) : 0,
        total_reviews: provider.total_reviews,
        is_available: provider.is_available
      },
      requests: {
        total: requestStats[0].total_requests,
        pending: requestStats[0].pending_requests,
        in_progress: requestStats[0].in_progress_requests,
        completed: requestStats[0].completed_requests,
        cancelled: requestStats[0].cancelled_requests,
        avg_cost: requestStats[0].avg_cost ? parseFloat(requestStats[0].avg_cost) : 0
      },
      recent_reviews: recentReviews.map(review => ({
        ...review,
        created_at: new Date(review.created_at).toISOString()
      })),
      monthly_earnings: monthlyEarnings.map(earning => ({
        ...earning,
        total_earnings: earning.total_earnings ? parseFloat(earning.total_earnings) : 0
      }))
    });

  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
