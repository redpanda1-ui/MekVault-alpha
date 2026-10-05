import { StyleSheet, Text, View } from 'react-native';
import { Screen, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { deckTotal } from '../utils/deck';
import { colors } from '../theme';

export function HomeScreen() {
  const { collection, decks, ready } = useVault();
  const cards = collection.reduce((sum, entry) => sum + entry.quantity, 0);
  const readyDecks = decks.filter((deck) => Boolean(deck.commander) && deckTotal(deck) === 100).length;

  return <Screen>
    <View style={styles.hero}>
      <Text style={styles.eyebrow}>YOUR COMMAND CENTER</Text>
      <Text style={styles.heroTitle}>Welcome to your Magic Vault</Text>
      <Text style={styles.heroText}>Track what you own, build Commander decks, and tune them without leaving one workspace.</Text>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statCard}><Text style={styles.statValue}>{ready ? cards : '—'}</Text><Text style={styles.statLabel}>CARDS</Text></View>
      <View style={styles.statCard}><Text style={styles.statValue}>{ready ? decks.length : '—'}</Text><Text style={styles.statLabel}>DECKS</Text></View>
      <View style={styles.statCard}><Text style={styles.statValue}>{ready ? readyDecks : '—'}</Text><Text style={styles.statLabel}>READY</Text></View>
    </View>

    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Vault status</Text><Text style={styles.sectionMeta}>{ready ? 'LOCAL · SYNCED' : 'LOADING'}</Text></View>
    <View style={styles.statusPanel}>
      <View style={styles.statusDot} />
      <View style={styles.statusCopy}><Text style={styles.statusTitle}>Local vault active</Text><Text style={ui.muted}>Your collection and deck library are stored on this device.</Text></View>
    </View>

    <Text style={styles.sectionTitle}>Recent decks</Text>
    {decks.length === 0
      ? <View style={ui.panel}><Text style={ui.heading}>No decks yet</Text><Text style={ui.muted}>Open Decks to create one or import a full Commander list.</Text></View>
      : decks.slice(0, 3).map((deck) => {
        const total = deckTotal(deck);
        return <View key={deck.id} style={styles.deckCard}>
          <View style={styles.deckTop}><Text style={styles.deckName}>{deck.name}</Text><Text style={styles.deckCount}>{total}/100</Text></View>
          <Text style={ui.muted}>{deck.commander?.name ?? 'Commander not selected'}</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(total, 100)}%` }]} /></View>
        </View>;
      })}

    <View style={styles.corePanel}>
      <Text style={styles.sectionTitle}>MekVault loop</Text>
      <Text style={ui.text}>Vault → Build → Coach → Test → Proxy → Print</Text>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: '#111720', borderColor: '#35445a', borderRadius: 18, borderWidth: 1, marginBottom: 14, overflow: 'hidden', padding: 20 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 2.1, marginBottom: 9 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: '900', lineHeight: 32 },
  heroText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  statsRow: { flexDirection: 'row', gap: 9, marginBottom: 22 },
  statCard: { alignItems: 'center', backgroundColor: '#141c27', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, paddingVertical: 15 },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '900' },
  statLabel: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 1.3, marginTop: 4 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  sectionMeta: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 },
  statusPanel: { alignItems: 'center', backgroundColor: '#10161f', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginBottom: 22, padding: 14 },
  statusDot: { backgroundColor: colors.green, borderRadius: 6, height: 12, marginRight: 12, width: 12 },
  statusCopy: { flex: 1 },
  statusTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  deckCard: { backgroundColor: '#111720', borderColor: colors.border, borderLeftColor: colors.gold, borderLeftWidth: 3, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14 },
  deckTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  deckName: { color: colors.text, flex: 1, fontSize: 17, fontWeight: '800', marginRight: 10 },
  deckCount: { color: colors.gold, fontSize: 12, fontWeight: '900' },
  progressTrack: { backgroundColor: '#202b39', borderRadius: 999, height: 5, marginTop: 12, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 999, height: 5 },
  corePanel: { backgroundColor: '#0d1219', borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginTop: 10, padding: 15 },
});
