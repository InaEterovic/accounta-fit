import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Pressable style={styles.row} onPress={() => signOut(auth)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  signOutText: { fontSize: 16, color: "#E53935" },
});
