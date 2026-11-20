# 12. Ficha técnica y dependencias

| Campo | Especificación |
|---|---|
| Sistema | LUMA STORE |
| Versión | 2.0.0 Firebase |
| Finalidad | E-commerce académico B2C ropa/accesorios para mujer |
| Frontend | Angular 22 (SPA cliente), TypeScript 6, CSS |
| Autenticación | Firebase Authentication Web SDK |
| Backend | Firebase Cloud Functions v2 (Node.js 22), function `lumaApi` |
| Datos | Cloud Firestore (NoSQL documental) |
| Hosting | Firebase Hosting estático con HTTPS |
| Región de la función | us-central1 |
| Local | Windows, Node.js 24, npm, navegador moderno |
| Puertos locales | Angular 4200; emuladores opcionales: Auth 9099, Firestore 8080, Functions 5001, Hosting 5000 |
| Operación económica | Demo sin pagos reales; Cloud Functions exige Blaze |
| Credenciales y secretos | Configuración web en environments; no incluir llaves privadas |
| Operador | Propietaria del proyecto Firebase y administración autorizada |
| Despliegue público | PENDIENTE de conectar proyecto y ejecutar Firebase CLI |
| Estado de pruebas | Backend sintácticamente revisado; 6 pruebas unitarias; E2E pendiente |

La documentación de Cloud Functions, Firestore y Hosting se encuentra en el README. La interfaz incluye material de ejemplo; antes de distribuir comercialmente verificar licencias fotográficas y cumplimiento legal actualizado.
