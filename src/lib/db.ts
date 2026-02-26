// Database connection utility for PostgreSQL
// Uses pg client with fallback for Cloudflare Workers

import pg from 'pg';
const { Pool } = pg;

let pool: any = null;

// Hardcoded fallback for development (will use .dev.vars in production)
const FALLBACK_DATABASE_URL = 'postgresql://neondb_owner:npg_dmGzNnsx6tf0@ep-divine-mouse-acs7dan0-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

// Get database connection from environment
export function getDbConnection() {
  if (!pool) {
    // Try to get DATABASE_URL from process.env, use fallback if not available
    const databaseUrl = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;
    
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
}

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const pool = getDbConnection();
    const result = await pool.query(queryText, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function executeTransaction<T>(
  operations: Array<{ query: string; params: any[] }>
): Promise<T[]> {
  const pool = getDbConnection();
  const client = await pool.connect();
  const results: T[]  = [];
  
  try {
    await client.query('BEGIN');
    
    for (const op of operations) {
      const result = await client.query(op.query, op.params);
      results.push(result.rows as T);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}
