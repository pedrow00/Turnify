
const verificarRol = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const rol = req.headers['rol'];

    if (!rol) {
      return res.status(401).json({ error: 'Rol requerido' });
    }

    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ error: 'No tienes permiso' });
    }

    next();
  };
};

module.exports = { verificarRol };