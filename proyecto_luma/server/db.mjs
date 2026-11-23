import pg from 'pg';

export function database(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) throw new Error('Define DATABASE_URL en server/.env');
  return new pg.Pool({ connectionString, connectionTimeoutMillis: 5000, statement_timeout: 15000 });
}

export async function transaction(pool, work) {
  const connection = await pool.connect();
  try {
    await connection.query('BEGIN');
    const result = await work(connection);
    await connection.query('COMMIT');
    return result;
  } catch (error) {
    await connection.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export async function rows(db, statement, params) {
  return (await db.query(statement, params)).rows;
}

export async function first(db, statement, params) {
  return (await rows(db, statement, params))[0];
}
