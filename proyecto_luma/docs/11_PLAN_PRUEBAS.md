# 11. Plan de pruebas y seguridad

## Verificación de la edición PostgreSQL

Usa la configuración `postgres-demo`, el emulador de Firebase Authentication y una base que puedas reiniciar. Los recorridos del navegador usan datos ficticios. Los resultados obtenidos, sus capturas y las instrucciones de inicio están en el [registro de evidencias](16_POSTGRES_EVIDENCIAS.md) y la [guía de instalación](01_GUIA_INSTALACION.md).

| Área | Caso de aceptación | Resultado esperado | Referencia |
|---|---|---|---|
| Cuenta | Registrar una cuenta y consultar su perfil | Firebase Authentication reconoce la sesión y la API guarda el perfil en PostgreSQL | API-01, UI-01, UI-04 |
| Catálogo y carrito | Buscar por texto, cruzar categoría y precio, y agregar, modificar y quitar una partida | Se filtra el catálogo y cambian las cantidades del carrito | UI-05 |
| Permisos | Intentar abrir el panel o leer pedidos de otra cuenta como cliente. Repetir con un token inválido | La API rechaza el panel y el token, y únicamente devuelve los pedidos de la cuenta autenticada | API-05 |
| Compra | Comprar dos piezas con stock inicial de ocho y enviar un total alterado | La API recalcula con los precios de la base, crea un folio y registra una salida de dos piezas | API-02, UI-01 |
| Stock y reintentos | Intentar comprar más unidades que las disponibles, competir por el último stock y repetir la clave de una compra | La API protege el inventario y conserva un folio por clave | API-03, API-04 |
| Atención | Entregar el pedido, solicitar devolución, resolverla y repetir el intento de reembolso | El cliente ve el estado final y el inventario se reintegra una vez | API-06, UI-02 |
| Galería | Cargar las fichas, cambiar de imagen y editar una galería desde administración | Cada ficha muestra las imágenes en orden. Solo administración puede editar y la API rechaza URL duplicadas | API-08, UI-03 |
| Teclado y pantallas | Recorrer miniaturas, cerrar con Esc y probar a 360 y 768 px. Repetir ficha, registro y compra en Firefox | El foco se mueve y vuelve al control esperado. El contenido cabe en pantalla y el pedido queda registrado | UI-03, UI-04 |
| Políticas | Abrir privacidad, entrega, cancelaciones, garantía y términos desde la tienda | Los textos públicos están disponibles | UI-06 |
| Continuidad | Exportar la base con pedidos y restaurar en otra base | Coinciden los datos de pedidos, partidas, movimientos, variantes, pagos y usuarios | BD-01 |

Para repetir la revisión automática de accesibilidad, abre catálogo, ficha con el diálogo activo y checkout. Ejecuta axe en Chromium con las reglas WCAG 2.0 y 2.1 de nivel A y AA. Guarda el resultado por pantalla y registra aparte los casos probados manualmente con teclado.

## Revisiones pendientes

- Realizar la sesión con una persona ajena al desarrollo según el [protocolo de usabilidad](17_PRUEBA_USABILIDAD.md).
- Verificar la entrega efectiva del correo de recuperación desde la configuración de autenticación que se vaya a presentar. La demostración local usa el emulador.
- Si se evalúa la edición en Firebase Hosting, verificar allí el registro, la compra y la recuperación. Para una instalación con Cloud Functions y Firestore, revisar las reglas de ese entorno y ejecutar su procedimiento de respaldo. Las pruebas unitarias de `functions/tests/business.test.mjs` se ejecutan con `npm.cmd test` y cubren envío, descuentos, cantidades y código postal.
