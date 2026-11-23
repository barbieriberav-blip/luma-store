import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Component,computed,effect,linkedSignal,OnInit,signal} from '@angular/core';
import {firebaseErrorMessage} from './firebase-client';
import {USE_POSTGRES_API} from '../environments/store.config';
import {postgresRequest} from './postgres-api';
import {ProductGallery, type ProductPhoto} from './product-gallery';
import {StoreModal} from './store-modal';
import {ORDER_MAX_LINES,ORDER_MAX_LINE_QUANTITY,sparkRequest} from './spark-api';

type Page='inicio'|'catalogo'|'carrito'|'checkout'|'cuenta'|'admin'|'ayuda'|'politicas'|'nosotros'|'gracias';
type AuthMode='login'|'register';
interface Product {id:number;sku:string;name:string;description:string;category:string;category_id:number;price:number;stock:number;stock_by_size?:Record<string,number>;sizes:string[];image:string;gallery?:ProductPhoto[];badge:string;featured:number;material:string;care:string;active:number;}
interface Category {id:number;name:string;slug:string;active?:number;}
interface CartLine {productId:number;quantity:number;size:string;}
interface CartView extends CartLine {product:Product;lineTotal:number;}
interface CurrentUser {id:string;name:string;email:string;role:string;phone?:string;}
interface OrderItem {id:number;name:string;sku:string;size:string;quantity:number;unit_price:number;line_total:number;}
interface Order {id:number;folio:string;status:string;created_at:string;total:number;subtotal:number;discount:number;shipping:number;shipping_type:string;payment_status:string;tracking:string;items:OrderItem[];}
interface ReturnRequest {id:number;folio:string;order_folio:string;reason:string;detail:string;status:string;created_at:string;resolution:string;}
interface AdminData {metrics:any;products:Product[];categories:Category[];orders:any[];returns:any[];customers:any[];coupons:any[];tickets:any[];movements:any[];audit:any[];bestSellers?:{sku:string;name:string;quantity:number}[];}

const blankProduct=()=>({sku:'',name:'',description:'',material:'',care:'',price:499,stock:10,categoryId:1,sizesText:'CH, M, G',image:'/assets/product-fallback.svg',badge:'NUEVO',featured:false,active:true});
const blankAddress=()=>({recipient:'',street:'',neighborhood:'',city:'',state:'Tamaulipas',postalCode:'',phone:''});
function jsonStorage<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}

