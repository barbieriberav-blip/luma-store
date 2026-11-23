import { randomUUID } from 'node:crypto';
import { first, rows, transaction } from './db.mjs';
import { integer, requireValue, text } from './validation.mjs';

const shippingFees = { estandar: 99, express: 179, recoger: 0 };
const transitions = {
  simulado: ['preparando', 'cancelado'],
  preparando: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
  reembolsado: [],
};

function purchaseLines(items) {
  requireValue(Array.isArray(items) && items.length > 0 && items.length <= 20, 'Agrega entre 1 y 20 combinaciones de productos y tallas.');
  const lines = new Map();
  for (const item of items) {
    const productId = integer(item?.productId);
    const size = text(item?.size, 32, 1);
    const key = JSON.stringify([productId, size]);
    const quantity = integer(integer(item?.quantity, 1, 10) + (lines.get(key)?.quantity ?? 0), 1, 10);
    lines.set(key, { productId, size, quantity });
  }
  return [...lines.values()];
}

function deliveryAddress(address) {
  const data = ['recipient', 'street', 'neighborhood', 'city', 'state', 'postalCode', 'phone']
    .map(field => text(address?.[field], field === 'postalCode' ? 5 : 120, 1));
  requireValue(/^\d{5}$/.test(data[5]), 'Escribe un código postal de 5 dígitos.');
  return data;
}

export function couponCode(value) {
  const code = text(value, 20, 3).toUpperCase();
  requireValue(/^[A-Z0-9_-]{3,20}$/.test(code), 'El código del cupón no es válido.');
  return code;
}

function couponDiscount(coupon, subtotal) {
  requireValue(coupon?.active && (!coupon.expires_at || coupon.expires_at > new Date()), 'Cupón no disponible.', 409);
  requireValue(coupon.used < coupon.max_uses, 'El cupón alcanzó su límite de usos.', 409);
  requireValue(subtotal >= coupon.minimum, 'El pedido no alcanza el mínimo del cupón.');
  return Math.round(subtotal * coupon.percent / 100);
}

export async function calculateQuote(db, body, lock = false) {
  const lines = purchaseLines(body.items);
  const shippingType = text(body.shippingType || 'estandar', 15, 1);
  requireValue(Object.hasOwn(shippingFees, shippingType), 'Selecciona un método de envío válido.');
  const productIds = [...new Set(lines.map(line => line.productId))].sort((a,b) => a-b);
  const products = await rows(db, `SELECT p.id,p.sku,p.name,p.description,p.price,p.active,c.active AS category_active
    FROM products p JOIN categories c ON c.id=p.category_id
    WHERE p.id=ANY($1::integer[]) ORDER BY p.id ${lock ? 'FOR UPDATE OF p FOR SHARE OF c' : ''}`, [productIds]);
  const variants = await rows(db, `SELECT id,product_id,size,stock,active FROM product_variants
    WHERE product_id=ANY($1::integer[]) ORDER BY id ${lock ? 'FOR UPDATE' : ''}`, [productIds]);
  const productsById = new Map(products.map(product => [product.id, product]));
  const variantsByKey = new Map(variants.map(variant => [JSON.stringify([variant.product_id, variant.size]), variant]));
  const selections = lines.map(line => {
    const product = productsById.get(line.productId);
    const variant = variantsByKey.get(JSON.stringify([line.productId,line.size]));
    requireValue(product?.active && product.category_active && variant?.active, 'Un producto o talla ya no está disponible.', 409);
    requireValue(variant.stock >= line.quantity, `Existencias insuficientes para ${product.name}, talla ${line.size}. Disponibles: ${variant.stock}.`, 409);
    return { ...line, product, variantId: variant.id };
  });
  const subtotal = selections.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const code = body.coupon ? couponCode(body.coupon) : null;
  const coupon = code ? await first(db, `SELECT * FROM coupons WHERE code=$1 ${lock ? 'FOR UPDATE' : ''}`, [code]) : null;
  const discount = code ? couponDiscount(coupon, subtotal) : 0;
  const shipping = shippingType === 'estandar' && subtotal - discount >= 1200 ? 0 : shippingFees[shippingType];
  return { subtotal, discount, shipping, total: subtotal - discount + shipping, selections, shippingType,
    couponId: coupon?.id ?? null, code, percent: coupon?.percent ?? 0 };
}

const orderQuery = `SELECT o.id,o.folio,o.user_id,o.status,o.subtotal,o.discount,o.shipping,o.total,
    o.terms_version,o.terms_accepted_at,o.created_at,u.name AS customer_name, u.email AS customer_email, p.status AS payment_status,
    d.shipping_type,d.tracking,
    json_build_object('recipient',d.recipient,'street',d.street,'neighborhood',d.neighborhood,'city',d.city,
      'state',d.state,'postal_code',d.postal_code,'phone',d.phone) AS address,
    (SELECT json_agg(i ORDER BY i.id) FROM order_items i WHERE i.order_id=o.id) AS items
  FROM orders o JOIN users u ON u.id=o.user_id JOIN order_delivery d ON d.order_id=o.id JOIN payments p ON p.order_id=o.id`;

