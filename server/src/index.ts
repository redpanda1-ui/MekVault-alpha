import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';

import { config } from './config.js';

const app = express();
const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(10_000),
});

app.disable('x-powered-by');
app.use(cors({ origin: config.ALLOWED_ORIGIN }));
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/chat', async (request, response, next) => {
  try {
    const { message } = chatRequestSchema.parse(request.body);
    const result = await openai.responses.create({
      model: config.OPENAI_MODEL,
      input: message,
    });

    response.json({ reply: result.output_text });
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: 'A non-empty message is required.' });
      return;
    }

    console.error(error);
    response.status(500).json({ error: 'Unable to process the request.' });
  },
);

app.listen(config.PORT, () => {
  console.log(`MekVault API listening on port ${config.PORT}`);
});
