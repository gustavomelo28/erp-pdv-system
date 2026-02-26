// Database connection utility for Neon PostgreSQL
// Uses @neondatabase/serverless for edge compatibility

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Get database connection URL from environment
export function getDbConnection(): NeonQueryFunction<false, false> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  return neon(databaseUrl);
}

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const sql = getDbConnection();
    const result = await sql(queryText, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper (Neon serverless doesn't support traditional transactions)
// Instead, we use application-level rollback logic
export async function executeTransaction<T>(
  operations: Array<{ query: string; params: any[] }>
): Promise<T[]> {
  const sql = getDbConnection();
  const results: T[] = [];
  
  try {
    for (const op of operations) {
      const result = await sql(op.query, op.params);
      results.push(result as T);
    }
    return results;
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
