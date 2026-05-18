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

export type MeasurementsData = {
  weight: string;
  waist: string;
  hip: string;
  neck: string;
  arm: string;
  chest: string;
};

type Props = {
  draft: MeasurementsData;
  onNext: (data: MeasurementsData) => void;
  onBack: () => void;
};

export default function MeasurementsStep({ draft, onNext, onBack }: Props) {
  const [weight, setWeight] = useState(draft.weight);
  const [waist, setWaist] = useState(draft.waist);
  const [hip, setHip] = useState(draft.hip);
  const [neck, setNeck] = useState(draft.neck);
  const [arm, setArm] = useState(draft.arm);
  const [chest, setChest] = useState(draft.chest);

  function handleNext() {
    const w = parseFloat(weight);
    if (!weight || isNaN(w) || w < 20 || w > 500) {
      Alert.alert('Required', 'Please enter a valid weight in kg (20–500).');
      return;
    }
    onNext({ weight, waist, hip, neck, arm, chest });
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
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <Text style={styles.title}>Starting Measurements</Text>
        <Text style={styles.subtitle}>All values in kg or cm</Text>

        <MeasurementInput
          label="Weight"
          unit="kg"
          value={weight}
          onChangeText={setWeight}
          required
        />
        <MeasurementInput label="Waist" unit="cm" value={waist} onChangeText={setWaist} />
        <MeasurementInput label="Hip" unit="cm" value={hip} onChangeText={setHip} />
        <MeasurementInput label="Neck" unit="cm" value={neck} onChangeText={setNeck} />
        <MeasurementInput label="Arm" unit="cm" value={arm} onChangeText={setArm} />
        <MeasurementInput label="Chest" unit="cm" value={chest} onChangeText={setChest} />

        <Pressable style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Next</Text>
        </Pressable>

        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// A small reusable sub-component — notice the ? on required (it's optional)
function MeasurementInput({
  label,
  unit,
  value,
  onChangeText,
  required,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (v: string) => void;
  required?: boolean;
}) {
  return (
    <View>
      <Text style={styles.label}>
        {label}{' '}
        {!required && <Text style={styles.optional}>(optional)</Text>}
      </Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="0"
          placeholderTextColor="#aaa"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          returnKeyType="next"
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
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
    marginBottom: 16,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    minWidth: 30,
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
