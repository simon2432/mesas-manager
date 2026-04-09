import { Platform } from 'react-native';

/**
 * Base URL del backend (incluye `/api`).
 *
 * - Web: `localhost` apunta al mismo host que el navegador.
 * - Android emulator: `10.0.2.2` es el loopback del host desde el emulador.
 * - iOS simulator: `localhost` del Mac funciona.
 * - Dispositivo físico: definí `EXPO_PUBLIC_API_URL` (ej. `http://192.168.1.x:3000/api`).
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
}
