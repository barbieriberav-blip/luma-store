# 01. Guía de instalación y publicación

**LUMA STORE | Firebase | Versión académica 2.0 | 20/11/2026**

## Finalidad
Instalar y desplegar el proyecto de tienda virtual con Angular 22, Firebase Authentication, Cloud Firestore, Cloud Functions v2 y Firebase Hosting. La publicación no se produce al descomprimir el archivo; exige un proyecto Firebase, autorización y ejecución desde la cuenta propietaria.

## Requisitos
Windows con Node.js LTS compatible (el entorno de trabajo del proyecto utiliza Node.js 24), npm, Visual Studio Code, conexión a internet y cuenta Google. Cloud Functions exige habilitar facturación Blaze. Se recomienda configurar alertas de presupuesto y usar datos académicos ficticios.

## Instalación local
Desde la carpeta que contiene `package.json`: `npm.cmd install` y luego `npm.cmd start`. La interfaz se presenta en http://localhost:4200. Antes de configurar Firebase, la tienda solo mostrará el catálogo de vista previa; no procesa datos personales ni pedidos. Detén otro servidor que use el puerto 4200.

## Activación Firebase
1. En Firebase Console, crea un proyecto único.
2. Authentication: habilita email y contraseña.
3. Firestore: crea base de datos, con reglas de seguridad del repositorio.
4. Configuración del proyecto: registra la aplicación web y copia sus valores en `src/environments/firebase.config.ts`.
5. Cambia a Blaze únicamente cuando apruebes expresamente la facturación.
6. Instala Firebase CLI: `npm.cmd install -g firebase-tools`.
7. Autentícate: `firebase.cmd login`; elige proyecto: `firebase.cmd use --add`.
8. Instala funciones: `npm.cmd --prefix functions install`.
9. Ejecuta pruebas `npm.cmd test`, compila `npm.cmd run build`.
10. Despliega `firebase.cmd deploy --only firestore,functions,hosting`.

## Primer administrador y catálogo
La administradora se registra con correo y contraseña en la tienda. El propietario del Firebase cambia el campo `users/{uid}.role` desde `cliente` a `admin` desde la consola. Al iniciar sesión de nuevo, el panel de administración permitirá cargar 24 productos y 10 categorías con el botón de catálogo de ejemplo. No compartir credenciales de servicio.

## Diagnóstico
Si aparece `ENOENT package.json`: entra en la carpeta que contiene el proyecto. Si falla la app: instala dependencias. Si Firebase no conecta: revisa la configuración web y la activación de Authentication y Cloud Functions. Si aparece `permission-denied`: inicia sesión y verifica rol de administrador. Si `functions/not-found`: comprueba que se desplegó `lumaApi` en `us-central1`. Si Hosting muestra página inicial: compila y publica de nuevo; la carpeta configurada es `dist/luma-angular/browser`.
