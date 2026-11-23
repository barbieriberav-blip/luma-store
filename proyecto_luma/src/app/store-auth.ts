import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { currentAuth } from './firebase-client';

export async function storeAuth(
 path: string, method: string, payload: unknown, loadProfile: (registeredName?: string) => Promise<unknown>,
): Promise<unknown> {
 const b = (payload ?? {}) as Record<string, unknown>;
 const auth = currentAuth();
 await auth.authStateReady();
 if(path==='/auth/register'&&method==='POST'){
  const name=String(b.name??'').trim();
  const email=String(b.email??'').trim();
  const password=String(b.password??'');
  if(name.length<2||name.length>80)throw new Error('Ingresa un nombre de entre 2 y 80 caracteres');
  if(password.length<10)throw new Error('La contraseña debe tener al menos 10 caracteres');
  const credential=await createUserWithEmailAndPassword(auth,email,password);
  try{
   await updateProfile(credential.user,{displayName:name});
   return await loadProfile(name);
  }catch{
   await signOut(auth).catch(()=>{});
   throw new Error('Tu cuenta se creó, pero el perfil quedó pendiente. Inicia sesión para completar el acceso.');
  }
 }
 if(path==='/auth/login'&&method==='POST'){
  await signInWithEmailAndPassword(auth,String(b.email??'').trim(),String(b.password??''));
  try{return await loadProfile();}
  catch(error){await signOut(auth).catch(()=>{});throw error;}
 }
 if(path==='/auth/logout'&&method==='POST'){await signOut(auth);return {ok:true};}
 if(path==='/auth/recover'&&method==='POST'){
  try{await sendPasswordResetEmail(auth,String(b.email??'').trim());}
  catch(error){if(!(error instanceof FirebaseError)||error.code!=='auth/user-not-found')throw error;}
  return {message:'Si la cuenta existe, Firebase enviará las instrucciones de recuperación a tu correo.'};
 }
 if(path==='/auth/me'&&method==='GET')return auth.currentUser ? loadProfile() : {user:null};
 throw new Error('Operación de autenticación no disponible.');
}

export function isStoreAuth(path: string, method: string) {
 return method === 'GET' && path === '/auth/me' ||
   method === 'POST' && ['/auth/register','/auth/login','/auth/logout','/auth/recover'].includes(path);
}
