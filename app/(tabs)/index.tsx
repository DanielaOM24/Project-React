import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMockProgress } from '@/mock/progress.mock';
import { getMockUser } from '@/mock/user.mock';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * Dashboard (Inicio)
 * Datos: user.mock + progress.mock.
 * Botones: Registrar comida → Registrar | Explorar recetas → Recetas | Chat IA → Chat.
 */
export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = getMockUser();
  const progress = getMockProgress();
  const { hoy, rachaDias } = progress;
  const pctCal = Math.min(100, Math.round((hoy.caloriasConsumidas / hoy.caloriasObjetivo) * 100));
  const pctAgua = Math.min(100, Math.round((hoy.vasosAgua / hoy.vasosObjetivo) * 100));

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Hola, {user.name.split(' ')[0]}</ThemedText>
        <ThemedText style={styles.sub}>Resumen de hoy</ThemedText>
      </ThemedView>

      {/* Bloque progreso mock */}
      <ThemedView style={[styles.progressCard, { borderColor: colors.tint }]}>
        <View style={styles.progressRow}>
          <MaterialIcons name="local-fire-department" size={22} color={colors.tint} />
          <ThemedText type="defaultSemiBold">Calorías</ThemedText>
          <ThemedText style={styles.progressVal}>{hoy.caloriasConsumidas} / {hoy.caloriasObjetivo}</ThemedText>
        </View>
        <View style={[styles.bar, { backgroundColor: 'rgba(10,126,164,0.2)' }]}>
          <View style={[styles.barFill, { width: `${pctCal}%`, backgroundColor: colors.tint }]} />
        </View>
        <View style={styles.progressRow}>
          <MaterialIcons name="water-drop" size={20} color={colors.tint} />
          <ThemedText type="defaultSemiBold">Agua</ThemedText>
          <ThemedText style={styles.progressVal}>{hoy.vasosAgua} / {hoy.vasosObjetivo} vasos</ThemedText>
        </View>
        <View style={[styles.bar, { backgroundColor: 'rgba(10,126,164,0.2)' }]}>
          <View style={[styles.barFill, { width: `${pctAgua}%`, backgroundColor: colors.tint }]} />
        </View>
        <View style={styles.progressRow}>
          <MaterialIcons name="whatshot" size={20} color={colors.tint} />
          <ThemedText type="defaultSemiBold">Racha</ThemedText>
          <ThemedText style={styles.progressVal}>{rachaDias} días</ThemedText>
        </View>
      </ThemedView>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Acciones</ThemedText>
      <ThemedView style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, { borderColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/registrar')}
          activeOpacity={0.8}>
          <MaterialIcons name="add-circle-outline" size={32} color={colors.tint} />
          <View style={styles.cardText}>
            <ThemedText type="subtitle">Registrar comida</ThemedText>
            <ThemedText style={styles.cardHint}>Ir a Registrar</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/recetas')}
          activeOpacity={0.8}>
          <MaterialIcons name="menu-book" size={32} color={colors.tint} />
          <View style={styles.cardText}>
            <ThemedText type="subtitle">Explorar recetas</ThemedText>
            <ThemedText style={styles.cardHint}>Ir a Recetas</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/chat')}
          activeOpacity={0.8}>
          <MaterialIcons name="chat-bubble-outline" size={32} color={colors.tint} />
          <View style={styles.cardText}>
            <ThemedText type="subtitle">Chat IA</ThemedText>
            <ThemedText style={styles.cardHint}>Ir a Chat</ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  sub: { opacity: 0.8, marginTop: 4 },
  progressCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressVal: { marginLeft: 'auto', opacity: 0.9 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  sectionTitle: { marginBottom: 12 },
  cards: { gap: 16 },
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardText: { flex: 1 },
  cardHint: { opacity: 0.6, fontSize: 12, marginTop: 2 },
});
