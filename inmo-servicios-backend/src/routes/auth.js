const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').optional().isIn(['administrador', 'propietario', 'inquilino', 'proveedor']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, name, phone, role = 'inquilino' } = req.body;
    const safePhone = phone ?? null;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Get role ID
    const [roles] = await db.execute(
      'SELECT id FROM roles WHERE nombre = ?',
      [role]
    );

    if (roles.length === 0) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const roleId = roles[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, telefono, hash_password, rol_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, safePhone, hashedPassword, roleId]
    );

    const userId = result.insertId;

    // If provider, create provider profile
    if (role === 'proveedor') {
      await db.execute(
        'INSERT INTO proveedores_perfil (usuario_id, bio) VALUES (?, ?)',
        [userId, 'Nuevo proveedor']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Get user data
    const [users] = await db.execute(
      'SELECT u.id, u.email, u.nombre as name, u.telefono as phone, r.nombre as role, u.created_at FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: users[0]
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT u.id, u.email, u.hash_password, u.nombre as name, u.telefono as phone, r.nombre as role, u.estado FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (user.estado !== 'activo') {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hash_password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    delete user.hash_password;

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await db.execute(
      'SELECT u.id, u.email, u.nombre as name, u.telefono as phone, r.nombre as role, u.created_at \n       FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id \n       WHERE u.id = ? AND (u.estado = ? OR u.estado IS NULL)',
      [decoded.userId, 'activo']
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone } = req.body;

    await db.execute(
      'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
      [name, phone, decoded.userId]
    );

    // Get updated user
    const [users] = await db.execute(
      'SELECT u.id, u.email, u.nombre as name, u.telefono as phone, r.nombre as role, u.created_at \n       FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.id = ?',
      [decoded.userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    // Get current password
    const [users] = await db.execute(
      'SELECT hash_password FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].hash_password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.execute(
      'UPDATE usuarios SET hash_password = ? WHERE id = ?',
      [hashedNewPassword, decoded.userId]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
