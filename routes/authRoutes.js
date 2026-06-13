const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.get('/login', (req, res) => {
  const error = req.session.messages ? req.session.messages[0] : null;
  req.session.messages = [];
  const success = req.query.reset === 'true' ? 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.' : (req.query.registered === 'true' ? 'Registro exitoso. Inicia sesión.' : null);
  res.render('auth/login', { error, success });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureMessage: true
}));

router.get('/register', (req, res) => res.render('auth/register', { error: null }));
router.post('/register', authController.register);

router.get('/logout', authController.logout);

// Forgot Password routes
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

module.exports = router;
