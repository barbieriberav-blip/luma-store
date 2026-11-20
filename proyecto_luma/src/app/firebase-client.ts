import {initializeApp} from 'firebase/app';
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
