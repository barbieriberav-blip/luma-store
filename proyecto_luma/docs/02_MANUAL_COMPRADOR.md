# Manual de LUMA para compras de prueba

## Acceso y catálogo

Sigue la [instalación con PostgreSQL](../server/README.md) y abre [http://localhost:4201/](http://localhost:4201/). El sitio es una simulación académica con cuentas, pagos y entregas de prueba.

1. Selecciona **Colección**. Usa el buscador y los filtros de categoría, precio o disponibilidad para encontrar un artículo. Cambia de página con **Anterior** y **Siguiente**.
   [Figura 1. Catálogo](capturas-postgres/01-catalogo.webp)
2. Abre la ficha de un producto para consultar precio en MXN, material, tallas y unidades disponibles. Usa las miniaturas para ver otra foto. Con teclado, pulsa **Tab** hasta la primera miniatura y **←** o **→** para cambiar de vista. **Esc** cierra la ficha y devuelve el foco al producto.
   [Figura 2. Ficha y galería](capturas-postgres/02-galeria.webp)
3. Elige talla y cantidad. Pulsa **Agregar a mi bolsa**. La bolsa permite sumar, restar o quitar productos. Pulsa **Continuar al checkout**.
   [Figura 3. Carrito con dos piezas talla M](capturas-postgres/03-carrito.webp)

## Finalizar la compra

1. Registra una cuenta ficticia o inicia sesión. En la demostración local, Firebase Authentication Emulator administra estas cuentas.
2. Captura un destinatario, domicilio y teléfono de prueba. Selecciona envío estándar, exprés o recolección. El envío estándar cuesta $99 MXN y es gratis desde $1,200 MXN después del descuento. El exprés cuesta $179 MXN y la recolección es gratis.
3. Revisa subtotal, descuento, envío y total. Consulta los términos y el aviso de privacidad y marca la casilla cuando estés lista. Pulsa **Confirmar compra de prueba**. La API valida las existencias y vuelve a calcular el total antes de registrar el pedido.
   [Figura 4. Checkout y pago simulado](capturas-postgres/04-checkout.webp)
4. Guarda el folio y abre **Ver mis pedidos** para consultar la compra.
   [Figura 5. Confirmación con folio](capturas-postgres/05-folio.webp)

## Historial y devoluciones

Consulta folio, estado y guía en **Mi cuenta**. Antes de que el pedido se envíe puedes solicitar su cancelación. Una vez entregado puedes seleccionar **Devolución** o **Garantía**, registrar el motivo y consultar la resolución en **Mis solicitudes**. El reembolso es simulado y el ejercicio se aplica al pedido completo.
[Figura 8. Resolución registrada en administración](capturas-postgres/08-devolucion.webp)

Usa **Ayuda** para enviar un mensaje con tu cuenta de prueba. El aviso y las políticas se abren desde el pie de la página. Si estás probando el registro o la recuperación de acceso, usa los datos ficticios de tu entorno.
[Figura 9. Aviso de privacidad de la demostración](capturas-postgres/09-privacidad.webp)
