import assert from 'node:assert/strict';
import test from 'node:test';
import type { Deck, ScryfallCard } from '../types/mtg';
import { replaceCommander, validateCommanderDeck } from './deck';

const card = (name: string, overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: name, name, typeLine: 'Artifact', set: 'TST', setName: 'Test', collectorNumber: '1',
  colorIdentity: [], commanderLegality: 'legal', ...overrides,
});
const leader = card('Valid Leader', { typeLine: 'Legendary Creature — Wizard', colorIdentity: ['U'] });
const deck = (cards: Deck['cards'], commander: ScryfallCard = leader): Deck => ({ id: 'deck', name: 'Test', commander, cards, createdAt: '', updatedAt: '' });
const island = card('Island', { typeLine: 'Basic Land — Island', colorIdentity: ['U'] });

test('accepts a valid 99 cards plus commander deck', () => {
  const result = validateCommanderDeck(deck([{ card: island, quantity: 99 }]));
  assert.equal(result.totalCards, 100); assert.equal(result.isComplete, true); assert.equal(result.isValid, true);
});

test('rejects illegal identity, banned cards, singleton violations, and invalid commanders', () => {
  const invalidLeader = card('Not a Leader', { typeLine: 'Sorcery' });
  const result = validateCommanderDeck(deck([
    { card: card('Red Card', { colorIdentity: ['R'] }), quantity: 1 },
    { card: card('Banned Card', { commanderLegality: 'banned' }), quantity: 1 },
    { card: card('Repeated Card'), quantity: 2 },
    { card: island, quantity: 94 },
  ], invalidLeader));
  const messages = result.issues.map((issue) => issue.message).join(' ');
  assert.match(messages, /not eligible/); assert.match(messages, /color identity/); assert.match(messages, /banned/); assert.match(messages, /singleton/);
});

test('returns the previous commander to the deck when changing commanders', () => {
  const next = card('Next Leader', { typeLine: 'Legendary Creature — Wizard', colorIdentity: ['U'] });
  const changed = replaceCommander(deck([{ card: next, quantity: 1 }, { card: island, quantity: 98 }]), next);
  assert.equal(changed.commander?.name, 'Next Leader');
  assert.equal(changed.cards.find((entry) => entry.card.name === leader.name)?.quantity, 1);
  assert.equal(changed.cards.some((entry) => entry.card.name === next.name), false);
});
