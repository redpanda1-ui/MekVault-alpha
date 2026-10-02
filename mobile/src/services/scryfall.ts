import type { ScryfallCard } from '../types/mtg';

const API_URL = 'https://api.scryfall.com';
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ScryfallResponseCard {
  id: string; name: string; mana_cost?: string; type_line: string; oracle_text?: string; set: string; set_name: string;
  collector_number: string; image_uris?: { normal?: string }; card_faces?: Array<{ image_uris?: { normal?: string } }>;
  prices: { usd?: string | null }; color_identity: ScryfallCard['colorIdentity'];
  legalities: { commander: ScryfallCard['commanderLegality'] };
}
const mapCard = (card: ScryfallResponseCard): ScryfallCard => ({
  id: card.id, name: card.name, manaCost: card.mana_cost, typeLine: card.type_line, oracleText: card.oracle_text,
  set: card.set.toUpperCase(), setName: card.set_name, collectorNumber: card.collector_number,
  imageUrl: card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal,
  usdPrice: card.prices.usd ?? undefined, colorIdentity: card.color_identity,
  commanderLegality: card.legalities.commander,
});
async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/json;q=0.9,*/*;q=0.8' } });
  if (!response.ok) throw new Error(response.status === 404 ? 'No matching card found.' : 'Scryfall is unavailable. Try again.');
  return response.json() as Promise<T>;
}
export async function searchCards(query: string): Promise<ScryfallCard[]> {
  const result = await request<{ data: ScryfallResponseCard[] }>(`/cards/search?q=${encodeURIComponent(query)}&order=name&unique=cards`);
  return result.data.slice(0, 30).map(mapCard);
}
export async function findCardByName(name: string): Promise<ScryfallCard> {
  return mapCard(await request<ScryfallResponseCard>(`/cards/named?exact=${encodeURIComponent(name)}`));
}
export async function resolveCardsByName(names: string[]): Promise<{ cards: ScryfallCard[]; notFound: string[] }> {
  const response = await fetch(`${BACKEND_URL}/api/cards/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names }),
  });
  const body = await response.json() as { cards?: ScryfallCard[]; notFound?: string[]; error?: string };
  if (!response.ok) throw new Error(body.error ?? 'Unable to resolve imported cards.');
  return { cards: body.cards ?? [], notFound: body.notFound ?? [] };
}
