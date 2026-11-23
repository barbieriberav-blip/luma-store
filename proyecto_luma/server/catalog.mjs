import { first, rows, transaction } from './db.mjs';
import { recordAudit } from './orders.mjs';
import { integer, requireValue, text } from './validation.mjs';

export function categories(db, includeInactive = false) {
  return rows(db,`SELECT id,name,slug,active::int FROM categories WHERE active OR $1 ORDER BY id`,[includeInactive]);
}

export function products(db, includeInactive = false) {
  return rows(db,`SELECT p.id,p.category_id,c.name AS category,p.sku,p.name,p.description,p.material,p.care,
      p.price,p.image,p.badge,p.featured::int,p.active::int,
      COALESCE(sum(v.stock),0)::int AS stock,
      COALESCE(array_agg(v.size ORDER BY v.id) FILTER (WHERE v.id IS NOT NULL), '{}') AS sizes,
      COALESCE(json_object_agg(v.size,v.stock) FILTER (WHERE v.id IS NOT NULL), '{}') AS stock_by_size
    FROM products p JOIN categories c ON c.id=p.category_id
    LEFT JOIN product_variants v ON v.product_id=p.id AND v.active
    WHERE $1 OR (p.active AND c.active) GROUP BY p.id,c.name ORDER BY p.id`,[includeInactive]);
}

function productInput(body) {
  const { sizes, variantStock, expectedVariantStock } = body;
  requireValue(Array.isArray(sizes) && sizes.length && sizes.length <= 20, 'Ingresa de 1 a 20 tallas.');
  const cleanSizes = sizes.map(size => text(size,32,1));
  requireValue(new Set(cleanSizes).size === cleanSizes.length, 'Las tallas deben ser distintas.');
  return {
    fields: [
      integer(body.categoryId),text(body.sku,40,3),text(body.name,100,3),text(body.description,2000),
      text(body.material,120),text(body.care,120),integer(body.price,0,1000000),
      text(body.image,1000),text(body.badge,40),body.featured === true,body.active === true,
    ],
    cleanSizes,
    variantStock,
    expectedVariantStock,
    stock: integer(body.stock,0,1000000),
  };
}

export async function saveProduct(pool, id, actor, body) {
  const input = productInput(body);
  return transaction(pool, async db => {
    if (id) requireValue(await first(db,'SELECT id FROM products WHERE id=$1 FOR UPDATE',[id]),'Producto no encontrado.',404);
    const category = await first(db,'SELECT active FROM categories WHERE id=$1 FOR SHARE',[input.fields[0]]);
    requireValue(category && (category.active || !input.fields[10]),'Selecciona una categoría activa.');
    if (id) {
      await db.query(`UPDATE products SET category_id=$1,sku=$2,name=$3,description=$4,material=$5,care=$6,
        price=$7,image=$8,badge=$9,featured=$10,active=$11 WHERE id=$12`,[...input.fields,id]);
    } else {
      ({ id } = await first(db,`INSERT INTO products
        (category_id,sku,name,description,material,care,price,image,badge,featured,active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,input.fields));
    }

    const oldVariants = await rows(db,'SELECT id,size,stock,active FROM product_variants WHERE product_id=$1 ORDER BY id FOR UPDATE',[id]);
    const currentBySize = new Map(oldVariants.map(variant => [variant.size,variant]));
    for (const [index,size] of input.cleanSizes.entries()) {
      const old = currentBySize.get(size);
      const explicit = input.variantStock && Object.hasOwn(input.variantStock,size);
      if (explicit && old?.active) {
        requireValue(input.expectedVariantStock?.[size] === old.stock,
          `El stock de la talla ${size} cambió. Cierra el editor y vuelve a cargar los datos.`,409);
      }
      const stock = explicit
        ? integer(input.variantStock[size],0,1000000)
        : old?.stock ?? (oldVariants.length ? 0 : Math.floor(input.stock / input.cleanSizes.length) + Number(index < input.stock % input.cleanSizes.length));
      const variant = await first(db,`INSERT INTO product_variants (product_id,size,stock) VALUES ($1,$2,$3)
        ON CONFLICT(product_id,size) DO UPDATE SET stock=EXCLUDED.stock,active=true RETURNING id`,[id,size,stock]);
      const delta = stock - (old?.stock ?? 0);
      if (delta) await db.query("INSERT INTO inventory_movements (variant_id,actor_id,delta,reason) VALUES ($1,$2,$3,'ajuste_admin')",
        [variant.id,actor,delta]);
    }
    await db.query('UPDATE product_variants SET active=false WHERE product_id=$1 AND NOT(size=ANY($2::text[]))',[id,input.cleanSizes]);
    await recordAudit(db,actor,'producto_guardado','producto',id);
    return { id };
  });
}

export function deactivateProduct(pool, id, actor) {
  return transaction(pool, async db => {
    requireValue(await first(db,'UPDATE products SET active=false WHERE id=$1 RETURNING id',[id]),'Producto no encontrado.',404);
    await recordAudit(db,actor,'producto_desactivado','producto',id);
    return { ok:true };
  });
}

export function saveCategory(pool, id, actor, body, remove = false) {
  return transaction(pool, async db => {
    if (remove) {
      requireValue(await first(db,'UPDATE categories SET active=false WHERE id=$1 RETURNING id',[id]),'Categoría no encontrada.',404);
    } else {
      const name = text(body.name,60,3);
      const slug = name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      requireValue(slug,'Escribe un nombre con letras o números.');
      if (id) {
        requireValue(await first(db,'UPDATE categories SET name=$1,slug=$2,active=$3 WHERE id=$4 RETURNING id',
          [name,slug,body.active !== false,id]),'Categoría no encontrada.',404);
      } else {
        ({ id }=await first(db,'INSERT INTO categories (name,slug) VALUES ($1,$2) RETURNING id',[name,slug]));
      }
    }
    await recordAudit(db,actor,remove ? 'categoria_desactivada' : 'categoria_guardada','categoria',id);
    return { id };
  });
}
