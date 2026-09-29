import OpenAI from 'openai';
import { config } from './config.js';
import { buildJsonSchema, coachJsonSchema } from './schemas.js';
import { validateCardNames } from './scryfall.js';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
type CoachDraft = { summary: string; strengths: string[]; weaknesses: string[]; suggestedCuts: Array<{ name: string; reason: string }>; suggestedAdds: Array<{ name: string; reason: string }>; strategy: string[]; warnings: string[] };
type BuildDraft = { summary: string; commander: string; cards: Array<{ name: string; quantity: number; role: string }>; warnings: string[] };
async function structured<T>(name: string, schema: object, prompt: string): Promise<T> {
  const response = await openai.responses.create({ model: config.OPENAI_MODEL, input: prompt, text: { format: { type: 'json_schema', name, strict: true, schema } } });
  if (!response.output_text) throw new Error('OpenAI returned an empty response.');
  return JSON.parse(response.output_text) as T;
}
export async function coachDeck(input: unknown) {
  const draft = await structured<CoachDraft>('deck_coaching', coachJsonSchema, `You are an experienced Magic: The Gathering Commander deck coach. Give practical recommendations that follow the user's constraints. Do not claim suggestions are legal or available; the application validates names separately. Input:\n${JSON.stringify(input)}`);
  const validation = await validateCardNames(draft.suggestedAdds.map((card) => card.name));
  const suggestedAdds = draft.suggestedAdds.map((card) => { const checked = validation.get(card.name) ?? { name: card.name, validated: false }; return { ...card, name: checked.name, validated: checked.validated }; });
  const needsReview = suggestedAdds.some((card) => !card.validated);
  return { ...draft, suggestedAdds, needsReview, warnings: needsReview ? [...draft.warnings, 'One or more suggested card names could not be verified with Scryfall. Review them manually.'] : draft.warnings };
}
export async function buildDeck(input: unknown) {
  const draft = await structured<BuildDraft>('deck_build', buildJsonSchema, `Build a 100-card Magic: The Gathering Commander deck including the commander. Respect strategy, budget, power/bracket, must-keep, avoid, and collection preferences. Use quantities and explain each card's role. Names will be checked against Scryfall. Input:\n${JSON.stringify(input)}`);
  const validation = await validateCardNames([draft.commander, ...draft.cards.map((card) => card.name)]);
  const commanderCheck = validation.get(draft.commander) ?? { name: draft.commander, validated: false };
  const cards = draft.cards.map((card) => { const checked = validation.get(card.name) ?? { name: card.name, validated: false }; return { ...card, name: checked.name, validated: checked.validated }; });
  const needsReview = !commanderCheck.validated || cards.some((card) => !card.validated);
  return { ...draft, commander: { name: commanderCheck.name, validated: commanderCheck.validated }, cards, needsReview, warnings: needsReview ? [...draft.warnings, 'Some generated card names failed Scryfall validation and require review.'] : draft.warnings };
}
