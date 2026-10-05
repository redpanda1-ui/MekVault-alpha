import { StyleSheet, Text, View } from 'react-native';
import { Screen, Title, ui } from '../components/ui';
import { useVault } from '../context/VaultContext';
import { deckTotal } from '../utils/deck';
import { colors } from '../theme';

export function HomeScreen() {
  const { collection, decks, ready } = useVault();
  const cards = collection.reduce((sum, entry) => sum + entry.quantity, 0);
  const uniquePrintings = collection.length;
  const commanderDecks = decks.filter((deck) => deck.commander).length;
  const readyDecks = decks.filter((deck) => deckTotal(deck) >= 100).length;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.eyebrow}>MEKVAULT COMMAND CENTER</Text>
          <View style={styles.statusPill}><Text style={styles.statusText}>{ready ? 'VAULT ONLINE' : 'LOADING'}</Text></View>
        </View>
        <Text style={styles.heroTitle}>Your Magic workspace.</Text>
        <Text style={styles.heroSub}>Collection, decks, validation, and AI tuning in one vault.</Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statCard}><Text style={styles.statValue}>{ready ? cards : '—'}</Text><Text style={styles.statLabel}>CARDS OWNED</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{ready ? uniquePrintings : '—'}</Text><Text style={styles.statLabel}>PRINTINGS</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{ready ? decks.length : '—'}</Text><Text style={styles.statLabel}>DECKS</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{ready ? readyDecks : '—'}</Text><Text style={styles.statLabel}>100-CARD READY</Text></View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vault snapshot</Text>
        <Text style={styles.sectionMeta}>{commanderDecks}/{decks.length || 0} commanders assigned</Text>
      </View>

      <View style={ui.panel}>
        <Text style={ui.label}>Quick flow</Text>
        <Text style={styles.flowLine}><Text style={styles.flowNumber}>01</Text> Add cards to your Collection</Text>
        <Text style={styles.flowLine}><Text style={styles.flowNumber}>02</Text> Create or import a Commander deck</Text>
        <Text style={styles.flowLine}><Text style={styles.flowNumber}>03</Text> Validate the list and commander</Text>
        <Text style={styles.flowLine}><Text style={styles.flowNumber}>04</Text> Tune it with AI Coach</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent decks</Text>
        <Text style={styles.sectionMeta}>{decks.length ? 'Latest 3' : 'No decks yet'}</Text>
      </View>

      {decks.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Your vault is ready.</Text>
          <Text style={ui.muted}>Create your first deck from the Decks tab, then bring it here for tuning.</Text>
        </View>
      ) : decks.slice(-3).reverse().map((deck) => {
        const total = deckTotal(deck);
        const progress = Math.min(total, 100);
        return (
          <View key={deck.id} style={styles.deckCard}>
            <View style={styles.deckTop}>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={styles.deckName}>{deck.name}</Text>
                <Text numberOfLines={1} style={styles.deckCommander}>{deck.commander?.name ?? 'Commander not selected'}</Text>
              </View>
              <Text style={styles.deckCount}>{total}/100</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.panelRaised, borderColor: colors.gold, borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 18 },
  heroTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  statusPill: { backgroundColor: 'rgba(101,193,140,0.12)', borderColor: colors.green, borderRadius: 99, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  statusText: { color: colors.green, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.6 },
  heroSub: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 14, borderWidth: 1, padding: 14, width: '48%' },
  statValue: { color: colors.text, fontSize: 26, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginTop: 4 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionMeta: { color: colors.muted, fontSize: 11 },
  flowLine: { color: colors.text, fontSize: 14, lineHeight: 29 },
  flowNumber: { color: colors.gold, fontSize: 11, fontWeight: '900' },
  emptyCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, padding: 18 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  deckCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14 },
  deckTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  deckName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  deckCommander: { color: colors.muted, fontSize: 12, marginTop: 4 },
  deckCount: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  progressTrack: { backgroundColor: colors.panelRaised, borderRadius: 99, height: 5, marginTop: 12, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.gold, borderRadius: 99, height: 5 },
});
