import { useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc, addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

import ProfileStep, { ProfileData } from '../components/onboarding/ProfileStep';
import MeasurementsStep, { MeasurementsData } from '../components/onboarding/MeasurementsStep';
import GoalsStep, { GoalsData } from '../components/onboarding/GoalsStep';
import NotificationsStep from '../components/onboarding/NotificationsStep';

type Props = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [profileDraft, setProfileDraft] = useState({
    name: '',
    sex: null as 'male' | 'female' | null,
    dateOfBirth: new Date(1995, 0, 1),
    height: '',
  });

  const [measurementsDraft, setMeasurementsDraft] = useState<MeasurementsData>({
    weight: '',
    waist: '',
    hip: '',
    neck: '',
    arm: '',
    chest: '',
  });

  const [goalsDraft, setGoalsDraft] = useState<GoalsData>({
    targetWeight: '',
    targetDate: null,
  });

  async function saveAndFinish() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      await setDoc(doc(db, 'users', uid), {
        name: profileDraft.name,
        sex: profileDraft.sex,
        dateOfBirth: Timestamp.fromDate(profileDraft.dateOfBirth),
        targetWeight: goalsDraft.targetWeight ? parseFloat(goalsDraft.targetWeight) : null,
        targetDate: goalsDraft.targetDate ? Timestamp.fromDate(goalsDraft.targetDate) : null,
      });

      const parseOptional = (v: string) => (v.trim() ? parseFloat(v) : null);

      await addDoc(collection(db, 'users', uid, 'measurements'), {
        weight: parseFloat(measurementsDraft.weight),
        height: parseFloat(profileDraft.height),
        waist: parseOptional(measurementsDraft.waist),
        hip: parseOptional(measurementsDraft.hip),
        neck: parseOptional(measurementsDraft.neck),
        arm: parseOptional(measurementsDraft.arm),
        chest: parseOptional(measurementsDraft.chest),
        createdAt: serverTimestamp(),
      });

      onComplete();
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#185FA5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {(() => {
        switch (step) {
          case 0:
            return (
              <ProfileStep
                draft={profileDraft}
                onNext={(data: ProfileData) => {
                  setProfileDraft(data);
                  setStep(1);
                }}
              />
            );
          case 1:
            return (
              <MeasurementsStep
                draft={measurementsDraft}
                onNext={(data) => {
                  setMeasurementsDraft(data);
                  setStep(2);
                }}
                onBack={() => setStep(0)}
              />
            );
          case 2:
            return (
              <GoalsStep
                draft={goalsDraft}
                onNext={(data) => {
                  setGoalsDraft(data);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            );
          case 3:
            return (
              <NotificationsStep
                onFinish={saveAndFinish}
                onBack={() => setStep(2)}
              />
            );
          default:
            return null;
        }
      })()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
