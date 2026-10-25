const pool = require('../config/db');

/**
 * Valida la sesión contra la base en cada request:
 * - si el usuario fue dado de baja, se cierra la sesión;
 * - si un admin le cambió el rol, se usa el rol vigente y no el del login.
 */
const requireAuth = async (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.activo, r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
        WHERE u.id = $1`,
      [sessionUser.id]
    );
    const usuario = result.rows[0];

    if (!usuario) {
      req.session.destroy(() =>
        res.status(401).json({ error: 'No autenticado' })
      );
      return;
    }

    if (!usuario.activo) {
      req.session.destroy(() =>
        res.status(403).json({ error: 'Tu cuenta está desactivada' })
      );
      return;
    }

    const rol = usuario.rol.toLowerCase();
    if (rol !== sessionUser.rol || usuario.email !== sessionUser.email) {
      req.session.user = { id: usuario.id, email: usuario.email, rol };
    }

    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (rolesPermitidos = []) => (req, res, next) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  if (!rolesPermitidos.includes(user.rol)) {
    return res.status(403).json({ error: 'No tenés permiso' });
  }
  next();
};

module.exports = { requireAuth, requireRole };
