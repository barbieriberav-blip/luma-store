/** LUMA · puente Firestore para plan Spark. Solo pedidos y pagos de DEMOSTRACIÓN.
 * No hace liquidación financiera, descuento transaccional de inventario ni validación
 * autoritativa de precios: para comercio real se requiere un backend seguro.
 */
import {FirebaseError} from 'firebase/app';
import {createUserWithEmailAndPassword,sendPasswordResetEmail,signInWithEmailAndPassword,signOut,updateProfile} from 'firebase/auth';
import {collection,doc,getDoc,getDocs,query,where,setDoc,updateDoc,addDoc,writeBatch,runTransaction,arrayUnion,arrayRemove} from 'firebase/firestore';
import {currentAuth,currentDb,firebaseReady} from './firebase-client';

export const ORDER_MAX_LINES = 20;
export const ORDER_MAX_LINE_QUANTITY = 10;

const iso=()=>new Date().toISOString();
const randomId=()=>Date.now()*1000+Math.floor(Math.random()*1000);
const check=(test:unknown,msg:string)=>{if(!test)throw new Error(msg)};
const clean=(s:unknown,max=120)=>String(s??'').trim().slice(0,max);
const sortNew=(xs:any[])=>xs.sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
async function preview(){const r=await fetch('/assets/catalogo-vista-previa.json');if(!r.ok)throw new Error('No se pudo cargar el catálogo');return r.json();}
async function list(name:string,onlyMine=false):Promise<any[]>{
 const db=currentDb();const uid=currentAuth().currentUser?.uid;
 const q=onlyMine&&uid?query(collection(db,name),where('user_id','==',uid)):collection(db,name);
 const s=await getDocs(q);
 return s.docs.map(x=>({...x.data(),_docId:x.id}));
}
async function isAdmin(uid:string):Promise<boolean>{const s=await getDoc(doc(currentDb(),'adminUsers',uid));return s.exists()&&s.data()['enabled']===true;}
async function ensureUser(){
 const auth=currentAuth();await auth.authStateReady();const u=auth.currentUser;
 if(!u)return null;
 const db=currentDb(),ref=doc(db,'users',u.uid);let s=await getDoc(ref);
 if(!s.exists()){
  try{await setDoc(ref,{id:u.uid,name:clean(u.displayName||u.email?.split('@')[0]||'Cliente',80),email:u.email||'',role:'cliente',phone:'',wishlist:[],addresses:[],created_at:iso()});}catch(e){
   // Un registro creado por otra pestaña puede causar una colisión; vuelve a consultar.
   s=await getDoc(ref);if(!s.exists())throw e;
  }
  s=await getDoc(ref);
 }
 const d=s.data()||{};
 return {id:u.uid,name:d['name']||u.displayName||'Cliente',email:u.email||'',role:await isAdmin(u.uid)?'admin':'cliente',phone:d['phone']||''};
}
function owner(){const u=currentAuth().currentUser;check(u,'Inicia sesión para continuar');return u!.uid;}
function adminOnly(user:any){check(user?.role==='admin','Acceso reservado a la administradora');}
function addressOk(a:any){return a&&['recipient','street','neighborhood','city','state','postalCode','phone'].every(k=>clean(a[k],180).length>0)&&/^\d{5}$/.test(clean(a.postalCode));}
function shipping(type:string,subtotal:number){if(type==='recoger')return 0;if(type==='express')return 179;check(type==='estandar','Método de envío incorrecto');return subtotal>=1200?0:99;}
async function catalog(key:'products'|'categories'){
 if(!firebaseReady)return (await preview())[key];
 const rows=await list(key);if(rows.length===0)return (await preview())[key];
 return rows.filter(x=>x.active!==0).sort((a,b)=>Number(a.id)-Number(b.id));
}
async function audit(action:string,entity:string,id:string,details:Record<string,unknown>={}){
 // La bitácora es solo de operaciones administrativas: no constituye auditoría inalterable.
 await addDoc(collection(currentDb(),'audit_logs'),{id:randomId(),actor_id:owner(),action,entity,entity_id:id,created_at:iso(),details});
}
export async function sparkRequest<T>(path:string,method='GET',payload?:unknown):Promise<T>{
 const b:any=payload||{},db=firebaseReady?currentDb():null;
 if(method==='GET'&&path==='/products')return await catalog('products') as T;
 if(method==='GET'&&path==='/categories')return await catalog('categories') as T;
 if(!firebaseReady){
  if(path==='/auth/me'&&method==='GET')return {user:null} as T;
  throw new Error('El servicio de cuentas y pedidos de LUMA requiere configuración en Firebase.');
 }
 const auth=currentAuth();await auth.authStateReady();
 if(path==='/auth/register'&&method==='POST'){
  const name=String(b.name??'').trim();
  const email=String(b.email??'').trim();
  const password=String(b.password??'');
  check(name.length>=2&&name.length<=80,'Ingresa un nombre de entre 2 y 80 caracteres');
  check(password.length>=10,'La contraseña debe tener al menos 10 caracteres');
  const credential=await createUserWithEmailAndPassword(auth,email,password);
  try{
   await updateProfile(credential.user,{displayName:name});
   return {user:await ensureUser()} as T;
  }catch{
   await signOut(auth).catch(()=>{});
   throw new Error('Tu cuenta se creó, pero el perfil quedó pendiente. Inicia sesión para completar el acceso.');
  }
 }
 if(path==='/auth/login'&&method==='POST'){
  await signInWithEmailAndPassword(auth,String(b.email??'').trim(),String(b.password??''));
  try{return {user:await ensureUser()} as T;}
  catch(error){await signOut(auth).catch(()=>{});throw error;}
 }
 if(path==='/auth/logout'&&method==='POST'){await signOut(auth);return {ok:true} as T;}
 if(path==='/auth/recover'&&method==='POST'){
  try{await sendPasswordResetEmail(auth,String(b.email??'').trim());}
  catch(error){if(!(error instanceof FirebaseError)||error.code!=='auth/user-not-found')throw error;}
  return {message:'Si la cuenta existe, Firebase enviará las instrucciones de recuperación a tu correo.'} as T;
 }
 if(path==='/auth/me'&&method==='GET')return {user:await ensureUser()} as T;
 if(path==='/auth/profile'&&method==='POST'){
  const u=await ensureUser();check(u,'Inicia sesión para modificar tu perfil');const name=clean(b.name,80);
  check(name.length>=2,'Escribe tu nombre');await updateDoc(doc(db!,'users',u!.id),{name});
  return {user:{...u,name}} as T;
 }
 if(path==='/account'&&method==='GET'){
  const uid=owner(),snap=await getDoc(doc(db!,'users',uid)),orders=sortNew(await list('orders',true));
  return {wishlist:snap.data()?.['wishlist']||[],addresses:orders.slice(0,5).map(o=>({...o.address,postal_code:o.address?.postalCode})),user:await ensureUser()} as T;
 }
 const fav=path.match(/^\/wishlist\/(\d+)$/);
 if(fav&&(method==='POST'||method==='DELETE')){
  await updateDoc(doc(db!,'users',owner()),{wishlist:method==='POST'?arrayUnion(Number(fav[1])):arrayRemove(Number(fav[1]))});
  return {ok:true} as T;
 }
 if(path==='/coupons/validate'&&method==='POST'){
  const code=clean(b.code,25).toUpperCase();const found=(await list('coupons')).find(c=>c.code===code&&c.active);
  check(found,'Cupón no disponible');const subtotal=Number(b.subtotal);
  check(Number.isFinite(subtotal)&&subtotal>=Number(found.minimum||0),'No se alcanza el mínimo para el cupón');
  return {code,percent:found.percent,discount:Math.round(subtotal*Number(found.percent)/100)} as T;
 }
 if(path==='/orders'&&method==='POST'){
  const user=await ensureUser();check(user,'Inicia sesión para generar un pedido de prueba');
  const lines=Array.isArray(b.items)?b.items:[];
  check(lines.length>0,'Agrega productos al carrito');
  check(lines.length<=ORDER_MAX_LINES,`El pedido admite hasta ${ORDER_MAX_LINES} combinaciones de producto y talla`);
  check(b.termsAccepted===true,'Debes aceptar los términos');check(addressOk(b.address),'Completa los datos de entrega ficticios');
  const key=clean(b.idempotencyKey,100);
  check(/^[A-Za-z0-9_-]{12,100}$/.test(key),'Identificador de compra inválido');
  const ref=doc(db!,'orders',user!.id+'_'+key);
  const ps=await catalog('products');const items:any[]=[];const quantities=new Map<number,number>();let subtotal=0;
  for(const [i,line] of lines.entries()){
    const p=ps.find((x:any)=>x.id===Number(line.productId));const count=Number(line.quantity);
    check(p&&p.active!==0,'Producto no encontrado');
    check(Number.isInteger(count)&&count>0&&count<=ORDER_MAX_LINE_QUANTITY,`El pedido admite de 1 a ${ORDER_MAX_LINE_QUANTITY} piezas por producto y talla`);
    check(p.sizes.includes(line.size),'Talla no disponible');
    const quantity=(quantities.get(p.id)??0)+count;
    check(quantity<=p.stock,'Existencias informativas insuficientes');
    quantities.set(p.id,quantity);
    items.push({id:i+1,product_id:p.id,sku:p.sku,name:p.name,size:line.size,quantity:count,unit_price:p.price,line_total:p.price*count});subtotal+=p.price*count;
  }
  let discount=0;
  if(b.coupon){const x=await sparkRequest<any>('/coupons/validate','POST',{code:b.coupon,subtotal});discount=x.discount;}
  const delivery=shipping(String(b.shippingType),subtotal-discount);const num=randomId();
  const order={id:num,folio:`LUMA-DEMO-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(num).slice(-6)}`,
   user_id:user!.id,customer_name:user!.name,customer_email:user!.email,
   status:'simulado',payment_status:'simulado',payment_method:'simulado',subtotal,discount,shipping:delivery,
   total:subtotal-discount+delivery,shipping_type:String(b.shippingType),address:b.address,tracking:'',
   created_at:iso(),terms_version:'1.0',terms_accepted_at:iso(),items,mode:'spark-demo',order_doc_id:ref.id};
  const saved=await runTransaction(db!,async tx=>{const existing=await tx.get(ref);if(existing.exists())return existing.data();tx.set(ref,order);return order;});
  return saved as T;
 }
 if(path==='/orders'&&method==='GET')return sortNew(await list('orders',true)) as T;
 if(path==='/returns'&&method==='GET')return sortNew(await list('returns',true)) as T;
 if(path==='/returns'&&method==='POST'){
  const uid=owner(),o=(await list('orders',true)).find(x=>x.id===Number(b.orderId));
  check(o,'Pedido no encontrado');const id=randomId();const reason=clean(b.reason,100),detail=clean(b.detail,500);
  check(reason.length>=3&&detail.length>=5,'Describe el motivo de la solicitud');
  const ret={id,folio:'DEV-DEMO-'+String(id).slice(-8),order_id:o.id,order_doc_id:o._docId,
   order_folio:o.folio,user_id:uid,reason,detail,status:'solicitada',resolution:'',created_at:iso()};
  await setDoc(doc(db!,'returns',String(id)),ret);return ret as T;
 }
 if(path==='/contact'&&method==='POST'){
  check(auth.currentUser,'Inicia sesión para enviar una solicitud desde el formulario');
  const name=clean(b.name,90),email=clean(b.email,120),message=clean(b.message,2000),id=randomId();
  check(name.length>=2&&/^\S+@\S+\.\S+$/.test(email)&&message.length>=10,'Completa correctamente el formulario');
  const obj={id,folio:'AYU-DEMO-'+String(id).slice(-8),user_id:owner(),name,email,message,status:'abierto',created_at:iso()};
  await setDoc(doc(db!,'contact_tickets',String(id)),obj);return {folio:obj.folio} as T;
 }
 if(!path.startsWith('/admin/'))throw new Error('Operación no disponible en el modo Spark');
 const user=await ensureUser();adminOnly(user);
 if(path==='/admin/overview'&&method==='GET'){
  const [products,categories,orders,returns,customers,coupons,tickets,movements,auditLogs]=await Promise.all(
   ['products','categories','orders','returns','users','coupons','contact_tickets','inventory_movements','audit_logs'].map(x=>list(x))
  );
  return {products,categories,orders:sortNew(orders),returns:sortNew(returns),customers,coupons,tickets,movements:sortNew(movements),audit:sortNew(auditLogs),
   metrics:{sales:orders.reduce((s,o)=>s+Number(o.total||0),0),orders:orders.length,products:products.filter(p=>p.active).length,
    customers:customers.length,lowStock:products.filter(p=>p.active&&p.stock<=5).length}} as T;
 }
 if(path==='/admin/seed'&&method==='POST'){
  const previous=await list('products');check(previous.length===0,'El catálogo ya se cargó en Firestore');
  const seed=await preview(),batch=writeBatch(db!);
  for(const p of seed.products)batch.set(doc(db!,'products',String(p.id)),p);
  for(const c of seed.categories)batch.set(doc(db!,'categories',String(c.id)),c);
  for(const c of seed.coupons||[])batch.set(doc(db!,'coupons',String(c.code)),c);
  await batch.commit();await audit('seed','products','demo',{count:seed.products.length});return {products:seed.products.length} as T;
 }
 if(path==='/admin/products'&&method==='POST'){
  const id=randomId(),cat=(await list('categories')).find(x=>x.id===Number(b.categoryId));check(cat,'Categoría inexistente');
  const p={id,sku:clean(b.sku,40),name:clean(b.name,100),description:clean(b.description,2000),material:clean(b.material,120),care:clean(b.care,120),
   category_id:cat.id,category:cat.name,price:Number(b.price),stock:Number(b.stock),sizes:b.sizes,image:clean(b.image,1000),badge:clean(b.badge,40),featured:b.featured?1:0,active:b.active?1:0,created_at:iso()};
  check(p.sku.length>=3&&p.name.length>=3&&Number.isInteger(p.price)&&p.price>=0&&Number.isInteger(p.stock)&&p.stock>=0&&Array.isArray(p.sizes)&&p.sizes.length>0,'Revisa los datos del producto');
  await setDoc(doc(db!,'products',String(id)),p);await audit('producto_creado','products',String(id));return {id} as T;
 }
 const productPath=path.match(/^\/admin\/products\/(\d+)$/);
 if(productPath&&(method==='PATCH'||method==='DELETE')){
  const id=productPath[1],ref=doc(db!,'products',id);
  if(method==='DELETE'){await updateDoc(ref,{active:0});await audit('producto_desactivado','products',id);return {ok:true} as T;}
  const s=await getDoc(ref);check(s.exists(),'Producto inexistente');const data=s.data()||{};
  const cat=(await list('categories')).find(x=>x.id===Number(b.categoryId));check(cat,'Categoría no encontrada');
  const patch={sku:clean(b.sku,40),name:clean(b.name,100),description:clean(b.description,2000),material:clean(b.material,120),care:clean(b.care,120),
   price:Number(b.price),stock:Number(b.stock),category_id:cat.id,category:cat.name,sizes:b.sizes,image:clean(b.image,1000),badge:clean(b.badge,40),featured:b.featured?1:0,active:b.active?1:0};
  check(Number.isInteger(patch.price)&&patch.price>=0&&Number.isInteger(patch.stock)&&patch.stock>=0,'Precio o existencias no válidos');
  await updateDoc(ref,patch);
  if(Number(data['stock'])!==patch.stock){const delta=patch.stock-Number(data['stock']);await addDoc(collection(db!,'inventory_movements'),{id:randomId(),product_id:Number(id),product_name:patch.name,actor_id:owner(),delta,reason:'ajuste_admin',reference:'MANUAL',created_at:iso()});}
  await audit('producto_actualizado','products',id);return {ok:true} as T;
 }
 if(path==='/admin/categories'&&method==='POST'){
  const name=clean(b.name,60);check(name.length>=3,'Especifica la categoría');const id=randomId(),slug=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-');
  await setDoc(doc(db!,'categories',String(id)),{id,name,slug,active:1});return {id} as T;
 }
 const orderPath=path.match(/^\/admin\/orders\/(\d+)$/);
 if(orderPath&&method==='PATCH'){
  const matches=(await list('orders')).filter(x=>x.id===Number(orderPath[1]));check(matches.length===1,'Pedido no encontrado');
  const patch:any={};if(b.status){check(['simulado','preparando','enviado','entregado','cancelado'].includes(b.status),'Estado inválido');patch.status=b.status;}
  else patch.tracking=clean(b.tracking,100);
  await updateDoc(doc(db!,'orders',matches[0]._docId),patch);await audit('estado_pedido','orders',orderPath[1]);return {ok:true} as T;
 }
 const returnPath=path.match(/^\/admin\/returns\/(\d+)$/);
 if(returnPath&&method==='PATCH'){
  check(['aprobada','rechazada','reembolsada'].includes(b.status),'Estado inválido');
  await updateDoc(doc(db!,'returns',returnPath[1]),{status:b.status,resolution:clean(b.resolution,500)});return {ok:true} as T;
 }
 if(path==='/admin/coupons'&&method==='POST'){
  const code=clean(b.code,20).toUpperCase(),percent=Number(b.percent),minimum=Number(b.minimum),maxUses=Number(b.maxUses);
  check(/^[A-Z0-9_-]{3,20}$/.test(code)&&Number.isInteger(percent)&&percent>=1&&percent<=90&&Number.isInteger(minimum)&&minimum>=0&&Number.isInteger(maxUses)&&maxUses>=1,'Cupón inválido');
  const id=randomId();await setDoc(doc(db!,'coupons',code),{id,code,percent,minimum,max_uses:maxUses,used:0,active:1,created_at:iso()});return {id} as T;
 }
 const couponPath=path.match(/^\/admin\/coupons\/(\d+)$/);
 if(couponPath&&method==='PATCH'){
  const c=(await list('coupons')).find(x=>x.id===Number(couponPath[1]));check(c,'Cupón no encontrado');await updateDoc(doc(db!,'coupons',c._docId),{active:b.active?1:0});return {ok:true} as T;
 }
 const ticketPath=path.match(/^\/admin\/tickets\/(\d+)$/);
 if(ticketPath&&method==='PATCH'){
  check(['abierto','en_revision','resuelto'].includes(b.status),'Estado inválido');await updateDoc(doc(db!,'contact_tickets',ticketPath[1]),{status:b.status});return {ok:true} as T;
 }
 if(path==='/admin/export/orders'&&method==='GET')return sortNew(await list('orders')).map(o=>({folio:o.folio,fecha:o.created_at,estado:o.status,subtotal:o.subtotal,envio:o.shipping,descuento:o.discount,total:o.total})) as T;
 throw new Error('Operación administrativa no disponible');
}
