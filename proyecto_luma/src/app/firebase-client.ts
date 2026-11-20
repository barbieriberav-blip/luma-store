import {FirebaseError,initializeApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,type Auth} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,type Firestore} from 'firebase/firestore';
import {firebaseConfig,USE_FIREBASE_EMULATORS} from '../environments/firebase.config';

export const firebaseReady=!Object.values(firebaseConfig).some(v=>v.startsWith('REEMPLAZAR_'));
let auth:Auth|null=null;
let store:Firestore|null=null;
if(firebaseReady){
  const app=initializeApp(firebaseConfig);
  auth=getAuth(app);
  store=getFirestore(app);
  if(USE_FIREBASE_EMULATORS){
    connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});
    connectFirestoreEmulator(store,'127.0.0.1',8080);
  }
}
export function currentAuth():Auth {if(!auth)throw new Error('Configura Firebase en src/environments/firebase.config.ts');return auth;}
export function currentDb():Firestore {if(!store)throw new Error('Configura Firebase en src/environments/firebase.config.ts');return store;}

const firebaseMessages: Partial<Record<string, string>> = {
  'auth/configuration-not-found': 'El servicio de cuentas de LUMA requiere configuración en Firebase.',
  'auth/operation-not-allowed': 'El acceso por correo y contraseña aún no está habilitado.',
  'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
  'auth/invalid-login-credentials': 'El correo o la contraseña son incorrectos.',
  'auth/wrong-password': 'El correo o la contraseña son incorrectos.',
  'auth/user-not-found': 'El correo o la contraseña son incorrectos.',
  'auth/invalid-email': 'Escribe un correo electrónico válido.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.',
  'auth/weak-password': 'La contraseña no cumple los requisitos de seguridad.',
  'auth/too-many-requests': 'Hubo demasiados intentos. Espera unos minutos y vuelve a intentarlo.',
  'auth/network-request-failed': 'No pudimos conectar con Firebase. Revisa tu conexión y vuelve a intentarlo.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'permission-denied': 'No pudimos acceder a estos datos con tu cuenta.',
  'unavailable': 'El servicio no está disponible en este momento. Intenta de nuevo en unos minutos.',
};

export function firebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return firebaseMessages[error.code] ?? 'No pudimos completar la operación. Intenta de nuevo en unos minutos.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error';
}
