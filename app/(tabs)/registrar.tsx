import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet } from 'react-native';

export default function RegistrarScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Registrar</ThemedText>
      <ThemedText>Contenido de Registrar. Conectar con el equipo.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
