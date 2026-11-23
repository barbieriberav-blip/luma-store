import { randomUUID } from 'node:crypto';
import { first, rows, transaction } from './db.mjs';
import { recordAudit, reverseOrder } from './orders.mjs';
import { integer, requireValue, text } from './validation.mjs';

const returnSelect = `SELECT r.*,o.folio AS order_folio FROM return_requests r JOIN orders o ON o.id=r.order_id`;

export function getReturns(db,userId = null) {
  return rows(db,`${returnSelect} WHERE ($1::text IS NULL OR o.user_id=$1) ORDER BY r.id DESC`,[userId]);
}

function eligible(kind,status) {
  return kind === 'cancelacion' ? ['simulado','preparando'].includes(status) : status === 'entregado';
}

export function requestReturn(pool,userId,body) {
  const orderId=integer(body.orderId);
  const kind=text(body.kind,15,1);
  requireValue(['cancelacion','devolucion','garantia'].includes(kind),'Elige el tipo de solicitud.');
  const reason=text(body.reason,100,3);
  const detail=text(body.detail,500,5);
  return transaction(pool,async db=>{
    const order=await first(db,'SELECT id,status FROM orders WHERE id=$1 AND user_id=$2 FOR UPDATE',[orderId,userId]);
    requireValue(order,'Pedido no encontrado.',404);
    requireValue(eligible(kind,order.status),'El estado del pedido no permite esta solicitud.',409);
    const request=await first(db,`INSERT INTO return_requests (order_id,kind,folio,reason,detail)
      VALUES ($1,$2,$3,$4,$5) RETURNING id`,[orderId,kind,'SOL-'+randomUUID().toUpperCase(),reason,detail]);
    return first(db,`${returnSelect} WHERE r.id=$1`,[request.id]);
  });
}

export function resolveReturn(pool,id,actor,body) {
  const status=text(body.status,15,1);
  const resolution=text(body.resolution,500,5);
  return transaction(pool,async db=>{
    const reference=await first(db,'SELECT order_id FROM return_requests WHERE id=$1',[id]);
    requireValue(reference,'Solicitud no encontrada.',404);
    const order=await first(db,'SELECT id,status FROM orders WHERE id=$1 FOR UPDATE',[reference.order_id]);
    const request=await first(db,'SELECT status,kind FROM return_requests WHERE id=$1 FOR UPDATE',[id]);
    if (status === request.status) return {ok:true};
    const allowed=request.status === 'solicitada' ? ['aprobada','rechazada'] : request.status === 'aprobada' ? ['reembolsada','rechazada'] : [];
    requireValue(allowed.includes(status),'La solicitud no puede pasar a ese estado.',409);
    if (status==='reembolsada') {
      requireValue(eligible(request.kind,order.status),'El pedido ya fue resuelto o cambió de estado.',409);
      await reverseOrder(db,order,actor,request.kind==='cancelacion' ? 'cancelacion' : 'devolucion');
    }
    await db.query('UPDATE return_requests SET status=$1,resolution=$2 WHERE id=$3',[status,resolution,id]);
    await recordAudit(db,actor,status,'solicitud',id);
    return {ok:true};
  });
}
