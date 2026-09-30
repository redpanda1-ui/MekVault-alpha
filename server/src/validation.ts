import type { ScryfallCardData } from './scryfall.js';

export type CardLookup = (name: string) => Promise<ScryfallCardData | undefined>;
export interface BuildDraft {
  summary: string;
  commander: string;
  cards: Array<{ name: string; quantity: number; role: string }>;
  warnings: string[];
}
export interface CoachDraft {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedCuts: Array<{ name: string; reason: string }>;
  suggestedAdds: Array<{ name: string; reason: string }>;
  strategy: string[];
  warnings: string[];
}
export interface SubmittedDeck {
  commander?: { name: string; colorIdentity?: string[] };
  cards: Array<{ card: { name: string }; quantity: number }>;
}
export interface ValidationIssue {
  cardName?: string;
  code: 'card_not_found' | 'invalid_commander' | 'illegal' | 'color_identity' | 'singleton' | 'quantity' | 'card_count' | 'hallucinated_cut';
  message: string;
}

const MULTIPLE_COPY_TEXT = /a deck can have (?:any number|up to [a-z0-9]+) of cards named/i;
export const canBeCommander = (card: ScryfallCardData) =>
  (card.typeLine.includes('Legendary') && card.typeLine.includes('Creature'))
  || /can be your commander/i.test(card.oracleText);
const permitsMultiples = (card: ScryfallCardData) =>
  card.typeLine.includes('Basic Land') || MULTIPLE_COPY_TEXT.test(card.oracleText);

