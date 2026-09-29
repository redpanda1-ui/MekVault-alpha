interface NamedCard { name: string; }
const headers = { Accept: 'application/json', 'User-Agent': 'MekVaultAlpha/0.2' };
export async function validateCardName(name: string): Promise<{ name: string; validated: boolean }> {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`, { headers });
    if (!response.ok) return { name, validated: false };
    const card = await response.json() as NamedCard;
    return { name: card.name, validated: true };
  } catch { return { name, validated: false }; }
}
export async function validateCardNames(names: string[]) {
  const uniqueNames = [...new Set(names)]; const results = new Map<string, { name: string; validated: boolean }>();
  for (const name of uniqueNames) results.set(name, await validateCardName(name));
  return results;
}
