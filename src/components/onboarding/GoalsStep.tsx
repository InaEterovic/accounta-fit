import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type GoalsData = {
  targetWeight: string;
  targetDate: Date | null;
};

type Props = {
  draft: GoalsData;
  onNext: (data: GoalsData) => void;
  onBack: () => void;
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export default function GoalsStep({ draft, onNext, onBack }: Props) {
  const [targetWeight, setTargetWeight] = useState(draft.targetWeight);
  const [targetDate, setTargetDate] = useState<Date | null>(draft.targetDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleDateChange(_event: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setTargetDate(selected);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>Your Goal</Text>
        <Text style={styles.subtitle}>Set a target to work towards</Text>

        {/* --- Target weight (optional) --- */}
        <Text style={styles.label}>
          Target Weight <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="70"
            placeholderTextColor="#aaa"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
          <Text style={styles.unit}>kg</Text>
        </View>

        {/* --- Target date (optional) --- */}
        <Text style={styles.label}>
          Target Date <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.dateRow}>
          <Pressable
            style={[styles.input, { flex: 1 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={targetDate ? styles.inputText : styles.placeholder}>
              {targetDate ? targetDate.toLocaleDateString() : 'Tap to set a date'}
            </Text>
          </Pressable>

          {targetDate && (
            <Pressable onPress={() => setTargetDate(null)} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={targetDate ?? tomorrow}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={tomorrow}
            onChange={handleDateChange}
          />
        )}

        <Pressable
          style={styles.primaryButton}
          onPress={() => onNext({ targetWeight, targetDate })}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLUE = '#185FA5';

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 56,
  },
  stepLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 20,
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: '#aaa',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  inputText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholder: {
    fontSize: 16,
    color: '#aaa',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    minWidth: 30,
  },
  clearButton: {
    padding: 14,
  },
  clearText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: BLUE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: '#666',
    fontSize: 15,
  },
});
