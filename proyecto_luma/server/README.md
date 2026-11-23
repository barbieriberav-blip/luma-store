# LUMA STORE con PostgreSQL

En esta edición, Angular muestra la tienda, Firebase Authentication identifica al usuario y la API Express registra la operación en PostgreSQL. Las cuentas de cliente y administración se prueban con datos ficticios. El catálogo inicial tiene 24 productos en 10 categorías y tres vistas ilustrativas por producto.

## Instalación local en Windows

Se necesita Git, Node.js 24 y PostgreSQL 17 o posterior. Docker Desktop es opcional y puede iniciar PostgreSQL mediante el archivo `compose.yaml`.

Desde `proyecto_luma` en PowerShell:

```powershell
npm.cmd ci
npm.cmd ci --prefix server
Copy-Item .\server\.env.example .\server\.env
```

Abre `server/.env` y ajusta `DATABASE_URL` y `POSTGRES_PASSWORD`. Para usar una instalación existente, crea una base vacía llamada `luma_store` y asigna su propiedad a la cuenta que figura en `DATABASE_URL`. Si vas a usar Docker, conserva el usuario `luma`, escribe la misma contraseña en ambos campos y ejecuta:

```powershell
docker compose --env-file .\server\.env -f .\server\compose.yaml up -d
```

Cuando PostgreSQL esté disponible, ejecuta `npm.cmd --prefix server run db:setup`. El comando aplica las migraciones y carga el catálogo inicial una vez. Repítelo si vienes de una edición anterior de PostgreSQL para incorporar la galería. La actualización agrega imágenes a los productos de muestra que conservan su foto original.

Abre tres terminales en `proyecto_luma`, una por servicio:

| Terminal | Comando |
|---|---|
| Auth de prueba | `npx.cmd --yes firebase-tools emulators:start --only auth --project demo-luma-sql --config firebase.postgres.json` |
| API | `npm.cmd --prefix server start` |
| Angular | `npm.cmd run dev:postgres:demo -- --port 4201` |

Abre [LUMA en local](http://localhost:4201/). Comprueba [el estado de la API](http://localhost:4201/api/health). El proxy de Angular envía `/api` a la API local. El emulador de autenticación usa el puerto 9099.

## Comprar y administrar

1. Registra dos cuentas ficticias desde la tienda, una de cliente y otra de administración. Inicia sesión con cada cuenta al menos una vez para crear su perfil en PostgreSQL.
2. Abre [Authentication del emulador](http://localhost:4000/auth), copia el UID de la cuenta administradora y ejecuta `npm.cmd --prefix server run admin -- UID_DE_FIREBASE`. Cierra y vuelve a iniciar esa sesión para ver el Panel.
3. Selecciona un producto con talla M. Como administradora, abre **Panel → Productos → Editar** y deja 8 piezas en el campo **Stock talla M**. Usa dos ventanas o perfiles de navegador para mantener las sesiones separadas.
4. Desde la cuenta cliente, agrega 2 piezas talla M, introduce datos ficticios de entrega, selecciona recolección y confirma. Copia el folio.
5. En el Panel, verifica el folio en **Pedidos** y la salida de 2 piezas en **Resumen → Movimientos de inventario**. En **Productos** el stock de la talla M queda en 6.
6. En **Pedidos**, el flujo es simulado → preparando → enviado → entregado. Puedes cancelar antes del envío. El cliente también puede solicitar cancelación antes de ese punto o devolución/garantía al recibir el pedido. Aprobar una solicitud y ejecutar su reembolso académico devuelve al stock todas las partidas del pedido una sola vez. Esta edición modela la devolución total de un pedido.

## Verificación, API y datos

- Con PostgreSQL y el emulador iniciados, ejecuta `npm.cmd --prefix server test`. La prueba crea un esquema PostgreSQL aislado y cuentas ficticias en el emulador. Verifica la compra, permisos, precios del servidor, idempotencia, rechazo por falta de stock, concurrencia, cupones, movimientos, reembolso y categorías.
- [Contrato OpenAPI](openapi.json) contiene las rutas HTTP y un ejemplo de pedido. Los formularios de acceso y registro usan Firebase Authentication. La API valida el ID token y asigna los permisos administrativos a partir del UID registrado en SQL.
- [Modelo de datos y continuidad](../docs/15_POSTGRES_OPERACION.md) incluye el diagrama relacional, consultas de verificación y el procedimiento de respaldo y restauración.

## Entrega académica

[Manual de compra](../docs/02_MANUAL_COMPRADOR.md) · [Manual del panel](../docs/03_MANUAL_ADMIN.md) · [Matriz de requisitos](../docs/08_REQUISITOS_Y_BACKLOG.md) · [Guion de exposición](../docs/13_PRESENTACION_Y_EVIDENCIAS.md) · [Matriz normativa](../docs/10_MARCO_LEGAL_Y_POLITICAS.md) · [Resultados y capturas](../docs/16_POSTGRES_EVIDENCIAS.md)

## Usar el proyecto Firebase existente

Para conservar las cuentas del proyecto `luma-store-cda1a` en una instalación local, ejecuta `VINCULAR_FIREBASE_WINDOWS.bat`, usa el proyecto real en `FIREBASE_PROJECT_ID`, quita `FIREBASE_AUTH_EMULATOR_HOST` de `server/.env` e inicia Angular con `npm.cmd run dev:postgres -- --port 4201`. La API valida los tokens de ese proyecto Firebase. Asigna el rol administrador en SQL después de iniciar sesión por primera vez. Las compras y los perfiles anteriores de Firestore requieren una migración si deseas incorporarlos.

Para un despliegue público de esta edición, aloja la API de Node.js y PostgreSQL junto a un proxy HTTPS que dirija `/api` a Node.js. Publica en esa infraestructura el resultado de `npm.cmd run build:postgres`. Configura la conexión, el proyecto Firebase real y los orígenes del proyecto antes de habilitar registros públicos. El emulador es para pruebas locales y la configuración para él se rechaza al arrancar la API en producción. La publicación estática que usa Firebase Hosting sigue disponible mediante el comando de compilación estándar.
