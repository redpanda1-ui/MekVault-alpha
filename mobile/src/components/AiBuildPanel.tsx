import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useVault } from '../context/VaultContext';
import { colors } from '../theme';
import type { AiBuildResult } from '../types/mtg';
import { Button, Input, Loading, ui } from './ui';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const list = (value: string) => value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

export function AiBuildPanel() {
  const { collection } = useVault();
  const [commander, setCommander] = useState('');
  const [strategy, setStrategy] = useState('');
  const [budget, setBudget] = useState('');
  const [power, setPower] = useState('');
  const [bracket, setBracket] = useState('3');
  const [mustKeep, setMustKeep] = useState('');
  const [avoid, setAvoid] = useState('');
  const [useCollection, setUseCollection] = useState(false);
  const [result, setResult] = useState<AiBuildResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const build = async () => {
    setLoading(true); setError(''); setResult(undefined);
    try {
      const response = await fetch(`${API_URL}/api/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commander, strategy,
          budget: budget ? Number(budget) : undefined,
          desiredPower: power || undefined,
          bracket: bracket ? Number(bracket) : undefined,
          mustKeep: list(mustKeep), avoid: list(avoid),
          collection: useCollection ? collection.map(({ card, quantity }) => ({ name: card.name, quantity })) : undefined,
        }),
      });
      const body = await response.json() as AiBuildResult | { error: string };
      if (!response.ok) throw new Error('error' in body ? body.error : 'Build request failed.');
      setResult(body as AiBuildResult);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Build request failed.');
    } finally { setLoading(false); }
  };

  return <View style={ui.panel}>
    <Text style={ui.heading}>AI deck builder</Text>
    <Text style={ui.muted}>Generate 99 cards plus one commander. Every result receives deterministic Scryfall legality checks.</Text>
    <Input value={commander} onChangeText={setCommander} placeholder="Commander name" />
    <Input multiline value={strategy} onChangeText={setStrategy} placeholder="Strategy and play style" />
    <Input value={budget} onChangeText={setBudget} keyboardType="decimal-pad" placeholder="Budget in USD (optional)" />
    <Input value={bracket} onChangeText={setBracket} keyboardType="number-pad" placeholder="Bracket 1–5" />
    <Input value={power} onChangeText={setPower} placeholder="Desired power (optional)" />
    <Input multiline value={mustKeep} onChangeText={setMustKeep} placeholder="Must-keep cards, comma or line separated" />
    <Input multiline value={avoid} onChangeText={setAvoid} placeholder="Cards to avoid, comma or line separated" />
    <Pressable onPress={() => setUseCollection((value) => !value)} style={[ui.panel, { borderColor: useCollection ? colors.gold : colors.border }]}>
      <Text style={ui.text}>{useCollection ? '✓ ' : ''}Prefer cards from my collection ({collection.length} unique)</Text>
    </Pressable>
    {loading ? <Loading /> : <Button title="Generate and validate deck" onPress={() => void build()} disabled={!commander.trim() || !strategy.trim()} />}
    {error ? <Text style={ui.error}>{error}</Text> : null}
    {result ? <BuildResult result={result} /> : null}
  </View>;
}

function BuildResult({ result }: { result: AiBuildResult }) {
  const statusStyle = result.validation.isValid ? ui.success : ui.error;
  return <View>
    <Text style={statusStyle}>{result.validation.isValid ? '✓ Valid Commander build' : '⚠ Needs review'}</Text>
    <Text style={ui.heading}>{result.commander.name} {result.commander.validated ? '✓' : '⚠'}</Text>
    <Text style={ui.text}>{result.summary}</Text>
    <Text style={ui.label}>{result.validation.deckCardCount} deck cards + 1 commander = {result.validation.totalCards}</Text>
    {result.validation.issues.map((issue, index) => <Text key={`${issue.code}-${issue.cardName}-${index}`} style={ui.error}>• {issue.message}</Text>)}
    <Text style={ui.heading}>Generated cards</Text>
    {result.cards.map((card, index) => <Text key={`${card.name}-${index}`} style={card.validated ? ui.text : ui.error}>{card.quantity} × {card.name} {card.validated ? '' : '⚠'} — {card.role}</Text>)}
    {result.warnings.map((warning, index) => <Text key={`${warning}-${index}`} style={ui.muted}>• {warning}</Text>)}
  </View>;
}
