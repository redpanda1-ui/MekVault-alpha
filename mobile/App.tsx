import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>MEKVAULT</Text>
        <Text style={styles.title}>Your ideas, secured.</Text>
        <Text style={styles.body}>
          The foundation is ready. Connect this app to the MekVault API to begin building your vault.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#090d16',
    padding: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: '#253149',
    borderRadius: 24,
    backgroundColor: '#111827',
    padding: 28,
  },
  eyebrow: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 14,
  },
  body: {
    color: '#a8b3c7',
    fontSize: 17,
    lineHeight: 26,
  },
});
