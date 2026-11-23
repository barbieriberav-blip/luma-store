import { readdir, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { database, first, transaction } from './db.mjs';

const migrations = new URL('./migrations/', import.meta.url);

export async function prepareDatabase(pool) {
  return transaction(pool, async client => {
    await client.query('SELECT pg_advisory_xact_lock(671904318)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)');
    for (const name of (await readdir(migrations)).filter(file => /^\d+_.*\.sql$/.test(file)).sort()) {
      if (await first(client, 'SELECT name FROM schema_migrations WHERE name=$1', [name])) continue;
      await client.query(await readFile(new URL(name, migrations), 'utf8'));
      await client.query('INSERT INTO schema_migrations VALUES ($1)', [name]);
    }
    const demo = JSON.parse(await readFile(new URL('../src/assets/catalogo-vista-previa.json', import.meta.url), 'utf8'));
    if (!(await first(client, "SELECT name FROM schema_migrations WHERE name='seed-demo-v1'"))) {
      for (const c of demo.categories) {
        await client.query('INSERT INTO categories (id,name,slug,active) VALUES ($1,$2,$3,$4)', [c.id,c.name,c.slug,c.active !== 0]);
      }
      for (const p of demo.products) {
        await client.query(`INSERT INTO products (id,category_id,sku,name,description,material,care,price,image,badge,featured,active)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [p.id,p.category_id,p.sku,p.name,p.description,p.material,p.care,p.price,p.image,p.badge,Boolean(p.featured),p.active !== 0]);
        for (const [index, size] of p.sizes.entries()) {
          const stock = Math.floor(p.stock / p.sizes.length) + Number(index < p.stock % p.sizes.length);
          await client.query('INSERT INTO product_variants (product_id,size,stock) VALUES ($1,$2,$3)', [p.id,size,stock]);
        }
      }
      for (const c of demo.coupons) {
        await client.query(`INSERT INTO coupons (id,code,percent,minimum,max_uses,used,active,expires_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [c.id,c.code,c.percent,c.minimum,c.max_uses,c.used,Boolean(c.active),c.expires_at]);
      }
      for (const table of ['categories', 'products', 'coupons']) {
        await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT MAX(id) FROM ${table}))`);
      }
      await client.query("INSERT INTO schema_migrations VALUES ('seed-demo-v1')");
    }
    if (!(await first(client, "SELECT name FROM schema_migrations WHERE name='seed-gallery-v1'"))) {
      const assets = JSON.parse(await readFile(new URL('./gallery-seed.json', import.meta.url), 'utf8'));
      for (const original of demo.products) {
        const images = assets[original.sku];
        if (!images) continue;
        const product = await first(client,`UPDATE products SET image=$1
          WHERE sku=$2 AND image=$3 AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id=products.id)
          RETURNING id`, [images.cover,original.sku,original.image]);
        if (!product) continue;
        for (const [index,photo] of images.gallery.entries()) {
          await client.query('INSERT INTO product_images (product_id,position,url,alt) VALUES ($1,$2,$3,$4)',
            [product.id,index+1,photo.url,photo.alt]);
        }
      }
      await client.query("INSERT INTO schema_migrations VALUES ('seed-gallery-v1')");
    }

  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pool = database();
  try {
    await prepareDatabase(pool);
    console.log('Migraciones y catálogo de demostración listos.');
  } finally {
    await pool.end();
  }
}
