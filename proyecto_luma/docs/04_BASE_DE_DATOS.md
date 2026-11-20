# 04. Base de datos documental: Cloud Firestore

## Justificación de diseño
La nueva arquitectura sustituye SQLite por Firestore, una base de datos de documentos NoSQL administrada. Los recursos principales se agrupan en colecciones. En este caso no puede afirmarse una normalización relacional hasta 3FN: Firestore utiliza incrustación de datos y documentos inmutables para el historial comercial. La integridad lógica es responsabilidad de las Cloud Functions y sus transacciones.

## Colecciones y campos esenciales

| Colección | Documento | Campos relevantes |
|---|---|---|
| users | UID de Firebase Authentication | id, email, name, role, wishlist, created_at |
| categories | ID numérico como cadena | id, name, slug, active |
| products | ID numérico como cadena | id, sku, name, category_id, category, price, stock, sizes, image, active |
| orders | ID numérico como cadena | id, folio, user_id, items snapshot, subtotal, discount, shipping, total, status, address |
| order_keys | UID + idempotencyKey | user_id, order_id, created_at |
| payments | mismo ID del pedido | order_id, reference simulada, amount, status |
| returns | ID numérico como cadena | id, folio, order_id, user_id, reason, status, resolution |
| coupons | código de cupón | percent, minimum, max_uses, used, active |
| inventory_movements | ID automático | product_id, delta, reason, actor_id, reference, created_at |
| audit_logs | ID automático | actor_id, action, entity, entity_id, details, created_at |
| contact_tickets | ID numérico como cadena | name, email, message, status, folio |
| contact_limits | hash de IP | count, reset; control simple de abuso |

## Transacción de compra
La función `createOrder` obtiene documentos de productos y cupón, valida tallas, cantidades y existencia, calcula subtotal/descuento/envío/total y verifica la llave idempotente. Dentro de una **transacción Firestore** se crea el pedido y el pago de prueba, se descuenta inventario, se incrementa uso de cupón, y se registran movimientos y auditoría. Si algo falla, la transacción no se confirma.

## Seguridad de datos
`firestore.rules` niega todas las lecturas y escrituras directas desde clientes. Solo Functions, mediante Admin SDK y token de autenticación Firebase, aplica las reglas de negocio. Evita crear reglas públicas `allow read,write: if true`.

## Respaldo
El respaldo/restauración real de Firestore requiere configurar exportaciones administradas o herramientas soportadas por Firebase/Google Cloud y sus permisos/costos. No se incluye evidencia de restauración real en este ZIP; documenta y demuestra esa prueba antes de la entrega final.
