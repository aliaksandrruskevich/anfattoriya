require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const url = process.env.DATABASE_URL;
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  const [, user, password, host, port, database] = m;
  const c = await mysql.createConnection({ user, password, host, port: Number(port), database });

  const adminEmail = 'anfattoriya@gmail.com';
  const adminPlainPassword = 'AdminFattoria2026!'; // <-- поменяй на свой пароль
  const hash = await bcrypt.hash(adminPlainPassword, 10);

  const [rows] = await c.execute('SELECT id FROM agents WHERE LOWER(email) = LOWER(?)', [adminEmail]);

  if (rows.length > 0) {
    await c.execute(
      'UPDATE agents SET password = ?, isAdmin = 1, isApproved = 1, hasLeadsAccess = 1 WHERE LOWER(email) = LOWER(?)',
      [hash, adminEmail]
    );
    console.log('Админ обновлен:', adminEmail);
  } else {
    const id = 'admin-' + Date.now();
    await c.execute(
      `INSERT INTO agents
        (id, name, photo, role, phone, specialization, password, email,
         isAdmin, isApproved, hasLeadsAccess, firstName, lastName, agencyName, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?, ?, ?, ?)`,
      [
        id,
        'Главный Администратор',
        '/photo/logo.svg',
        'Администратор системы',
        '+375 29 000-00-00',
        'all',
        hash,
        adminEmail,
        'Админ',
        'Системы',
        'ООО «АН Фаттория»',
        'Администратор системы «АН Фаттория»'
      ]
    );
    console.log('Админ создан:', adminEmail, 'id =', id);
  }

  await c.end();
  console.log('Готово. Пароль:', adminPlainPassword);
})();
