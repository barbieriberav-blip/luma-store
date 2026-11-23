import { database } from './db.mjs';

const uid = process.argv[2]?.trim();
if (!uid || uid.length > 128) throw new Error('Uso: npm run admin -- UID_DE_FIREBASE');
const pool = database();
try {
  await pool.query('INSERT INTO admins (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [uid]);
  console.log('Permiso registrado para el UID indicado. Vuelve a iniciar sesión en Luma.');
} finally {
  await pool.end();
}
