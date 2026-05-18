import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

type Props = {
  onFinish: () => void;
  onBack: () => void;
};

const BENEFITS = [
  'Daily reminders to log your weight',
  'Goal milestone alerts',
  'Weekly progress summaries',
];

export default function NotificationsStep({ onFinish, onBack }: Props) {
  async function handleAllow() {
    // This triggers the native OS permission dialog.
    // We call onFinish regardless of the result — never block the user.
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    onFinish();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Step 4 of 4</Text>
      <Text style={styles.title}>Stay on Track</Text>
      <Text style={styles.subtitle}>
        AccountaFit can send you reminders to log your measurements and keep you consistent.
      </Text>

      <View style={styles.benefitsList}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>+</Text>
            </View>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={handleAllow}>
        <Text style={styles.primaryButtonText}>Allow Notifications</Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={onFinish}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const BLUE = '#185FA5';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 40,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 48,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  primaryButton: {
    backgroundColor: BLUE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 15,
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#aaa',
    fontSize: 13,
  },
});
