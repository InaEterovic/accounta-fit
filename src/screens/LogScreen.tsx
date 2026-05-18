import { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

type Measurement = {
  weight: number;
  height: number | null;
  waist: number | null;
  hip: number | null;
  neck: number | null;
  arm: number | null;
  chest: number | null;
};

export default function LogScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode as "weight" | "measurements";

  const [last, setLast] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [neck, setNeck] = useState("");
  const [arm, setArm] = useState("");
  const [chest, setChest] = useState("");

  useEffect(() => {
    const uid = auth.currentUser!.uid;

    async function fetchLast() {
      const snap = await getDocs(
        query(
          collection(db, "users", uid, "measurements"),
          orderBy("createdAt", "desc"),
          limit(1)
        )
      );
      if (!snap.empty) setLast(snap.docs[0].data() as Measurement);
      setLoading(false);
    }

    fetchLast();
  }, []);

  async function handleSave() {
    const w = parseFloat(weight);
    if (!weight || isNaN(w) || w < 20 || w > 500) {
      Alert.alert("Required", "Please enter a valid weight in kg.");
      return;
    }

    const uid = auth.currentUser!.uid;
    const copyOrParse = (input: string, fallback: number | null) =>
      input.trim() ? parseFloat(input) : fallback;

    setSaving(true);
    try {
      await addDoc(collection(db, "users", uid, "measurements"), {
        weight: w,
        height: last?.height ?? null,
        waist:
          mode === "measurements"
            ? copyOrParse(waist, last?.waist ?? null)
            : (last?.waist ?? null),
        hip:
          mode === "measurements"
            ? copyOrParse(hip, last?.hip ?? null)
            : (last?.hip ?? null),
        neck:
          mode === "measurements"
            ? copyOrParse(neck, last?.neck ?? null)
            : (last?.neck ?? null),
        arm:
          mode === "measurements"
            ? copyOrParse(arm, last?.arm ?? null)
            : (last?.arm ?? null),
        chest:
          mode === "measurements"
            ? copyOrParse(chest, last?.chest ?? null)
            : (last?.chest ?? null),
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || saving) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {mode === "weight" ? "Log Weight" : "Log Measurements"}
          </Text>

          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={last ? String(last.weight) : "0"}
              placeholderTextColor="#aaa"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              returnKeyType="done"
              autoFocus
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          {mode === "measurements" && (
            <>
              <MeasurementInput
                label="Waist"
                value={waist}
                onChangeText={setWaist}
                last={last?.waist}
              />
              <MeasurementInput
                label="Hip"
                value={hip}
                onChangeText={setHip}
                last={last?.hip}
              />
              <MeasurementInput
                label="Neck"
                value={neck}
                onChangeText={setNeck}
                last={last?.neck}
              />
              <MeasurementInput
                label="Arm"
                value={arm}
                onChangeText={setArm}
                last={last?.arm}
              />
              <MeasurementInput
                label="Chest"
                value={chest}
                onChangeText={setChest}
                last={last?.chest}
              />
            </>
          )}

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MeasurementInput({
  label,
  value,
  onChangeText,
  last,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  last?: number | null;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder={last != null ? String(last) : "-"}
          placeholderTextColor="#aaa"
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          returnKeyType="next"
        />
        <Text style={styles.unit}>cm</Text>
      </View>
    </View>
  );
}

const BLUE = "#185FA5";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    paddingBottom: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 20,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1a1a1a",
    backgroundColor: "#fafafa",
  },
  unit: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    minWidth: 30,
  },
  primaryButton: {
    backgroundColor: BLUE,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 15,
  },
});
