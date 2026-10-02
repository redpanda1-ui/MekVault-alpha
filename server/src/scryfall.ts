export interface ScryfallCardData {
  name: string;
  typeLine: string;
  oracleText: string;
  colorIdentity: string[];
  commanderLegality: string;
}

export interface ClientScryfallCard {
  id: string;
  name: string;
  manaCost?: string;
  typeLine: string;
  oracleText?: string;
  set: string;
  setName: string;
  collectorNumber: string;
  imageUrl?: string;
  usdPrice?: string;
  colorIdentity: string[];
  commanderLegality: string;
}

interface ScryfallCardResponse {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  card_faces?: Array<{ oracle_text?: string; image_uris?: { normal?: string } }>;
  set: string;
  set_name: string;
  collector_number: string;
  image_uris?: { normal?: string };
  prices: { usd?: string | null };
  color_identity: string[];
  legalities: { commander: string };
}

const headers = {
  Accept: 'application/json;q=0.9,*/*;q=0.8',
  'User-Agent': 'MekVaultAlpha/0.3 (+https://github.com/redpanda1-ui/MekVault-alpha)',
};

const oracleText = (card: ScryfallCardResponse) =>
  card.oracle_text ?? card.card_faces?.map((face) => face.oracle_text ?? '').join('\n') ?? '';

const toValidationCard = (card: ScryfallCardResponse): ScryfallCardData => ({
  name: card.name,
  typeLine: card.type_line,
  oracleText: oracleText(card),
  colorIdentity: card.color_identity,
  commanderLegality: card.legalities.commander,
});

const toClientCard = (card: ScryfallCardResponse): ClientScryfallCard => ({
  id: card.id,
  name: card.name,
  manaCost: card.mana_cost,
  typeLine: card.type_line,
  oracleText: oracleText(card) || undefined,
  set: card.set.toUpperCase(),
  setName: card.set_name,
  collectorNumber: card.collector_number,
  imageUrl: card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal,
  usdPrice: card.prices.usd ?? undefined,
  colorIdentity: card.color_identity,
  commanderLegality: card.legalities.commander,
});

export async function fetchCardByName(name: string): Promise<ScryfallCardData | undefined> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
      { headers },
    );
    if (!response.ok) return undefined;
    return toValidationCard(await response.json() as ScryfallCardResponse);
  } catch {
    return undefined;
  }
}

export async function fetchCardsByName(names: string[]) {
  const results = new Map<string, ScryfallCardData | undefined>();
  for (const name of new Set(names)) {
    results.set(name.toLocaleLowerCase(), await fetchCardByName(name));
  }
  return results;
}

export async function resolveCardNames(names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const cards: ClientScryfallCard[] = [];
  const notFound: string[] = [];

  for (let offset = 0; offset < unique.length; offset += 75) {
    const chunk = unique.slice(offset, offset + 75);
    const response = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers: chunk.map((name) => ({ name })) }),
    });
    if (!response.ok) {
      throw new Error(`Scryfall collection lookup failed with HTTP ${response.status}.`);
    }
    const body = await response.json() as {
      data: ScryfallCardResponse[];
      not_found?: Array<{ name?: string }>;
    };
    cards.push(...body.data.map(toClientCard));
    notFound.push(...(body.not_found ?? []).flatMap((item) => item.name ? [item.name] : []));
  }

  return { cards, notFound };
}
