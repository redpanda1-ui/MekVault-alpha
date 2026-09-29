import cors from 'cors';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import { ZodError } from 'zod';
import { buildDeck, coachDeck } from './ai.js';
import { config } from './config.js';
import { buildRequestSchema, coachRequestSchema } from './schemas.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.ALLOWED_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_request, response) => response.json({ status: 'ok', version: '0.2.0' }));
const coachHandler: RequestHandler = async (request, response, next) => { try { const input = coachRequestSchema.parse(request.body); response.json(await coachDeck(input)); } catch (error) { next(error); } };
const buildHandler: RequestHandler = async (request, response, next) => { try { const input = buildRequestSchema.parse(request.body); response.json(await buildDeck(input)); } catch (error) { next(error); } };
app.post('/api/coach', coachHandler);
app.post('/api/build', buildHandler);
const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) { response.status(400).json({ error: 'Invalid request.', details: error.issues }); return; }
  console.error(error); response.status(500).json({ error: 'Unable to process the request.' });
};
app.use(errorHandler);
app.listen(config.PORT, () => console.log(`MekVault API v0.2 listening on port ${config.PORT}`));
