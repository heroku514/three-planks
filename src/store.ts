import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseBridge, type BridgeState } from "./bridge";

const KEY = "three-planks-v1";

export async function loadBridge(): Promise<BridgeState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseBridge(raw);
}

export async function saveBridge(state: BridgeState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
