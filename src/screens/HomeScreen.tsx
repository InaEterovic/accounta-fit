import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "../firebase";
import { useCallback, useState } from "react";
import {
  query,
  collection,
  orderBy,
  limit,
  getDocs,
  where,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const BLUE = "#185FA5";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [prevWeight, setPrevWeight] = useState<number | null>(null);
  const [monthStartWeight, setMonthStartWeight] = useState<number | null>(null);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [firstWeight, setFirstWeight] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser!.uid;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      async function fetchData() {
        const [latestSnap, monthSnap, firstSnap, userDoc] = await Promise.all([
          getDocs(
            query(
              collection(db, "users", uid, "measurements"),
              orderBy("createdAt", "desc"),
              limit(2)
            )
          ),
          getDocs(
            query(
              collection(db, "users", uid, "measurements"),
              where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
              orderBy("createdAt", "asc"),
              limit(1)
            )
          ),
          getDocs(
            query(
              collection(db, "users", uid, "measurements"),
              orderBy("createdAt", "asc"),
              limit(1)
            )
          ),
          getDoc(doc(db, "users", uid)),
        ]);

        if (!latestSnap.empty) {
          const docs = latestSnap.docs;
          setCurrentWeight(docs[0].data().weight as number);
          setPrevWeight(docs.length > 1 ? (docs[1].data().weight as number) : null);
        }

        setMonthStartWeight(
          !monthSnap.empty ? (monthSnap.docs[0].data().weight as number) : null
        );

        setFirstWeight(
          !firstSnap.empty ? (firstSnap.docs[0].data().weight as number) : null
        );

        if (userDoc.exists()) {
          setGoalWeight((userDoc.data()?.targetWeight as number) ?? null);
        }
      }

      fetchData();
    }, [])
  );

  const deltaPrev =
    currentWeight != null && prevWeight != null
      ? +(currentWeight - prevWeight).toFixed(1)
      : null;

  const deltaMonth =
    currentWeight != null && monthStartWeight != null
      ? +(currentWeight - monthStartWeight).toFixed(1)
      : null;

  // Green if moving toward goal, red if moving away, neutral if no goal
  function deltaColor(delta: number | null): string {
    if (delta === null || goalWeight === null || firstWeight === null)
      return "#888";
    const losing = goalWeight < firstWeight;
    return (losing ? delta <= 0 : delta >= 0) ? "#2E7D32" : "#C62828";
  }

  function formatDelta(delta: number | null): string {
    if (delta === null) return "—";
    return `${delta > 0 ? "+" : ""}${delta} kg`;
  }

  const showProgress =
    currentWeight != null &&
    goalWeight != null &&
    firstWeight != null &&
    firstWeight !== goalWeight;

  let progress = 0;
  let progressPercent = 0;
  let kgToGo = 0;

  if (showProgress) {
    const losing = goalWeight! < firstWeight!;
    progress = losing
      ? (firstWeight! - currentWeight!) / (firstWeight! - goalWeight!)
      : (currentWeight! - firstWeight!) / (goalWeight! - firstWeight!);
    progress = Math.max(0, Math.min(1, progress));
    progressPercent = Math.round(progress * 100);
    kgToGo = +Math.abs(goalWeight! - currentWeight!).toFixed(1);
  }

  const showDeltas = deltaPrev !== null || deltaMonth !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>AccountaFit</Text>
      <Text style={styles.title}>
        {currentWeight !== null ? `${currentWeight} kg` : "Log your weight"}
      </Text>

      {showDeltas && (
        <View style={styles.deltaRow}>
          <View style={styles.deltaCard}>
            <Text style={styles.deltaCaption}>vs last entry</Text>
            <Text style={[styles.deltaValue, { color: deltaColor(deltaPrev) }]}>
              {formatDelta(deltaPrev)}
            </Text>
          </View>
          <View style={styles.deltaDivider} />
          <View style={styles.deltaCard}>
            <Text style={styles.deltaCaption}>vs this month</Text>
            <Text
              style={[styles.deltaValue, { color: deltaColor(deltaMonth) }]}
            >
              {formatDelta(deltaMonth)}
            </Text>
          </View>
        </View>
      )}

      {showProgress && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Goal Progress</Text>
            <Text style={styles.progressPct}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` as any },
              ]}
            />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressEnd}>{firstWeight} kg</Text>
            <Text style={styles.progressToGo}>{kgToGo} kg to go</Text>
            <Text style={styles.progressEnd}>{goalWeight} kg</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Log", { mode: "weight" })}>
          <Text style={styles.buttonText}>Log Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Log", { mode: "measurements" })}>
          <Text style={styles.buttonText}>Log Measurements</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    color: BLUE,
    textTransform: "uppercase",
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "300",
    color: "#111",
    marginBottom: 24,
    textAlign: "center",
  },
  // Deltas
  deltaRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  deltaCard: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  deltaDivider: {
    width: 1,
    backgroundColor: "#eee",
  },
  deltaCaption: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  deltaValue: {
    fontSize: 18,
    fontWeight: "600",
  },
  // Progress bar
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: "700",
    color: BLUE,
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BLUE,
    borderRadius: 5,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressEnd: {
    fontSize: 12,
    color: "#aaa",
  },
  progressToGo: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },
  // Buttons
  buttonGroup: {
    alignItems: "center",
    gap: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "500",
  },
});
