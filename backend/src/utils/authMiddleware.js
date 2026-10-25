const pool = require('../config/db');
const { nombreVisible } = require('./identidad');

/**
 * Valida la sesión contra la base en cada request:
 * - si el usuario fue dado de baja, se cierra la sesión;
 * - si un admin le cambió el rol o los datos, se usa lo vigente y no lo del login.
 */
const requireAuth = async (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.activo, u.nombre, u.apellido,
              p.nombre AS profesional_nombre, p.apellido AS profesional_apellido,
              r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id = u.rol_id
         LEFT JOIN profesionales p ON p.id = u.profesional_id
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
    const nombreCompleto = nombreVisible(usuario);
    if (
      rol !== sessionUser.rol ||
      usuario.email !== sessionUser.email ||
      nombreCompleto !== sessionUser.nombre_completo
    ) {
      req.session.user = {
        id: usuario.id,
        email: usuario.email,
        rol,
        nombre_completo: nombreCompleto,
      };
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
