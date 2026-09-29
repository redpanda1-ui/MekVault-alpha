import { z } from 'zod';

const cardSchema = z.object({ name: z.string().min(1), quantity: z.number().int().positive().optional(), typeLine: z.string().optional(), colorIdentity: z.array(z.string()).optional(), commanderLegality: z.string().optional(), usdPrice: z.string().optional() });
export const coachRequestSchema = z.object({
  instructions: z.string().trim().min(1).max(2_000),
  deck: z.object({ name: z.string().min(1), commander: z.object({ name: z.string(), colorIdentity: z.array(z.string()), typeLine: z.string() }).optional(), cards: z.array(z.object({ card: cardSchema, quantity: z.number().int().positive() })).max(500), validation: z.unknown().optional() }),
});
export const buildRequestSchema = z.object({
  commander: z.string().trim().min(1), strategy: z.string().trim().min(1), budget: z.number().nonnegative().optional(),
  desiredPower: z.string().trim().min(1).optional(), bracket: z.number().int().min(1).max(5).optional(),
  mustKeep: z.array(z.string()).max(100).default([]), avoid: z.array(z.string()).max(100).default([]),
  collection: z.array(cardSchema).max(10_000).optional(),
});
export const coachJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string' }, strengths: { type: 'array', items: { type: 'string' } }, weaknesses: { type: 'array', items: { type: 'string' } },
    suggestedCuts: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, reason: { type: 'string' } }, required: ['name', 'reason'] } },
    suggestedAdds: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, reason: { type: 'string' } }, required: ['name', 'reason'] } },
    strategy: { type: 'array', items: { type: 'string' } }, warnings: { type: 'array', items: { type: 'string' } },
  }, required: ['summary', 'strengths', 'weaknesses', 'suggestedCuts', 'suggestedAdds', 'strategy', 'warnings'],
} as const;
export const buildJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string' }, commander: { type: 'string' },
    cards: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, quantity: { type: 'number' }, role: { type: 'string' } }, required: ['name', 'quantity', 'role'] } },
    warnings: { type: 'array', items: { type: 'string' } },
  }, required: ['summary', 'commander', 'cards', 'warnings'],
 } as const;
