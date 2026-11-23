import { currentAuth } from './firebase-client';
import { isStoreAuth, storeAuth } from './store-auth';

async function apiRequest<T>(path: string, method: string, body?: unknown): Promise<T> {
  const publicCatalog = method === 'GET' && ['/products','/categories'].includes(path);
  const headers = new Headers({ Accept: 'application/json' });
  if (!publicCatalog) {
    const auth = currentAuth();
    await auth.authStateReady();
    if (!auth.currentUser) throw new Error('Inicia sesión para continuar.');
    headers.set('Authorization', 'Bearer ' + await auth.currentUser.getIdToken());
  }
  if (body !== undefined) headers.set('Content-Type','application/json');

  let response: Response;
  try {
    response = await fetch('/api' + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error('La API de LUMA no responde. Comprueba que el servidor está iniciado.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    throw new Error(data?.message ?? 'La API de LUMA no respondió correctamente.');
  }
  return data as T;
}

export async function postgresRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  if (isStoreAuth(path,method)) {
    return await storeAuth(path,method,body,name=>name
      ? apiRequest('/auth/profile','POST',{name})
      : apiRequest('/auth/me','GET')) as T;
  }
  return apiRequest<T>(path,method,body);
}
