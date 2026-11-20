# 14. Continuidad, respaldos y restauración

## Disponibilidad
Firebase Hosting sirve el frontend estático; Cloud Functions y Firestore son servicios separados. Una caída de Functions deja las operaciones de compra y sesión incompletas, aunque Hosting siga mostrando la página. Informar la incidencia claramente y prohibir pedidos sin verificación de stock.

## Respaldo de Firestore
Antes de operar con datos importantes, configurar exportaciones periódicas de Firestore a Cloud Storage con IAM apropiado, retención controlada, cifrado administrado y presupuesto aprobado. Registrar nombre, fecha, proyecto, colección y responsable del archivo. Los procedimientos concretos dependen de permisos y servicios habilitados en el proyecto.

## Restauración de prueba
Seleccionar una base de datos de pruebas separada. Exportar, verificar registros y restaurar con los mecanismos oficiales; comprobar productos, pedidos, integridad del stock y permisos antes de regresar a operación. Registrar capturas y tiempos, sin exponer datos personales. Este archivo no afirma que ya se ejecutó una restauración.

## Respuesta a incidentes
Detener despliegues, revocar accesos comprometidos, revisar registros de Cloud Functions, comprobar Firestore y volver a la última versión verificada de Hosting si aplica. No publicar tokens ni credenciales en capturas o repositorios.
