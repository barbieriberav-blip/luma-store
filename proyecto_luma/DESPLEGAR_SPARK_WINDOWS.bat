@echo off
cd /d "%~dp0"
echo LUMA STORE - Publicar en Firebase Hosting + Firestore (Spark)
echo.
call node tools\verificar-vinculacion.mjs
if errorlevel 1 (echo Vincula primero tu proyecto. & pause & exit /b 1)
if not exist node_modules (call npm.cmd install)
if errorlevel 1 (echo Error al instalar dependencias & pause & exit /b 1)
call npm.cmd run build
if errorlevel 1 (echo Angular no compilo. No se publico la pagina. & pause & exit /b 1)
echo.
echo Vas a publicar las reglas de Firestore y la pagina LUMA STORE.
choice /c SN /m "Confirmar publicacion"
if errorlevel 2 exit /b 0
call firebase.cmd deploy --only hosting,firestore
if errorlevel 1 (echo Error al desplegar. Revisa permisos y proyecto activo. & pause & exit /b 1)
echo.
echo Exito: consulta la URL web.app que aparece arriba.
pause
