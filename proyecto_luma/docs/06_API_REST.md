# API REST de LUMA

La base URL de la demostración es `http://localhost:4201/api`. Consulta formatos, rutas y ejemplos en [OpenAPI](../server/openapi.json).

| Operación | Ejemplo de ruta | Acceso |
|---|---|---|
| Salud y catálogo | `GET /health`, `GET /products` | Público |
| Cuenta y favoritos | `GET /auth/me`, `GET /account`, `POST /wishlist/{id}` | Cliente |
| Pedido | `POST /orders/quote`, `POST /orders`, `GET /orders` | Cliente |
| Devolución | `POST /returns`, `GET /returns` | Cliente |
| Administración de catálogo | `PATCH /admin/products/{id}`, `POST /admin/categories` | Administración |
| Panel y movimientos | `GET /admin/overview` | Administración |
| Gestión de pedido y devolución | `PATCH /admin/orders/{id}`, `PATCH /admin/returns/{id}` | Administración |

Las rutas autenticadas reciben un token de Firebase en `Authorization: Bearer …`. Los perfiles y el rol de administración se verifican en la API. La operación de compra se identifica con `idempotencyKey`, devuelve el folio y confirma el stock en PostgreSQL antes de actualizar las existencias.
