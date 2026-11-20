# 09. Diseño UX/UI y guía visual

## Identidad de marca
**Logotipo tipográfico:** `LUMA.` blanco/rosa sobre fondo oscuro, con favicon original SVG. **Estilo:** editorial moderno, lookbook de moda, fotografías grandes, tarjetas redondeadas, interfaz de alto contraste. **Paleta**:
- Negro de fondo: `#101014`; negro header: `#111115`.
- Rosa suave principal: `#e7adc5`; rosa claro botones: `#f3d1dd`.
- Gris de superficies: `#211f25`; bordes: `#3e3a43`.
- Texto principal: `#f7f4f5`, secundarios: `#aaa3ae`.

**Tipografías:** `DM Sans` para interfaz y `Playfair Display` para titulares editoriales (Google Fonts; con fuentes alternativas del sistema). **Iconografía:** símbolos simples y accesibles en botones con `aria-label` donde corresponde.

## Mapa del sitio
```text
Inicio
├── Colección
│   ├── Categorías, filtros y búsqueda
│   └── Detalle de producto (modal)
├── Favoritos
├── Carrito (panel lateral)
├── Checkout (requiere sesión)
│   └── Confirmación de pedido
├── Mi cuenta
│   ├── Acceso/registro
│   ├── Historial y seguimiento
│   └── Solicitud de devolución
├── Nosotras
├── Ayuda/FAQ/contacto
├── Políticas de entrega, devolución, privacidad, términos, garantía y facturación
└── Panel administrador (rol protegido)
    ├── Resumen e inventario
    ├── Productos y categorías
    ├── Pedidos, guías y devoluciones
    ├── Clientes y cupones
    └── Atención, auditoría y CSV
```

## Componentes diseñados
- **Header sticky:** logotipo, navegación, búsqueda, cuenta, favoritos, bolsa con cantidad.
- **Hero:** editorial principal con llamada a la acción, identidad de marca y nota de demostración.
- **Banda de beneficios:** estilo, prueba segura y métodos de envío.
- **Tendencias:** mosaico de tarjetas con badges, fotografías y precio.
- **Categorías:** accesos directos a filtros; chips para selección.
- **Tarjeta de producto:** imagen, etiqueta, favorito, nombre, precio, CTA.
- **Modal de producto:** SKU, tallas, cuidado, stock, cantidad, añadir al carrito.
- **Carrito lateral:** lista, subtotales, modificar y quitar.
- **Checkout:** datos de contacto, envío, cupón, términos, total, confirmación.
- **Cuenta:** pedidos, estado, solicitudes, direcciones de prueba.
- **Administración:** tabla con scroll, filtros por pestaña y formularios.
- **Ayuda/políticas:** FAQ desplegable, enlaces, formulario y textos públicos.

## Wireframes textuales
**Escritorio:** Header horizontal → hero 2 columnas → tendencias 6 tarjetas → categorías 4 mosaicos → catálogo 4 columnas → footer 4 columnas.

**Móvil:** header compacto → hero apilado → beneficios verticales → tendencias con deslizamiento horizontal → categorías 2 columnas → catálogo 2 columnas → footer reordenado. Modales y formularios cambian a una columna.

## Accesibilidad y mejoras pendientes
Se usan controles nativos, etiquetas de formularios, alternativa de imagen, estados de error/éxito, foco visible y opción de movimiento reducido. Validar con lector de pantalla y teclado los modales y paneles; implementar bloqueo de foco en diálogos y mejorar el menú móvil si lo exige la auditoría. Medir contraste real y rendimiento en la instalación final.

## Fuente de fotografías
Las referencias se cargan desde `images.unsplash.com`, con fallback en `src/assets/product-fallback.svg`. Son ilustraciones del concepto de moda, no imágenes de mercancía real. **Antes de comercializar:** verificar uso permitido de cada imagen, sustituir por fotografías propias/licenciadas y asociar imágenes a SKU reales. Consultar: https://unsplash.com/license
