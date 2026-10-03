export type Plank = "up" | "down";
export type Side = "left" | "right";

export type BridgeState = {
  left: Plank;
  right: Plank;
  middle: Plank;
};

export const EMPTY_BRIDGE: BridgeState = { left: "up", right: "up", middle: "up" };

export function bridgeLine(state: BridgeState): string {
  if (state.middle === "down") return "The bridge is ready.";
  const sides = (state.left === "down" ? 1 : 0) + (state.right === "down" ? 1 : 0);
  if (sides === 2) return "Ready for the middle.";
  if (sides === 1) return "One side is down.";
  return "The gap is open.";
}

export function bridgeStatus(state: BridgeState): string {
  if (state.middle === "down") return "Safe to cross.";
  if (state.left === "down" && state.right === "down") return "Both sides ready.";
  if (state.left === "down") return "Only the left.";
  if (state.right === "down") return "Only the right.";
  return "Nothing across.";
}

export function hasProgress(state: BridgeState): boolean {
  return state.left === "down" || state.right === "down" || state.middle === "down";
}

function isPlank(value: unknown): value is Plank {
  return value === "up" || value === "down";
}

export function parseBridge(raw: string | null): BridgeState {
  if (!raw) return EMPTY_BRIDGE;
  try {
    const value = JSON.parse(raw) as { left?: unknown; right?: unknown; middle?: unknown };
    if (!isPlank(value.left) || !isPlank(value.right) || !isPlank(value.middle)) return EMPTY_BRIDGE;
    if (value.middle === "down" && (value.left !== "down" || value.right !== "down")) return EMPTY_BRIDGE;
    return { left: value.left, right: value.right, middle: value.middle };
  } catch {
    return EMPTY_BRIDGE;
  }
}

export function putSide(state: BridgeState, side: Side): { state: BridgeState; note: string } {
  if (state.middle === "down") return { state, note: "Lift the middle." };
  if (state[side] === "down") return { state, note: "Already down." };
  const next = { ...state, [side]: "down" as const };
  return { state: next, note: side === "left" ? "Left went down." : "Right went down." };
}

export function liftSide(state: BridgeState, side: Side): { state: BridgeState; note: string } {
  if (state.middle === "down") return { state, note: "Lift the middle." };
  if (state[side] === "up") return { state, note: "Already up." };
  const next = { ...state, [side]: "up" as const };
  return { state: next, note: side === "left" ? "Left came up." : "Right came up." };
}

export function putMiddle(state: BridgeState): { state: BridgeState; note: string } {
  if (state.middle === "down") return { state, note: "Already across." };
  if (state.left !== "down" || state.right !== "down") return { state, note: "Both sides first." };
  return { state: { left: "down", right: "down", middle: "down" }, note: "Middle went down." };
}

export function liftMiddle(state: BridgeState): { state: BridgeState; note: string } {
  if (state.middle === "up") return { state, note: "Already up." };
  return { state: { left: "down", right: "down", middle: "up" }, note: "Middle came up." };
}

export function resetBridge(): { state: BridgeState; note: string } {
  return { state: EMPTY_BRIDGE, note: "Look at the gap." };
}
