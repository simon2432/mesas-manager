import { StyleSheet, Text, View } from 'react-native';

import { getApiBaseUrl } from '@/src/constants/api';
import { useAuthStore } from '@/src/store/auth.store';

export default function HomeScreen() {
  const token = useAuthStore((s) => s.token);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mesas Manager</Text>
      <Text style={styles.label}>API base</Text>
      <Text style={styles.mono}>{getApiBaseUrl()}</Text>
      <Text style={styles.label}>Sesión</Text>
      <Text style={styles.mono}>{token ? 'Token guardado' : 'Sin token'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  mono: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
