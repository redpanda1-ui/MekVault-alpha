import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CollectionEntry, Deck } from '../types/mtg';

const STORAGE_KEY = '@mekvault/vault-v2';
export interface VaultState { collection: CollectionEntry[]; decks: Deck[]; }
export const emptyVault: VaultState = { collection: [], decks: [] };
export async function loadVault(): Promise<VaultState> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) return emptyVault;
  try {
    const parsed = JSON.parse(value) as Partial<VaultState>;
    return { collection: Array.isArray(parsed.collection) ? parsed.collection : [], decks: Array.isArray(parsed.decks) ? parsed.decks : [] };
  } catch { return emptyVault; }
}
export const saveVault = (state: VaultState) => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
