import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { logger } from './logger';

// Configure Neon for WebSocket connection
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

logger.info("Initializing database connection", { 
  host: process.env.PGHOST,
  database: process.env.PGDATABASE
});

// Create connection pool with PgBouncer pooling enabled
const pooledConnectionString = process.env.DATABASE_URL?.replace(
  /(@[^.]+)\.([^.]+)\.([^.]+)\.neon\.tech/,
  '$1-pooler.$2.$3.neon.tech'
);

logger.info("Using PgBouncer connection pooling", { 
  originalHost: process.env.PGHOST,
  pooledConnection: pooledConnectionString?.includes('-pooler') ? 'enabled' : 'disabled'
});

export const pool = new Pool({ connectionString: pooledConnectionString });

// Create drizzle instance
export const db = drizzle({ client: pool, schema });