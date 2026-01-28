import { ThemedText } from '@/components/themed-text';
import { getMockRecipes } from '@/mock/recipes.mock';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Lista de recetas (mock).
 * Carga sin backend. "Ver receta" → /receta/[id].
 */
export default function RecetasScreen() {
  const recetas = getMockRecipes();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Recetas
      </ThemedText>
      {recetas.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.card}
          onPress={() => router.push(`/receta/${r.id}`)}
          activeOpacity={0.8}>
          <ThemedText type="subtitle">{r.nombre}</ThemedText>
          <ThemedText style={styles.meta}>
            {r.calorias} kcal · {r.tiempoMinutos} min · {r.categoria}
          </ThemedText>
          <ThemedText style={styles.ver}>Ver receta →</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { marginBottom: 16 },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.3)',
  },
  meta: { marginTop: 4, opacity: 0.8, fontSize: 13 },
  ver: { marginTop: 8, opacity: 0.8 },
});
