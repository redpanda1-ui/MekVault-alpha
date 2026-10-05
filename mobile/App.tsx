import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { VaultProvider } from './src/context/VaultContext';
import { AiCoachScreen } from './src/screens/AiCoachScreen';
import { BuildScreen } from './src/screens/BuildScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DecksScreen } from './src/screens/DecksScreen';
import { HomeScreen } from './src/screens/HomeScreen';

const tabs = ['Home', 'Decks', 'Build', 'AI Coach', 'Collection'] as const;
type Tab = (typeof tabs)[number];

const screens: Record<Tab, () => React.JSX.Element> = {
  Home: HomeScreen,
  Decks: DecksScreen,
  Build: BuildScreen,
  'AI Coach': AiCoachScreen,
  Collection: CollectionScreen,
};

export default function App() {
  const [tab, setTab] = useState<Tab>('Home');
  const Screen = screens[tab];

  return (
    <SafeAreaProvider>
      <VaultProvider>
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.screen}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>MEKVAULT</Text>
              <Text style={styles.tagline}>MAGIC, ORGANIZED.</Text>
            </View>
            <View style={styles.versionBadge}><Text style={styles.versionText}>ALPHA · v0.4</Text></View>
          </View>
          <View style={styles.content}><Screen /></View>
          <View style={styles.nav}>
            {tabs.map((item) => (
              <Pressable key={item} onPress={() => setTab(item)} style={styles.navItem}>
                <Text style={[styles.navText, item === tab && styles.navTextActive]}>{item}</Text>
                {item === tab ? <View style={styles.activeBar} /> : null}
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </VaultProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080b10' },
  header: { alignItems: 'center', backgroundColor: '#0d1219', borderBottomColor: '#293444', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13 },
  brand: { color: '#d6aa5d', fontSize: 19, fontWeight: '900', letterSpacing: 3.5 },
  tagline: { color: '#65758a', fontSize: 8, fontWeight: '800', letterSpacing: 1.8, marginTop: 2 },
  versionBadge: { backgroundColor: '#18212d', borderColor: '#35445a', borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  versionText: { color: '#f3f0e8', fontSize: 10, fontWeight: '800' },
  content: { flex: 1 },
  nav: { backgroundColor: '#111720', borderTopColor: '#293444', borderTopWidth: 1, flexDirection: 'row', minHeight: 64 },
  navItem: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 2 },
  navText: { color: '#7f8da0', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  navTextActive: { color: '#d6aa5d' },
  activeBar: { backgroundColor: '#d6aa5d', borderRadius: 2, bottom: 5, height: 3, position: 'absolute', width: 28 },
});
