# Base de datos relacional de LUMA

La edición PostgreSQL utiliza claves primarias, claves foráneas, restricciones e índices. El historial de un pedido conserva los valores vendidos para que un cambio posterior del catálogo no altere el pedido.

- [Diagrama, diccionario y consultas](15_POSTGRES_OPERACION.md).
- [Migración inicial](../server/migrations/001_store.sql) y [migración de la galería](../server/migrations/002_product_gallery.sql).
- [Carga inicial](../server/setup.mjs) y [vistas de muestra por SKU](../server/gallery-seed.json).
- [Respaldo y restauración comprobados](16_POSTGRES_EVIDENCIAS.md).

El administrador técnico aplica migraciones y semilla con `npm.cmd --prefix server run db:setup`. La carga inicial se registra en `schema_migrations` para conservar los datos operativos al repetir el comando.
