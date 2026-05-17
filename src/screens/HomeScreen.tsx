import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>AccountaFit</Text>
      <Text style={styles.title}>Work in progress</Text>
      <Text style={styles.subtitle}>Check back soon.</Text>
      <TouchableOpacity style={styles.button} onPress={() => signOut(auth)}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    color: '#185FA5',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 1,
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    marginBottom: 48,
  },
  button: {
    borderWidth: 1,
    borderColor: '#185FA5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#185FA5',
    fontSize: 15,
    fontWeight: '500',
  },
});
