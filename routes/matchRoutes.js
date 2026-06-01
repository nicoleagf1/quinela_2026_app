const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/', ensureAuthenticated, matchController.getMatches);

module.exports = router;
