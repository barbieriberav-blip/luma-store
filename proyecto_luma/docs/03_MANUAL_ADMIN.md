# 03. Manual de la persona administradora

## Acceso controlado
El botón Panel aparece únicamente si la sesión tiene rol `admin`. El rol se consulta en Cloud Functions y no depende de esconder botones del navegador. Para elevar una cuenta, el propietario del Firebase edita `users/{uid}.role` en Firestore Console; los clientes no pueden escribir este dato.

## Inicio de operaciones
Si el catálogo está vacío, entra a Panel → Resumen y selecciona Cargar 24 productos de demostración. Solo debe ejecutarse una vez. A partir de entonces se gestiona el inventario persistente en Firestore.

## Catálogo
- Nuevo producto: SKU único, nombre, descripción, categoría, imagen HTTPS, tallas, precio, stock, material y cuidado.
- Modificar: los cambios de precio y stock quedan registrados con auditoría; el stock debe ser entero no negativo.
- Desactivar: baja lógica; el producto desaparece del catálogo público sin eliminar sus datos históricos.
- Categorías: agrega nombres nuevos con slug legible.

## Pedidos
En la pestaña Pedidos se muestran folio, cliente, importe, fecha, estado y guía. Transiciones: Pagado → Preparando → Enviado → Entregado. También es posible cancelar desde estados permitidos; al hacerlo se restituye el inventario mediante transacción.

## Devoluciones
Lee motivo y detalle, aprueba o rechaza con resolución motivada. La opción Reembolsada representa solo una compensación ficticia: actualiza estado de pedido y devuelve unidades al inventario, de forma atómica.

## Promociones, atención y reportes
Los cupones tienen código, porcentaje, compra mínima y límite de usos. La validación definitiva de cupón se ejecuta al confirmar la compra. La pestaña Atención muestra solicitudes, que pueden marcarse En revisión o Resuelta. Pedidos permite exportar un CSV para uso académico. Las pestañas Inventario/Auditoría registran entradas y salidas con actor y referencia.

## Administración segura
No uses datos reales ni publiques contraseñas. Mantén acceso Firebase Console restringido, habilita medidas fuertes de seguridad en la cuenta propietaria y supervisa costos, errores y reglas.
