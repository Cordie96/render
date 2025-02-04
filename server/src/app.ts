import express from 'express';
import client from 'prom-client';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/api', router);
app.use(errorHandler); 