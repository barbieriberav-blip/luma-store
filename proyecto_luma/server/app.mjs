import express from 'express';
import { randomUUID } from 'node:crypto';
import { categories, deactivateProduct, products, saveCategory, saveProduct } from './catalog.mjs';
import { first, rows, transaction } from './db.mjs';
import { calculateQuote, changeOrder, couponCode, createOrder, getOrders, recordAudit } from './orders.mjs';
import { getReturns, requestReturn, resolveReturn } from './returns.mjs';
import { HttpError, integer, requireValue, text } from './validation.mjs';

export function createApp(db, verifyIdToken) {
  const app = express();
  const api = express.Router();
  app.disable('x-powered-by');
  app.use('/api', (_request,response,next) => {
    response.set('Cache-Control','no-store');
    response.set('X-Content-Type-Options','nosniff');
    next();
  }, express.json({limit:'24kb'}), api);

  api.get('/health', async (_req,res) => {
    await db.query('SELECT 1 FROM schema_migrations LIMIT 1');
    res.json({status:'ok'});
  });
  api.get('/products', async (_req,res) => res.json(await products(db)));
  api.get('/categories', async (_req,res) => res.json(await categories(db)));

  async function identify(req,res,next) {
    const token = req.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    requireValue(token,'Inicia sesión para continuar.',401);
    let identity;
    try { identity=await verifyIdToken(token); }
    catch { throw new HttpError(401,'Tu sesión expiró o es inválida. Vuelve a iniciar sesión.'); }
    requireValue(identity.uid && identity.email,'La cuenta necesita un correo electrónico.',403);
    const existing=await first(db,`SELECT u.*,CASE WHEN a.user_id IS NULL THEN 'cliente' ELSE 'admin' END AS role
      FROM users u LEFT JOIN admins a ON a.user_id=u.id WHERE u.id=$1`,[identity.uid]);
    if (existing) {
      req.user=existing;
    } else {
      const name=((typeof identity.name==='string' ? identity.name.trim() : '') || identity.email.split('@')[0]).slice(0,80);
      await db.query('INSERT INTO users (id,name,email) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',[identity.uid,name,identity.email]);
      req.user={id:identity.uid,name,email:identity.email,role:'cliente'};
    }
    next();
  }

  api.use(identify);
  api.get('/auth/me',(req,res)=>res.json({user:req.user}));
  api.post('/auth/profile',async(req,res)=>{
    const name=text(req.body?.name,80,2);
    await db.query('UPDATE users SET name=$1 WHERE id=$2',[name,req.user.id]);
    res.json({user:{...req.user,name}});
  });
  api.get('/account',async(req,res)=>{
    const [favorites,addresses]=await Promise.all([
      rows(db,'SELECT product_id FROM favorites WHERE user_id=$1 ORDER BY product_id',[req.user.id]),
      rows(db,`SELECT d.* FROM order_delivery d JOIN orders o ON o.id=d.order_id
        WHERE o.user_id=$1 ORDER BY o.id DESC LIMIT 5`,[req.user.id]),
    ]);
    res.json({wishlist:favorites.map(f=>f.product_id),addresses,user:req.user});
  });
  api.post('/wishlist/:id',async(req,res)=>{
    await db.query('INSERT INTO favorites (user_id,product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[req.user.id,routeId(req)]);
    res.json({ok:true});
  });
  api.delete('/wishlist/:id',async(req,res)=>{
    await db.query('DELETE FROM favorites WHERE user_id=$1 AND product_id=$2',[req.user.id,routeId(req)]);
    res.json({ok:true});
  });
  api.post('/orders/quote',async(req,res)=>{
    const {subtotal,discount,shipping,total,code,percent}=await calculateQuote(db,req.body ?? {});
    res.json({subtotal,discount,shipping,total,code,percent});
  });
  api.post('/orders',async(req,res)=>res.status(201).json(await createOrder(db,req.user.id,req.body ?? {})));
  api.get('/orders',async(req,res)=>res.json(await getOrders(db,req.user.id)));
  api.get('/returns',async(req,res)=>res.json(await getReturns(db,req.user.id)));
  api.post('/returns',async(req,res)=>res.status(201).json(await requestReturn(db,req.user.id,req.body ?? {})));
  api.post('/contact',async(req,res)=>{
    const body=req.body ?? {};
    const entry=await first(db,`INSERT INTO contact_tickets (user_id,folio,name,email,message)
      VALUES ($1,$2,$3,$4,$5) RETURNING folio`,[req.user.id,'AYU-'+randomUUID().toUpperCase(),text(body.name,90,2),req.user.email,text(body.message,2000,10)]);
    res.status(201).json(entry);
  });

  api.use('/admin',(req,_res,next)=>{
    requireValue(req.user.role==='admin','Acceso reservado a administración.',403);
    next();
  });
  api.get('/admin/overview',async(_req,res)=>{
    const [catalog,groups,orders,returns,customers,coupons,tickets,movements,audit,bestSellers]=await Promise.all([
      products(db,true), categories(db,true), getOrders(db), getReturns(db), rows(db,'SELECT * FROM users ORDER BY created_at DESC'),
      rows(db,'SELECT *,active::int FROM coupons ORDER BY id'),rows(db,'SELECT * FROM contact_tickets ORDER BY id DESC'),
      rows(db,`SELECT m.*,p.id AS product_id,p.name AS product_name,v.size,COALESCE(o.folio,'MANUAL') AS reference
        FROM inventory_movements m JOIN product_variants v ON v.id=m.variant_id JOIN products p ON p.id=v.product_id
        LEFT JOIN orders o ON o.id=m.order_id ORDER BY m.id DESC`),
      rows(db,'SELECT * FROM audit_logs ORDER BY id DESC'),
      rows(db,`SELECT sku,name,sum(quantity)::int AS quantity FROM order_items
        JOIN orders ON orders.id=order_items.order_id WHERE status NOT IN ('cancelado','reembolsado')
        GROUP BY sku,name ORDER BY quantity DESC,sku LIMIT 10`),
    ]);
    const active=catalog.filter(p=>p.active);
    const sales=orders.filter(o=>o.payment_status==='aprobado').reduce((sum,o)=>sum+o.total,0);
    res.json({products:catalog,categories:groups,orders,returns,customers,coupons,tickets,movements,audit,bestSellers,
      metrics:{sales,orders:orders.length,products:active.length,customers:customers.length,lowStock:active.filter(p=>p.stock<=5).length}});
  });
  api.post('/admin/products',async(req,res)=>res.status(201).json(await saveProduct(db,null,req.user.id,req.body ?? {})));
  api.patch('/admin/products/:id',async(req,res)=>res.json(await saveProduct(db,routeId(req),req.user.id,req.body ?? {})));
  api.delete('/admin/products/:id',async(req,res)=>res.json(await deactivateProduct(db,routeId(req),req.user.id)));
  api.post('/admin/categories',async(req,res)=>res.status(201).json(await saveCategory(db,null,req.user.id,req.body ?? {})));
  api.patch('/admin/categories/:id',async(req,res)=>res.json(await saveCategory(db,routeId(req),req.user.id,req.body ?? {})));
  api.delete('/admin/categories/:id',async(req,res)=>res.json(await saveCategory(db,routeId(req),req.user.id,{},true)));
  api.patch('/admin/orders/:id',async(req,res)=>res.json(await changeOrder(db,routeId(req),req.user.id,req.body ?? {})));
  api.patch('/admin/returns/:id',async(req,res)=>res.json(await resolveReturn(db,routeId(req),req.user.id,req.body ?? {})));
  api.post('/admin/coupons',async(req,res)=>{
    const body=req.body ?? {};
    const expiresAt=body.expiresAt ? new Date(body.expiresAt) : null;
    requireValue(!expiresAt || (Number.isFinite(expiresAt.valueOf()) && expiresAt > new Date()),'La vigencia del cupón debe estar en el futuro.');
    const args=[couponCode(body.code),integer(body.percent,1,90),integer(body.minimum,0),integer(body.maxUses),expiresAt];
    const coupon=await transaction(db,async client=>{
      const entry=await first(client,`INSERT INTO coupons (code,percent,minimum,max_uses,expires_at)
        VALUES ($1,$2,$3,$4,$5) RETURNING id`,args);
      await recordAudit(client,req.user.id,'cupon_creado','cupon',entry.id);
      return entry;
    });
    res.status(201).json(coupon);
  });
  api.patch('/admin/coupons/:id',async(req,res)=>{
    requireValue(typeof req.body?.active==='boolean','Indica si el cupón está activo.');
    const id=routeId(req);
    await transaction(db,async client=>{
      requireValue(await first(client,'UPDATE coupons SET active=$1 WHERE id=$2 RETURNING id',[req.body.active,id]),'Cupón no encontrado.',404);
      await recordAudit(client,req.user.id,'cupon_actualizado','cupon',id);
    });
    res.json({ok:true});
  });
  api.patch('/admin/tickets/:id',async(req,res)=>{
    const status=req.body?.status;
    requireValue(['abierto','en_revision','resuelto'].includes(status),'Estado inválido.');
    requireValue(await first(db,'UPDATE contact_tickets SET status=$1 WHERE id=$2 RETURNING id',[status,routeId(req)]),'Solicitud no encontrada.',404);
    res.json({ok:true});
  });
  api.get('/admin/export/orders',async(_req,res)=>{
    res.json(await rows(db,`SELECT folio,created_at AS fecha,status AS estado,subtotal,
      shipping AS envio,discount AS descuento,total FROM orders ORDER BY id DESC`));
  });
  api.use((_req,_res,next)=>next(new HttpError(404,'Operación no disponible.')));
  app.use((error,_req,res,_next)=>{
    const conflict=['23505','23503','40001','40P01'].includes(error.code);
    const status=error instanceof HttpError ? error.status : conflict ? 409 : error.type==='entity.too.large' ? 413
      : error instanceof SyntaxError && error.status===400 ? 400 : 500;
    const message=error instanceof HttpError ? error.message : conflict ? 'La operación entra en conflicto con un registro existente. Revisa los datos o vuelve a intentar.'
      : status===413 ? 'La solicitud es demasiado grande.' : status===400 ? 'La solicitud JSON no es válida.' : 'No pudimos completar la operación.';
    if(status===500) console.error('Error interno en API LUMA:',error.code ?? error.name);
    res.status(status).json({message});
  });
  return app;
}

function routeId(req) {
  return integer(Number(req.params.id));
}
