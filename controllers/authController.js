const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.render('auth/register', { error: 'El correo electrónico ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({ firstName, lastName, email: normalizedEmail, passwordHash });
    res.redirect('/login?registered=true');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', { error: 'Ocurrió un error en el servidor.' });
  }
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
};

exports.getForgotPassword = (req, res) => {
  res.render('auth/forgot_password', { error: null });
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.render('auth/forgot_password', { error: 'El correo electrónico no está registrado.' });
    }
    req.session.resetEmail = normalizedEmail;
    res.redirect('/reset-password');
  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('auth/forgot_password', { error: 'Ocurrió un error en el servidor.' });
  }
};

exports.getResetPassword = (req, res) => {
  if (!req.session.resetEmail) {
    return res.redirect('/forgot-password');
  }
  res.render('auth/reset_password', { email: req.session.resetEmail, error: null });
};

exports.postResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.resetEmail;
  if (!email) {
    return res.redirect('/forgot-password');
  }
  if (password !== confirmPassword) {
    return res.render('auth/reset_password', { email, error: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 6) {
    return res.render('auth/reset_password', { email, error: 'La contraseña debe tener al menos 6 caracteres.' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = await User.findByEmail(email);
    if (!user) {
      req.session.resetEmail = null;
      return res.redirect('/forgot-password');
    }
    
    await User.update(user.id, {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      passwordHash
    });
    
    req.session.resetEmail = null;
    res.redirect('/login?reset=true');
  } catch (error) {
    console.error('Reset password error:', error);
    res.render('auth/reset_password', { email, error: 'Ocurrió un error al restablecer la contraseña.' });
  }
};
