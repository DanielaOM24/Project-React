import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMockUser } from '@/mock/user.mock';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

/**
 * Perfil (mock).
 * Muestra info básica de user.mock. Sin backend.
 */
export default function PerfilScreen() {
  const user = getMockUser();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={48} color="#687076" />
      </View>
      <ThemedText type="title" style={styles.name}>{user.name}</ThemedText>
      <ThemedText style={styles.email}>{user.email}</ThemedText>

      <View style={styles.meta}>
        <ThemedText type="subtitle">Objetivos</ThemedText>
        <ThemedText style={styles.metaRow}>Calorías: {user.meta.caloriasObjetivo} kcal/día</ThemedText>
        <ThemedText style={styles.metaRow}>Agua: {user.meta.vasosAguaObjetivo} vasos/día</ThemedText>
        <ThemedText style={styles.metaRow}>Miembro desde: {user.meta.fechaRegistro}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(10,126,164,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: { textAlign: 'center' },
  email: { marginTop: 4, opacity: 0.8 },
  meta: { marginTop: 32, width: '100%', maxWidth: 320 },
  metaRow: { marginTop: 8, opacity: 0.9 },
});
