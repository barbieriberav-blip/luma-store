# 08. Requisitos y backlog (Firebase)

## Identificación
LUMA STORE es un comercio electrónico B2C simulado de ropa y accesorios para mujer. El frontend Angular consulta una función `lumaApi` desplegada en Firebase, que accede a Firestore y verifica roles de Firebase Authentication. El alcance no incluye cobro bancario real ni logística física.

## Requisitos funcionales

| ID | Funcionalidad | Verificación |
|---|---|---|
| RF-01 | Catálogo con 15+ productos y tres o más categorías | Semilla con 24 productos y 10 categorías |
| RF-02 | Buscar y filtrar | Búsqueda, categoría, stock y precio visibles |
| RF-03 | Ver detalle con talla, precio y existencias | Modal de producto |
| RF-04 | Carrito editable y subtotal | Modificar cantidad, eliminar línea |
| RF-05 | Registro y login mediante Firebase Authentication | Sesión persistente |
| RF-06 | Checkout de simulación con domicilio y términos | Folio único de pedido |
| RF-07 | Cálculo de totales exclusivamente en Cloud Functions | Manipular subtotal en cliente no altera pedido |
| RF-08 | Comprobar y actualizar inventario atómicamente | Firestore transacciones |
| RF-09 | Consultar pedidos propios | Cloud Function restringe por UID |
| RF-10 | Solicitar devolución | Estado y folio |
| RF-11 | Administrar productos, cupones y estados | Rol `admin` verificado por servidor |
| RF-12 | Exportar informe CSV | Solo rol admin |
| RF-13 | Publicar HTTPS en Firebase Hosting | URL real de despliegue, pendiente de propietaria |

## Requisitos no funcionales

| ID | Atributo | Meta |
|---|---|---|
| RNF-01 | Responsive | Ancho desde 360 px y escritorio |
| RNF-02 | Seguridad | Reglas Firestore sin acceso directo; funciones por rol |
| RNF-03 | Persistencia | Usuarios en Auth, documentos en Firestore |
| RNF-04 | Coherencia | Transacciones para inventario y pedidos |
| RNF-05 | Usabilidad | Mensajes de error, estado vacío y cargas |
| RNF-06 | Mantenibilidad | Separación en Angular / Functions / docs |
| RNF-07 | Recuperación | Plan de exportación y restauración, pendiente de evidencia |
| RNF-08 | Privacidad | No guardar CVV, números de tarjeta ni contraseñas |

## Priorización
**P0**: publicar frontend, autenticar, catálogo, carrito, compra simulada, stock, pedidos y acceso admin. **P1**: devoluciones, cupones, informes, contacto y auditoría. **P2**: accesibilidad avanzada, UX móvil, respaldos periódicos y validación jurídica final. Los casos de aceptación del docente siguen requiriendo pruebas con capturas reales en la instancia de Firebase seleccionada.

## Dependencias críticas
No puede haber despliegue público sin cuenta/proyecto autorizado. Cloud Functions v2 requiere habilitar Blaze. Antes de la demostración hay que registrar y configurar la app Firebase Web, asignar un administrador desde consola y cargar el catálogo semilla.
