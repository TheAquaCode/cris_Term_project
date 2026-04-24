function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please log in first.');
  res.redirect('/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  next();
}

module.exports = { requireAuth, redirectIfAuth };
