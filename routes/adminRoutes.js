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
router.get('/users', adminController.getUsers);
router.get('/users/edit/:id', adminController.getUserEdit);
router.post('/users/edit/:id', adminController.postUserEdit);
router.get('/matches', adminController.getMatches);
router.get('/matches/center', adminController.getMatchesCenter);
router.post('/matches/score', adminController.postMatchScore);
router.post('/matches/override-deadline', adminController.postOverrideDeadline);

module.exports = router;
