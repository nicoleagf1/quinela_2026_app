const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.post('/', ensureAuthenticated, predictionController.submitPrediction);

module.exports = router;
