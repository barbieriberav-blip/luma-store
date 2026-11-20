@echo off
setlocal
cd /d "%~dp0"
echo.
echo ===========================================================
echo  LUMA STORE - VINCULAR FIREBASE SPARK (SIN BLAZE)
echo ===========================================================
echo.
echo REQUISITOS: proyecto Firebase creado, Authentication correo/
echo contrasena activado y Firestore creado en modo produccion.
echo.
echo Este proceso pedira autorizacion desde tu navegador y NO
 echo necesita contrasenas pegadas en archivos ni tarjeta bancaria.
echo.
where node >nul 2>nul
if errorlevel 1 goto nodeerror
where firebase.cmd >nul 2>nul
if errorlevel 1 (
  echo Instalando herramientas oficiales Firebase CLI...
  call npm.cmd install -g firebase-tools
  if errorlevel 1 goto failed
)
echo.
echo PASO 1. Inicia sesion con la MISMA cuenta que uso Firebase.
call firebase.cmd login
if errorlevel 1 goto failed
echo.
echo PASO 2. Selecciona el proyecto que YA creaste.
echo Cuando pregunte el alias, escribe: default
call firebase.cmd use --add
if errorlevel 1 goto failed
echo.
echo PASO 3. Comprueba tu aplicacion Web registrada.
call firebase.cmd apps:list WEB
if errorlevel 1 goto failed
echo.
echo Si la lista no muestra ninguna app WEB, registrala desde
 echo Firebase Console - Configuracion del proyecto - Tus apps - Web.
echo Luego regresa a esta ventana y presiona una tecla.
pause >nul
if exist firebase-js-config.json del /q firebase-js-config.json
echo.
echo PASO 4. Obteniendo la configuracion publica del SDK Web.
echo Si hay varias apps, selecciona tu app LUMA STORE.
call firebase.cmd apps:sdkconfig WEB --out firebase-js-config.json
if errorlevel 1 goto noapp
call node tools\importar-config-firebase.mjs firebase-js-config.json
if errorlevel 1 goto failed
call node tools\verificar-vinculacion.mjs
if errorlevel 1 goto failed
echo.
echo Listo: vinculacion LOCAL preparada.
echo Abre DESPLEGAR_SPARK_WINDOWS.bat para compilar y publicar.
echo.
pause
exit /b 0
:noapp
echo.
echo No se encontro una app Web. En la consola Firebase abre:
echo Configuracion del proyecto - Tus apps - Agregar app Web.
echo Despues vuelve a ejecutar este asistente.
goto failed
:nodeerror
echo No se encontro Node.js en PATH. Instala Node.js LTS.
goto failed
:failed
echo.
echo Hubo un error. NO se ha publicado nada.
echo Puedes copiar el mensaje de esta pantalla para revisarlo.
pause
exit /b 1
