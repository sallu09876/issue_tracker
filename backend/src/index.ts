import './loadEnv';
import cors from 'cors';
import express from 'express';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';
import { errorHandler } from './middleware/errorHandler';
import analysisRouter from './routes/analysis';
import commentsRouter from './routes/comments';
import issuesRouter from './routes/issues';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/issues', issuesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/analysis', analysisRouter);
app.use(errorHandler);

async function startServer() {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Migrations complete ✓');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();