@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule,ProductGallery,StoreModal],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App implements OnInit {
 page=signal<Page>('inicio');
 products=signal<Product[]>([]);categories=signal<Category[]>([]);
 filteredCategory=signal('Todos');search=signal('');sort=signal('featured');maxPrice=signal(1500);stockOnly=signal(false);favoritesOnly=signal(false);
 cart=signal<CartLine[]>(jsonStorage<CartLine[]>('luma_cart_v2',[]));
 private guestFavorites=signal<number[]>(jsonStorage<number[]>('luma_wishlist_v2',[]));
 private accountFavorites=signal<number[]>([]);
 cartDrawer=signal(false);selected=signal<Product|null>(null);selectedSize=signal('');selectedQty=signal(1);
 account=signal<CurrentUser|null>(null);authMode=signal<AuthMode>('login');authForm={name:'',email:'',password:''};returnAfterAuth=signal<Page>('inicio');
 orders=signal<Order[]>([]);returns=signal<ReturnRequest[]>([]);addresses=signal<any[]>([]);
 checkoutAddress=blankAddress();shippingType=signal('estandar');couponInput='';couponApplied=signal('');couponDiscount=signal(0);termsAccepted=false;submitBusy=signal(false);idempotencyKey='';
 notice=signal('');error=signal('');busy=signal(false);lastOrder=signal<Order|null>(null);
 selectedPolicy=signal('envios');faqOpen=signal(0);contactForm={name:'',email:'',message:''};
 admin=signal<AdminData|null>(null);adminTab=signal('resumen');productEditor=signal(false);editProductId=signal<number|null>(null);productForm=blankProduct();productPhotos:ProductPhoto[]=[];categoryName='';editingCategory=signal<Category|null>(null);variantStock:Record<string,number>={};private originalVariantStock:Record<string,number>={};couponForm={code:'',percent:10,minimum:500,maxUses:100,expiresAt:''};
 returnOrderId=signal<number|null>(null);returnForm={kind:'devolucion',reason:'Talla incorrecta',detail:''};
 readonly siteCategories=computed(()=>[...new Set(['Todos',...this.categories().map(c=>c.name),...this.products().map(p=>p.category)])]);
 readonly favorites=computed(()=>this.account()?this.accountFavorites():this.guestFavorites());
 readonly quickBenefits=[{icon:'✦',title:'ESTILO A TU MANERA',description:'Prendas y accesorios para combinar'},{icon:'◈',title:'COMPRA SEGURA',description:'Demostración sin cobros reales'},{icon:'▱',title:'ENVÍO Y RECOLECCIÓN',description:'Opciones y costos antes de confirmar'}];
 readonly faqs=[{q:'¿Puedo realizar una compra real?',a:'No. LUMA STORE es un proyecto académico de demostración. Los productos, existencias, precios y pagos son simulados y no se realizan cargos ni envíos físicos.'},{q:'¿Cuánto cuesta el envío?',a:'En este simulador, el envío estándar cuesta $99 MXN y es gratuito a partir de $1,200 MXN después de descuentos. El exprés cuesta $179 MXN y la recolección simulada es gratuita.'},{q:'¿Cómo puedo dar seguimiento a mi pedido?',a:'Inicia sesión y abre Mi cuenta → Pedidos. Ahí verás el folio, fecha, productos, estado y guía simulada si un administrador la registra.'},{q:'¿Qué pasa si la talla no es correcta?',a:'Desde Mi cuenta puedes registrar una solicitud de devolución. El administrador podrá revisar, aprobar y registrar un reembolso simulado. Las políticas son académicas y no sustituyen los derechos del consumidor.'},{q:'¿Puedo pagar con tarjeta?',a:'No. El único medio disponible es el pago de prueba. LUMA no solicita ni conserva números de tarjeta, CVV o datos bancarios.'}];
 constructor(){effect(()=>{try{localStorage.setItem('luma_cart_v2',JSON.stringify(this.cart()))}catch{}});effect(()=>{try{localStorage.setItem('luma_wishlist_v2',JSON.stringify(this.guestFavorites()))}catch{}})}
 async ngOnInit(){await Promise.all([this.loadCatalog(),this.loadSession()])}
 readonly featured=computed(()=>this.products().filter(p=>p.featured).slice(0,6));
 readonly visibleProducts=computed(()=>{let ps=[...this.products()];const q=this.search().trim().toLocaleLowerCase('es-MX');if(q)ps=ps.filter(p=>(p.name+' '+p.description+' '+p.category+' '+p.sku).toLocaleLowerCase('es-MX').includes(q));if(this.filteredCategory()!=='Todos')ps=ps.filter(p=>p.category===this.filteredCategory());if(this.favoritesOnly())ps=ps.filter(p=>this.favorites().includes(p.id));if(this.stockOnly())ps=ps.filter(p=>p.stock>0);ps=ps.filter(p=>p.price<=this.maxPrice());if(this.sort()==='price_asc')ps.sort((a,b)=>a.price-b.price);if(this.sort()==='price_desc')ps.sort((a,b)=>b.price-a.price);if(this.sort()==='name')ps.sort((a,b)=>a.name.localeCompare(b.name,'es'));return ps;});
 readonly catalogPage=linkedSignal(()=>{this.visibleProducts();return 1});
 readonly catalogPages=computed(()=>Math.max(1,Math.ceil(this.visibleProducts().length/12)));
 readonly displayedProducts=computed(()=>{
  const products=this.visibleProducts();
  if(this.page()!=='catalogo')return products;
  const offset=(this.catalogPage()-1)*12;
  return products.slice(offset,offset+12);
 });
 readonly cartView=computed<CartView[]>(()=>this.cart().flatMap(line=>{const p=this.products().find(x=>x.id===line.productId);return p?[{...line,product:p,lineTotal:p.price*line.quantity}]:[]}));
 readonly cartCount=computed(()=>this.cartView().reduce((n,x)=>n+x.quantity,0));
 readonly subtotal=computed(()=>this.cartView().reduce((n,x)=>n+x.lineTotal,0));
 readonly shipping=computed(()=>this.shippingType()==='recoger'?0:this.shippingType()==='express'?179:Math.max(0,this.subtotal()-this.couponDiscount())>=1200?0:99);
 readonly grandTotal=computed(()=>Math.max(0,this.subtotal()-this.couponDiscount())+this.shipping());
 readonly totalWishlist=computed(()=>this.favorites().length);
 money(n:number){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n||0)}
 date(s:string){try{const d=new Date(s.includes('T')?s:s.replace(' ','T')+'Z');return Number.isNaN(d.getTime())?s:d.toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}catch{return s}}
 readonly usePostgres=USE_POSTGRES_API;
 readonly request=USE_POSTGRES_API?postgresRequest:sparkRequest;
 stockFor(product:Product,size:string){return product.stock_by_size?.[size]??product.stock}
 productSizes(){return [...new Set(this.productForm.sizesText.split(',').map(size=>size.trim()).filter(Boolean))]}
 tell(message:string){this.notice.set(message);this.error.set('');window.setTimeout(()=>{if(this.notice()===message)this.notice.set('')},5500)}
 fail(e:unknown){const msg=firebaseErrorMessage(e);this.error.set(msg);window.setTimeout(()=>{if(this.error()===msg)this.error.set('')},6500)}
 async loadCatalog(){
  try{
   const [products,categories]=await Promise.all([this.request<Product[]>('/products'),this.request<Category[]>('/categories')]);
   this.products.set(products);
   this.categories.set(categories);
   const availableSizes=new Map(products.map(product=>[product.id,product.sizes]));
   const currentCart=this.cart();
   const validCart=currentCart.filter(line=>availableSizes.get(line.productId)?.includes(line.size));
   if(validCart.length!==currentCart.length){
    this.cart.set(validCart);
    this.clearCoupon();
    this.tell('Retiramos de tu bolsa los artículos o tallas que ya no están en el catálogo.');
   }
  }catch(e){this.fail(e)}
 }
 async loadSession(){try{const result=await this.request<{user:CurrentUser|null}>('/auth/me');this.account.set(result.user);if(result.user)await this.loadAccount()}catch{this.account.set(null)}}
 go(page:Page){this.page.set(page);this.cartDrawer.set(false);this.selected.set(null);this.productEditor.set(false);window.scrollTo({top:0,behavior:'smooth'});if(page==='admin')this.loadAdmin();if(page==='cuenta'&&this.account())this.loadAccount()}
 chooseCategory(cat:string){this.filteredCategory.set(cat);this.favoritesOnly.set(false);this.go('catalogo')}
 startSearch(e:Event){this.search.set((e.target as HTMLInputElement).value);this.page.set('catalogo');}
 resetFilters(){this.search.set('');this.filteredCategory.set('Todos');this.sort.set('featured');this.maxPrice.set(1500);this.stockOnly.set(false);this.favoritesOnly.set(false)}
 wishlistToggle(){this.favoritesOnly.set(!this.favoritesOnly());this.page.set('catalogo');window.scrollTo(0,0)}
 async favoriteToggle(id:number){
  const accountId=this.account()?.id;
  const turnOn=!this.favorites().includes(id);
  const update=(ids:number[])=>turnOn?[...new Set([...ids,id])]:ids.filter(current=>current!==id);
  if(!accountId){this.guestFavorites.update(update);return}
  try{
   await this.request('/wishlist/'+id,turnOn?'POST':'DELETE');
   if(this.account()?.id===accountId)this.accountFavorites.update(update);
  }catch(e){this.fail(e)}
 }
 openProduct(p:Product){this.selected.set(p);this.selectedSize.set(p.sizes.find(size=>this.stockFor(p,size)>0)||p.sizes[0]||'Unitalla');this.selectedQty.set(1)}
 imageError(event:Event){const img=event.target as HTMLImageElement;if(!img.src.endsWith('/assets/product-fallback.svg'))img.src='/assets/product-fallback.svg'}
 addCart(p:Product,size?:string,quantity=1){
  const selectedSize=size||p.sizes[0]||'Unitalla';
  const cart=this.cart();
  const matching=cart.filter(line=>line.productId===p.id);
  const existing=matching.find(line=>line.size===selectedSize);
  const current=p.stock_by_size?existing?.quantity??0:matching.reduce((total,line)=>total+line.quantity,0);
  if(current+quantity>this.stockFor(p,selectedSize)){this.fail(new Error('No hay suficientes unidades disponibles'));return}
  if((existing?.quantity??0)+quantity>ORDER_MAX_LINE_QUANTITY){
   this.fail(new Error(`Puedes agregar hasta ${ORDER_MAX_LINE_QUANTITY} piezas por producto y talla`));return;
  }
  if(!existing&&cart.length>=ORDER_MAX_LINES){
   this.fail(new Error(`Tu bolsa admite hasta ${ORDER_MAX_LINES} combinaciones de producto y talla`));return;
  }
  this.clearCoupon();
  this.cart.set(existing
   ? cart.map(line=>line===existing?{...line,quantity:line.quantity+quantity}:line)
   : [...cart,{productId:p.id,size:selectedSize,quantity}]);
  this.selected.set(null);
  this.cartDrawer.set(true);
  this.tell('Producto agregado a tu bolsa');
 }
 updateCart(id:number,size:string,delta:number){
  const matching=this.cart().filter(line=>line.productId===id);
  const line=matching.find(item=>item.size===size);
  if(!line)return;
  if(delta>0){
   const product=this.products().find(item=>item.id===id);
   const current=product?.stock_by_size?line.quantity:matching.reduce((total,item)=>total+item.quantity,0);
   if(!product||current+delta>this.stockFor(product,size)){this.fail(new Error('Inventario insuficiente'));return}
   if(line.quantity+delta>ORDER_MAX_LINE_QUANTITY){
    this.fail(new Error(`Puedes agregar hasta ${ORDER_MAX_LINE_QUANTITY} piezas por producto y talla`));return;
   }
  }
  this.cart.update(lines=>lines.map(item=>item===line?{...item,quantity:item.quantity+delta}:item).filter(item=>item.quantity>0));
  this.clearCoupon();
 }
 removeCart(id:number,size:string){this.cart.update(xs=>xs.filter(x=>!(x.productId===id&&x.size===size)));this.clearCoupon()}
 clearCoupon(){this.couponApplied.set('');this.couponDiscount.set(0)}
 beginCheckout(){if(!this.cartCount()){this.tell('Tu carrito está vacío');return}if(!this.account()){this.returnAfterAuth.set('checkout');this.authMode.set('login');this.go('cuenta');this.tell('Inicia sesión para finalizar tu compra de prueba');return}this.go('checkout')}
 async applyCoupon(){if(!this.couponInput.trim()){this.clearCoupon();return}try{const r=await this.request<{code:string;discount:number;percent:number}>(
  this.usePostgres?'/orders/quote':'/coupons/validate','POST',this.usePostgres
    ?{items:this.cart(),coupon:this.couponInput,shippingType:this.shippingType()}
    :{code:this.couponInput,subtotal:this.subtotal()});this.couponApplied.set(r.code);this.couponDiscount.set(r.discount);this.tell(`Cupón ${r.code} aplicado · ${r.percent}%`)}catch(e){this.clearCoupon();this.fail(e)}}
 async placeOrder(){if(this.submitBusy())return;if(!this.account()){this.beginCheckout();return}if(!this.termsAccepted){this.fail(new Error('Debes aceptar los términos para continuar'));return}this.submitBusy.set(true);try{if(!this.idempotencyKey)this.idempotencyKey=crypto.randomUUID();const order=await this.request<Order>('/orders','POST',{items:this.cart().map(x=>({...x})),address:this.checkoutAddress,shippingType:this.shippingType(),coupon:this.couponApplied(),termsAccepted:this.termsAccepted,payment:'simulado',idempotencyKey:this.idempotencyKey});this.lastOrder.set(order);this.cart.set([]);this.clearCoupon();this.couponInput='';this.idempotencyKey='';this.termsAccepted=false;this.go('gracias');await this.loadCatalog();await this.loadAccount();}catch(e){this.fail(e)}finally{this.submitBusy.set(false)}}
 async submitAuth(){if(this.busy())return;this.busy.set(true);try{const route=this.authMode()==='register'?'/auth/register':'/auth/login';const result=await this.request<{user:CurrentUser}>(route,'POST',this.authForm);this.account.set(result.user);this.authForm={name:'',email:'',password:''};await this.loadAccount();this.tell(`¡Bienvenida a LUMA, ${result.user.name}!`);this.go(this.returnAfterAuth());this.returnAfterAuth.set('inicio')}catch(e){this.fail(e)}finally{this.busy.set(false)}}
 async recoverPassword(){
  const email=this.authForm.email.trim();
  if(!email){this.fail(new Error('Escribe primero tu correo electrónico para recuperar tu contraseña.'));return}
  if(this.busy())return;
  this.busy.set(true);
  try{
   const result=await this.request<{message:string}>('/auth/recover','POST',{email});
   this.tell(result.message);
  }catch(e){this.fail(e)}finally{this.busy.set(false)}
 }
 async logout(){
  try{
   await this.request('/auth/logout','POST');
   this.account.set(null);
   this.accountFavorites.set([]);
   this.orders.set([]);
   this.returns.set([]);
   this.addresses.set([]);
   this.admin.set(null);
   this.tell('Sesión cerrada correctamente');
   this.go('inicio');
  }catch(e){this.fail(e)}
 }
 async loadAccount(){
  const accountId=this.account()?.id;
  if(!accountId)return;
  try{
   const [orders,returns,details]=await Promise.all([this.request<Order[]>('/orders'),this.request<ReturnRequest[]>('/returns'),this.request<{wishlist:number[];addresses:any[]}>('/account')]);
   if(this.account()?.id!==accountId)return;
   this.orders.set(orders);
   this.returns.set(returns);
   this.addresses.set(details.addresses);
   this.accountFavorites.set(details.wishlist);
  }catch(e){this.fail(e)}
 }
 askReturn(orderId:number){
  this.returnOrderId.set(orderId);
  const order=this.orders().find(item=>item.id===orderId);
  this.returnForm={kind:order?.status==='entregado'?'devolucion':'cancelacion',reason:'Talla incorrecta',detail:''};
 }
 async sendReturn(){if(!this.returnOrderId())return;try{await this.request('/returns','POST',{orderId:this.returnOrderId(),...this.returnForm});this.returnOrderId.set(null);await this.loadAccount();this.tell('Tu solicitud quedó registrada y tiene un folio de seguimiento')}catch(e){this.fail(e)}}
 policy(tab:string){this.selectedPolicy.set(tab);this.go('politicas')}
 async sendContact(){try{const r=await this.request<{folio:string}>('/contact','POST',this.contactForm);this.tell('Solicitud registrada · '+r.folio+' (demo académica)');this.contactForm={name:'',email:'',message:''}}catch(e){this.fail(e)}}
 openAdminTab(tab:string){
  this.adminTab.set(tab);
  void this.loadAdmin();
 }
 async loadAdmin(){if(this.account()?.role!=='admin'){this.fail(new Error('Necesitas una cuenta administrativa'));return}try{const data=await this.request<AdminData>('/admin/overview');this.admin.set(data)}catch(e){this.fail(e)}}
 startProduct(p?:Product){this.productPhotos=(p?.gallery ?? []).map(photo=>({...photo}));this.editProductId.set(p?.id??null);this.originalVariantStock={...p?.stock_by_size};this.variantStock={...this.originalVariantStock};this.productForm=p?{sku:p.sku,name:p.name,description:p.description,material:p.material,care:p.care,price:p.price,stock:p.stock,categoryId:p.category_id,sizesText:p.sizes.join(', '),image:p.image,badge:p.badge,featured:!!p.featured,active:!!p.active}:blankProduct();this.productEditor.set(true)}
 async saveProduct(){try{
  const sizes=this.productSizes();
  const variantStock=Object.fromEntries(sizes.filter(size=>Object.hasOwn(this.variantStock,size)&&
    this.variantStock[size]!==this.originalVariantStock[size]).map(size=>[size,this.variantStock[size]]));
  const form={...this.productForm,sizes,...(this.usePostgres?{variantStock,expectedVariantStock:this.originalVariantStock,gallery:this.productPhotos}:{})};if(this.editProductId())await this.request('/admin/products/'+this.editProductId(),'PATCH',form);else await this.request('/admin/products','POST',form);this.productEditor.set(false);await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Producto guardado correctamente')}catch(e){this.fail(e)}}
 async deleteProduct(p:Product){if(!confirm('¿Dar de baja este producto del catálogo?'))return;try{await this.request('/admin/products/'+p.id,'DELETE',{});await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Producto desactivado')}catch(e){this.fail(e)}}
 async createCategory(){try{await this.request('/admin/categories','POST',{name:this.categoryName});this.categoryName='';await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Categoría registrada')}catch(e){this.fail(e)}}
 selectCategory(category:Category){
  this.editingCategory.set(category);
  this.categoryName=category.name;
 }
 async editCategory(active:boolean){
  const category=this.editingCategory();
  if(!category)return;
  try{
   await this.request('/admin/categories/'+category.id,active?'PATCH':'DELETE',active?{name:this.categoryName,active}:undefined);
   this.editingCategory.set(null);
   this.categoryName='';
   await Promise.all([this.loadAdmin(),this.loadCatalog()]);
   this.tell('Categoría actualizada');
  }catch (error){this.fail(error)}
 }
 async changeOrder(o:any){try{await this.request('/admin/orders/'+o.id,'PATCH',{status:o.nextStatus||o.status});await this.loadAdmin();this.tell('Estado del pedido actualizado')}catch(e){this.fail(e)}}
 async saveTracking(o:any){try{await this.request('/admin/orders/'+o.id,'PATCH',{tracking:o.tracking});await this.loadAdmin();this.tell('Guía registrada')}catch(e){this.fail(e)}}
 async reviewReturn(r:any,status:string){try{await this.request('/admin/returns/'+r.id,'PATCH',{status,resolution:r.resolution||'Resolución académica registrada'});await this.loadAdmin();this.tell('Solicitud actualizada')}catch(e){this.fail(e)}}
 async saveCoupon(){try{await this.request('/admin/coupons','POST',{...this.couponForm,expiresAt:this.couponForm.expiresAt?new Date(this.couponForm.expiresAt).toISOString():null});this.couponForm={code:'',percent:10,minimum:500,maxUses:100,expiresAt:''};await this.loadAdmin();this.tell('Cupón creado')}catch(e){this.fail(e)}}
 async toggleCoupon(c:any){try{await this.request('/admin/coupons/'+c.id,'PATCH',{active:!c.active});await this.loadAdmin();this.tell('Cupón actualizado')}catch(e){this.fail(e)}}
 async updateTicket(t:any,status:string){try{await this.request('/admin/tickets/'+t.id,'PATCH',{status});await this.loadAdmin();this.tell('Caso de atención actualizado')}catch(e){this.fail(e)}}
 async exportOrders(){try{
  const rows=await this.request<Array<{folio:string;fecha:string;estado:string;subtotal:number;envio:number;descuento:number;total:number}>>('/admin/export/orders');
  const cols=['folio','fecha','estado','subtotal','envio','descuento','total'] as const;
  const csv=[cols.join(','),...rows.map(r=>cols.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\r\n');
  const a=document.createElement('a');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
  a.href=url;a.download='luma_pedidos.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1500);
 }catch(e){this.fail(e)}}
 async seedDemo(){try{if(!confirm('¿Cargar los 24 productos y categorías de demostración en tu Firebase?'))return;const r=await this.request<{products:number}>('/admin/seed','POST',{});await Promise.all([this.loadCatalog(),this.loadAdmin()]);this.tell(`${r.products} productos de demostración cargados en Firebase`)}catch(e){this.fail(e)}}
}
