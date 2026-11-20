import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Component,computed,effect,OnInit,signal} from '@angular/core';
import {createUserWithEmailAndPassword,sendPasswordResetEmail,signInWithEmailAndPassword,signOut,updateProfile} from 'firebase/auth';
import {currentAuth,firebaseReady} from './firebase-client';
import {sparkRequest} from './spark-api';

type Page='inicio'|'catalogo'|'carrito'|'checkout'|'cuenta'|'admin'|'ayuda'|'politicas'|'nosotros'|'gracias';
type AuthMode='login'|'register';
interface Product {id:number;sku:string;name:string;description:string;category:string;category_id:number;price:number;stock:number;sizes:string[];image:string;badge:string;featured:number;material:string;care:string;active:number;}
interface Category {id:number;name:string;slug:string;}
interface CartLine {productId:number;quantity:number;size:string;}
interface CartView extends CartLine {product:Product;lineTotal:number;}
interface CurrentUser {id:string;name:string;email:string;role:string;phone?:string;}
interface OrderItem {id:number;name:string;sku:string;size:string;quantity:number;unit_price:number;line_total:number;}
interface Order {id:number;folio:string;status:string;created_at:string;total:number;subtotal:number;discount:number;shipping:number;shipping_type:string;payment_status:string;tracking:string;items:OrderItem[];}
interface ReturnRequest {id:number;folio:string;order_folio:string;reason:string;detail:string;status:string;created_at:string;resolution:string;}
interface AdminData {metrics:any;products:Product[];categories:Category[];orders:any[];returns:any[];customers:any[];coupons:any[];tickets:any[];movements:any[];audit:any[];}

const blankProduct=()=>({sku:'',name:'',description:'',material:'',care:'',price:499,stock:10,categoryId:1,sizesText:'CH, M, G',image:'/assets/product-fallback.svg',badge:'NUEVO',featured:false,active:true});
const blankAddress=()=>({recipient:'',street:'',neighborhood:'',city:'',state:'Tamaulipas',postalCode:'',phone:''});
function jsonStorage<T>(key:string,fallback:T):T{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}

