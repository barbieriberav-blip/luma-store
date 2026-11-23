# Continuidad y respaldos de LUMA

Antes de la exposición, comprueba los servicios de Angular, la API, PostgreSQL y el emulador de Firebase. Si la interfaz no carga el catálogo, consulta `/api/health` y revisa la terminal de la API. Usa [las capturas de la demostración](16_POSTGRES_EVIDENCIAS.md) para enseñar el recorrido si falla la ejecución en vivo.

El [manual relacional](15_POSTGRES_OPERACION.md#respaldo-y-restauración) contiene los comandos de exportación y restauración. Usa una base separada y compara los conteos y los datos de pedidos, inventario y pagos. Mantén los respaldos fuera del repositorio. Las cuentas del proveedor de identidad se gestionan por separado.

El resultado de recuperación ya está registrado en [Evidencias de PostgreSQL](16_POSTGRES_EVIDENCIAS.md).
