# 11. Plan de pruebas, seguridad y estado de evidencias

## Pruebas automatizadas disponibles
Los seis casos unitarios de `functions/tests/business.test.mjs` verifican costo del envío estándar, gratuidad por umbral, descuento porcentual, agrupación de líneas duplicadas, rechazo de cantidad excedida y validación de código postal. Ejecutar `npm.cmd test`.

## Casos de aceptación pendientes de ejecución integrada

| ID | Prueba | Resultado esperado | Estado de evidencia |
|---|---|---|---|
| E2E-01 | Registrar usuario | Aparece en Firebase Auth; perfil cliente | Pendiente de prueba en proyecto real |
| E2E-02 | Buscar y filtrar producto | Encuentra el producto por categoría o texto | Pendiente de navegador |
| E2E-03 | Modificar carrito | Cantidades y subtotal actualizados | Pendiente de navegador |
| E2E-04 | Comprar más stock del permitido | Cloud Function rechaza operación | Pendiente de Firebase |
| E2E-05 | Comprar con envío y pago de prueba | Folio, pedido y stock descontado | Pendiente de Firebase |
| E2E-06 | Enviar dos veces la misma llave | Se conserva un solo pedido | Pendiente de Firebase |
| E2E-07 | Abrir panel sin rol admin | Error de permiso de backend | Pendiente de Firebase |
| E2E-08 | Cancelar pedido pagado | Se devuelve stock una sola vez | Pendiente de Firebase |
| E2E-09 | Solicitar y revisar devolución | Cambia estado y registra auditoría | Pendiente de Firebase |
| E2E-10 | Recuperación de contraseña | Firebase envía correo al propietario | Pendiente de correo de prueba |
| E2E-11 | Diseño en 360px y teclado | Control usable sin desbordamiento | Pendiente de inspección |
| E2E-12 | Restauración Firestore | Recupera registros consistentes | Pendiente de infraestructura |

**No se deben marcar como aprobadas pruebas que aún no se han ejecutado.** Registrar fecha, entorno, capturas, resultado obtenido, desviaciones y correcciones.

## Revisión de seguridad
Inspeccionar funciones de autenticación, roles, reglas de Firestore, protección ante modificación de precio, inyección, XSS, peticiones excesivas, idempotencia y registros sin información sensible. Para exposición pública se recomienda habilitar App Check, monitoreo, presupuestos y revisiones periódicas de dependencias.
