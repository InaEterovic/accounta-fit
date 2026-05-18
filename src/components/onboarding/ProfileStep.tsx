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
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Sex = 'male' | 'female';

export type ProfileData = {
  name: string;
  sex: Sex;
  dateOfBirth: Date;
  height: string;
};

type Props = {
  draft: {
    name: string;
    sex: Sex | null;
    dateOfBirth: Date;
    height: string;
  };
  onNext: (data: ProfileData) => void;
};

const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 13);

export default function ProfileStep({ draft, onNext }: Props) {
  const [name, setName] = useState(draft.name);
  const [sex, setSex] = useState<Sex | null>(draft.sex);
  const [dateOfBirth, setDateOfBirth] = useState(draft.dateOfBirth);
  const [height, setHeight] = useState(draft.height);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleDateChange(_event: DateTimePickerEvent, selected?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (selected) setDateOfBirth(selected);
  }

  function handleNext() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!sex) {
      Alert.alert('Required', 'Please select your sex.');
      return;
    }
    const h = parseFloat(height);
    if (!height || isNaN(h) || h < 50 || h > 300) {
      Alert.alert('Invalid', 'Please enter a valid height in cm (50–300).');
      return;
    }
    onNext({ name: name.trim(), sex, dateOfBirth, height });
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
        <Text style={styles.stepLabel}>Step 1 of 4</Text>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>This helps us personalise your experience</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Jane Doe"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text style={styles.label}>Sex</Text>
        <View style={styles.toggleRow}>
          {(['male', 'female'] as Sex[]).map((option) => (
            <Pressable
              key={option}
              style={[styles.toggleButton, sex === option && styles.toggleButtonActive]}
              onPress={() => setSex(option)}
            >
              <Text style={[styles.toggleText, sex === option && styles.toggleTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>{dateOfBirth.toLocaleDateString()}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maxDob}
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Height</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="170"
            placeholderTextColor="#aaa"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.unit}>cm</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Next</Text>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    minWidth: 30,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  toggleButtonActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  toggleText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#fff',
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
});
