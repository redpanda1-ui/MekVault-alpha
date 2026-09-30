import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AiBuildPanel } from '../components/AiBuildPanel';
import { Button, CardRow, Input, Loading, Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { searchCards } from '../services/scryfall';
import type { ScryfallCard } from '../types/mtg';
import { canBeCommander, replaceCommander, upsertCard, validateCommanderDeck } from '../utils/deck';

export function BuildScreen() {
  const { decks, updateDeck } = useVault(); const [deckId, setDeckId] = useState(''); const [query, setQuery] = useState(''); const [results, setResults] = useState<ScryfallCard[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const deck = decks.find((item) => item.id === deckId); const validation = useMemo(() => deck ? validateCommanderDeck(deck) : undefined, [deck]);
  const search = async () => { if (!query.trim()) return; setLoading(true); setError(''); try { setResults(await searchCards(query)); } catch (value) { setError(value instanceof Error ? value.message : 'Search failed.'); } finally { setLoading(false); } };
  const add = (card: ScryfallCard) => { if (deck) updateDeck({ ...deck, cards: upsertCard(deck.cards, card) }); };
  return <Screen><Title subtitle="Edit or generate a Commander deck with deterministic format checks.">Build</Title><AiBuildPanel /><Text style={ui.label}>Choose deck</Text><View style={[ui.row, { flexWrap: 'wrap', marginBottom: 14 }]}>{decks.map((item) => <Pressable key={item.id} onPress={() => setDeckId(item.id)} style={[ui.panel, { padding: 10 }, item.id === deckId && { borderColor: '#d6aa5d' }]}><Text style={ui.text}>{item.name}</Text></Pressable>)}</View>
    {!deck ? <Text style={ui.muted}>Create and select a deck to start building.</Text> : <><View style={ui.panel}><Text style={ui.label}>Commander</Text><Text style={ui.heading}>{deck.commander?.name ?? 'Not selected'}</Text><Text style={ui.heading}>{validation?.totalCards ?? 0}/100 cards</Text><Text style={validation?.isValid ? ui.success : ui.error}>{validation?.isValid ? 'Commander checks pass.' : `${validation?.issues.length} issue(s) to resolve.`}</Text>{validation?.issues.map((issue, index) => <Text key={`${issue.cardName}-${index}`} style={ui.muted}>• {issue.message}</Text>)}</View>
      <Input value={query} onChangeText={setQuery} onSubmitEditing={() => void search()} placeholder="Search Scryfall to add cards" /><Button title="Search" onPress={() => void search()} />{error ? <Text style={ui.error}>{error}</Text> : null}{loading ? <Loading /> : results.map((card) => <CardRow key={card.id} card={card} action={() => add(card)} actionLabel="+ Add to deck" />)}
      <Text style={ui.heading}>Deck cards</Text>{deck.cards.map((entry) => <View key={entry.card.id} style={ui.panel}><Text style={ui.heading}>{entry.quantity} × {entry.card.name}</Text><View style={ui.row}><Button title="−" secondary onPress={() => updateDeck({ ...deck, cards: upsertCard(deck.cards, entry.card, -1) })} /><Button title="+" secondary onPress={() => add(entry.card)} />{canBeCommander(entry.card) ? <Button title="Set commander" onPress={() => updateDeck(replaceCommander(deck, entry.card))} /> : null}</View></View>)}</>}</Screen>;
}
