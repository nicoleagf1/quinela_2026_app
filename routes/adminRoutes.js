const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Ensure Admin Middleware
const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/dashboard');
};

router.use(ensureAdmin);

router.get('/dashboard', adminController.getDashboard);
// Future routes:
// router.get('/users', ...);
// router.get('/matches', ...);
// router.get('/metrics', ...);

module.exports = router;
