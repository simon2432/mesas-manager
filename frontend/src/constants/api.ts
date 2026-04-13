import Constants from "expo-constants";
import { Platform } from "react-native";

function devHostFromExpo(): string | undefined {
  const raw = Constants.expoGoConfig?.debuggerHost;
  if (!raw || typeof raw !== "string") return undefined;
  const host = raw.split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") return undefined;
  return host;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const lan = devHostFromExpo();
  if (lan) {
    return `http://${lan}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}
