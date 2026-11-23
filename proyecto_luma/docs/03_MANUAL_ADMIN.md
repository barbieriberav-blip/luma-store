# Manual de LUMA para administración

## Habilitar una cuenta de administración

Registra una cuenta ficticia e inicia sesión para crear su perfil en PostgreSQL. Copia su UID desde el emulador de Firebase Authentication y ejecuta `npm.cmd --prefix server run admin -- UID_DE_FIREBASE` desde `proyecto_luma`. Cierra sesión y selecciona **Ingresar** para acceder nuevamente. El botón **Panel** aparece cuando la API confirma el rol.
[Guía de instalación y operación](../server/README.md)

## Catálogo y galería

La instalación carga 24 productos con tres vistas ilustrativas por ficha. Para editar, abre **Panel → Productos → Editar**. Ajusta SKU, precio y stock por talla. La portada se configura en **Foto**. En **Fotos adicionales**, puedes registrar hasta cinco enlaces HTTPS o rutas de imágenes dentro de `/assets/`, agregar su texto alternativo o quitar una foto. Guarda y vuelve a abrir la ficha pública para comprobar el orden.

Para preparar la demostración, ajusta **Stock talla M** de **Blusa Satinada Alba** a 8 antes de que la clienta compre dos unidades. Si el stock cambió mientras se editaba, cierra el formulario, recarga ese producto y repite el ajuste.

## Pedidos e inventario

1. Abre **Panel → Resumen → Movimientos de inventario**. Busca el folio de la compra y verifica una salida de **−2** para la talla M.
   [Figura 6. Movimiento de venta](capturas-postgres/06-movimiento.webp)
2. Abre **Pedidos** y localiza el mismo folio. Cambia el estado a **Preparando**, después **Enviado** y finalmente **Entregado**, guardando cada transición. La guía se puede registrar en esa misma fila.
   [Figura 7. Folio en el panel de pedidos](capturas-postgres/07-panel-pedido.webp)
3. Si el pedido aún se puede cancelar, el servidor revierte las unidades una sola vez. Si se entrega, utiliza la solicitud de devolución que registra la clienta.

## Resolver una devolución

Abre **Devoluciones**, localiza la solicitud y escribe una nota. Pulsa **Aprobar** o **Rechazar**. Para registrar el reembolso de prueba de una solicitud aprobada, pulsa **Reembolso de prueba** y verifica el estado. Las dos unidades de ese pedido se reincorporan al inventario.
[Figura 8. Devolución reembolsada](capturas-postgres/08-devolucion.webp)

En **Cupones** configura porcentaje, mínimo, usos y vigencia. En **Atención** puedes responder operativamente mediante el cambio de estado de la solicitud. **Pedidos** permite descargar el CSV y **Auditoría** muestra quién realizó los cambios.
[Consultas de verificación y respaldo](15_POSTGRES_OPERACION.md)
