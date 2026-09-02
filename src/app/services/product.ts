import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private searchQuerySubject = new BehaviorSubject<string>('');

  private readonly apparelSizes = ['6', '8', '10', '12', '14', '16', '18'];
  private readonly shoeSizes = ['22', '23', '24', '25', '26', '27'];
  private readonly oneSize = ['Unitalla'];

  private readonly standardColors = [
    { name: 'Negro', hex: '#111111' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Azul', hex: '#1d4ed8' },
    { name: 'Beige', hex: '#d4b996' },
    { name: 'Rojo', hex: '#b91c1c' }
  ];

  private products: Product[] = [
    // ================= BLUSAS (10) =================
    {
      id: 101,
      name: 'Blusa Satinada Elegante',
      category: 'Blusas',
      price: 549,
      rating: 4.9,
      stock: 30,
      description: 'Acabado satinado suave con cuello drapeado y manga abullonada.',
      images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 102,
      name: 'Blusa de Lino Holgada',
      category: 'Blusas',
      price: 499,
      rating: 4.8,
      stock: 25,
      description: 'Tejido de lino transpirable con botones de madera frontales.',
      images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 103,
      name: 'Blusa Camisera Clásica',
      category: 'Blusas',
      price: 520,
      rating: 4.7,
      stock: 20,
      description: 'Corte clásico estructurado con cuello camisero y puños ajustables.',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
   {
      id: 104,
      name: 'Blusa Romántica con Encaje',
      category: 'Blusas',
      price: 580,
      rating: 4.9,
      stock: 18,
      description: 'Detalles de encaje floral en escote y mangas semitransparentes.',
      images: ['https://images.unsplash.com/photo-1551803091-e20673f15770?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 105,
      name: 'Blusa Escote Halter',
      category: 'Blusas',
      price: 460,
      rating: 4.6,
      stock: 22,
      description: 'Diseño halter con espalda descubierta y caída fluida.',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 106,
      name: 'Blusa Peplum Entallada',
      category: 'Blusas',
      price: 510,
      rating: 4.7,
      stock: 24,
      description: 'Corte peplum con cintura marcada y escote en V.',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 107,
      name: 'Blusa Wrap Cruzada',
      category: 'Blusas',
      price: 530,
      rating: 4.8,
      stock: 19,
      description: 'Ajuste envolvente con lazo lateral adaptable al cuerpo.',
      images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 108,
      name: 'Blusa Boho Manga Campana',
      category: 'Blusas',
      price: 560,
      rating: 4.8,
      stock: 15,
      description: 'Estilo bohemio con mangas acampanadas y bordados tonales.',
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 109,
      name: 'Blusa Asimétrica Minimal',
      category: 'Blusas',
      price: 475,
      rating: 4.6,
      stock: 20,
      description: 'Un hombro descubierto con corte moderno y tejido elástico.',
      images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 110,
      name: 'Blusa Sin Mangas Cuello Alto',
      category: 'Blusas',
      price: 430,
      rating: 4.7,
      stock: 28,
      description: 'Cuello mock neck sofisticado, ideal para layering y oficina.',
      images: ['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= TOPS (10) =================
    {
      id: 201,
      name: 'Top Ribbed Básico',
      category: 'Tops',
      price: 299,
      rating: 4.8,
      stock: 40,
      description: 'Top corto de canalé de punto elástico con tirantes finos.',
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 202,
      name: 'Crop Top Corset Estructurado',
      category: 'Tops',
      price: 450,
      rating: 4.9,
      stock: 25,
      description: 'Estructura tipo corset con varillas flexibles y copas preformadas.',
      images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 203,
      name: 'Top Strapless Bandeau',
      category: 'Tops',
      price: 280,
      rating: 4.6,
      stock: 35,
      description: 'Bandeau sin tirantes con banda interna de silicona antideslizante.',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 204,
      name: 'Top Deportivo Seamless',
      category: 'Tops',
      price: 360,
      rating: 4.9,
      stock: 30,
      description: 'Compresión media sin costuras para soporte y comodidad deportiva.',
      images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 205,
      name: 'Crop Top Manga Larga',
      category: 'Tops',
      price: 390,
      rating: 4.7,
      stock: 22,
      description: 'Manga larga entallada con orificio para pulgar y tejido suave.',
      images: ['https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 206,
      name: 'Top Halter Cruzado',
      category: 'Tops',
      price: 340,
      rating: 4.8,
      stock: 26,
      description: 'Tiras frontales cruzadas al cuello con espalda descubierta.',
      images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 207,
      name: 'Top Asimétrico de Tirante',
      category: 'Tops',
      price: 310,
      rating: 4.5,
      stock: 28,
      description: 'Diseño monohombro contemporáneo en punto fino elastizado.',
      images: ['https://images.unsplash.com/photo-1564257631407-4deb129f042b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 208,
      name: 'Top de Encaje Bralette',
      category: 'Tops',
      price: 410,
      rating: 4.8,
      stock: 20,
      description: 'Encaje delicado con forro suave interno y detalle triangular.',
      images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 209,
      name: 'Top Drapeado Frontal',
      category: 'Tops',
      price: 375,
      rating: 4.7,
      stock: 24,
      description: 'Detalle fruncido frontal regulable mediante cordones.',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 210,
      name: 'Top Tejido de Crochet',
      category: 'Tops',
      price: 440,
      rating: 4.9,
      stock: 16,
      description: 'Tejido artesanal de crochet estilo festival con ribetes limpios.',
      images: ['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= SUDADERAS / HOODIES (5) =================
    {
      id: 301,
      name: 'Hoodie Oversized Essential',
      category: 'Sudaderas',
      price: 799,
      rating: 4.9,
      stock: 25,
      description: 'Sudadera pesada con capucha amplia y bolsillo tipo canguro.',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 302,
      name: 'Hoodie Crop con Cierre',
      category: 'Sudaderas',
      price: 699,
      rating: 4.7,
      stock: 20,
      description: 'Corte crop con cremallera frontal completa y pretina elástica.',
      images: ['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 303,
      name: 'Sudadera Cuello Redondo Minimal',
      category: 'Sudaderas',
      price: 649,
      rating: 4.8,
      stock: 22,
      description: 'Crewneck clásico de algodón perchado con interior térmico ultra suave.',
      images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 304,
      name: 'Hoodie Zip Up Oversized',
      category: 'Sudaderas',
      price: 849,
      rating: 4.9,
      stock: 18,
      description: 'Chamarra sudadera con doble bolsillo y cierre metálico bidireccional.',
      images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 305,
      name: 'Hoodie Sin Mangas Urbano',
      category: 'Sudaderas',
      price: 580,
      rating: 4.6,
      stock: 15,
      description: 'Estilo sisa caída para entrenamiento y uso casual.',
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= SUÉTERES (5) =================
    {
      id: 401,
      name: 'Suéter Chunky de Punto Trenzado',
      category: 'Suéteres',
      price: 899,
      rating: 4.9,
      stock: 20,
      description: 'Punto grueso con patrón trenzado artesanal y cuello redondo reforzado.',
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 402,
      name: 'Suéter Cuello Alto Tortuga',
      category: 'Suéteres',
      price: 780,
      rating: 4.8,
      stock: 25,
      description: 'Turtleneck fino y suave con acabado acanalado de tacto cachemira.',
      images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 403,
      name: 'Suéter Escote V Holgado',
      category: 'Suéteres',
      price: 740,
      rating: 4.7,
      stock: 18,
      description: 'Corte relajado con hombros caídos y escote pronunciado en V.',
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 404,
      name: 'Suéter Calado de Hilo',
      category: 'Suéteres',
      price: 690,
      rating: 4.6,
      stock: 22,
      description: 'Punto abierto calado y fresco para entretiempo.',
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 405,
      name: 'Suéter Rayado Breton',
      category: 'Suéteres',
      price: 760,
      rating: 4.8,
      stock: 17,
      description: 'Estilo marinero atemporal con tejido suave de densidad media.',
      images: ['https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= CARDIGANS (5) =================
    {
      id: 501,
      name: 'Cardigan Largo Fluido',
      category: 'Cardigans',
      price: 850,
      rating: 4.9,
      stock: 20,
      description: 'Corte maxi por debajo de la rodilla sin botones y caída libre.',
      images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 502,
      name: 'Cardigan Crop con Botones Carey',
      category: 'Cardigans',
      price: 680,
      rating: 4.8,
      stock: 24,
      description: 'Corte crop con escote en pico y botones grandes decorativos.',
      images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 503,
      name: 'Cardigan Chunky Oversized',
      category: 'Cardigans',
      price: 920,
      rating: 4.9,
      stock: 15,
      description: 'Tejido artesanal voluminoso con bolsillos frontales profundos.',
      images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 504,
      name: 'Cardigan Fino de Punto Acanalado',
      category: 'Cardigans',
      price: 620,
      rating: 4.7,
      stock: 26,
      description: 'Ajuste entallado con botonadura continua hasta el cuello.',
      images: ['https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 505,
      name: 'Cardigan Texturizado con Cinturón',
      category: 'Cardigans',
      price: 890,
      rating: 4.8,
      stock: 18,
      description: 'Incluye lazo a juego para ceñir a la cintura.',
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= SHORTS (10) =================
    {
      id: 601,
      name: 'Short Denim Tiro Alto',
      category: 'Shorts',
      price: 499,
      rating: 4.8,
      stock: 30,
      description: 'Mezclilla rígida 100% algodón con bajo deshilachado y 5 bolsillos.',
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 602,
      name: 'Short de Lino con Cinturón',
      category: 'Shorts',
      price: 460,
      rating: 4.7,
      stock: 25,
      description: 'Cintura paperbag elastizada con lazo frontal y bolsillos laterales.',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 603,
      name: 'Biker Short Deportivo',
      category: 'Shorts',
      price: 340,
      rating: 4.9,
      stock: 35,
      description: 'Malla ciclista elástica de compresión alta y control de abdomen.',
      images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 604,
      name: 'Short Cargo con Bolsillos',
      category: 'Shorts',
      price: 520,
      rating: 4.8,
      stock: 22,
      description: 'Estilo utilitario con bolsillos laterales de fuelle y solapa.',
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 605,
      name: 'Short de Vestir con Pinzas',
      category: 'Shorts',
      price: 490,
      rating: 4.8,
      stock: 20,
      description: 'Corte sastre elegante de tiro medio para looks formales y casuales.',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 606,
      name: 'Short Deportivo de Felpa',
      category: 'Shorts',
      price: 380,
      rating: 4.6,
      stock: 28,
      description: 'Tejido jogger suave con cordón ajustable y ribete redondeado.',
      images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 607,
      name: 'Short Mom Fit Desgastado',
      category: 'Shorts',
      price: 510,
      rating: 4.7,
      stock: 24,
      description: 'Pierna holgada estilo vintage con roturas sutiles.',
      images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 608,
      name: 'Short de Satén Estilo Pijama',
      category: 'Shorts',
      price: 360,
      rating: 4.7,
      stock: 26,
      description: 'Tacto sedoso ultraligero con cintura fruncida y ribetes contrastantes.',
      images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 609,
      name: 'Short Falda Asimétrica',
      category: 'Shorts',
      price: 540,
      rating: 4.9,
      stock: 19,
      description: 'Diseño tipo skort con solapa delantera y short oculto.',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 610,
      name: 'Short Bermudas Holgado',
      category: 'Shorts',
      price: 480,
      rating: 4.6,
      stock: 21,
      description: 'Largo por encima de la rodilla con pernera recta amplia.',
      images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= PANTALONES DE MEZCLILLA / JEANS (10) =================
    {
      id: 701,
      name: 'Jeans Wide Leg Tiro Alto',
      category: 'Pantalones',
      price: 899,
      rating: 4.9,
      stock: 25,
      description: 'Pierna extra ancha en mezclilla premium con caída recta.',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 702,
      name: 'Jeans Mom Fit Clásicos',
      category: 'Pantalones',
      price: 849,
      rating: 4.8,
      stock: 30,
      description: 'Corte vintage ajustado a la cintura y ligeramente holgado en muslos.',
      images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 703,
      name: 'Jeans Flare Acampanados',
      category: 'Pantalones',
      price: 880,
      rating: 4.9,
      stock: 20,
      description: 'Silueta estilizada con bota campana retro y tejido ligeramente elástico.',
      images: ['https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 704,
      name: 'Jeans Straight Leg Rectos',
      category: 'Pantalones',
      price: 799,
      rating: 4.7,
      stock: 28,
      description: 'El corte recto básico infalible con dobladillo limpio.',
      images: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 705,
      name: 'Jeans Skinny High Waist',
      category: 'Pantalones',
      price: 750,
      rating: 4.6,
      stock: 32,
      description: 'Ajuste súper entallado de tiro ultra alto con tecnología super stretch.',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 706,
      name: 'Jeans Slouchy Baggy',
      category: 'Pantalones',
      price: 860,
      rating: 4.8,
      stock: 18,
      description: 'Volumen amplio en caderas y ajuste sutil en el tobillo.',
      images: ['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 707,
      name: 'Jeans Ripped con Aberturas',
      category: 'Pantalones',
      price: 870,
      rating: 4.7,
      stock: 22,
      description: 'Detalles destruidos en rodillas con lavado desvanecido.',
      images: ['https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 708,
      name: 'Jeans Bootcut Entallados',
      category: 'Pantalones',
      price: 820,
      rating: 4.7,
      stock: 24,
      description: 'Corte bota discreto para calzar con botines o tenis de plataforma.',
      images: ['https://images.unsplash.com/photo-1542272604-780c96856592?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 709,
      name: 'Jeans Carpenter Utilitarios',
      category: 'Pantalones',
      price: 890,
      rating: 4.8,
      stock: 17,
      description: 'Detalle de trabilla de martillo lateral y costuras dobles en contraste.',
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 710,
      name: 'Jeans Culotte Tobilleros',
      category: 'Pantalones',
      price: 780,
      rating: 4.6,
      stock: 21,
      description: 'Corte ancho cropped que deja al descubierto los tobillos.',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= PANTALONES CARGO (10) =================
    {
      id: 801,
      name: 'Pantalón Cargo Wide Leg Urbano',
      category: 'Pantalones',
      price: 890,
      rating: 4.9,
      stock: 24,
      description: 'Pierna ancha fluida con 6 bolsillos utilitarios de solapa.',
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 802,
      name: 'Pantalón Cargo Jogger Ajustable',
      category: 'Pantalones',
      price: 820,
      rating: 4.8,
      stock: 28,
      description: 'Puños elásticos en los tobillos y cordón técnico ajustable en cintura.',
      images: ['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 803,
      name: 'Pantalón Parachute Cargo Baggy',
      category: 'Pantalones',
      price: 920,
      rating: 4.9,
      stock: 20,
      description: 'Tejido técnico tipo paracaídas con tancas ajustables en bota y pretina.',
      images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 804,
      name: 'Cargo Slim Fit Gabardina',
      category: 'Pantalones',
      price: 840,
      rating: 4.7,
      stock: 26,
      description: 'Bolsillos laterales estilizados en gabardina de algodón premium.',
      images: ['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 805,
      name: 'Pantalón Cargo Satinado Elegante',
      category: 'Pantalones',
      price: 880,
      rating: 4.8,
      stock: 19,
      description: 'Fusión elegante de satén fluido con silueta cargo moderna.',
      images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 806,
      name: 'Pantalón Cargo Militar Multibolsillos',
      category: 'Pantalones',
      price: 860,
      rating: 4.7,
      stock: 22,
      description: 'Confección extra resistente con costuras reforzadas.',
      images: ['https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 807,
      name: 'Cargo Recto Tiro Bajo Y2K',
      category: 'Pantalones',
      price: 810,
      rating: 4.6,
      stock: 21,
      description: 'Inspiración retro años 2000 con tiro a la cadera y cremalleras vistas.',
      images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 808,
      name: 'Pantalón Cargo Denim Lavado',
      category: 'Pantalones',
      price: 940,
      rating: 4.9,
      stock: 18,
      description: 'Mezclilla pesada con bolsillos 3D estructurados en muslos.',
      images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 809,
      name: 'Cargo de Lino con Cordón',
      category: 'Pantalones',
      price: 790,
      rating: 4.7,
      stock: 25,
      description: 'Frescura de lino combinada con la funcionalidad de bolsillos cargo.',
      images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },
    {
      id: 810,
      name: 'Cargo Palazzo con Abertura Lateral',
      category: 'Pantalones',
      price: 870,
      rating: 4.8,
      stock: 16,
      description: 'Aberturas en los laterales de las piernas con botones automáticos.',
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'],
      sizes: this.apparelSizes,
      colors: this.standardColors
    },

    // ================= CALCETINES (5) =================
    {
      id: 901,
      name: 'Calcetines Crew Deportivos Ribbed (Pack 3)',
      category: 'Calcetines',
      price: 199,
      rating: 4.9,
      stock: 50,
      description: 'Algodón peinado con refuerzo acolchado en planta y talón.',
      images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 902,
      name: 'Calcetines Tobilleros Invisible No-Show',
      category: 'Calcetines',
      price: 149,
      rating: 4.8,
      stock: 60,
      description: 'Corte invisible con agarre de gel de silicona para evitar deslizamientos.',
      images: ['https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 903,
      name: 'Calcetines Altos con Ribete de Encaje',
      category: 'Calcetines',
      price: 180,
      rating: 4.9,
      stock: 35,
      description: 'Detalle romántico de encaje elástico en la parte superior.',
      images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 904,
      name: 'Calcetines Térmicos de Lana Suave',
      category: 'Calcetines',
      price: 240,
      rating: 4.9,
      stock: 30,
      description: 'Mezcla térmica de lana suave para mantener los pies cálidos.',
      images: ['https://images.unsplash.com/photo-1582966772680-860e372bb558?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 905,
      name: 'Calcetines Fruncidos Estilo Slouchy',
      category: 'Calcetines',
      price: 190,
      rating: 4.7,
      stock: 40,
      description: 'Caña holgada para llevar arrugada con tenis o mocasines.',
      images: ['https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },

    // ================= CALZADO (Zapatos, Tacones y Tenis) =================
    {
      id: 1001,
      name: 'Tenis Urbanos Retro Chunky',
      category: 'Calzado',
      price: 1299,
      rating: 4.9,
      stock: 20,
      description: 'Suela gruesa ligera con plantilla de amortiguación de memoria.',
      images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
      sizes: this.shoeSizes,
      colors: this.standardColors
    },
    {
      id: 1002,
      name: 'Tacones Stiletto con Tira al Tobillo',
      category: 'Calzado',
      price: 1150,
      rating: 4.8,
      stock: 18,
      description: 'Tacón fino de 8.5 cm con puntera afilada y cierre de hebilla.',
      images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
      sizes: this.shoeSizes,
      colors: this.standardColors
    },
    {
      id: 1003,
      name: 'Mocasines Clásicos Plataforma',
      category: 'Calzado',
      price: 1099,
      rating: 4.8,
      stock: 22,
      description: 'Zapatos mocasín con antifaz tradicional y suela track dentada.',
      images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800'],
      sizes: this.shoeSizes,
      colors: this.standardColors
    },
    {
      id: 1004,
      name: 'Sandalias de Tacón Bloque Minimal',
      category: 'Calzado',
      price: 980,
      rating: 4.7,
      stock: 25,
      description: 'Tiras finas tubulares con tacón bloque cómodo de 6 cm.',
      images: ['https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800'],
      sizes: this.shoeSizes,
      colors: this.standardColors
    },
    {
      id: 1005,
      name: 'Tenis Blancos Minimalistas Clásicos',
      category: 'Calzado',
      price: 1050,
      rating: 4.9,
      stock: 30,
      description: 'Confección de piel sintética lisa con forro acolchado.',
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800'],
      sizes: this.shoeSizes,
      colors: this.standardColors
    },

    // ================= ACCESORIOS (Aretes, Pulseras, Ligas y Diademas) =================
    {
      id: 1101,
      name: 'Arracadas Doradas Gruesas (Aretes)',
      category: 'Accesorios',
      price: 260,
      rating: 4.9,
      stock: 45,
      description: 'Argollas tubulares ligeras con baño de oro hipoalergénico.',
      images: ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800'],
      sizes: this.oneSize,
      colors: [
        { name: 'Dorado', hex: '#ffd700' },
        { name: 'Plateado', hex: '#c0c0c0' },
        { name: 'Negro', hex: '#111111' }
      ]
    },
  {
      id: 1102,
      name: 'Set de Pulseras Eslabón Cadena',
      category: 'Accesorios',
      price: 320,
      rating: 4.8,
      stock: 35,
      description: 'Set de 3 brazaletes combinables de eslabón plano y cierre marinero.',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80'],
      sizes: this.oneSize,
      colors: [
        { name: 'Dorado', hex: '#ffd700' },
        { name: 'Plateado', hex: '#c0c0c0' }
      ]
    },
    {
      id: 1103,
      name: 'Pack Scrunchies de Satén (Ligas)',
      category: 'Accesorios',
      price: 180,
      rating: 4.9,
      stock: 50,
      description: 'Pack de 5 ligas suaves de satén que cuidan tu cabello sin quebrarlo.',
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 1104,
      name: 'Diadema Acolchada de Terciopelo',
      category: 'Accesorios',
      price: 240,
      rating: 4.8,
      stock: 30,
      description: 'Diadema ancha forrada en terciopelo suave con estructura flexible.',
      images: ['https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800'],
      sizes: this.oneSize,
      colors: this.standardColors
    },
    {
      id: 1105,
      name: 'Aretes Colgantes de Perlas Barrocas',
      category: 'Accesorios',
      price: 290,
      rating: 4.9,
      stock: 28,
      description: 'Perlas cultivadas irregulares montadas en postes de plata.',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
      sizes: this.oneSize,
      colors: [
        { name: 'Blanco Perla', hex: '#fdfbf7' },
        { name: 'Dorado', hex: '#ffd700' }
      ]
    },
    {
      id: 1106,
      name: 'Diadema Metálica Minimalista',
      category: 'Accesorios',
      price: 210,
      rating: 4.7,
      stock: 32,
      description: 'Diseño ultrafino de metal pulido con terminales de confort.',
      images: ['https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800'],
      sizes: this.oneSize,
      colors: [
        { name: 'Dorado', hex: '#ffd700' },
        { name: 'Plateado', hex: '#c0c0c0' },
        { name: 'Negro', hex: '#111111' }
      ]
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  getSearchQuery(): Observable<string> {
    return this.searchQuerySubject.asObservable();
  }
}