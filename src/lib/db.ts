import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from '../../drizzle/relations';

const db = drizzle(process.env.DATABASE_URL!, { schema: { ...schema, ...relations } });

export default db;