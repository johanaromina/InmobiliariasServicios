const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const propertyValidation = [
  body('title').trim().isLength({ min: 5, max: 255 }).withMessage('Title must be 5-255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('address').trim().isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  body('state').trim().isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters'),
  body('zip_code').optional().trim().isLength({ max: 20 }).withMessage('Zip code too long'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('property_type').isIn(['apartment', 'house', 'office', 'commercial', 'land']).withMessage('Invalid property type'),
  body('bedrooms').optional().isInt({ min: 0, max: 20 }).withMessage('Invalid bedrooms count'),
  body('bathrooms').optional().isInt({ min: 0, max: 20 }).withMessage('Invalid bathrooms count'),
  body('area_sqm').optional().isFloat({ min: 0, max: 10000 }).withMessage('Invalid area'),
  body('price').optional().isFloat({ min: 0, max: 999999999 }).withMessage('Invalid price'),
  body('status').optional().isIn(['available', 'rented', 'maintenance', 'sold']).withMessage('Invalid status'),
  body('published').optional().isBoolean().withMessage('Published must be boolean')
];

// Get all properties (with filters)
router.get('/', [
  query('mine').optional().isBoolean().withMessage('Mine must be boolean'),
  query('city').optional().trim().isLength({ min: 2 }).withMessage('City filter too short'),
  query('property_type').optional().isIn(['apartment', 'house', 'office', 'commercial', 'land']).withMessage('Invalid property type'),
  query('status').optional().isIn(['available', 'rented', 'maintenance', 'sold']).withMessage('Invalid status'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Invalid min price'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Invalid max price'),
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
      mine = false,
      city,
      property_type,
      status,
      min_price,
      max_price,
      page = 1,
      limit = 20
    } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Filter by user's properties if mine=true
    if (mine === 'true' || mine === true) {
      whereConditions.push('vi.propietario_id = ?');
      queryParams.push(req.user.id);
    }

    // Apply filters
    if (city) {
      whereConditions.push('vi.ciudad LIKE ?');
      queryParams.push(`%${city}%`);
    }

    if (property_type) {
      whereConditions.push('vi.tipo = ?');
      queryParams.push(property_type);
    }

    if (status) {
      whereConditions.push('vi.estado = ?');
      queryParams.push(status);
    }

    if (min_price) {
      whereConditions.push('p.precio >= ?');
      queryParams.push(min_price);
    }

    if (max_price) {
      whereConditions.push('p.precio <= ?');
      queryParams.push(max_price);
    }

    // Only show published properties for non-owners
    if (mine !== 'true' && mine !== true) {
      whereConditions.push('p.estado = "publicada"');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM vista_inmuebles vi
      LEFT JOIN publicaciones p ON vi.id = p.inmueble_id
      ${whereClause}
    `;
    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get properties with images
    const propertiesQuery = `
      SELECT 
        vi.*,
        u_prop.nombre as owner_name,
        u_prop.email as owner_email,
        u_prop.telefono as owner_phone,
        p.precio,
        p.moneda,
        p.tipo as tipo_publicacion,
        GROUP_CONCAT(ii.url) as images
      FROM vista_inmuebles vi
      LEFT JOIN usuarios u_prop ON vi.propietario_id = u_prop.id
      LEFT JOIN inmuebles_imagenes ii ON vi.id = ii.inmueble_id
      LEFT JOIN publicaciones p ON vi.id = p.inmueble_id
      ${whereClause}
      GROUP BY vi.id
      ORDER BY vi.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [properties] = await db.execute(propertiesQuery, [...queryParams, parseInt(limit), offset]);

    // Format images
    const formattedProperties = properties.map(property => ({
      ...property,
      images: property.images ? property.images.split(',') : [],
      price: property.precio ? parseFloat(property.precio) : null,
      area_sqm: property.superficie_m2 ? parseFloat(property.superficie_m2) : null,
      latitude: property.lat ? parseFloat(property.lat) : null,
      longitude: property.lng ? parseFloat(property.lng) : null,
      property_type: property.tipo,
      bedrooms: property.ambientes,
      bathrooms: property.banos,
      city: property.ciudad,
      state: property.provincia,
      address: property.direccion_completa
    }));

    res.json({
      properties: formattedProperties,
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
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [properties] = await db.execute(`
      SELECT 
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone,
        GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = properties[0];

    // Check if user can view this property
    if (property.user_id !== req.user.id && !property.published) {
      return res.status(403).json({ message: 'Property not available' });
    }

    // Format response
    const formattedProperty = {
      ...property,
      images: property.images ? property.images.split(',') : [],
      price: property.price ? parseFloat(property.price) : null,
      area_sqm: property.area_sqm ? parseFloat(property.area_sqm) : null,
      latitude: property.latitude ? parseFloat(property.latitude) : null,
      longitude: property.longitude ? parseFloat(property.longitude) : null
    };

    res.json({ property: formattedProperty });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create property
router.post('/', propertyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      property_type,
      bedrooms = 0,
      bathrooms = 0,
      area_sqm,
      price,
      status = 'available',
      published = false
    } = req.body;

    const [result] = await db.execute(`
      INSERT INTO properties (
        user_id, title, description, address, city, state, zip_code,
        latitude, longitude, property_type, bedrooms, bathrooms,
        area_sqm, price, status, published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, title, description, address, city, state, zip_code,
      latitude, longitude, property_type, bedrooms, bathrooms,
      area_sqm, price, status, published
    ]);

    const propertyId = result.insertId;

    // Get created property
    const [properties] = await db.execute(`
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [propertyId]);

    res.status(201).json({
      message: 'Property created successfully',
      property: properties[0]
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update property
router.put('/:id', propertyValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;

    // Check if property exists and belongs to user
    const [existingProperties] = await db.execute(
      'SELECT id FROM properties WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingProperties.length === 0) {
      return res.status(404).json({ message: 'Property not found or access denied' });
    }

    const {
      title,
      description,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      property_type,
      bedrooms,
      bathrooms,
      area_sqm,
      price,
      status,
      published
    } = req.body;

    await db.execute(`
      UPDATE properties SET
        title = ?, description = ?, address = ?, city = ?, state = ?, zip_code = ?,
        latitude = ?, longitude = ?, property_type = ?, bedrooms = ?, bathrooms = ?,
        area_sqm = ?, price = ?, status = ?, published = ?
      WHERE id = ?
    `, [
      title, description, address, city, state, zip_code,
      latitude, longitude, property_type, bedrooms, bathrooms,
      area_sqm, price, status, published, id
    ]);

    // Get updated property
    const [properties] = await db.execute(`
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM properties p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      message: 'Property updated successfully',
      property: properties[0]
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and belongs to user
    const [existingProperties] = await db.execute(
      'SELECT id FROM properties WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingProperties.length === 0) {
      return res.status(404).json({ message: 'Property not found or access denied' });
    }

    // Check if property has active maintenance requests
    const [activeRequests] = await db.execute(
      'SELECT id FROM maintenance_requests WHERE property_id = ? AND status IN ("pending", "in_progress")',
      [id]
    );

    if (activeRequests.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with active maintenance requests' 
      });
    }

    await db.execute('DELETE FROM properties WHERE id = ?', [id]);

    res.json({ message: 'Property deleted successfully' });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add property image
router.post('/:id/images', [
  body('image_url').isURL().withMessage('Valid image URL required'),
  body('is_primary').optional().isBoolean().withMessage('is_primary must be boolean')
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
    const { image_url, is_primary = false } = req.body;

    // Check if property exists and belongs to user
    const [existingProperties] = await db.execute(
      'SELECT id FROM properties WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingProperties.length === 0) {
      return res.status(404).json({ message: 'Property not found or access denied' });
    }

    // If setting as primary, unset other primary images
    if (is_primary) {
      await db.execute(
        'UPDATE property_images SET is_primary = 0 WHERE property_id = ?',
        [id]
      );
    }

    const [result] = await db.execute(
      'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
      [id, image_url, is_primary]
    );

    res.status(201).json({
      message: 'Image added successfully',
      image: {
        id: result.insertId,
        property_id: id,
        image_url,
        is_primary
      }
    });

  } catch (error) {
    console.error('Add image error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
