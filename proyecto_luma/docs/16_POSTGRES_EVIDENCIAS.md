# Evidencias de LUMA con PostgreSQL

**Entorno de verificación:** PostgreSQL 18.7, Node.js 24, Firebase Authentication Emulator y Angular, ejecutados en local. Se usaron cuentas y direcciones ficticias. Firebase Hosting corresponde a la edición Spark.

| ID | Caso y precondición | Resultado obtenido | Evidencia reproducible |
|---|---|---|---|
| API-01 | Crear cuenta y acceder con correo y contraseña mediante el emulador | Perfil registrado en PostgreSQL y sesión reconocida por la API | `npm --prefix server test` |
| API-02 | Existencia inicial de 8 en talla M. Comprar 2 piezas y enviar un importe incorrecto | Total calculado con el precio de la base, 6 piezas restantes, mismo folio en el panel y movimiento de −2 | `npm --prefix server test` y consultas de la guía relacional |
| API-03 | Con 6 piezas, pedir 7 e intentar dos pedidos simultáneos de 5 | El pedido de 7 y uno de los concurrentes se rechazan. El stock no queda negativo | `npm --prefix server test` |
| API-04 | Repetir la compra con la misma clave y editar un stock que cambió mientras el editor estaba abierto | Se conserva el folio, se evita duplicar la salida y el ajuste desactualizado se rechaza | `npm --prefix server test` |
| API-05 | Entrar al panel como cliente, consultar pedidos de otra cuenta y probar un token inválido | Panel denegado, ningún pedido ajeno devuelto y token rechazado | `npm --prefix server test` |
| API-06 | Entregar un pedido, resolver una garantía y repetir el reembolso. Cancelar otro pedido antes de enviarlo | Se devuelve el inventario una vez por pedido. El cliente ve el estado de su solicitud | `npm --prefix server test` |
| API-07 | Usar un cupón, gestionar categorías y consultar el reporte | Uso, descuento, altas, edición, baja y filas del reporte registrados | `npm --prefix server test` |
| API-08 | Cargar las galerías del catálogo y editar una como administrador | Los 24 productos tienen tres imágenes iniciales. Se verificó el orden de las imágenes, el rechazo de URL duplicadas y la edición restringida a administración | `npm --prefix server test` y [contrato de la API](../server/openapi.json) |
| BD-01 | Exportar una base con un pedido y restaurar en una base nueva | Coincidieron los datos de pedidos, partidas, movimientos, 78 variantes, pagos y usuarios | Procedimiento con `pg_dump` y `pg_restore` en [Modelo y continuidad](15_POSTGRES_OPERACION.md) |
| UI-01 | Registrar una cuenta en Chromium, abrir un producto y comprar dos piezas en talla M | El historial mostró el folio. En otra sesión, administración encontró el mismo pedido y el movimiento de −2. PostgreSQL registró el cambio de 8 a 6 piezas | [Galería](capturas-postgres/02-galeria.webp), [carrito](capturas-postgres/03-carrito.webp), [checkout](capturas-postgres/04-checkout.webp), [folio](capturas-postgres/05-folio.webp), [movimiento](capturas-postgres/06-movimiento.webp) y [panel](capturas-postgres/07-panel-pedido.webp) |
| UI-02 | Marcar el pedido como entregado, solicitar devolución desde la cuenta compradora y resolverla en el panel de Chromium | La clienta vio el estado reembolsado y PostgreSQL volvió a registrar 8 piezas | [Devolución resuelta](capturas-postgres/08-devolucion.webp) |
| UI-03 | Abrir la ficha con teclado, recorrer miniaturas con las flechas y cerrar con Esc | El foco quedó dentro del diálogo mientras estaba abierto y regresó al control de la ficha al cerrarlo. La revisión de Chromium con axe aplicó reglas WCAG 2.0 y 2.1 de nivel A y AA sin hallar infracciones en catálogo, galería y checkout | [Galería en escritorio](capturas-postgres/02-galeria.webp) y casos del [plan de pruebas](11_PLAN_PRUEBAS.md) |
| UI-04 | Revisar Chromium a 360 × 800 y 768 × 1024 px. Registrar y comprar una unidad en Firefox | La galería abrió en móvil y tableta sin desbordamiento horizontal. En Firefox se verificó la galería con teclado y se comprobó que la compra restó una unidad | [Móvil Chromium](capturas-postgres/11-celular.webp), [tableta Chromium](capturas-postgres/10-tableta.webp) y [tableta Firefox](capturas-postgres/12-firefox-tableta.webp) |
| UI-05 | Buscar «Satinada Alba», filtrar por Tops y usar precio máximo de $500. Agregar dos piezas, sumar, restar y quitar la línea | La búsqueda encontró una ficha, el precio la excluyó y al limpiar filtros volvieron los 24 productos. La bolsa pasó de dos unidades a tres, volvió a dos y quedó vacía al eliminar | [Catálogo](capturas-postgres/01-catalogo.webp), [carrito](capturas-postgres/03-carrito.webp) y pasos del [manual de compra](02_MANUAL_COMPRADOR.md) |
| UI-06 | Abrir el aviso de privacidad desde el sitio y recorrer las políticas | Se abrieron privacidad, envíos, cancelaciones y devoluciones, garantías y términos | [Aviso de privacidad](capturas-postgres/09-privacidad.webp) y [matriz normativa](10_MARCO_LEGAL_Y_POLITICAS.md) |
| BUILD-01 | Instalar dependencias desde el archivo de bloqueo y compilar | Compilaciones de Angular para Spark y PostgreSQL de demostración completadas | `npm ci`, `npm run build` y `npm run build -- --configuration postgres-demo` |

## Medición local de rendimiento

Tres navegaciones en Chromium de escritorio (1280 × 900), con la compilación `postgres-demo`, API y base locales, caché de red desactivada y recursos de terceros excluidos. Para repetir, usa las marcas de navegación de `performance.getEntriesByType('navigation')`, mide cuándo aparece la primera tarjeta y cronometra desde la apertura de la ficha hasta que la foto seleccionada termina de decodificarse. Los tiempos describen este entorno de demostración.

| Indicador | Ejecución 1 | Ejecución 2 | Ejecución 3 | Mediana |
|---|---:|---:|---:|---:|
| DOM listo | 152 ms | 173 ms | 287 ms | 173 ms |
| Primera tarjeta lista | 375 ms | 703 ms | 565 ms | 565 ms |
| Ficha abierta y foto decodificada | 264 ms | 194 ms | 262 ms | 262 ms |

## Evaluación con una persona independiente

La sesión sigue pendiente. El [protocolo de usabilidad](17_PRUEBA_USABILIDAD.md) incluye tareas, criterios de éxito y la hoja de registro. La revisión automatizada de accesibilidad se limitó a las tres pantallas indicadas.
