import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, CardRow, Input, Loading, Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { searchCards } from '../services/scryfall';
import type { ScryfallCard } from '../types/mtg';

export function CollectionScreen() {
  const { collection, addToCollection } = useVault(); const [query, setQuery] = useState(''); const [results, setResults] = useState<ScryfallCard[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const search = async () => { if (!query.trim()) return; setLoading(true); setError(''); try { setResults(await searchCards(query.trim())); } catch (value) { setError(value instanceof Error ? value.message : 'Search failed.'); } finally { setLoading(false); } };
  return <Screen><Title subtitle="Live card data and prices are supplied by Scryfall.">Collection</Title><Input value={query} onChangeText={setQuery} onSubmitEditing={() => void search()} placeholder="Search by card name, type, oracle text…" returnKeyType="search" /><Button title="Search cards" onPress={() => void search()} disabled={loading} />{error ? <Text style={ui.error}>{error}</Text> : null}{loading ? <Loading /> : results.map((card) => <CardRow key={card.id} card={card} action={() => addToCollection(card)} actionLabel="+ Add to collection" />)}
    <Text style={ui.heading}>In your vault</Text>{collection.length === 0 ? <Text style={ui.muted}>No cards saved yet. Search above to begin.</Text> : collection.map(({ card, quantity }) => <View key={card.id}><CardRow card={card} /><Text style={[ui.label, { marginTop: -34, marginLeft: 122, marginBottom: 18 }]}>OWNED × {quantity}</Text></View>)}</Screen>;
}
