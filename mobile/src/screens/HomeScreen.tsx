import { Text, View } from 'react-native';
import { Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { deckTotal } from '../utils/deck';

export function HomeScreen() {
  const { collection, decks, ready } = useVault();
  const cards = collection.reduce((sum, entry) => sum + entry.quantity, 0);
  return <Screen><Title subtitle="Build, validate, and tune Commander decks.">Your MTG vault</Title>
    <View style={ui.panel}><Text style={ui.label}>Local vault</Text><Text style={ui.heading}>{ready ? `${cards} cards · ${decks.length} decks` : 'Loading…'}</Text><Text style={ui.muted}>Your collection and deck library stay on this device.</Text></View>
    <View style={ui.panel}><Text style={ui.label}>Core loop</Text><Text style={ui.text}>1. Search Scryfall and collect cards{`\n`}2. Create or import a deck{`\n`}3. Choose a commander and validate{`\n`}4. Ask AI Coach for structured ideas</Text></View>
    {decks.slice(0, 3).map((deck) => <View key={deck.id} style={ui.panel}><Text style={ui.heading}>{deck.name}</Text><Text style={ui.muted}>{deck.commander?.name ?? 'No commander'} · {deckTotal(deck)}/100 cards</Text></View>)}
  </Screen>;
}
