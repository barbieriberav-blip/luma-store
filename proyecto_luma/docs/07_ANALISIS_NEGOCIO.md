# 07. Propuesta de negocio y análisis preliminar

## Descripción e identidad
**Nombre:** LUMA STORE. **Modelo:** B2C (business to consumer): una tienda digital comercializa directamente prendas y accesorios para consumidoras. **Sector:** moda y accesorios para mujer. **Moneda:** pesos mexicanos (MXN). **Dominio hipotético:** `luma-store.mx` (no registrado ni comprobada su disponibilidad). **Identidad:** negro, blanco y acentos rosa suave; tipografía de titulares editorial y componentes funcionales. **Naturaleza:** iniciativa académica, no sociedad registrada.

## Problema y propuesta de valor
El comercio de moda en línea requiere combinar inspiración visual con datos comprobables sobre talla, precio, existencia y entrega. LUMA propone una experiencia donde el usuario descubra ropa y accesorios, compare opciones, conserve favoritos, consulte condiciones de compra y obtenga un folio de seguimiento. En la demostración se modela la experiencia completa de compra mediante pago ficticio, sin comprometer dinero ni logística real.

## Misión, visión y valores propuestos
- **Misión:** facilitar a consumidoras una experiencia digital clara, accesible e inspiradora para explorar moda y accesorios con información transparente.
- **Visión:** ser un ejemplo académico de comercio electrónico de moda moderno, seguro, mantenible y verificable.
- **Valores:** respeto, transparencia, privacidad, creatividad, inclusión, responsabilidad y mejora continua.

## Público objetivo y buyer persona hipotético
Cliente principal: mujeres jóvenes y adultas interesadas en estilos casuales, urbanos y elegantes, acostumbradas a explorar productos en celular y comparar precio, talla, imágenes y políticas antes de comprar. Buyer persona **hipotético**: «Andrea», de 23 años, estudiante y trabajadora, compra prendas ocasionalmente, busca jeans, blusas y accesorios, utiliza Instagram como fuente de inspiración y necesita un checkout sencillo con total visible. No se presentan cifras de mercado ni encuestas como hechos sin haberlas realizado.

## Segmentación y necesidades
| Dimensión | Segmento propuesto | Necesidad que atiende LUMA |
|---|---|---|
| Demográfica | Mujeres jóvenes y adultas | Variedad de tallas y estilos |
| Psicográfica | Interés por moda personal y versátil | Editorial visual, combinaciones |
| Conductual | Exploración digital y comparación | Búsqueda, filtros y favoritos |
| Compra | Transacción desde celular | Carrito persistente y formularios claros |
| Posventa | Consulta de pedido y reclamación | Folios, historial y devoluciones |

## Catálogo inicial
24 productos semilla en 10 categorías: Tops, Pantalones, Shorts, Hoodies, Suéteres, Cardigans, Calcetines, Calzado, Accesorios y Vestidos. Cada registro contiene SKU, nombre, descripción, precio, stock, tallas, fotografía ilustrativa, material, cuidados y estado; consulta `server/data.mjs`. Para el caso demostrativo se modelan descuentos y tres formas de envío.

## Modelo financiero de demostración
**Ingresos:** venta de artículos por unidad. **Costos hipotéticos:** adquisición de inventario, empaque, transporte, campañas, plataforma y procesamiento de pago. **Margen:** `(precio de venta − costo total unitario) / precio de venta × 100`. Esta versión no carga costos reales de proveedor y no presenta una utilidad contable calculada ni proyecciones como datos comprobados. El panel de ventas informa únicamente **ventas simuladas**.

## Análisis competitivo documental (consulta de sitios oficiales: 19/11/2026)
Se eligieron tres tiendas reales de moda para comparar, **sin reproducir su identidad, fotografías ni contenido comercial**. El análisis se limita a elementos verificables en sus sitios de México; no se hicieron compras ni se midieron precios en tiempo real.

| Tienda | Enfoque visible | Compras / posventa observables en fuente oficial | Aprendizaje para LUMA |
|---|---|---|---|
| **Zara México** | Catálogo de mujer y accesorios | Documenta compra con cuenta o invitado y proceso de devolución desde cuenta; su centro de ayuda indica plazo de 30 días desde envío para compras online | Diseñar una cuenta clara, fichas accesibles y flujo de devolución trazable |
| **H&M México** | Ropa y accesorios para mujer | Publica categorías, centro de atención y condiciones de devolución; distingue supuestos según artículo y canal de devolución | No ocultar condiciones comerciales y mostrar información de ayuda antes de comprar |
| **Mango México** | Colecciones de mujer y complementos | Publica catálogo, gestión de cambios/devoluciones y ayuda; en compras online declara plazo general de 30 días desde la fecha de envío | Incorporar políticas visibles y estado de solicitudes desde perfil |

**Interpretación del análisis:** Las tres tiendas muestran que una plataforma de moda necesita más que fotografías. La propuesta académica de LUMA prioriza transparencia del total, control de existencias y demostración completa del vínculo entre pedido e inventario. Esta comparación no afirma superioridad comercial ni equivalencia con servicios reales. Los plazos y políticas de competidores cambian: se usaron solo como referencia documental, **no se copiaron** en el simulador.

**Fuentes oficiales consultadas:**
- Zara México, accesorios y ayuda de compras/devoluciones: https://www.zara.com/mx/es/mujer-accesorios-l1003.html · https://www.zara.com/mx/es/help-center/OnlinePurchases · https://www.zara.com/mx/es/help-center/HowToReturn
- H&M México, moda de mujer y devoluciones: https://www2.hm.com/es_mx/mujer.html · https://www2.hm.com/es_mx/customer-service/returns.modal.html
- Mango México, moda de mujer y cambios/devoluciones: https://shop.mango.com/mx/es/h/mujer · https://shop.mango.com/mx/es/help/returns/online-returns

**Investigación cuantitativa pendiente:** para una evaluación de mercado con evidencia estadística se requieren entrevistas o encuestas con muestra, instrumentos, fecha, resultados tabulados y consentimiento correspondiente; no se inventaron respuestas de personas.

## Objetivo operativo de la demostración
Demostrar de punta a punta: búsqueda → ficha → carrito → cuenta → dirección → pago simulado → pedido → stock → administración → seguimiento → devolución. Los controles se ejecutan con datos ficticios.
