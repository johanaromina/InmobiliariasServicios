const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ active_properties }]] = await db.execute(
      `SELECT COUNT(*) AS active_properties
       FROM publicaciones p
       WHERE p.estado = 'publicada'`
    );

    const [[{ pending_requests }]] = await db.execute(
      `SELECT COUNT(*) AS pending_requests
       FROM solicitudes_mantenimiento sm
       WHERE sm.estado IN ('pendiente','asignada','en_proceso')`
    );

    const [[{ available_providers }]] = await db.execute(
      `SELECT COUNT(*) AS available_providers
       FROM vista_proveedores vp`
    );

    const [notifications] = await db.execute(
      `SELECT id, tipo AS type, mensaje AS message, leida AS read_flag
       FROM notificaciones
       WHERE usuario_id = ?
       ORDER BY id DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      stats: {
        activeProperties: Number(active_properties) || 0,
        pendingRequests: Number(pending_requests) || 0,
        availableProviders: Number(available_providers) || 0,
      },
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        read: !!n.read_flag,
      })),
    });
  } catch (e) {
    console.error('Dashboard summary error:', e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

