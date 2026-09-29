import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_MODEL: z.string().default('gpt-5-mini'),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGIN: z.string().default('*'),
});

export const config = environmentSchema.parse(process.env);