@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./app.html',styleUrl:'./app.css'})
export class App implements OnInit {
 page=signal<Page>('inicio');
 products=signal<Product[]>([]);categories=signal<Category[]>([]);
 filteredCategory=signal('Todos');search=signal('');sort=signal('featured');maxPrice=signal(1500);stockOnly=signal(false);favoritesOnly=signal(false);
 cart=signal<CartLine[]>(jsonStorage<CartLine[]>('luma_cart_v2',[]));favorites=signal<number[]>(jsonStorage<number[]>('luma_wishlist_v2',[]));
 cartDrawer=signal(false);selected=signal<Product|null>(null);selectedSize=signal('');selectedQty=signal(1);
 account=signal<CurrentUser|null>(null);authMode=signal<AuthMode>('login');authForm={name:'',email:'',password:''};returnAfterAuth=signal<Page>('inicio');
 orders=signal<Order[]>([]);returns=signal<ReturnRequest[]>([]);addresses=signal<any[]>([]);
 checkoutAddress=blankAddress();shippingType=signal('estandar');couponInput='';couponApplied=signal('');couponDiscount=signal(0);termsAccepted=false;submitBusy=signal(false);idempotencyKey='';
 notice=signal('');error=signal('');apiConnected=signal(false);loading=signal(true);busy=signal(false);lastOrder=signal<Order|null>(null);
 selectedPolicy=signal('envios');faqOpen=signal(0);contactForm={name:'',email:'',message:''};
 admin=signal<AdminData|null>(null);adminTab=signal('resumen');productEditor=signal(false);editProductId=signal<number|null>(null);productForm=blankProduct();categoryName='';couponForm={code:'',percent:10,minimum:500,maxUses:100};
 returnOrderId=signal<number|null>(null);returnForm={reason:'Talla incorrecta',detail:''};
 readonly siteCategories=['Todos','Tops','Pantalones','Shorts','Hoodies','Suéteres','Cardigans','Calcetines','Calzado','Accesorios','Vestidos'];
 readonly quickBenefits=[{icon:'✦',title:'ESTILO A TU MANERA',description:'Prendas y accesorios para combinar'},{icon:'◈',title:'COMPRA SEGURA',description:'Demostración sin cobros reales'},{icon:'▱',title:'ENVÍO Y RECOLECCIÓN',description:'Opciones y costos antes de confirmar'}];
 readonly faqs=[{q:'¿Puedo realizar una compra real?',a:'No. LUMA STORE es un proyecto académico de demostración. Los productos, existencias, precios y pagos son simulados y no se realizan cargos ni envíos físicos.'},{q:'¿Cuánto cuesta el envío?',a:'En este simulador, el envío estándar cuesta $99 MXN y es gratuito a partir de $1,200 MXN después de descuentos. El exprés cuesta $179 MXN y la recolección simulada es gratuita.'},{q:'¿Cómo puedo dar seguimiento a mi pedido?',a:'Inicia sesión y abre Mi cuenta → Pedidos. Ahí verás el folio, fecha, productos, estado y guía simulada si un administrador la registra.'},{q:'¿Qué pasa si la talla no es correcta?',a:'Desde Mi cuenta puedes registrar una solicitud de devolución. El administrador podrá revisar, aprobar y registrar un reembolso simulado. Las políticas son académicas y no sustituyen los derechos del consumidor.'},{q:'¿Puedo pagar con tarjeta?',a:'No. El único medio disponible es el pago de prueba. LUMA no solicita ni conserva números de tarjeta, CVV o datos bancarios.'}];
 constructor(){effect(()=>{try{localStorage.setItem('luma_cart_v2',JSON.stringify(this.cart()))}catch{}});effect(()=>{try{localStorage.setItem('luma_wishlist_v2',JSON.stringify(this.favorites()))}catch{}})}
 async ngOnInit(){await Promise.all([this.loadCatalog(),this.loadSession()]);this.loading.set(false)}
 readonly featured=computed(()=>this.products().filter(p=>p.featured).slice(0,6));
 readonly visibleProducts=computed(()=>{let ps=[...this.products()];const q=this.search().trim().toLocaleLowerCase('es-MX');if(q)ps=ps.filter(p=>(p.name+' '+p.description+' '+p.category+' '+p.sku).toLocaleLowerCase('es-MX').includes(q));if(this.filteredCategory()!=='Todos')ps=ps.filter(p=>p.category===this.filteredCategory());if(this.favoritesOnly())ps=ps.filter(p=>this.favorites().includes(p.id));if(this.stockOnly())ps=ps.filter(p=>p.stock>0);ps=ps.filter(p=>p.price<=this.maxPrice());if(this.sort()==='price_asc')ps.sort((a,b)=>a.price-b.price);if(this.sort()==='price_desc')ps.sort((a,b)=>b.price-a.price);if(this.sort()==='name')ps.sort((a,b)=>a.name.localeCompare(b.name,'es'));return ps;});
 readonly cartView=computed<CartView[]>(()=>this.cart().flatMap(line=>{const p=this.products().find(x=>x.id===line.productId);return p?[{...line,product:p,lineTotal:p.price*line.quantity}]:[]}));
 readonly cartCount=computed(()=>this.cart().reduce((n,x)=>n+x.quantity,0));
 readonly subtotal=computed(()=>this.cartView().reduce((n,x)=>n+x.lineTotal,0));
 readonly shipping=computed(()=>this.shippingType()==='recoger'?0:this.shippingType()==='express'?179:Math.max(0,this.subtotal()-this.couponDiscount())>=1200?0:99);
 readonly grandTotal=computed(()=>Math.max(0,this.subtotal()-this.couponDiscount())+this.shipping());
 readonly totalWishlist=computed(()=>this.favorites().length);
 money(n:number){return new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n||0)}
 date(s:string){try{const d=new Date(s.includes('T')?s:s.replace(' ','T')+'Z');return Number.isNaN(d.getTime())?s:d.toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'})}catch{return s}}
 async request<T>(url:string,method='GET',payload?:unknown):Promise<T>{
  if(!firebaseReady){
    if(method==='GET'&&(url==='/products'||url==='/categories')){
      const response=await fetch('/assets/catalogo-vista-previa.json');
      if(!response.ok)throw new Error('No se encontró el catálogo de vista previa');
      const demo=await response.json();return demo[url.slice(1)] as T;
    }
    throw new Error('Conecta tu proyecto Firebase: abre src/environments/firebase.config.ts y coloca los datos de tu aplicación web.');
  }
  const auth=currentAuth();
  if(url==='/auth/register'&&method==='POST'){
    const data=payload as {name:string;email:string;password:string};
    if(!data.name||data.name.trim().length<2)throw new Error('Ingresa tu nombre');
    if(data.password.length<10)throw new Error('La contraseña debe tener al menos 10 caracteres');
    const credential=await createUserWithEmailAndPassword(auth,data.email,data.password);
    await updateProfile(credential.user,{displayName:data.name.trim()});
    await this.request('/auth/profile','POST',{name:data.name.trim()});
    return this.request<T>('/auth/me');
  }
  if(url==='/auth/login'&&method==='POST'){
    const data=payload as {email:string;password:string};
    await signInWithEmailAndPassword(auth,data.email,data.password);
    return this.request<T>('/auth/me');
  }
  if(url==='/auth/logout'&&method==='POST'){await signOut(auth);return {ok:true} as T;}
  if(url==='/auth/recover'&&method==='POST'){
    const email=(payload as {email:string}).email;
    await sendPasswordResetEmail(auth,email);
    return {message:'Si la cuenta existe, Firebase enviará las instrucciones de recuperación a tu correo.'} as T;
  }
  if(url==='/auth/me'&&method==='GET'){
    await auth.authStateReady();
    if(!auth.currentUser)return {user:null} as T;
  }
  return sparkRequest<T>(url,method,payload);
 }
 tell(message:string){this.notice.set(message);this.error.set('');window.setTimeout(()=>{if(this.notice()===message)this.notice.set('')},5500)}
 fail(e:unknown){const msg=e instanceof Error?e.message:'Ocurrió un error';this.error.set(msg);window.setTimeout(()=>{if(this.error()===msg)this.error.set('')},6500)}
 async loadCatalog(){try{const [products,categories]=await Promise.all([this.request<Product[]>('/products'),this.request<Category[]>('/categories')]);this.products.set(products);this.categories.set(categories);this.apiConnected.set(firebaseReady)}catch(e){this.apiConnected.set(false);this.fail(e)}}
 async loadSession(){try{const result=await this.request<{user:CurrentUser|null}>('/auth/me');this.account.set(result.user);if(result.user)await this.loadAccount()}catch{this.account.set(null)}}
 go(page:Page){this.page.set(page);this.cartDrawer.set(false);this.selected.set(null);this.productEditor.set(false);window.scrollTo({top:0,behavior:'smooth'});if(page==='admin')this.loadAdmin();if(page==='cuenta'&&this.account())this.loadAccount()}
 chooseCategory(cat:string){this.filteredCategory.set(cat);this.favoritesOnly.set(false);this.go('catalogo')}
 startSearch(e:Event){this.search.set((e.target as HTMLInputElement).value);this.page.set('catalogo');}
 resetFilters(){this.search.set('');this.filteredCategory.set('Todos');this.sort.set('featured');this.maxPrice.set(1500);this.stockOnly.set(false);this.favoritesOnly.set(false)}
 wishlistToggle(){this.favoritesOnly.set(!this.favoritesOnly());this.page.set('catalogo');window.scrollTo(0,0)}
 async favoriteToggle(id:number){const newOn=!this.favorites().includes(id);this.favorites.update(ids=>newOn?[...ids,id]:ids.filter(i=>i!==id));if(this.account()){try{await this.request('/wishlist/'+id,newOn?'POST':'DELETE')}catch(e){this.fail(e)}}}
 openProduct(p:Product){this.selected.set(p);this.selectedSize.set(p.sizes[0]||'Unitalla');this.selectedQty.set(1)}
 imageError(event:Event){const img=event.target as HTMLImageElement;if(!img.src.endsWith('/assets/product-fallback.svg'))img.src='/assets/product-fallback.svg'}
 addCart(p:Product,size?:string,quantity=1){const s=size||p.sizes[0]||'Unitalla';const current=this.cart().filter(x=>x.productId===p.id).reduce((n,x)=>n+x.quantity,0);if(current+quantity>p.stock){this.fail(new Error('No hay suficientes unidades disponibles'));return}const existing=this.cart().find(x=>x.productId===p.id&&x.size===s);this.clearCoupon();this.cart.update(xs=>existing?xs.map(x=>x===existing?{...x,quantity:x.quantity+quantity}:x):[...xs,{productId:p.id,size:s,quantity}]);this.selected.set(null);this.cartDrawer.set(true);this.tell('Producto agregado a tu bolsa')}
 updateCart(id:number,size:string,delta:number){const l=this.cart().find(x=>x.productId===id&&x.size===size);if(!l)return;const p=this.products().find(x=>x.id===id);const current=this.cart().filter(x=>x.productId===id).reduce((n,x)=>n+x.quantity,0);if(delta>0&&p&&current+delta>p.stock){this.fail(new Error('Inventario insuficiente'));return}this.cart.update(xs=>xs.map(x=>x===l?{...x,quantity:x.quantity+delta}:x).filter(x=>x.quantity>0));this.clearCoupon()}
 removeCart(id:number,size:string){this.cart.update(xs=>xs.filter(x=>!(x.productId===id&&x.size===size)));this.clearCoupon()}
 clearCoupon(){this.couponApplied.set('');this.couponDiscount.set(0)}
 beginCheckout(){if(!this.cartCount()){this.tell('Tu carrito está vacío');return}if(!this.account()){this.returnAfterAuth.set('checkout');this.authMode.set('login');this.go('cuenta');this.tell('Inicia sesión para finalizar tu compra de prueba');return}this.go('checkout')}
 async applyCoupon(){if(!this.couponInput.trim()){this.clearCoupon();return}try{const r=await this.request<{code:string;discount:number;percent:number}>('/coupons/validate','POST',{code:this.couponInput,subtotal:this.subtotal()});this.couponApplied.set(r.code);this.couponDiscount.set(r.discount);this.tell(`Cupón ${r.code} aplicado · ${r.percent}%`)}catch(e){this.clearCoupon();this.fail(e)}}
 async placeOrder(){if(this.submitBusy())return;if(!this.account()){this.beginCheckout();return}if(!this.termsAccepted){this.fail(new Error('Debes aceptar los términos para continuar'));return}this.submitBusy.set(true);try{if(!this.idempotencyKey)this.idempotencyKey=crypto.randomUUID();const order=await this.request<Order>('/orders','POST',{items:this.cart().map(x=>({...x})),address:this.checkoutAddress,shippingType:this.shippingType(),coupon:this.couponApplied(),termsAccepted:this.termsAccepted,payment:'simulado',idempotencyKey:this.idempotencyKey});this.lastOrder.set(order);this.cart.set([]);this.clearCoupon();this.couponInput='';this.idempotencyKey='';this.termsAccepted=false;this.go('gracias');await this.loadCatalog();await this.loadAccount();}catch(e){this.fail(e)}finally{this.submitBusy.set(false)}}
 async submitAuth(){if(this.busy())return;this.busy.set(true);try{const route=this.authMode()==='register'?'/auth/register':'/auth/login';const result=await this.request<{user:CurrentUser}>(route,'POST',this.authForm);this.account.set(result.user);this.authForm={name:'',email:'',password:''};await this.loadAccount();this.tell(`¡Bienvenida a LUMA, ${result.user.name}!`);this.go(this.returnAfterAuth());this.returnAfterAuth.set('inicio')}catch(e){this.fail(e)}finally{this.busy.set(false)}}
 async recoverPassword(){
  const email=this.authForm.email.trim();
  if(!email){this.fail(new Error('Escribe primero tu correo electrónico para solicitar la recuperación simulada.'));return}
  if(this.busy())return;
  this.busy.set(true);
  try{
   const result=await this.request<{message:string}>('/auth/recover','POST',{email});
   this.tell(result.message);
  }catch(e){this.fail(e)}finally{this.busy.set(false)}
 }
 async logout(){try{await this.request('/auth/logout','POST',{});this.account.set(null);this.orders.set([]);this.returns.set([]);this.admin.set(null);this.tell('Sesión cerrada correctamente');this.go('inicio')}catch(e){this.fail(e)}}
 async loadAccount(){if(!this.account())return;try{const [orders,returns,details]=await Promise.all([this.request<Order[]>('/orders'),this.request<ReturnRequest[]>('/returns'),this.request<{wishlist:number[];addresses:any[]}>('/account')]);this.orders.set(orders);this.returns.set(returns);this.addresses.set(details.addresses);this.favorites.set(details.wishlist)}catch(e){this.fail(e)}}
 askReturn(orderId:number){this.returnOrderId.set(orderId);this.returnForm={reason:'Talla incorrecta',detail:''}}
 async sendReturn(){if(!this.returnOrderId())return;try{await this.request('/returns','POST',{orderId:this.returnOrderId(),reason:this.returnForm.reason,detail:this.returnForm.detail});this.returnOrderId.set(null);await this.loadAccount();this.tell('Tu solicitud quedó registrada y tiene un folio de seguimiento')}catch(e){this.fail(e)}}
 policy(tab:string){this.selectedPolicy.set(tab);this.go('politicas')}
 async sendContact(){try{const r=await this.request<{folio:string}>('/contact','POST',this.contactForm);this.tell('Solicitud registrada · '+r.folio+' (demo académica)');this.contactForm={name:'',email:'',message:''}}catch(e){this.fail(e)}}
 async loadAdmin(){if(this.account()?.role!=='admin'){this.fail(new Error('Necesitas una cuenta administrativa'));return}try{const data=await this.request<AdminData>('/admin/overview');this.admin.set(data)}catch(e){this.fail(e)}}
 startProduct(p?:Product){this.editProductId.set(p?.id??null);this.productForm=p?{sku:p.sku,name:p.name,description:p.description,material:p.material,care:p.care,price:p.price,stock:p.stock,categoryId:p.category_id,sizesText:p.sizes.join(', '),image:p.image,badge:p.badge,featured:!!p.featured,active:!!p.active}:blankProduct();this.productEditor.set(true)}
 async saveProduct(){try{const form={...this.productForm,sizes:this.productForm.sizesText.split(',').map(x=>x.trim()).filter(Boolean)};if(this.editProductId())await this.request('/admin/products/'+this.editProductId(),'PATCH',form);else await this.request('/admin/products','POST',form);this.productEditor.set(false);await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Producto guardado correctamente')}catch(e){this.fail(e)}}
 async deleteProduct(p:Product){if(!confirm('¿Dar de baja este producto del catálogo?'))return;try{await this.request('/admin/products/'+p.id,'DELETE',{});await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Producto desactivado')}catch(e){this.fail(e)}}
 async createCategory(){try{await this.request('/admin/categories','POST',{name:this.categoryName});this.categoryName='';await Promise.all([this.loadAdmin(),this.loadCatalog()]);this.tell('Categoría registrada')}catch(e){this.fail(e)}}
 async changeOrder(o:any){try{await this.request('/admin/orders/'+o.id,'PATCH',{status:o.nextStatus||o.status});await this.loadAdmin();this.tell('Estado del pedido actualizado')}catch(e){this.fail(e)}}
 async saveTracking(o:any){try{await this.request('/admin/orders/'+o.id,'PATCH',{tracking:o.tracking});await this.loadAdmin();this.tell('Guía registrada')}catch(e){this.fail(e)}}
 async reviewReturn(r:any,status:string){try{await this.request('/admin/returns/'+r.id,'PATCH',{status,resolution:r.resolution||'Resolución académica registrada'});await this.loadAdmin();this.tell('Solicitud actualizada')}catch(e){this.fail(e)}}
 async saveCoupon(){try{await this.request('/admin/coupons','POST',this.couponForm);this.couponForm={code:'',percent:10,minimum:500,maxUses:100};await this.loadAdmin();this.tell('Cupón creado')}catch(e){this.fail(e)}}
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
