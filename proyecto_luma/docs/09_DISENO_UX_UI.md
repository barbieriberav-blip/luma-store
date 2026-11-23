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

## Accesibilidad y pantallas de referencia

Los diálogos usan controles nativos, mantienen el foco mientras están abiertos y lo devuelven al control de origen cuando se cierra la ficha. La galería usa texto alternativo descriptivo, miniaturas con estado anunciado y flechas de teclado. La tienda incluye salto a contenido, foco visible, etiquetas y una opción de movimiento reducido basada en la preferencia del dispositivo.

[Catálogo en escritorio](capturas-postgres/01-catalogo.webp) · [Ficha en escritorio](capturas-postgres/02-galeria.webp) · [Ficha en tableta](capturas-postgres/10-tableta.webp) · [Ficha en móvil](capturas-postgres/11-celular.webp) · [Checkout](capturas-postgres/04-checkout.webp)

Consulta los resultados de teclado y contraste en el [registro de evidencias](16_POSTGRES_EVIDENCIAS.md). Queda pendiente una sesión con lector de pantalla y la [evaluación de usabilidad con una persona](17_PRUEBA_USABILIDAD.md).

## Fuente de fotografías
La galería de PostgreSQL usa ilustraciones generadas para esta demostración, guardadas en `src/assets/product-gallery` y asociadas al SKU correspondiente. Los recursos editoriales de portada y algunos catálogos de Firebase conservan referencias a Unsplash y disponen de `src/assets/product-fallback.svg` si la imagen no carga. Consulta el inventario de recursos de la [ficha técnica](12_FICHA_TECNICA.md).
