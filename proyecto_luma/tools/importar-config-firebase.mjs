/**
 * Importa configuración pública de SDK Web exportada por Firebase CLI.
 * NO usar llaves privadas, tokens de acceso ni cuentas de servicio.
 * Uso: node tools/importar-config-firebase.mjs firebase-js-config.json
 */
import fs from 'node:fs';
import path from 'node:path';

const input = path.resolve(process.argv[2] || 'firebase-js-config.json');
const output = path.resolve('src/environments/firebase.config.ts');

if (!fs.existsSync(input)) {
  console.error('No se encontró:', input);
  process.exit(1);
}
let raw;
try {
  raw = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch {
  console.error('No es un JSON válido. Usa: firebase.cmd apps:sdkconfig WEB --out firebase-js-config.json');
  process.exit(1);
}
const config = raw.firebaseConfig && typeof raw.firebaseConfig === 'object' ? raw.firebaseConfig : raw;
const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
const missing = required.filter(k => typeof config[k] !== 'string' || config[k].trim().length === 0);
if (missing.length) {
  console.error('Faltan campos del SDK Web:', missing.join(', '));
  process.exit(1);
}
if (!/^[a-z0-9-]+$/.test(config.projectId)) {
  console.error('El projectId no tiene el formato esperado.');
  process.exit(1);
}
const safe = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket || '',
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};
const ts = `/** Firebase Web SDK: configuración pública. No incluyas claves de servicio. */\n` +
  `export const firebaseConfig = ${JSON.stringify(safe, null, 2)};\n` +
  `// Nunca habilitar emuladores en una versión publicada.\n` +
  `export const USE_FIREBASE_EMULATORS = false;\n`;
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, ts, 'utf8');
console.log('✔ LUMA STORE vinculada localmente al proyecto Firebase:', safe.projectId);
console.log('✔ Configuración Web SDK guardada en src/environments/firebase.config.ts');
console.log('Siguiente paso: npm.cmd install && npm.cmd run build');
