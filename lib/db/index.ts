import { neon } from '@neondatabase/serverless';

// Initialize Neon database connection
export const sql = neon(process.env.DATABASE_URL!);
