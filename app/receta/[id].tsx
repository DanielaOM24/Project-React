import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMockRecipeById } from '@/mock/recipes.mock';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

/**
 * Detalle de receta (mock).
 * Carga sin backend. Datos de recipes.mock.
 */
export default function RecetaDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const receta = id ? getMockRecipeById(id) : undefined;

  if (!receta) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Receta no encontrada</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ThemedText type="title">{receta.nombre}</ThemedText>
      <ThemedText style={styles.meta}>
        {receta.calorias} kcal · {receta.tiempoMinutos} min · {receta.porciones} porciones · {receta.categoria}
      </ThemedText>
      <ThemedText style={styles.desc}>{receta.descripcion}</ThemedText>

      <ThemedText type="subtitle" style={styles.section}>Ingredientes</ThemedText>
      {receta.ingredientes.map((i, idx) => (
        <ThemedText key={idx} style={styles.bullet}>• {i}</ThemedText>
      ))}

      <ThemedText type="subtitle" style={styles.section}>Pasos</ThemedText>
      {receta.pasos.map((p, idx) => (
        <View key={idx} style={styles.paso}>
          <ThemedText type="defaultSemiBold">{idx + 1}.</ThemedText>
          <ThemedText style={styles.pasoTexto}>{p}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  meta: { marginTop: 8, opacity: 0.8 },
  desc: { marginTop: 16 },
  section: { marginTop: 20, marginBottom: 8 },
  bullet: { marginLeft: 8, marginBottom: 4 },
  paso: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pasoTexto: { flex: 1 },
});
