import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "../firebase";
import { useCallback, useState } from "react";
import { query, collection, orderBy, limit, getDocs } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser!.uid;

      async function fetchData() {
        const q = query(
          collection(db, "users", uid, "measurements"),
          orderBy("createdAt", "desc"),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setCurrentWeight(snap.docs[0].data().weight as number);
        }
      }

      fetchData();
    }, [])
  );

  const logWeight = () => {
    navigation.navigate("Log", { mode: "weight" });
  };

  const logMeasurements = () => {
    navigation.navigate("Log", { mode: "measurements" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>AccountaFit</Text>
      <Text style={styles.title}>
        {currentWeight !== null ? ` ${currentWeight} kgs` : "Log your weight"}
      </Text>

      <TouchableOpacity style={styles.button} onPress={logWeight}>
        <Text style={styles.buttonText}>Log Weight</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={logMeasurements}>
        <Text style={styles.buttonText}>Log Measurements</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 2,
    color: "#185FA5",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "300",
    letterSpacing: 1,
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    marginBottom: 48,
  },
  button: {
    borderWidth: 1,
    borderColor: "#185FA5",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonText: {
    color: "#185FA5",
    fontSize: 15,
    fontWeight: "500",
  },
});
