# Evidencias de LUMA con PostgreSQL

**Entorno de verificación:** PostgreSQL 18.7, Node.js 24, Firebase Authentication Emulator y Angular. Las cuentas y direcciones de las pruebas son ficticias. El sitio de Firebase Hosting corresponde a la edición Spark.

| ID | Caso y precondición | Resultado obtenido | Evidencia reproducible |
|---|---|---|---|
| API-01 | Crear cuenta y acceder con correo y contraseña mediante el emulador | Perfil registrado en PostgreSQL y sesión reconocida por la API | `npm --prefix server test` |
| API-02 | Existencia inicial de 8 en talla M. Comprar 2 piezas y enviar un importe incorrecto | Total calculado con el precio de la base, 6 piezas restantes, mismo folio en el panel y movimiento de −2 | `npm --prefix server test` y consultas de la guía relacional |
| API-03 | Con 6 piezas, pedir 7 e intentar dos pedidos simultáneos de 5 | El pedido de 7 y uno de los concurrentes se rechazan. El stock no queda negativo | `npm --prefix server test` |
| API-04 | Repetir la compra con la misma clave y editar un stock que cambió mientras el editor estaba abierto | Se conserva el folio, se evita duplicar la salida y el ajuste desactualizado se rechaza | `npm --prefix server test` |
| API-05 | Entrar al panel como cliente, consultar pedidos de otra cuenta y probar un token inválido | Panel denegado, ningún pedido ajeno devuelto y token rechazado | `npm --prefix server test` |
| API-06 | Entregar un pedido, resolver una garantía y repetir el reembolso. Cancelar otro pedido antes de enviarlo | Se devuelve el inventario una vez por pedido. El cliente ve el estado de su solicitud | `npm --prefix server test` |
| API-07 | Usar un cupón, gestionar categorías y consultar el reporte | Uso, descuento, altas, edición, baja y filas del reporte registrados | `npm --prefix server test` |
| BD-01 | Exportar una base con un pedido y restaurar en una base nueva | Coincidieron los datos de pedidos, partidas, movimientos, 78 variantes, pagos y usuarios | Procedimiento con `pg_dump` y `pg_restore` en [Modelo y continuidad](15_POSTGRES_OPERACION.md) |
| UI-01 | Abrir la app local en Chromium, registrar una cuenta y completar el checkout | Catálogo paginado, pedido con folio, historial y reducción por talla verificados | Pasos de [la guía de operación](../server/README.md) |
| BUILD-01 | Instalar dependencias desde el archivo de bloqueo y compilar | Compilaciones de Angular para Spark y PostgreSQL de demostración completadas | `npm ci`, `npm run build` y `npm run build -- --configuration postgres-demo` |

## Evidencias pendientes de la rúbrica

La verificación de este módulo se hizo en local. Quedan por documentar la operación en un segundo navegador y tableta, la evaluación completa de accesibilidad y usabilidad con participantes, las capturas numeradas de los manuales y la galería con varias fotografías por producto. Los documentos académicos previos conservan sus alcances originales. Para instalar y demostrar esta edición, usa las guías enlazadas en `server/README.md`.
