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
const constraints = (overrides: Partial<{ commander: string; mustKeep: string[]; avoid: string[] }> = {}) => ({ commander: 'Leader', mustKeep: [], avoid: [], ...overrides });

test('accepts exactly 99 legal cards plus one eligible commander', async () => {
  const result = await validateGeneratedBuild(draft(), constraints(), lookup);
  assert.equal(result.validation.deckCardCount, 99); assert.equal(result.validation.totalCards, 100);
  assert.equal(result.validation.isValid, true); assert.equal(result.needsReview, false);
});

test('flags wrong counts and non-positive or fractional quantities', async () => {
  const result = await validateGeneratedBuild(draft({ cards: [{ name: 'Island', quantity: 98.5, role: 'land' }] }), constraints(), lookup);
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
  }), constraints({ commander: 'Invalid Leader' }), lookup);
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


test('flags a generated commander that differs from the requested commander', async () => {
  const result = await validateGeneratedBuild(draft(), constraints({ commander: 'Invalid Leader' }), lookup);
  assert.equal(result.validation.issues.some((issue) => issue.code === 'commander_mismatch'), true);
  assert.equal(result.validation.isValid, false);
  assert.equal(result.needsReview, true);
});

test('flags missing must-keep cards after canonical name resolution', async () => {
  const result = await validateGeneratedBuild(draft(), constraints({ mustKeep: ['Ordinary'] }), lookup);
  assert.equal(result.validation.issues.some((issue) => issue.code === 'missing_must_keep' && issue.cardName === 'Ordinary'), true);
  assert.equal(result.validation.isValid, false);
  assert.equal(result.needsReview, true);
});

test('flags avoided cards in the 99 or commander slot', async () => {
  const inCards = await validateGeneratedBuild(draft(), constraints({ avoid: ['island'] }), lookup);
  const asCommander = await validateGeneratedBuild(draft(), constraints({ avoid: ['leader'] }), lookup);
  assert.equal(inCards.validation.issues.some((issue) => issue.code === 'avoided_card'), true);
  assert.equal(asCommander.validation.issues.some((issue) => issue.code === 'avoided_card'), true);
  assert.equal(inCards.validation.isValid, false);
  assert.equal(asCommander.needsReview, true);
});
