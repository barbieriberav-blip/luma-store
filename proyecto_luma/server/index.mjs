import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createApp } from './app.mjs';
import { database } from './db.mjs';

const { FIREBASE_PROJECT_ID:projectId, FIREBASE_AUTH_EMULATOR_HOST:emulator, NODE_ENV, HOST } = process.env;
const host=HOST || '127.0.0.1';
if (!projectId) throw new Error('Define FIREBASE_PROJECT_ID en server/.env');
if (emulator && (!projectId.startsWith('demo-') || NODE_ENV === 'production' || host !== '127.0.0.1')) {
  throw new Error('El emulador de Authentication requiere un proyecto demo y una API local.');
}
const auth=getAuth(initializeApp({projectId}));
const pool=database();
await pool.query('SELECT 1 FROM schema_migrations LIMIT 1');
const port=Number(process.env.PORT || 3000);
const server=createApp(pool,token=>auth.verifyIdToken(token)).listen(port,host,()=>{
  console.log(`API LUMA en http://${host}:${port}/api/health`);
});
for (const signal of ['SIGINT','SIGTERM']) {
  process.once(signal,()=>server.close(()=>pool.end()));
}
