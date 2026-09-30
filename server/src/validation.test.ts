import assert from 'node:assert/strict';
import test from 'node:test';
import type { ScryfallCardData } from './scryfall.js';
import { type BuildDraft, type CoachDraft, validateCoachDraft, validateGeneratedBuild } from './validation.js';

const card = (name: string, overrides: Partial<ScryfallCardData> = {}): ScryfallCardData => ({
  name, typeLine: 'Artifact', oracleText: '', colorIdentity: [], commanderLegality: 'legal', ...overrides,
});
const leader = card('Leader', { typeLine: 'Legendary Creature — Wizard', colorIdentity: ['U'] });
const island = card('Island', { typeLine: 'Basic Land — Island', colorIdentity: ['U'] });
const cards = new Map<string, ScryfallCardData>([
  ['leader', leader], ['island', island],
  ['red card', card('Red Card', { colorIdentity: ['R'] })],
  ['banned card', card('Banned Card', { commanderLegality: 'banned' })],
  ['not legal', card('Not Legal', { commanderLegality: 'not_legal' })],
  ['ordinary', card('Ordinary')], ['invalid leader', card('Invalid Leader', { typeLine: 'Sorcery' })],
]);
const lookup = async (name: string) => cards.get(name.toLocaleLowerCase());
const draft = (overrides: Partial<BuildDraft> = {}): BuildDraft => ({ summary: 'Build', commander: 'Leader', cards: [{ name: 'Island', quantity: 99, role: 'land' }], warnings: [], ...overrides });

test('accepts exactly 99 legal cards plus one eligible commander', async () => {
  const result = await validateGeneratedBuild(draft(), lookup);
  assert.equal(result.validation.deckCardCount, 99); assert.equal(result.validation.totalCards, 100);
  assert.equal(result.validation.isValid, true); assert.equal(result.needsReview, false);
});

test('flags wrong counts and non-positive or fractional quantities', async () => {
  const result = await validateGeneratedBuild(draft({ cards: [{ name: 'Island', quantity: 98.5, role: 'land' }] }), lookup);
  assert.equal(result.needsReview, true);
  assert.deepEqual(new Set(result.validation.issues.map((issue) => issue.code)), new Set(['quantity', 'card_count']));
});

test('flags invalid commander, illegal cards, color identity, singleton, and missing names', async () => {
  const result = await validateGeneratedBuild(draft({
    commander: 'Invalid Leader',
    cards: [
      { name: 'Red Card', quantity: 1, role: 'threat' }, { name: 'Banned Card', quantity: 1, role: 'bad' },
      { name: 'Not Legal', quantity: 1, role: 'bad' }, { name: 'Ordinary', quantity: 2, role: 'duplicate' },
      { name: 'Imaginary', quantity: 1, role: 'fake' }, { name: 'Island', quantity: 93, role: 'land' },
    ],
  }), lookup);
  const codes = new Set(result.validation.issues.map((issue) => issue.code));
  for (const code of ['invalid_commander', 'illegal', 'color_identity', 'singleton', 'card_not_found']) assert.equal(codes.has(code as never), true);
  assert.equal(result.needsReview, true);
});

test('coach removes hallucinated cuts and rejects off-color or illegal additions', async () => {
  const coach: CoachDraft = { summary: 'Coach', strengths: [], weaknesses: [], strategy: [], warnings: [], suggestedCuts: [{ name: 'Imaginary', reason: 'cut' }, { name: 'Ordinary', reason: 'real' }], suggestedAdds: [{ name: 'Red Card', reason: 'off color' }, { name: 'Banned Card', reason: 'illegal' }, { name: 'Island', reason: 'legal' }] };
  const result = await validateCoachDraft(coach, { commander: { name: 'Leader' }, cards: [{ card: { name: 'Ordinary' }, quantity: 1 }] }, lookup);
  assert.deepEqual(result.suggestedCuts.map((cut) => cut.name), ['Ordinary']);
  assert.deepEqual(result.suggestedAdds.map((add) => add.validated), [false, false, true]);
  assert.equal(result.needsReview, true);
});
