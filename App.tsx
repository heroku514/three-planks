import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  bridgeLine,
  bridgeStatus,
  EMPTY_BRIDGE,
  hasProgress,
  liftMiddle,
  liftSide,
  putMiddle,
  putSide,
  resetBridge,
  type BridgeState,
} from "./src/bridge";
import { loadBridge, saveBridge } from "./src/store";

export default function App() {
  const [state, setState] = useState<BridgeState>(EMPTY_BRIDGE);
  const [note, setNote] = useState("Look at the gap.");
  const [ready, setReady] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    let alive = true;
    loadBridge()
      .then((loaded) => {
        if (!alive) return;
        setState(loaded);
        setNote(hasProgress(loaded) ? "Saved bridge loaded." : "Look at the gap.");
        setReady(true);
      })
      .catch(() => {
        if (alive) setNote("Could not read the gap.");
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveBridge(state).catch(() => setNote("Could not save the gap."));
  }, [ready, state]);

  if (!ready && note === "Look at the gap.") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the gap</Text>
        </View>
      </SafeAreaView>
    );
  }

  function apply(result: { state: BridgeState; note: string }) {
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.title}>Three Planks</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.count}>{bridgeStatus(state)}</Text>
        <Text style={styles.line}>{bridgeLine(state)}</Text>
        <View style={styles.row}>
          <BigButton label="Put left" inRow onPress={() => apply(putSide(state, "left"))} />
          <BigButton label="Put right" inRow onPress={() => apply(putSide(state, "right"))} />
        </View>
        <View style={styles.row}>
          <BigButton label="Lift left" inRow onPress={() => apply(liftSide(state, "left"))} />
          <BigButton label="Lift right" inRow onPress={() => apply(liftSide(state, "right"))} />
        </View>
        <View style={styles.row}>
          <BigButton label="Put middle" inRow onPress={() => apply(putMiddle(state))} />
          <BigButton label="Lift middle" inRow onPress={() => apply(liftMiddle(state))} />
        </View>
        {confirmNew ? (
          <View style={styles.row}>
            <BigButton label="Confirm new" filled inRow onPress={onConfirmNew} />
            <BigButton label="Cancel new" inRow onPress={onCancelNew} />
          </View>
        ) : (
          <BigButton label="New bridge" onPress={() => setConfirmNew(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmNew() {
    const result = resetBridge();
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  function onCancelNew() {
    setConfirmNew(false);
    setNote("New bridge canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E7F2EC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#1E3330" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#1E3330" },
  note: { fontSize: 18, color: "#3E5A52", minHeight: 24 },
  count: { fontSize: 22, fontWeight: "700", color: "#1E3330" },
  line: { fontSize: 34, fontWeight: "800", color: "#1F6B52", lineHeight: 40 },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1E3330",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#1E3330" },
  buttonText: { fontSize: 18, fontWeight: "800", color: "#1E3330", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
