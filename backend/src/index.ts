import './loadEnv';
import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import analysisRouter from './routes/analysis';
import commentsRouter from './routes/comments';
import issuesRouter from './routes/issues';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/issues', issuesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/analysis', analysisRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
