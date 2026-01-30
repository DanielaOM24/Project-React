import { ErrorMessage } from '@/components/error-message';
import { LoadingScreen } from '@/components/loading-screen';
import { ThemedText } from '@/components/themed-text';
import { getMockRecipes } from '@/mock/recipes.mock';
import type { Receta } from '@/services/api.service';
import { obtenerRecetas } from '@/services/api.service';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Lista de recetas. Intenta backend; si falla → mensaje + retry y fallback a mock.
 * Loading mientras carga; sin pantalla en blanco.
 */
export default function RecetasScreen() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerRecetas();
      setRecetas(data);
      setFromApi(true);
    } catch {
      setError('No se pudo conectar al servidor.');
      setRecetas(getMockRecipes());
      setFromApi(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && recetas.length === 0) {
    return <LoadingScreen message="Cargando recetas..." />;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Recetas
      </ThemedText>
      {!fromApi && recetas.length > 0 ? (
        <ThemedText style={styles.fallbackHint}>Mostrando datos locales.</ThemedText>
      ) : null}
      {error ? (
        <ErrorMessage message={error} onRetry={load} retryLabel="Reintentar" />
      ) : null}
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
  title: { marginBottom: 8 },
  fallbackHint: { marginBottom: 12, opacity: 0.7, fontSize: 13 },
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
