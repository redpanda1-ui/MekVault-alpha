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
import { colors } from './src/theme';

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
          <Text style={styles.brand}>MEKVAULT</Text>
          <Text style={styles.alpha}>ALPHA · v0.6</Text>
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
  header: { alignItems: 'center', borderBottomColor: '#293444', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  brand: { color: '#d6aa5d', fontSize: 18, fontWeight: '800', letterSpacing: 3.5 },
  alpha: { color: '#9aa7b8', fontSize: 11, fontWeight: '700' },
  content: { flex: 1 },
  nav: { backgroundColor: '#111720', borderTopColor: '#293444', borderTopWidth: 1, flexDirection: 'row', minHeight: 62 },
  navItem: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 2 },
  navText: { color: '#9aa7b8', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  navTextActive: { color: '#d6aa5d' },
  activeBar: { backgroundColor: '#d6aa5d', borderRadius: 2, bottom: 5, height: 3, position: 'absolute', width: 22 },
});
