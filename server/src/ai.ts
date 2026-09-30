import OpenAI from 'openai';
import { config } from './config.js';
import { buildJsonSchema, coachJsonSchema } from './schemas.js';
import { fetchCardByName } from './scryfall.js';
import {
  type BuildDraft,
  type BuildConstraints,
  type CoachDraft,
  type SubmittedDeck,
  validateCoachDraft,
  validateGeneratedBuild,
} from './validation.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

async function structured<T>(name: string, schema: Record<string, unknown>, prompt: string): Promise<T> {
  const response = await openai.responses.create({
    model: config.OPENAI_MODEL,
    input: prompt,
    text: { format: { type: 'json_schema', name, strict: true, schema } },
  });
  if (!response.output_text) throw new Error('OpenAI returned an empty response.');
  return JSON.parse(response.output_text) as T;
}

export async function coachDeck(input: { deck: SubmittedDeck; [key: string]: unknown }) {
  const draft = await structured<CoachDraft>(
    'deck_coaching',
    coachJsonSchema,
    `You are an experienced Magic: The Gathering Commander deck coach. Give practical recommendations that follow the user's constraints. Only suggest cuts that appear in the submitted deck. Do not claim suggestions are legal or available; the application validates them separately. Input:\n${JSON.stringify(input)}`,
  );
  return validateCoachDraft(draft, input.deck, fetchCardByName);
}

export async function buildDeck(input: BuildConstraints & Record<string, unknown>) {
  const draft = await structured<BuildDraft>(
    'deck_build',
    buildJsonSchema,
    `Build a Magic: The Gathering Commander deck with exactly one commander and a cards array whose quantities total exactly 99. Do not include the commander in cards. Respect strategy, budget, power/bracket, must-keep, avoid, and collection preferences. Use positive integer quantities and explain each card's role. All legality is checked after generation. Input:\n${JSON.stringify(input)}`,
  );
  return validateGeneratedBuild(draft, input, fetchCardByName);
}
