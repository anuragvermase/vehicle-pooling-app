export const requireRole = (...roles) => (req, res, next) => {
  try {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};
