import fs from 'node:fs';
const read = file => fs.readFileSync(file,'utf8');
for (const file of ['firebase.json','firestore.rules','src/environments/firebase.config.ts','src/app/spark-api.ts']) {
  if (!fs.existsSync(file)) { console.error('✗ Falta',file); process.exit(1); }
}
const cfg = read('src/environments/firebase.config.ts');
const found = cfg.match(/"projectId"\s*:\s*"([^"]+)"/) || cfg.match(/projectId\s*:\s*'([^']+)'/);
if (!found || found[1].startsWith('REEMPLAZAR')) {
  console.error('✗ Firebase no está vinculado. Ejecuta VINCULAR_FIREBASE_WINDOWS.bat');
  process.exit(1);
}
if (!/\bUSE_FIREBASE_EMULATORS\s*=\s*false\b/.test(cfg)) {
  console.error('✗ Desactiva los emuladores en firebase.config.ts antes de publicar.');
  process.exit(1);
}
if (!fs.existsSync('.firebaserc')) {
  console.error('✗ Falta seleccionar el proyecto Firebase con firebase.cmd use --add');
  process.exit(1);
}
let linked;
try { linked = JSON.parse(read('.firebaserc')).projects?.default; }
catch { console.error('✗ .firebaserc no es JSON válido'); process.exit(1); }
if (!linked || linked !== found[1]) {
  console.error('✗ El proyecto seleccionado en Firebase CLI no coincide con el proyecto del SDK Web.');
  console.error('  CLI:', linked || '(sin alias default)', '  SDK:', found[1]);
  console.error('  Ejecuta firebase.cmd use --add y vuelve a obtener apps:sdkconfig WEB.');
  process.exit(1);
}
const hosting = JSON.parse(read('firebase.json'));
if (!hosting.hosting || !hosting.firestore || 'functions' in hosting) {
  console.error('✗ El proyecto no está configurado para Spark sin Functions');process.exit(1);
}
const rules = read('firestore.rules');
if (!rules.includes('adminUsers') || !rules.includes('allow read,write: if false')) {
  console.error('✗ Revisa las reglas de Firestore');process.exit(1);
}
console.log('✔ Configuración local de Firebase:', found[1]);
console.log('✔ Hosting clásico + Firestore, SIN Cloud Functions');
console.log('✔ Archivo de reglas presente');
console.log('IMPORTANTE: la conexión y permisos reales se comprueban tras desplegar y probar en la consola Firebase.');
