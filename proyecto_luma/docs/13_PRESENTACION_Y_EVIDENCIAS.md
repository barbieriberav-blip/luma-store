# 13. Guion de demostración y relación con la rúbrica

## Exposición propuesta (12 a 15 minutos)
| Minutos | Contenido | Evidencia |
|---|---|---|
| 0:00–1:00 | Nombre, problema y propuesta B2C | Inicio editorial y descripción |
| 1:00–2:30 | Público, catálogo y diferenciación | Categorías, productos y 24 SKU |
| 2:30–4:30 | Búsqueda, filtro y ficha | Consulta de producto, talla, precio, stock |
| 4:30–7:00 | Carrito y checkout | Registro, dirección ficticia, envío, cupón, términos |
| 7:00–8:00 | Confirmación y folio | Pedido y total final, precio calculado en servidor |
| 8:00–10:00 | Panel administrador | Pedido, inventario, movimiento y cambio de estado |
| 10:00–11:15 | Devolución | Solicitud con folio y resolución simulada |
| 11:15–12:30 | Arquitectura, DB y API | Código, esquema, GET/POST principales |
| 12:30–14:00 | Seguridad, privacidad y políticas | Denegación admin cliente, textos públicos y pruebas |
| 14:00–15:00 | Conclusiones y mejoras | Manuales, límites y trabajo futuro |

## Script de demostración reproducible
1. Iniciar `npm.cmd run dev`. Confirmar `http://localhost:4200` y salud de API.
2. Ingresar como cliente creado durante la demostración, explorar tops, aplicar filtro y buscar jeans.
3. Agregar una o dos prendas; elegir talla; modificar cantidad.
4. Completar checkout con datos **ficticios**, aplicar `LUMA10`, aceptar términos y generar folio.
5. En otra sesión o después de cerrar sesión, ingresar con la cuenta administradora creada por CLI.
6. Abrir Panel → Resumen y comprobar venta, producto y movimientos; cambiar pedido a preparando/enviado.
7. Volver al cliente, registrar devolución; como admin aprobar y reembolsar la prueba.
8. Mostrar SQL, auditoría, reportes, pruebas de acceso y documentos; explicar que no hubo dinero ni envío físico.

## Matriz de los 13 entregables del docente
| N.º | Entregable | Archivo / evidencia incluida | Evidencia restante |
|---|---|---|---|
| 01 | Negocio y mercado | `07_ANALISIS_NEGOCIO.md` | Comparación documental incluida; encuesta si se exige |
| 02 | Requisitos y backlog | `08_REQUISITOS_Y_BACKLOG.md` | Aprobación, cronograma real, RACI validada |
| 03 | Diseño UX/UI | `09_DISENO_UX_UI.md`, archivos Angular | Wireframes dibujados, capturas finales |
| 04 | Código fuente | `src/`, `server/`, `tools/`, `tests/` | Repositorio Git remoto y commits propios |
| 05 | Frontend funcional | Código Angular | Verificar compilación y URL local con capturas |
| 06 | Backend/API | API Node y `06_API_REST.md` | Colección Postman/OpenAPI formal si se exige |
| 07 | Base de datos | `server/data.mjs`, `04_BASE_DE_DATOS.md` | Diagrama ER gráfico, prueba documentada de restauración |
| 08 | Panel admin | Pantallas Angular y endpoints | Capturas y demostración en equipo |
| 09 | Legal/comercial | Pantallas de políticas, `10_MARCO_LEGAL_Y_POLITICAS.md` | Validación normativa final por tipo de operación |
| 10 | Manuales | `01_GUIA_INSTALACION`, `02_MANUAL_COMPRADOR`, `03_MANUAL_ADMIN` | Capturas numeradas exigidas |
| 11 | Calidad/seguridad | Tests y `11_PLAN_PRUEBAS.md` | Resultados E2E, accesibilidad, compatibilidad, recuperación |
| 12 | Ficha y arquitectura | `12_FICHA_TECNICA.md`, `05_ARQUITECTURA.md` | Diagrama de despliegue final y versión desplegada |
| 13 | Presentación/demo | Este guion | Diapositivas y exposición práctica |

**Criterio de transparencia:** la presencia del código y los documentos no prueba por sí misma que el frontend se haya ejecutado en Windows ni que se hayan realizado pruebas con usuarios. Cada evidencia no ejecutada está señalada para completarse de forma honesta. La rúbrica exige una demostración verificable, no afirmaciones generales.
