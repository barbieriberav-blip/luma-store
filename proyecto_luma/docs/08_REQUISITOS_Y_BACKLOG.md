# 08. Requisitos y evidencias de LUMA STORE

LUMA STORE simula un comercio B2C de ropa y accesorios. Esta matriz corresponde a la edición académica con Angular, Express, PostgreSQL y Firebase Authentication, instalada en local según la [guía de instalación](01_GUIA_INSTALACION.md).

## Requisitos funcionales

| ID | Funcionalidad | Evidencia |
|---|---|---|
| RF-01 | Consultar catálogo, buscar y filtrar por categoría, disponibilidad y precio | [Catálogo de 24 productos](capturas-postgres/01-catalogo.webp) y casos de [aceptación](16_POSTGRES_EVIDENCIAS.md) |
| RF-02 | Ver la ficha, variante, material, existencias e imágenes | [Galería](capturas-postgres/02-galeria.webp), [migración](../server/migrations/002_product_gallery.sql) y API-08 |
| RF-03 | Agregar, editar y quitar artículos, y consultar el subtotal | [Carrito](capturas-postgres/03-carrito.webp) y [manual comprador](02_MANUAL_COMPRADOR.md) |
| RF-04 | Registrar una cuenta, iniciar y cerrar sesión | API-01, UI-01 y UI-04 del [registro de evidencias](16_POSTGRES_EVIDENCIAS.md) |
| RF-05 | Confirmar un pedido con entrega, aceptación de términos y pago simulado | [Checkout](capturas-postgres/04-checkout.webp), [folio](capturas-postgres/05-folio.webp) y API-02 |
| RF-06 | Calcular importes en servidor y proteger inventario ante sobreventa o reintentos | [Contrato de API](../server/openapi.json) y casos API-02 a API-04 |
| RF-07 | Consultar pedidos propios, estado y guía cuando esté registrada | [Manual comprador](02_MANUAL_COMPRADOR.md), API-05 y UI-01 |
| RF-08 | Solicitar cancelación, devolución o garantía y seguir la resolución | [Devolución resuelta](capturas-postgres/08-devolucion.webp), API-06 y UI-02 |
| RF-09 | Administrar categorías, catálogo, variantes, existencias y promociones | [Manual de administración](03_MANUAL_ADMIN.md), API-07 y API-08 |
| RF-10 | Administrar pedidos, revisar clientes, movimientos y reportes | [Panel](capturas-postgres/07-panel-pedido.webp), [movimiento](capturas-postgres/06-movimiento.webp), API-07 y UI-01 |
| RF-11 | Consultar políticas antes de comprar y disponer de un canal de atención de prueba | [Matriz legal](10_MARCO_LEGAL_Y_POLITICAS.md) y [aviso de privacidad](capturas-postgres/09-privacidad.webp) |

## Requisitos de calidad y documentación

| ID | Requisito | Evidencia o estado |
|---|---|---|
| RNF-01 | Interfaz adaptable con teclado, foco visible y textos alternativos | UI-03 y UI-04 del [registro de evidencias](16_POSTGRES_EVIDENCIAS.md) |
| RNF-02 | Probar con personas y registrar hallazgos de uso | [Protocolo de cinco tareas](17_PRUEBA_USABILIDAD.md). Sesión pendiente |
| RNF-03 | Disponibilidad, respaldo y recuperación | [Plan de continuidad](14_CONTINUIDAD_Y_RESPALDOS.md), [operación de PostgreSQL](15_POSTGRES_OPERACION.md) y BD-01 |
| RNF-04 | Control de acceso por rol, validación en servidor y protección de datos | API-02 a API-05, [arquitectura](05_ARQUITECTURA.md) y [plan de pruebas](11_PLAN_PRUEBAS.md) |
| RNF-05 | Modelo relacional, migraciones e instalación reproducible | [Modelo y diccionario](04_BASE_DE_DATOS.md), [migraciones](../server/migrations) y [manual técnico](../server/README.md) |
| RNF-06 | Identidad visual, alcance del negocio y recursos del catálogo | [Análisis del negocio](07_ANALISIS_NEGOCIO.md), [diseño](09_DISENO_UX_UI.md) y [ficha técnica](12_FICHA_TECNICA.md) |
| RNF-07 | Medición de rendimiento en navegador | Consulta el [registro de evidencias](16_POSTGRES_EVIDENCIAS.md) |
| RNF-08 | Reproducir la compra y administración durante la defensa | [Guion de exposición](13_PRESENTACION_Y_EVIDENCIAS.md) y [manual de administración](03_MANUAL_ADMIN.md) |

## Backlog de cierre

1. Realizar la sesión de usabilidad con una persona ajena al desarrollo y documentar hallazgos.
2. Verificar la recuperación de contraseña en el entorno de autenticación que se vaya a presentar.
3. Si se elige presentar esta edición en una URL pública, desplegar la API por HTTPS, conectar PostgreSQL y repetir las pruebas de compra, roles y restauración en ese entorno.
