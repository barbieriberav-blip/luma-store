# Guion de exposición de LUMA STORE

Duración prevista de **12 a 15 minutos**, más preguntas. Abre dos perfiles o ventanas de navegador con cuentas ficticias de clienta y administración. Confirma antes de exponer que [http://localhost:4201/api/health](http://localhost:4201/api/health) responde y deja 8 piezas talla M de **Blusa Satinada Alba**.

| Tiempo | Qué mostrar | Qué explicar |
|---|---|---|
| 0:00–2:00 | Portada y catálogo. Busca la blusa y abre tres vistas. | LUMA es un prototipo B2C. Muestra talle, precio y disponibilidad en la ficha. |
| 2:00–5:00 | Selecciona talla M y dos unidades. Abre el carrito, elige recolección, revisa el total y confirma. | El pago es simulado. La API vuelve a calcular el total y registra el pedido con su folio. |
| 5:00–7:00 | En el panel muestra el mismo folio, la salida de −2 y las 6 piezas restantes. | Una transacción conserva juntos el pedido y el movimiento de inventario. |
| 7:00–8:30 | Intenta aumentar la cantidad a 7. Muestra cómo protege las existencias. | Con 6 piezas disponibles la interfaz evita la cantidad excedida. La prueba de integración verifica también el rechazo en la API. |
| 8:30–10:30 | Pasa el pedido por Preparando, Enviado y Entregado. Como clienta envía una solicitud. Como admin aprueba y reembolsa la prueba. | La devolución total tiene folio y devuelve dos unidades una vez. |
| 10:30–12:30 | Muestra ficha técnica, tablas, OpenAPI y evidencia de restauración. | Angular consulta la API Express. Firebase autentica y PostgreSQL conserva datos, reglas e inventario. |
| 12:30–14:30 | Abre términos, privacidad y matriz normativa. Resume compatibilidad y accesibilidad. | Los importes y políticas corresponden a la demo académica. Explica qué se requeriría para operar comercialmente. |

## Evidencias rápidas

[1. Catálogo](capturas-postgres/01-catalogo.webp) · [2. Galería](capturas-postgres/02-galeria.webp) · [3. Carrito](capturas-postgres/03-carrito.webp) · [4. Checkout](capturas-postgres/04-checkout.webp) · [5. Folio](capturas-postgres/05-folio.webp) · [6. Movimiento](capturas-postgres/06-movimiento.webp) · [7. Panel](capturas-postgres/07-panel-pedido.webp) · [8. Devolución](capturas-postgres/08-devolucion.webp)

[Manual de compra](02_MANUAL_COMPRADOR.md) · [Manual del panel](03_MANUAL_ADMIN.md) · [Matriz de requisitos](08_REQUISITOS_Y_BACKLOG.md) · [Matriz normativa](10_MARCO_LEGAL_Y_POLITICAS.md) · [Instalación reproducible](../server/README.md)

## Preguntas para la defensa

- **¿Cómo se evita la sobreventa?** La API bloquea las filas de inventario implicadas dentro de la transacción y comprueba el stock antes del descuento.
- **¿Qué protege el panel?** La API valida la identidad de Firebase y consulta si el UID tiene rol de administración en PostgreSQL.
- **¿Qué pasa ante un reintento?** Una clave idempotente por cliente permite devolver el mismo pedido y folio.
- **¿Qué ocurre si se pierde la base?** Se restaura una copia en una base nueva y se comparan pedidos, partidas, variantes, pagos y movimientos.
