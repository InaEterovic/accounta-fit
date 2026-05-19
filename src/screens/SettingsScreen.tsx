import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const BLUE = "#185FA5";

export default function SettingsScreen() {
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function fetchGoal() {
        const uid = auth.currentUser!.uid;
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setGoalWeight((snap.data()?.targetWeight as number) ?? null);
        }
      }
      fetchGoal();
    }, [])
  );

  function openModal() {
    setInput(goalWeight != null ? String(goalWeight) : "");
    setModalVisible(true);
  }

  async function handleSave() {
    const value = parseFloat(input);
    if (!input.trim() || isNaN(value) || value < 20 || value > 500) {
      Alert.alert("Invalid", "Please enter a valid weight between 20 and 500 kg.");
      return;
    }
    const uid = auth.currentUser!.uid;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), { targetWeight: value });
      setGoalWeight(value);
      setModalVisible(false);
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.sectionLabel}>Goals</Text>
      <View style={styles.section}>
        <Pressable style={styles.row} onPress={openModal}>
          <Text style={styles.rowLabel}>Goal Weight</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>
              {goalWeight != null ? `${goalWeight} kg` : "Not set"}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.section}>
        <Pressable style={styles.row} onPress={() => signOut(auth)}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.root}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalInner}
          >
            <Text style={styles.modalTitle}>Goal Weight</Text>
            <Text style={styles.modalHint}>
              Your progress bar tracks from your first logged weight to this goal.
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={input}
                onChangeText={(v) => setInput(v.replace(/,/g, ""))}
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
                placeholder="e.g. 75"
                placeholderTextColor="#aaa"
              />
              <Text style={styles.unit}>kg</Text>
            </View>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingBottom: 6,
    marginTop: 8,
  },
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  rowLabel: { fontSize: 16, color: "#1a1a1a" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 16, color: "#888" },
  chevron: { fontSize: 20, color: "#ccc", lineHeight: 22 },
  signOutText: { fontSize: 16, color: "#E53935" },
  // Modal
  modalInner: {
    flex: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 14,
    color: "#888",
    marginBottom: 28,
    lineHeight: 20,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  unit: { fontSize: 16, color: "#666", fontWeight: "500", minWidth: 30 },
  saveBtn: {
    backgroundColor: BLUE,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },
  saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelBtn: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelBtnText: { color: "#666", fontSize: 15 },
});
