import { resolveCardsByName } from '../services/scryfall';
import type { Deck, DeckCardEntry, DeckValidation, ScryfallCard } from '../types/mtg';

const MULTIPLE_COPY_TEXT = /a deck can have (?:any number|up to [a-z0-9]+) of cards named/i;
export const deckTotal = (deck: Deck) => (deck.commander ? 1 : 0) + deck.cards.reduce((sum, entry) => sum + entry.quantity, 0);
export const canBeCommander = (card: ScryfallCard) =>
  (card.typeLine.includes('Legendary') && card.typeLine.includes('Creature'))
  || /can be your commander/i.test(card.oracleText ?? '');
export function validateCommanderDeck(deck: Deck): DeckValidation {
  const issues: DeckValidation['issues'] = []; const totalCards = deckTotal(deck);
  if (!deck.commander) issues.push({ severity: 'error', message: 'Choose a commander.' });
  if (deck.commander && !canBeCommander(deck.commander)) issues.push({ severity: 'error', cardName: deck.commander.name, message: `${deck.commander.name} is not eligible to be a commander.` });
  if (totalCards !== 100) issues.push({ severity: 'error', message: `Commander decks require exactly 100 cards; this deck has ${totalCards}.` });
  const allowedColors = new Set(deck.commander?.colorIdentity ?? []);
  const allEntries: DeckCardEntry[] = [...deck.cards, ...(deck.commander ? [{ card: deck.commander, quantity: 1 }] : [])];
  const quantities = new Map<string, number>();
  for (const entry of allEntries) quantities.set(entry.card.name, (quantities.get(entry.card.name) ?? 0) + entry.quantity);
  for (const { card, quantity } of allEntries) {
    const isBasic = card.typeLine.includes('Basic Land');
    const allowsMultiples = MULTIPLE_COPY_TEXT.test(card.oracleText ?? '');
    if ((quantities.get(card.name) ?? quantity) > 1 && !isBasic && !allowsMultiples && !issues.some((issue) => issue.cardName === card.name && issue.message.includes('singleton'))) issues.push({ severity: 'error', cardName: card.name, message: `${card.name} breaks the Commander singleton rule.` });
    if (card.commanderLegality !== 'legal') issues.push({ severity: 'error', cardName: card.name, message: `${card.name} is ${card.commanderLegality.replace('_', ' ')} in Commander.` });
    const outsideIdentity = card.colorIdentity.filter((color) => !allowedColors.has(color));
    if (deck.commander && outsideIdentity.length) issues.push({ severity: 'error', cardName: card.name, message: `${card.name} is outside the commander's color identity (${outsideIdentity.join('')}).` });
  }
  return { totalCards, isComplete: totalCards === 100 && Boolean(deck.commander), isValid: issues.every((issue) => issue.severity !== 'error'), issues };
}
export interface ParsedDecklist {
  cards: Array<{ name: string; quantity: number }>;
  commanderName?: string;
  errors: string[];
}
export function parseDecklist(text: string): ParsedDecklist {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = new Map<string, number>();
  const errors: string[] = [];
  let section = '';
  let commanderName: string | undefined;

  for (const line of lines) {
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim().toUpperCase();
      continue;
    }
    const match = line.match(/^(\d+)\s+(?:x\s+)?(.+?)(?:\s+\([A-Z0-9]+\)\s+[A-Z0-9-]+)?(?:\s+\*[^*]+\*)?$/i);
    if (!match) {
      errors.push(`Could not parse: ${line}`);
      continue;
    }
    const quantity = Number(match[1]);
    const name = match[2].trim();
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100) {
      errors.push(`Invalid quantity for ${name}: ${match[1]} (must be 1-100)`);
      continue;
    }
    if (section === 'COMMANDER' && !commanderName) {
      commanderName = name;
      continue;
    }
    parsed.set(name, (parsed.get(name) ?? 0) + quantity);
  }

  return { cards: [...parsed].map(([name, quantity]) => ({ name, quantity })), commanderName, errors };
}
export interface ImportResult { entries: DeckCardEntry[]; commander?: ScryfallCard; errors: string[]; }
export async function importDecklist(text: string): Promise<ImportResult> {
  const parsed = parseDecklist(text);
  const names = [...parsed.cards.map((entry) => entry.name), ...(parsed.commanderName ? [parsed.commanderName] : [])];
  if (!names.length) return { entries: [], errors: parsed.errors.length ? parsed.errors : ['No cards found in decklist.'] };

  const resolved = await resolveCardsByName(names);
  const byName = new Map(resolved.cards.map((card) => [card.name.toLocaleLowerCase(), card]));
  const entries: DeckCardEntry[] = [];
  const errors = [...parsed.errors];

  for (const entry of parsed.cards) {
    const card = byName.get(entry.name.toLocaleLowerCase());
    if (card) entries.push({ card, quantity: entry.quantity });
    else errors.push(`Card not found: ${entry.name}`);
  }

  const commander = parsed.commanderName ? byName.get(parsed.commanderName.toLocaleLowerCase()) : undefined;
  if (parsed.commanderName && !commander) errors.push(`Commander not found: ${parsed.commanderName}`);

  return { entries, commander, errors };
}
export function upsertCard(entries: DeckCardEntry[], card: ScryfallCard, change = 1) {
  const existing = entries.find((entry) => entry.card.id === card.id);
  if (!existing && change > 0) return [...entries, { card, quantity: change }];
  return entries.map((entry) => entry.card.id === card.id ? { ...entry, quantity: entry.quantity + change } : entry).filter((entry) => entry.quantity > 0);
}

export function replaceCommander(deck: Deck, commander: ScryfallCard): Deck {
  let cards = deck.cards.filter((entry) => entry.card.id !== commander.id);
  if (deck.commander && deck.commander.id !== commander.id) {
    cards = upsertCard(cards, deck.commander, 1);
  }
  return { ...deck, commander, cards };
}
