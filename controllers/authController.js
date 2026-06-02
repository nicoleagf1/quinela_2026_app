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
