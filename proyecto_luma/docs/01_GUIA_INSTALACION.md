# Guía de instalación y demostración

La [guía principal de PostgreSQL](../server/README.md) contiene los comandos completos para Windows. Requiere Node.js 24, Git y PostgreSQL 17 o posterior. Se puede usar PostgreSQL instalado en Windows o el archivo Compose incluido.

1. Desde `proyecto_luma`, ejecuta `npm.cmd ci` y `npm.cmd ci --prefix server`.
2. Copia `server/.env.example` como `server/.env`, configura la conexión local y ejecuta `npm.cmd --prefix server run db:setup`.
3. Inicia el emulador de Firebase Authentication, la API Express y Angular en las tres terminales indicadas en la guía.
4. Abre [la tienda local](http://localhost:4201/) y comprueba [el estado de la API](http://localhost:4201/api/health).
5. Prepara las cuentas ficticias con [el manual de administración](03_MANUAL_ADMIN.md). Usa [el guion](13_PRESENTACION_Y_EVIDENCIAS.md) para el ejercicio de compra.

## Diagnóstico

| Síntoma | Qué revisar |
|---|---|
| El comando no encuentra `package.json` | Entra a `proyecto_luma` antes de ejecutar las instrucciones. |
| El catálogo no carga | Confirma que PostgreSQL y la API están iniciados, que el puerto 3000 está libre y que `/api/health` responde. |
| El registro no abre sesión | Confirma el emulador de Auth en el puerto 9099 y que se inició Angular con `dev:postgres:demo`. |
| La sesión no muestra el Panel | Registra el UID exacto y vuelve a ingresar a la cuenta de administración. |
| La galería antigua muestra solo una imagen | Ejecuta `npm.cmd --prefix server run db:setup` para aplicar la migración. |

Para alojar la edición con PostgreSQL se requiere una API accesible por HTTPS y una conexión con la base. [Configuración de despliegue](../server/README.md#usar-el-proyecto-firebase-existente)
