import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import pg from 'pg';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createApp } from '../app.mjs';
import { database, first } from '../db.mjs';
import { prepareDatabase } from '../setup.mjs';

test('Luma: Firebase Auth, API e inventario en PostgreSQL', async t => {
  const projectId=process.env.FIREBASE_PROJECT_ID;
  const emulator=process.env.FIREBASE_AUTH_EMULATOR_HOST;
  assert.ok(projectId?.startsWith('demo-') && emulator?.startsWith('127.0.0.1:'),'Inicia el emulador y configura el proyecto demo.');
  const auth=getAuth(initializeApp({projectId}));
  const namespace='test_'+randomUUID().replaceAll('-','');
  const control=database();
  const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,options:'-c search_path='+namespace});
  await control.query('CREATE SCHEMA '+namespace);
  t.after(async()=>{await pool.end();await control.query('DROP SCHEMA '+namespace+' CASCADE');await control.end()});
  await prepareDatabase(pool);
  await prepareDatabase(pool);
  const server=createApp(pool,token=>auth.verifyIdToken(token)).listen(0,'127.0.0.1');
  await once(server,'listening');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base='http://127.0.0.1:'+server.address().port+'/api';

  async function request(path,method='GET',token,body) {
    const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
    const response=await fetch(base+path,{method,headers,body:body?JSON.stringify(body):undefined});
    return {status:response.status,data:await response.json()};
  }
  async function register(alias) {
    const email=namespace+'-'+alias+'@example.com';
    const authBase='http://'+emulator+'/identitytoolkit.googleapis.com/v1/accounts:';
    const creds={email,password:'PruebaLuma-2026!',returnSecureToken:true};
    const signUp=await fetch(authBase+'signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(creds)});
    assert.equal(signUp.status,200);
    const signIn=await fetch(authBase+'signInWithPassword?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(creds)});
    assert.equal(signIn.status,200);
    const {idToken}=await signIn.json();
    const response=await request('/auth/me','GET',idToken);
    assert.equal(response.status,200);
    assert.equal(response.data.user.email,email);
    return {token:idToken,user:response.data.user};
  }
  const [customer,another,admin]=await Promise.all([register('cliente'),register('otro'),register('admin')]);
  try {
    await pool.query('INSERT INTO admins (user_id) VALUES ($1)',[admin.user.id]);
    assert.equal((await request('/orders')).status,401);
    assert.equal((await request('/auth/me','GET','token-invalido')).status,401);
    assert.equal((await request('/admin/overview','GET',customer.token)).status,403);
    assert.equal((await request('/products')).data.length,24);
    assert.equal((await request('/categories')).data.length,10);
    const product=(await request('/products')).data.find(item=>item.sizes.includes('M'));
    const {id:variantId}=await first(pool,"SELECT id FROM product_variants WHERE product_id=$1 AND size='M'",[product.id]);
    await pool.query('UPDATE product_variants SET stock=8 WHERE id=$1',[variantId]);
    const stock=async()=>(await first(pool,'SELECT stock FROM product_variants WHERE id=$1',[variantId])).stock;
    const address={recipient:'Clienta de prueba',street:'Calle Ejemplo 10',neighborhood:'Centro',city:'Nuevo Laredo',state:'Tamaulipas',postalCode:'88000',phone:'0000000000'};
    const body=(quantity,key)=>({items:[{productId:product.id,size:'M',quantity}],address,shippingType:'recoger',termsAccepted:true,idempotencyKey:key});
    const order=async(quantity,key,token=customer.token)=>request('/orders','POST',token,body(quantity,key));

    const purchase=await request('/orders','POST',customer.token,{...body(2,'compra-ejemplo-001'),subtotal:1,total:1});
    assert.equal(purchase.status,201,JSON.stringify(purchase.data));
    assert.equal(purchase.data.total,2*product.price);
    assert.equal(await stock(),6);
    const adjustments={categoryId:product.category_id,sku:product.sku,name:product.name,
      description:product.description,material:product.material,care:product.care,
      image:product.image,badge:product.badge,featured:Boolean(product.featured),active:true,
      price:product.price,sizes:product.sizes,stock:product.stock};
    assert.equal((await request('/admin/products/'+product.id,'PATCH',admin.token,{
      ...adjustments,variantStock:{M:9},expectedVariantStock:{M:8},
    })).status,409);
    assert.equal((await request('/admin/products/'+product.id,'PATCH',admin.token,adjustments)).status,200);
    assert.equal(await stock(),6);
    const duplicate=await order(2,'compra-ejemplo-001');
    assert.equal(duplicate.data.folio,purchase.data.folio);
    assert.equal(await stock(),6);
    assert.equal((await order(7,'compra-sinstock-01')).status,409);
    assert.equal(await stock(),6);
    assert.equal((await request('/orders','GET',another.token)).data.length,0);
    const overview=(await request('/admin/overview','GET',admin.token)).data;
    assert.equal(overview.orders[0].folio,purchase.data.folio);
    assert.equal(overview.movements[0].reference,purchase.data.folio);
    assert.equal(overview.movements[0].delta,-2);
    t.diagnostic('Caso de aceptación: 8 → 6, mismo folio en compra y panel, movimiento -2; 7 unidades rechazadas.');

    const concurrent=await Promise.all([order(5,'compra-concurrente-a'),order(5,'compra-concurrente-b',another.token)]);
    assert.deepEqual(concurrent.map(result=>result.status).sort(),[201,409]);
    assert.equal(await stock(),1);
    const limitedCoupon=await request('/admin/coupons','POST',admin.token,{code:'UNAVEZ',percent:10,minimum:0,maxUses:1});
    assert.equal(limitedCoupon.status,201);
    const quote=await request('/orders/quote','POST',customer.token,{...body(1,'cotizacion-prueba-01'),coupon:'UNAVEZ'});
    assert.equal(quote.data.discount,Math.round(product.price/10));
    const redeemed=await request('/orders','POST',customer.token,{...body(1,'compra-con-cupon-01'),coupon:'UNAVEZ'});
    assert.equal(redeemed.status,201);
    assert.equal(await stock(),0);
    assert.equal((await first(pool,"SELECT used FROM coupons WHERE code='UNAVEZ'")).used,1);

    const purchaseId=purchase.data.id;
    const updateOrder=status=>request('/admin/orders/'+purchaseId,'PATCH',admin.token,{status});
    assert.equal((await updateOrder('entregado')).status,409);
    for(const status of ['preparando','enviado','entregado'])assert.equal((await updateOrder(status)).status,200);
    const requestBody={orderId:purchaseId,kind:'garantia',reason:'Defecto de fabricación',detail:'Caso académico de revisión.'};
    assert.equal((await request('/returns','POST',another.token,requestBody)).status,404);
    const returnResult=await request('/returns','POST',customer.token,requestBody);
    assert.equal(returnResult.status,201);
    const review=status=>request('/admin/returns/'+returnResult.data.id,'PATCH',admin.token,{status,resolution:'Resolución académica registrada.'});
    assert.equal((await review('aprobada')).status,200);
    assert.equal((await review('reembolsada')).status,200);
    assert.equal((await review('reembolsada')).status,200);
    assert.equal(await stock(),2);
    assert.equal((await request('/returns','GET',customer.token)).data[0].status,'reembolsada');

    const cancellation=()=>request('/admin/orders/'+redeemed.data.id,'PATCH',admin.token,{status:'cancelado'});
    assert.equal((await cancellation()).status,200);
    assert.equal((await cancellation()).status,200);
    assert.equal(await stock(),3);
    assert.equal((await first(pool,'SELECT count(*)::int AS count FROM inventory_movements')).count,5);
    const category=await request('/admin/categories','POST',admin.token,{name:'Prueba de categorías'});
    assert.equal(category.status,201);
    assert.equal((await request('/admin/categories/'+category.data.id,'PATCH',admin.token,{name:'Categoría modificada'})).status,200);
    assert.equal((await request('/admin/categories/'+category.data.id,'DELETE',admin.token)).status,200);
    assert.equal((await request('/categories')).data.length,10);
    const csv=await request('/admin/export/orders','GET',admin.token);
    assert.equal(csv.status,200);
    assert.equal(csv.data.length,3);
    t.diagnostic('Sobreventa simultánea, permisos, cupón, garantía, cancelación idempotente, categorías y reporte verificados.');
  } finally {
    await Promise.all([customer,another,admin].map(account=>auth.deleteUser(account.user.id)));
  }
});
