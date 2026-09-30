export interface ScryfallCardData {
  name: string;
  typeLine: string;
  oracleText: string;
  colorIdentity: string[];
  commanderLegality: string;
}

interface ScryfallCardResponse {
  name: string;
  type_line: string;
  oracle_text?: string;
  card_faces?: Array<{ oracle_text?: string }>;
  color_identity: string[];
  legalities: { commander: string };
}

const headers = { Accept: 'application/json', 'User-Agent': 'MekVaultAlpha/0.2' };

export async function fetchCardByName(name: string): Promise<ScryfallCardData | undefined> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
      { headers },
    );
    if (!response.ok) return undefined;
    const card = await response.json() as ScryfallCardResponse;
    return {
      name: card.name,
      typeLine: card.type_line,
      oracleText: card.oracle_text ?? card.card_faces?.map((face) => face.oracle_text ?? '').join('\n') ?? '',
      colorIdentity: card.color_identity,
      commanderLegality: card.legalities.commander,
    };
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
