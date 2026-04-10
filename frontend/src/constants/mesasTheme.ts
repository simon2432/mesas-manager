import { Platform, StyleSheet } from "react-native";

import { welcomeTheme } from "@/src/constants/authTheme";

/** UI de operación salón (cards, modales claros). */
export const mesasTheme = {
  ...welcomeTheme,
  surface: "#f7f7f8",
  border: "#e2e4e8",
  muted: "#5c6470",
  freeTint: "#e8edf4",
  occupied: "#8B1538",
  inactiveBorder: "#c8c8c8",
} as const;

export function cardShadowStyle() {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 14px rgba(0,0,0,0.06)",
    } as const;
  }
  return {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  };
}

export const mesasModalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dim: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: "92%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: welcomeTheme.textDark,
    marginBottom: 6,
  },
  sheetHint: {
    fontSize: 14,
    color: mesasTheme.muted,
    marginBottom: 16,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: mesasTheme.muted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: mesasTheme.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: welcomeTheme.textDark,
    marginBottom: 14,
  },
  errorText: {
    color: "#b00020",
    fontSize: 13,
    marginBottom: 10,
    marginTop: -6,
  },
  primaryBtn: {
    backgroundColor: welcomeTheme.orange,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  ghostBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostBtnText: {
    color: mesasTheme.muted,
    fontSize: 15,
    fontWeight: "600",
  },
});
