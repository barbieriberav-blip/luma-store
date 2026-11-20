// Obtén estos valores en Firebase Console > Configuración del proyecto > Tus apps > Web.
// Los identificadores del SDK web NO son credenciales de administrador ni secretos.
// Nunca pegues aquí una llave privada de cuenta de servicio.
export const firebaseConfig = {
  apiKey: 'REEMPLAZAR_API_KEY',
  authDomain: 'REEMPLAZAR_AUTH_DOMAIN',
  projectId: 'REEMPLAZAR_PROJECT_ID',
  storageBucket: 'REEMPLAZAR_STORAGE_BUCKET',
  messagingSenderId: 'REEMPLAZAR_SENDER_ID',
  appId: 'REEMPLAZAR_APP_ID'
};
// Activa solo para desarrollo con 'firebase emulators:start'. Nunca desplegar en true.
export const USE_FIREBASE_EMULATORS = false;
