const bcrypt = require('bcrypt');
const User = require('../models/User');

async function seedAdmin() {
  try {
    const email = 'admin@vepagos.com';
    const password = 'S1stemas3031*.';
    
    console.log('Buscando usuario admin existente...');
    const existingAdmin = await User.findByEmail(email);
    
    if (existingAdmin) {
       console.log('El usuario admin ya existe, actualizando su contraseña y rol...');
       const salt = await bcrypt.genSalt(10);
       const passwordHash = await bcrypt.hash(password, salt);
       
       // Using the update method or raw query for password
       const db = require('../config/db');
       await db.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [passwordHash, 'admin', email]);
       console.log('Admin actualizado con éxito.');
    } else {
       console.log('Creando nuevo usuario admin...');
       const salt = await bcrypt.genSalt(10);
       const passwordHash = await bcrypt.hash(password, salt);
       
       await User.create({
         firstName: 'Admin',
         lastName: 'VEPAGOS',
         email: email,
         passwordHash: passwordHash,
         role: 'admin'
       });
       console.log('Admin creado con éxito.');
    }
  } catch (error) {
    console.error('Error al poblar usuario admin:', error);
  }
}

seedAdmin();