export async function getOrders(db, userId = null) {
  return rows(db, `${orderQuery} WHERE ($1::text IS NULL OR o.user_id=$1) ORDER BY o.id DESC`, [userId]);
}

function getOrder(db, id) {
  return first(db, `${orderQuery} WHERE o.id=$1`, [id]);
}

export async function recordAudit(db, actor, action, entity, id) {
  await db.query('INSERT INTO audit_logs (actor_id,action,entity,entity_id) VALUES ($1,$2,$3,$4)', [actor,action,entity,String(id)]);
}

export async function createOrder(pool, userId, body) {
  const key = text(body.idempotencyKey, 100, 12);
  requireValue(/^[A-Za-z0-9_-]+$/.test(key), 'Identificador de compra inválido.');
  return transaction(pool, async db => {
    await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 7))', [JSON.stringify([userId,key])]);
    const existing = await first(db, 'SELECT id FROM orders WHERE user_id=$1 AND idempotency_key=$2', [userId,key]);
    if (existing) return getOrder(db, existing.id);
    requireValue(body.termsAccepted === true, 'Acepta los términos para continuar.');
    const address = deliveryAddress(body.address);
    const quote = await calculateQuote(db, body, true);
    const folio = 'LUMA-' + randomUUID().toUpperCase();
    const { id } = await first(db, `INSERT INTO orders
      (folio,user_id,idempotency_key,coupon_id,status,subtotal,discount,shipping,terms_version)
      VALUES ($1,$2,$3,$4,'simulado',$5,$6,$7,'1.0') RETURNING id`,
      [folio,userId,key,quote.couponId,quote.subtotal,quote.discount,quote.shipping]);
    await db.query(`INSERT INTO order_delivery (order_id,recipient,street,neighborhood,city,state,postal_code,phone,shipping_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id,...address,quote.shippingType]);
    await db.query("INSERT INTO payments (order_id,status) VALUES ($1,'aprobado')", [id]);

    for (const {product,size,quantity,variantId} of quote.selections) {
      await db.query(`INSERT INTO order_items (order_id,variant_id,sku,name,description,size,unit_price,quantity)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id,variantId,product.sku,product.name,product.description,size,product.price,quantity]);
      await db.query('UPDATE product_variants SET stock=stock-$1 WHERE id=$2', [quantity,variantId]);
      await db.query(`INSERT INTO inventory_movements (variant_id,order_id,actor_id,delta,reason)
        VALUES ($1,$2,$3,$4,'venta')`, [variantId,id,userId,-quantity]);
    }
    if (quote.couponId) await db.query('UPDATE coupons SET used=used+1 WHERE id=$1', [quote.couponId]);
    return getOrder(db,id);
  });
}

export async function reverseOrder(db, order, actor, reason) {
  const items = await rows(db, 'SELECT variant_id,quantity FROM order_items WHERE order_id=$1 ORDER BY variant_id', [order.id]);
  for (const item of items) {
    await db.query('UPDATE product_variants SET stock=stock+$1 WHERE id=$2', [item.quantity,item.variant_id]);
    await db.query('INSERT INTO inventory_movements (variant_id,order_id,actor_id,delta,reason) VALUES ($1,$2,$3,$4,$5)',
      [item.variant_id,order.id,actor,item.quantity,reason]);
  }
  await db.query("UPDATE payments SET status='reembolsado' WHERE order_id=$1", [order.id]);
  const status = reason === 'cancelacion' ? 'cancelado' : 'reembolsado';
  await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status,order.id]);
  await recordAudit(db,actor,status,'pedido',order.id);
}

export async function changeOrder(pool, id, actor, body) {
  return transaction(pool, async db => {
    const order = await first(db, 'SELECT id,status FROM orders WHERE id=$1 FOR UPDATE', [id]);
    requireValue(order, 'Pedido no encontrado.', 404);
    if (Object.hasOwn(body,'tracking')) {
      await db.query('UPDATE order_delivery SET tracking=$1 WHERE order_id=$2', [text(body.tracking,100),id]);
      await recordAudit(db,actor,'guia_actualizada','pedido',id);
      return { ok:true };
    }
    const status = text(body.status, 20, 1);
    if (status === order.status) return { ok:true };
    requireValue(transitions[order.status].includes(status), 'El pedido no puede pasar a ese estado.', 409);
    if (status === 'cancelado') {
      await reverseOrder(db,order,actor,'cancelacion');
      await db.query(`UPDATE return_requests SET status='reembolsada',resolution='Cancelación y reembolso simulado'
        WHERE order_id=$1 AND status IN ('solicitada','aprobada')`, [id]);
    } else {
      await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status,id]);
      await recordAudit(db,actor,'estado_actualizado','pedido',id);
    }
    return { ok:true };
  });
}
