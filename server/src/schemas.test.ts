import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRequestSchema, coachRequestSchema, resolveCardsRequestSchema } from './schemas.js';

test('accepts a basic deck-build request', () => {
  const parsed = buildRequestSchema.parse({
    commander: 'The Mycotyrant',
    strategy: 'self-mill fungus tokens',
    bracket: 3,
  });
  assert.equal(parsed.commander, 'The Mycotyrant');
  assert.equal(parsed.bracket, 3);
  assert.deepEqual(parsed.mustKeep, []);
  assert.deepEqual(parsed.avoid, []);
});

test('accepts batched card-resolution names', () => {
  const parsed = resolveCardsRequestSchema.parse({
    names: ['Sol Ring', 'Command Tower'],
  });
  assert.deepEqual(parsed.names, ['Sol Ring', 'Command Tower']);
});

test('rejects an empty AI-coach instruction', () => {
  assert.throws(() =>
    coachRequestSchema.parse({
      instructions: '',
      deck: { name: 'Test', cards: [] },
    }),
  );
});
