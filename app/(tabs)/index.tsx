import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

function triggerSelectionHaptic() {
  void Haptics.selectionAsync().catch(() => undefined);
}

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.heroCard}>
        <ThemedText style={styles.eyebrow}>Local symptom tracking</ThemedText>
        <ThemedText type="title" style={styles.title}>
          Symptom Tracker
        </ThemedText>
        <ThemedText style={styles.description}>
          Log symptoms quickly, review saved entries, and edit them later. Everything stays local
          on your device for this MVP.
        </ThemedText>

        <View style={styles.infoBlock}>
          <ThemedText style={styles.infoLabel}>Current MVP</ThemedText>
          <ThemedText style={styles.infoText}>Simple symptom logging with offline local storage.</ThemedText>
        </View>

        <Link href="/explore" asChild>
          <Pressable onPress={triggerSelectionHaptic} hitSlop={8} style={styles.button}>
            <ThemedText style={styles.buttonText}>Open Symptom Log</ThemedText>
          </Pressable>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 14,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#5B6470',
  },
  title: {
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  infoBlock: {
    borderRadius: 16,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#5B6470',
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#11181C',
  },
  button: {
    marginTop: 4,
    minHeight: 54,
    backgroundColor: '#11181C',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
