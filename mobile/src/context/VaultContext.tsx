import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { emptyVault, loadVault, saveVault } from '../storage/vault';
import type { Deck, ScryfallCard } from '../types/mtg';

interface VaultContextValue {
  collection: typeof emptyVault.collection; decks: Deck[]; ready: boolean;
  addToCollection: (card: ScryfallCard) => void; createDeck: (name: string) => Deck; updateDeck: (deck: Deck) => void;
}
const VaultContext = createContext<VaultContextValue | undefined>(undefined);
export function VaultProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(emptyVault); const [ready, setReady] = useState(false);
  useEffect(() => { loadVault().then((stored) => { setState(stored); setReady(true); }); }, []);
  useEffect(() => { if (ready) void saveVault(state); }, [ready, state]);
  const value = useMemo<VaultContextValue>(() => ({
    ...state, ready,
    addToCollection: (card) => setState((current) => {
      const existing = current.collection.find((entry) => entry.card.id === card.id);
      const collection = existing ? current.collection.map((entry) => entry.card.id === card.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current.collection, { card, quantity: 1 }];
      return { ...current, collection };
    }),
    createDeck: (name) => {
      const now = new Date().toISOString();
      const deck: Deck = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: name.trim() || 'Untitled Deck', cards: [], createdAt: now, updatedAt: now };
      setState((current) => ({ ...current, decks: [...current.decks, deck] })); return deck;
    },
    updateDeck: (deck) => setState((current) => ({ ...current, decks: current.decks.map((item) => item.id === deck.id ? { ...deck, updatedAt: new Date().toISOString() } : item) })),
  }), [ready, state]);
  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}
export function useVault() { const value = useContext(VaultContext); if (!value) throw new Error('useVault must be used inside VaultProvider'); return value; }
