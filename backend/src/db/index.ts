import '../loadEnv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isRender = process.env.DATABASE_URL.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
export { schema, pool };

// import '../loadEnv';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
// import * as schema from './schema';

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL environment variable is not set');
// }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production'
//     ? { rejectUnauthorized: false }
//     : false,
// });

// export const db = drizzle(pool, { schema });
// export { schema, pool };