export async function validateGeneratedBuild(draft: BuildDraft, lookup: CardLookup) {
  const issues: ValidationIssue[] = [];
  const cache = new Map<string, ScryfallCardData | undefined>();
  const find = async (name: string) => {
    const key = name.toLocaleLowerCase();
    if (!cache.has(key)) cache.set(key, await lookup(name));
    return cache.get(key);
  };

  const commander = await find(draft.commander);
  if (!commander) {
    issues.push({ cardName: draft.commander, code: 'card_not_found', message: `Commander "${draft.commander}" was not found on Scryfall.` });
  } else {
    if (!canBeCommander(commander)) issues.push({ cardName: commander.name, code: 'invalid_commander', message: `${commander.name} is not eligible to be a commander.` });
    if (commander.commanderLegality !== 'legal') issues.push({ cardName: commander.name, code: 'illegal', message: `${commander.name} is ${commander.commanderLegality.replace('_', ' ')} in Commander.` });
  }

  const totalCards = draft.cards.reduce((total, entry) =>
    Number.isInteger(entry.quantity) && entry.quantity > 0 ? total + entry.quantity : total, 0);
  for (const entry of draft.cards.filter((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    issues.push({ cardName: entry.name, code: 'quantity', message: `${entry.name} must have a positive integer quantity.` });
  }
  if (totalCards !== 99) issues.push({ code: 'card_count', message: `A build must contain exactly 99 deck cards plus one commander; received ${totalCards} deck cards.` });

  const canonicalQuantities = new Map<string, number>();
  const canonicalCards = new Map<string, ScryfallCardData>();
  if (commander) {
    canonicalQuantities.set(commander.name.toLocaleLowerCase(), 1);
    canonicalCards.set(commander.name.toLocaleLowerCase(), commander);
  }
  const validatedCards = [] as Array<BuildDraft['cards'][number] & { validated: boolean }>;
  for (const entry of draft.cards) {
    const card = await find(entry.name);
    validatedCards.push({ ...entry, name: card?.name ?? entry.name, validated: Boolean(card) });
    if (!card) {
      issues.push({ cardName: entry.name, code: 'card_not_found', message: `Card "${entry.name}" was not found on Scryfall.` });
      continue;
    }
    const key = card.name.toLocaleLowerCase();
    canonicalQuantities.set(key, (canonicalQuantities.get(key) ?? 0) + entry.quantity);
    canonicalCards.set(key, card);
    if (card.commanderLegality !== 'legal') issues.push({ cardName: card.name, code: 'illegal', message: `${card.name} is ${card.commanderLegality.replace('_', ' ')} in Commander.` });
    if (commander) {
      const allowed = new Set(commander.colorIdentity);
      const outside = card.colorIdentity.filter((color) => !allowed.has(color));
      if (outside.length) issues.push({ cardName: card.name, code: 'color_identity', message: `${card.name} is outside ${commander.name}'s color identity.` });
    }
  }
  for (const [name, quantity] of canonicalQuantities) {
    const card = canonicalCards.get(name);
    if (card && quantity > 1 && !permitsMultiples(card)) issues.push({ cardName: card.name, code: 'singleton', message: `${card.name} violates the Commander singleton rule.` });
  }

  const invalidNames = new Set(issues.flatMap((issue) => issue.cardName ? [issue.cardName.toLocaleLowerCase()] : []));
  const cardsWithStatus = validatedCards.map((card) => ({ ...card, validated: card.validated && !invalidNames.has(card.name.toLocaleLowerCase()) }));
  const commanderName = commander?.name ?? draft.commander;
  const commanderResult = { name: commanderName, validated: Boolean(commander) && !invalidNames.has(commanderName.toLocaleLowerCase()) };
  return {
    ...draft,
    commander: commanderResult,
    cards: cardsWithStatus,
    validation: { isValid: issues.length === 0, totalCards: totalCards + 1, deckCardCount: totalCards, issues },
    needsReview: issues.length > 0,
    warnings: issues.length ? [...draft.warnings, 'Generated deck failed deterministic Commander validation. Review all flagged issues.'] : draft.warnings,
  };
}

export async function validateCoachDraft(draft: CoachDraft, deck: SubmittedDeck, lookup: CardLookup) {
  const issues: ValidationIssue[] = [];
  const deckNames = new Set(deck.cards.map((entry) => entry.card.name.toLocaleLowerCase()));
  if (deck.commander) deckNames.add(deck.commander.name.toLocaleLowerCase());
  const suggestedCuts = draft.suggestedCuts.filter((cut) => {
    const exists = deckNames.has(cut.name.toLocaleLowerCase());
    if (!exists) issues.push({ cardName: cut.name, code: 'hallucinated_cut', message: `Suggested cut "${cut.name}" is not in the submitted deck and was removed.` });
    return exists;
  });

  const commander = deck.commander ? await lookup(deck.commander.name) : undefined;
  const suggestedAdds = [] as Array<CoachDraft['suggestedAdds'][number] & { validated: boolean }>;
  for (const addition of draft.suggestedAdds) {
    const card = await lookup(addition.name);
    let validated = Boolean(card && commander);
    if (!card) issues.push({ cardName: addition.name, code: 'card_not_found', message: `Suggested addition "${addition.name}" was not found on Scryfall.` });
    if (card?.commanderLegality !== 'legal') {
      validated = false;
      issues.push({ cardName: card?.name ?? addition.name, code: 'illegal', message: `${card?.name ?? addition.name} is not legal in Commander.` });
    }
    if (card && commander) {
      const allowed = new Set(commander.colorIdentity);
      if (card.colorIdentity.some((color) => !allowed.has(color))) {
        validated = false;
        issues.push({ cardName: card.name, code: 'color_identity', message: `${card.name} is outside ${commander.name}'s color identity.` });
      }
    }
    if (!commander) {
      validated = false;
      issues.push({ cardName: addition.name, code: 'invalid_commander', message: 'The submitted commander could not be validated.' });
    }
    suggestedAdds.push({ ...addition, name: card?.name ?? addition.name, validated });
  }
  return {
    ...draft,
    suggestedCuts,
    suggestedAdds,
    needsReview: issues.length > 0,
    validation: { isValid: issues.length === 0, issues },
    warnings: issues.length ? [...draft.warnings, ...issues.map((issue) => issue.message)] : draft.warnings,
  };
}
