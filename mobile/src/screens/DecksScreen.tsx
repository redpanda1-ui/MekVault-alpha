import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Input, Loading, Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { deckTotal, importDecklist } from '../utils/deck';

export function DecksScreen() {
  const { decks, createDeck, updateDeck } = useVault(); const [name, setName] = useState(''); const [importText, setImportText] = useState(''); const [targetId, setTargetId] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const addDeck = () => { const deck = createDeck(name); setTargetId(deck.id); setName(''); setMessage(`Created ${deck.name}.`); };
  const runImport = async () => { const deck = decks.find((item) => item.id === targetId); if (!deck || !importText.trim()) return; setBusy(true); setMessage(''); try { const result = await importDecklist(importText); updateDeck({ ...deck, commander: result.commander ?? deck.commander, cards: result.entries }); const total = result.entries.reduce((sum, entry) => sum + entry.quantity, 0) + (result.commander ? 1 : 0); const issueSummary = result.errors.length ? ` ${result.errors.length} issue(s): ${result.errors.slice(0, 3).join(' | ')}${result.errors.length > 3 ? ' …' : ''}` : ''; setMessage(`Imported ${total} cards${result.commander ? ` with commander ${result.commander.name}` : ''}.${issueSummary}`); } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed.'); } finally { setBusy(false); } };
  return <Screen><Title subtitle="Create a deck, then import one card per line (for example: 1 Sol Ring).">Decks</Title><Input value={name} onChangeText={setName} placeholder="New deck name" /><Button title="Create deck" onPress={addDeck} disabled={!name.trim()} />
    <Text style={ui.heading}>Your decks</Text>{decks.length === 0 ? <Text style={ui.muted}>No decks yet.</Text> : decks.map((deck) => <View key={deck.id} style={[ui.panel, targetId === deck.id && { borderColor: '#d6aa5d' }]}><Text style={ui.heading}>{deck.name}</Text><Text style={ui.muted}>{deck.commander?.name ?? 'Commander not selected'} · {deckTotal(deck)}/100</Text><Button title={targetId === deck.id ? 'Selected for import' : 'Select for import'} secondary onPress={() => setTargetId(deck.id)} /></View>)}
    <Text style={ui.heading}>Import decklist</Text><Input multiline value={importText} onChangeText={setImportText} placeholder={'1 Sol Ring\n1 Command Tower\n20 Island'} />{busy ? <Loading /> : <Button title="Import into selected deck" onPress={() => void runImport()} disabled={!targetId || !importText.trim()} />}{message ? <Text style={ui.muted}>{message}</Text> : null}</Screen>;
}
