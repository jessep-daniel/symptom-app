import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SymptomEntry, useSymptomLog } from '@/components/symptom-log-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

function triggerSelectionHaptic() {
  void Haptics.selectionAsync().catch(() => undefined);
}

function triggerSuccessHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export default function SymptomLogScreen() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const { entries, addEntry, updateEntry, deleteEntry } = useSymptomLog();

  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({ light: '#5B6470', dark: '#9BA1A6' }, 'text');
  const inputBackgroundColor = useThemeColor({ light: '#F8FAFC', dark: '#1E2228' }, 'background');
  const panelColor = useThemeColor({ light: '#FFFFFF', dark: '#161B22' }, 'background');
  const borderColor = useThemeColor({ light: '#D7DEE7', dark: '#30363D' }, 'background');
  const placeholderColor = useThemeColor({ light: '#7A8594', dark: '#7D8590' }, 'text');
  const buttonColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const buttonTextColor = useThemeColor({ light: '#FFFFFF', dark: '#11181C' }, 'background');
  const mutedPanelColor = useThemeColor({ light: '#F3F5F7', dark: '#20262D' }, 'background');
  const selectedSeverityColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');
  const selectedSeverityTextColor = useThemeColor(
    { light: '#FFFFFF', dark: '#11181C' },
    'background'
  );

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setSeverity(3);
    setEditingEntryId(null);
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (editingEntryId) {
      updateEntry(editingEntryId, { title: trimmedTitle, notes, severity });
    } else {
      addEntry({ title: trimmedTitle, notes, severity });
    }

    triggerSuccessHaptic();
    resetForm();
  };

  const handleSelectEntry = (entry: SymptomEntry) => {
    triggerSelectionHaptic();
    setTitle(entry.title);
    setNotes(entry.notes);
    setSeverity(entry.severity);
    setEditingEntryId(entry.id);
  };

  const handleDelete = (id: string) => {
    triggerSelectionHaptic();
    deleteEntry(id);

    if (editingEntryId === id) {
      resetForm();
    }
  };

  const handleCancelEdit = () => {
    triggerSelectionHaptic();
    resetForm();
  };

  const handleSeveritySelect = (value: 1 | 2 | 3 | 4 | 5) => {
    triggerSelectionHaptic();
    setSeverity(value);
  };

  const canSave = title.trim().length > 0;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.headerCard, { backgroundColor: panelColor, borderColor }] }>
            <ThemedText style={[styles.eyebrow, { color: secondaryTextColor }]}>Symptom log</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Track how you feel
            </ThemedText>
            <ThemedText style={[styles.description, { color: secondaryTextColor }] }>
              Add a symptom title, optional notes, and a severity from 1 to 5. Tap a saved entry
              to edit it.
            </ThemedText>
          </View>

          <View style={[styles.formCard, { backgroundColor: panelColor, borderColor }] }>
            {editingEntryId ? (
              <View
                style={[
                  styles.editingBanner,
                  { borderColor, backgroundColor: mutedPanelColor },
                ]}>
                <View style={styles.editingCopy}>
                  <ThemedText type="defaultSemiBold">Editing entry</ThemedText>
                  <ThemedText style={[styles.editingHint, { color: secondaryTextColor }] }>
                    Saving will update this symptom instead of creating a new one.
                  </ThemedText>
                </View>
                <Pressable onPress={handleCancelEdit} hitSlop={8} style={styles.bannerActionButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.helperBanner, { backgroundColor: mutedPanelColor }] }>
                <ThemedText style={[styles.helperText, { color: secondaryTextColor }] }>
                  Your entries stay stored locally on this device for the MVP.
                </ThemedText>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: secondaryTextColor }]}>Title</ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Example: Headache"
                placeholderTextColor={placeholderColor}
                returnKeyType="next"
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBackgroundColor,
                    borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: secondaryTextColor }]}>Notes</ThemedText>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="When it started, where it hurts, or anything else useful"
                placeholderTextColor={placeholderColor}
                multiline
                textAlignVertical="top"
                style={[
                  styles.notesInput,
                  {
                    backgroundColor: inputBackgroundColor,
                    borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.severityHeader}>
                <ThemedText style={[styles.fieldLabel, { color: secondaryTextColor }]}>Severity</ThemedText>
                <ThemedText style={[styles.severityHint, { color: secondaryTextColor }]}>1 low, 5 high</ThemedText>
              </View>
              <View style={styles.severityRow}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const isSelected = severity === value;

                  return (
                    <Pressable
                      key={value}
                      onPress={() => handleSeveritySelect(value as 1 | 2 | 3 | 4 | 5)}
                      hitSlop={6}
                      style={[
                        styles.severityButton,
                        {
                          backgroundColor: isSelected ? selectedSeverityColor : inputBackgroundColor,
                          borderColor,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.severityButtonText,
                          { color: isSelected ? selectedSeverityTextColor : textColor },
                        ]}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              hitSlop={8}
              style={[
                styles.button,
                {
                  backgroundColor: canSave ? buttonColor : secondaryTextColor,
                  opacity: canSave ? 1 : 0.55,
                },
              ]}>
              <Text style={[styles.buttonText, { color: buttonTextColor }] }>
                {editingEntryId ? 'Update Entry' : 'Save Entry'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.listHeader}>
            <View>
              <ThemedText type="subtitle">Saved Entries</ThemedText>
              <ThemedText style={[styles.listSubcopy, { color: secondaryTextColor }] }>
                Tap a card to load it back into the form.
              </ThemedText>
            </View>
            <View style={[styles.countBadge, { backgroundColor: mutedPanelColor }] }>
              <ThemedText style={styles.countText}>{entries.length}</ThemedText>
            </View>
          </View>

          {entries.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { borderColor, backgroundColor: panelColor },
              ]}>
              <ThemedText type="defaultSemiBold">Nothing logged yet</ThemedText>
              <ThemedText style={[styles.emptyStateText, { color: secondaryTextColor }] }>
                Add your first symptom above to start building a simple history.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.entries}>
              {entries.map((entry) => (
                <View
                  key={entry.id}
                  style={[styles.entryCard, { backgroundColor: panelColor, borderColor }] }>
                  <View style={styles.entryRow}>
                    <Pressable
                      onPress={() => handleSelectEntry(entry)}
                      hitSlop={8}
                      style={styles.entryContentButton}>
                      <View style={styles.entryTopRow}>
                        <View style={styles.entryTitleBlock}>
                          <ThemedText type="defaultSemiBold" style={styles.entryTitle}>
                            {entry.title}
                          </ThemedText>
                          <ThemedText style={[styles.entryTimestamp, { color: secondaryTextColor }] }>
                            {new Date(entry.createdAt).toLocaleString()}
                          </ThemedText>
                        </View>
                        <View style={[
                          styles.severityPill,
                          {
                            backgroundColor: entry.severity >= 4 ? '#FDECEC' : mutedPanelColor,
                          },
                        ]}>
                          <Text style={styles.severityPillText}>{entry.severity}/5</Text>
                        </View>
                      </View>

                      {entry.notes ? (
                        <ThemedText style={styles.entryText}>{entry.notes}</ThemedText>
                      ) : (
                        <ThemedText style={[styles.entryPlaceholder, { color: secondaryTextColor }] }>
                          No notes added.
                        </ThemedText>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => handleDelete(entry.id)}
                      hitSlop={8}
                      style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 14,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    lineHeight: 38,
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  editingBanner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  editingCopy: {
    flex: 1,
    gap: 4,
  },
  editingHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  helperBanner: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bannerActionButton: {
    minHeight: 36,
    justifyContent: 'center',
  },
  cancelText: {
    color: '#C0392B',
    fontSize: 14,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
  },
  notesInput: {
    minHeight: 128,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  severityHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  button: {
    marginTop: 2,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  listHeader: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listSubcopy: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  countBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11181C',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 6,
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
  },
  entries: {
    gap: 12,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  entryContentButton: {
    flex: 1,
    minHeight: 48,
    gap: 12,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  entryTitleBlock: {
    flex: 1,
    gap: 4,
  },
  entryTitle: {
    fontSize: 17,
    lineHeight: 23,
  },
  entryTimestamp: {
    fontSize: 13,
    lineHeight: 18,
  },
  severityPill: {
    minWidth: 52,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  severityPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#11181C',
  },
  deleteButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  deleteButtonText: {
    color: '#C0392B',
    fontSize: 14,
    fontWeight: '700',
  },
  entryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#11181C',
  },
  entryPlaceholder: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
