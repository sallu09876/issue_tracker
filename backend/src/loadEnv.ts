import dotenv from 'dotenv';
import path from 'path';

// Load monorepo root .env first, then backend/.env (local overrides win).
const envPaths = [
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}
