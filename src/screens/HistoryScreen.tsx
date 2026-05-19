import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const BLUE = "#185FA5";

type Entry = {
  id: string;
  weight: number;
  height: number | null;
  waist: number | null;
  hip: number | null;
  neck: number | null;
  arm: number | null;
  chest: number | null;
  createdAt: Timestamp;
};

type EditState = {
  weight: string;
  waist: string;
  hip: string;
  neck: string;
  arm: string;
  chest: string;
};

const MEAS_FIELDS = [
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "neck", label: "Neck" },
  { key: "arm", label: "Arm" },
  { key: "chest", label: "Chest" },
] as const;

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [editState, setEditState] = useState<EditState>({
    weight: "",
    waist: "",
    hip: "",
    neck: "",
    arm: "",
    chest: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    const uid = auth.currentUser!.uid;
    const snap = await getDocs(
      query(
        collection(db, "users", uid, "measurements"),
        orderBy("createdAt", "desc")
      )
    );
    setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Entry)));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEntries();
    }, [fetchEntries])
  );

  function openEdit(entry: Entry) {
    setEditing(entry);
    setEditState({
      weight: String(entry.weight),
      waist: entry.waist != null ? String(entry.waist) : "",
      hip: entry.hip != null ? String(entry.hip) : "",
      neck: entry.neck != null ? String(entry.neck) : "",
      arm: entry.arm != null ? String(entry.arm) : "",
      chest: entry.chest != null ? String(entry.chest) : "",
    });
  }

  function handleDelete(entry: Entry) {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const uid = auth.currentUser!.uid;
          await deleteDoc(doc(db, "users", uid, "measurements", entry.id));
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        },
      },
    ]);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    const w = parseFloat(editState.weight);
    if (!editState.weight || isNaN(w) || w < 20 || w > 500) {
      Alert.alert("Required", "Please enter a valid weight in kg.");
      return;
    }
    const uid = auth.currentUser!.uid;
    const parse = (v: string, fallback: number | null) =>
      v.trim() ? parseFloat(v) : fallback;

    setSaving(true);
    try {
      const updated = {
        weight: w,
        waist: parse(editState.waist, editing.waist),
        hip: parse(editState.hip, editing.hip),
        neck: parse(editState.neck, editing.neck),
        arm: parse(editState.arm, editing.arm),
        chest: parse(editState.chest, editing.chest),
      };
      await updateDoc(
        doc(db, "users", uid, "measurements", editing.id),
        updated
      );
      setEntries((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...e, ...updated } : e))
      );
      setEditing(null);
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(ts: Timestamp) {
    return ts.toDate().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const hasMeasurements = (e: Entry) =>
    e.waist != null ||
    e.hip != null ||
    e.neck != null ||
    e.arm != null ||
    e.chest != null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  function handleAddEntry() {
    Alert.alert("Log New Entry", "What would you like to log?", [
      {
        text: "Weight",
        onPress: () => navigation.navigate("Log", { mode: "weight" }),
      },
      {
        text: "Weight + Measurements",
        onPress: () => navigation.navigate("Log", { mode: "measurements" }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>History</Text>
        <Pressable onPress={handleAddEntry} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
      {entries.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No entries yet.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => openEdit(item)}>
                    <Text style={styles.editBtn}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.weight}>{item.weight} kg</Text>
              {hasMeasurements(item) && (
                <View style={styles.measurements}>
                  {item.waist != null && (
                    <MeasRow label="Waist" value={item.waist} />
                  )}
                  {item.hip != null && <MeasRow label="Hip" value={item.hip} />}
                  {item.neck != null && (
                    <MeasRow label="Neck" value={item.neck} />
                  )}
                  {item.arm != null && <MeasRow label="Arm" value={item.arm} />}
                  {item.chest != null && (
                    <MeasRow label="Chest" value={item.chest} />
                  )}
                </View>
              )}
            </View>
          )}
        />
      )}

      <Modal
        visible={editing != null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.root}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Edit Entry</Text>

              <Text style={styles.fieldLabel}>Weight</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editState.weight}
                  onChangeText={(v) =>
                    setEditState((s) => ({
                      ...s,
                      weight: v.replace(/,/g, ""),
                    }))
                  }
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  autoFocus
                />
                <Text style={styles.unit}>kg</Text>
              </View>

              {MEAS_FIELDS.map(({ key, label }) => (
                <View key={key}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={editState[key]}
                      onChangeText={(v) =>
                        setEditState((s) => ({
                          ...s,
                          [key]: v.replace(/,/g, ""),
                        }))
                      }
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      placeholder="-"
                      placeholderTextColor="#aaa"
                    />
                    <Text style={styles.unit}>cm</Text>
                  </View>
                </View>
              ))}

              <Pressable
                style={styles.saveBtn}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setEditing(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function MeasRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.measRow}>
      <Text style={styles.measLabel}>{label}</Text>
      <Text style={styles.measValue}>{value} cm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "400",
  },
  empty: { color: "#999", fontSize: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: { fontSize: 13, color: "#666", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 16 },
  editBtn: { color: BLUE, fontSize: 14, fontWeight: "600" },
  deleteBtn: { color: "#E53935", fontSize: 14, fontWeight: "600" },
  weight: { fontSize: 22, fontWeight: "700", color: "#1a1a1a" },
  measurements: { marginTop: 12, gap: 4 },
  measRow: { flexDirection: "row", justifyContent: "space-between" },
  measLabel: { fontSize: 13, color: "#666" },
  measValue: { fontSize: 13, color: "#333", fontWeight: "500" },
  modalContent: { padding: 24, paddingBottom: 56 },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    marginBottom: 8,
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
    marginTop: 40,
  },
  saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cancelBtn: { padding: 16, alignItems: "center", marginTop: 8 },
  cancelBtnText: { color: "#666", fontSize: 15 },
});
