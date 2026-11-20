# 06. Documento de API (Firebase Callable)

**Cambio respecto de la versión anterior:** este proyecto NO despliega un servidor REST Express. Utiliza una función HTTPS callable `lumaApi` de segunda generación en `us-central1`, con los parámetros `{path, method, body}`. El SDK de Firebase adjunta automáticamente el token de autenticación cuando hay sesión. El primer argumento es un sobre con ruta y método; no se trata de URLs REST públicas.

## Operaciones del contrato

| Método y ruta del sobre | Acceso | Resultado o efecto |
|---|---|---|
| GET /products | público | Productos activos con stock y categoría |
| GET /categories | público | Categorías activas |
| GET /auth/me | sesión opcional | Perfil con rol; `null` si no hay sesión |
| POST /auth/profile | cliente | Actualizar nombre propio |
| GET /account | cliente | Favoritos y últimas direcciones simuladas |
| POST/DELETE /wishlist/{id} | cliente | Guardar o retirar favorito |
| POST /coupons/validate | público | Previsualización; no autoriza el total final |
| POST /orders | cliente | Pedido simulado y movimiento de inventario en transacción |
| GET /orders | cliente | Solo pedidos del usuario identificado |
| GET /returns | cliente | Solo devoluciones propias |
| POST /returns | cliente | Solicitud vinculada a pedido propio |
| POST /contact | público con límite | Crear folio de atención |
| GET /admin/overview | admin | Reportes, clientes y operación completa |
| POST /admin/seed | admin | Cargar catálogo de 24 productos una sola vez |
| POST /admin/products | admin | Crear producto |
| PATCH /admin/products/{id} | admin | Actualizar producto y auditar stock |
| DELETE /admin/products/{id} | admin | Baja lógica |
| POST /admin/categories | admin | Nueva categoría |
| PATCH /admin/orders/{id} | admin | Estado o guía |
| PATCH /admin/returns/{id} | admin | Decisión/reembolso de prueba |
| POST /admin/coupons | admin | Crear cupón |
| PATCH /admin/coupons/{id} | admin | Activar/desactivar cupón |
| PATCH /admin/tickets/{id} | admin | Estado de atención |
| GET /admin/export/orders | admin | Filas para construir un CSV en navegador |

Autenticación y registro emplean directamente `firebase/auth` (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `sendPasswordResetEmail`) y no forman parte del callable.

## Ejemplo de invocación de la compra

```ts
import {httpsCallable} from 'firebase/functions';
const send = httpsCallable(getFunctions(app,'us-central1'),'lumaApi');
const result = await send({
  method:'POST', path:'/orders',
  body:{items:[{productId:1,size:'M',quantity:1}],address:{/* datos */},
  shippingType:'estandar',termsAccepted:true,payment:'simulado',
  idempotencyKey:crypto.randomUUID()}
});
```

## Errores y seguridad
La función puede responder `invalid-argument`, `unauthenticated`, `permission-denied`, `not-found`, `resource-exhausted` o `internal`. Todos los precios y estados se verifican del lado servidor. No envíes números de tarjeta, contraseñas ni objetos de perfil con rol arbitrario. Prueba los escenarios de 403, cantidades excesivas y reintentos en Firebase real o emuladores.
