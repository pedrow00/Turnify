const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
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