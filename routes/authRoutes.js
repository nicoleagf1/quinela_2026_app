const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.get('/login', (req, res) => {
  const error = req.session.messages ? req.session.messages[0] : null;
  req.session.messages = [];
  res.render('auth/login', { error });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureMessage: true
}));

router.get('/register', (req, res) => res.render('auth/register', { error: null }));
router.post('/register', authController.register);

router.get('/logout', authController.logout);

module.exports = router;
