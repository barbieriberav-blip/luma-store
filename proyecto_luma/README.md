# LUMA STORE — vinculación con Firebase sin Blaze

**Para la entrega con API, inventario transaccional y PostgreSQL**, abre la [guía de instalación y demostración](server/README.md).

Esta edición viene con **backend de demostración para Firebase Authentication y Cloud Firestore**, además de **Firebase Hosting** para publicar la web. No despliega Cloud Functions ni solicita activar Blaze.

## Pasos en Windows (la forma más fácil)

1. Crea tu proyecto Firebase con plan **Spark**. Desde su consola, abre **Authentication > Sign-in method > Correo/contraseña** y actívalo. Abre **Firestore Database** y crea la base de datos en **modo producción**, eligiendo la región que prefieras. **No utilices modo prueba abierto para la publicación**.
2. En **Configuración del proyecto (engranaje) > Tus apps**, asegúrate de tener registrada una aplicación **Web** para LUMA STORE. Si no, créala (icono `</>`). No necesitas habilitar Hosting desde ese asistente si ya usas esta carpeta.
3. Descomprime el ZIP y abre en Visual Studio Code esta carpeta (donde aparece `package.json`).
4. Ejecuta **`VINCULAR_FIREBASE_WINDOWS.bat`**. Se abrirá Firebase CLI: inicia sesión con la cuenta donde creaste tu proyecto, selecciona el proyecto existente y asigna alias `default`. El asistente descarga la **configuración pública Web** y la coloca automáticamente en `src/environments/firebase.config.ts`.
5. Ejecuta **`DESPLEGAR_SPARK_WINDOWS.bat`**. Instala dependencias si hace falta, compila Angular y te pide confirmar el despliegue de **Hosting + reglas Firestore**. La CLI mostrará la dirección pública `https://ID-DEL-PROYECTO.web.app` al finalizar con éxito.
6. Abre la web publicada, crea una cuenta **de prueba** y comprueba el acceso. En Authentication aparecerá el usuario; en Firestore, colección `users`, su perfil. Para pedidos simulados, completa un checkout ficticio y revisa la colección `orders`.

## Activar el panel de administración

1. Abre Firebase Console > Authentication > Users y copia el **UID** de tu usuario de prueba.
2. Ve a Firestore > Datos y crea `adminUsers` con documento cuyo **ID sea el mismo UID**.
3. Crea un campo `enabled` de tipo **boolean**, valor `true` (no texto). El navegador no tiene permisos para editar esta colección.
4. Sal de tu sesión en LUMA y vuelve a ingresar. Ahora aparece el Panel de administración. En él puedes pulsar **Cargar 24 productos de demostración** para crear el catálogo de ejemplo en Firestore.

## Comandos alternativos en PowerShell

Desde la carpeta del proyecto:

```powershell
npm.cmd install -g firebase-tools
firebase.cmd login
firebase.cmd use --add
firebase.cmd apps:list WEB
firebase.cmd apps:sdkconfig WEB --out firebase-js-config.json
node tools/importar-config-firebase.mjs firebase-js-config.json
npm.cmd install
npm.cmd run build
firebase.cmd deploy --only firestore,hosting
```

Si `apps:list WEB` indica que no hay app, regístrala primero desde la consola web Firebase. **No** ejecutes `firebase init`, ni despliegues `functions`, ni uses Firebase **App Hosting**. La configuración necesaria ya está incluida.

## Qué queda vinculado y qué no

| Funcionalidad | Estado tras vincular y desplegar |
|---|---|
| Angular publicado con HTTPS | Firebase Hosting clásico |
| Registro/login/recuperación | Firebase Authentication, correo/contraseña |
| Perfil, favoritos, pedidos de prueba, solicitudes | Firestore |
| Catálogo, categorías, cupones | Firestore; se inicializan desde panel administrador |
| Reglas de lectura y permisos de administrador | `firestore.rules` desplegadas con CLI |
| Compras reales y cobro bancario | **No incluidos** |
| Inventario transaccional/servidor | **No incluido**: solo simulación |
| Base de datos SQL 3FN requerida por el profesor | **No incluida**: Firestore es NoSQL |

**Advertencia de seguridad:** sin servidor de confianza o Cloud Functions, el cliente calcula importes y crea los pedidos de demostración; esto no sirve para ventas reales. No uses clientes reales ni información financiera. En las pruebas, utiliza datos ficticios.

**Estado actual del ZIP:** aún no está asociado a un proyecto Firebase concreto. Este asistente realizará la asociación cuando se ejecute desde tu equipo con autorización de tu cuenta. No existe publicación pública hasta que Firebase CLI confirme el despliegue. Tampoco se ha compilado Angular en este entorno por falta de acceso a las dependencias npm; si la compilación presenta errores, deben corregirse antes de publicar.

Documentación oficial:
- https://firebase.google.com/docs/cli/
- https://firebase.google.com/docs/hosting/quickstart
- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/firestore/security/get-started
