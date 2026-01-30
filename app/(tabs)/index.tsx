/**
 * Inicio / Registrar comida — NutriLens
 * Saludo, objetivo del día, registrar comida (foto o voz) y comidas de hoy.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    analyzeAudioDescription,
    analyzeFoodImage,
    type AudioAnalysisResult,
    type FoodImageAnalysisResult,
} from '@/ai/chat.service';
import { UserContext } from '@/ai/prompts';
import { InnovationColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { captureImage, recordAudio } from '@/lib/mediaCapture';

const IC = InnovationColors;

const DEFAULT_USER_CONTEXT: UserContext = {
  objetivo: 'mantener peso',
  dieta: 'sin restricciones',
  comidasPreferidas: [],
  restricciones: [],
  infoAdicional: '',
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = IC[isDark ? 'dark' : 'light'];
  const [objetivoLabel] = useState('Ganar masa');
  const [consumidoKcal] = useState(0);
  const [objetivoKcal] = useState(3179);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const progress = objetivoKcal > 0 ? Math.min(100, (consumidoKcal / objetivoKcal) * 100) : 0;

  const handleTomarFoto = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const imageBase64 = await captureImage();
      if (!imageBase64) {
        setIsAnalyzing(false);
        return;
      }
      const result: FoodImageAnalysisResult = await analyzeFoodImage(
        imageBase64,
        DEFAULT_USER_CONTEXT
      );
      setAnalysisResult(result.message);
      setShowResultModal(true);
    } catch (e) {
      console.error(e);
      setAnalysisResult('No pude analizar la imagen. Revisa la conexión e inténtalo de nuevo.');
      setShowResultModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDecir = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const transcript = await recordAudio();
      if (!transcript) {
        setAnalysisResult(
          'No se pudo grabar o transcribir. Asegúrate de dar permiso al micrófono y vuelve a intentar.'
        );
        setShowResultModal(true);
        setIsAnalyzing(false);
        return;
      }
      const result: AudioAnalysisResult = await analyzeAudioDescription(
        transcript,
        DEFAULT_USER_CONTEXT
      );
      setAnalysisResult(result.message);
      setShowResultModal(true);
    } catch (e) {
      console.error(e);
      setAnalysisResult('No pude analizar lo que dijiste. Revisa la conexión e inténtalo de nuevo.');
      setShowResultModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.surface }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header: Hola Usuario + Objetivo */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: c.text }]}>Hola Usuario</Text>
            <TouchableOpacity
              style={[styles.objetivoPill, { backgroundColor: c.surfaceCard, borderColor: c.border }]}
            >
              <MaterialIcons name="fitness-center" size={18} color={c.primary} />
              <Text style={[styles.objetivoPillText, { color: c.text }]}>{objetivoLabel}</Text>
            </TouchableOpacity>
          </View>

          {/* Tu día */}
          <View style={[styles.cardDia, { backgroundColor: c.primaryDark }]}>
            <Text style={styles.cardDiaTitle}>Tu día</Text>
            <View style={styles.progressRow}>
              <View style={[styles.circleBg, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                <Text style={styles.circleText}>{Math.round(progress)}%</Text>
                <Text style={styles.circleSub}>consumido</Text>
              </View>
              <View style={styles.statsCol}>
                <Text style={styles.statsLabel}>Consumido</Text>
                <Text style={styles.statsValue}>{consumidoKcal} kcal</Text>
                <Text style={[styles.statsLabel, { marginTop: 8 }]}>Objetivo</Text>
                <Text style={styles.statsValue}>{objetivoKcal} kcal</Text>
              </View>
            </View>
          </View>

          {/* Registrar comida */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Registrar comida</Text>
          <View style={styles.registrarRow}>
            <TouchableOpacity
              onPress={handleTomarFoto}
              disabled={isAnalyzing}
              style={[styles.btnFoto, { backgroundColor: c.primary }]}
              activeOpacity={0.85}
            >
              <View style={styles.btnIconWrap}>
                <MaterialIcons name="camera-alt" size={36} color="#fff" />
              </View>
              <Text style={styles.btnFotoTitle}>Tomar foto</Text>
              <Text style={styles.btnFotoSub}>Del plato</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDecir}
              disabled={isAnalyzing}
              style={[styles.btnDecir, { borderColor: c.primary, backgroundColor: c.surfaceCard }]}
              activeOpacity={0.85}
            >
              <View style={[styles.btnIconWrapDecir, { borderColor: c.primary }]}>
                <MaterialIcons name="mic" size={32} color={c.primary} />
              </View>
              <Text style={[styles.btnDecirTitle, { color: c.text }]}>Decir</Text>
              <Text style={[styles.btnDecirSub, { color: c.textSecondary }]}>Lo que comiste</Text>
            </TouchableOpacity>
          </View>

          {isAnalyzing && (
            <View style={[styles.analyzingBar, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.analyzingText, { color: c.textSecondary }]}>
                Analizando con NutriLens…
              </Text>
            </View>
          )}

          {/* Comidas de hoy */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Comidas de hoy</Text>
          <View style={[styles.comidasHoy, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <MaterialIcons name="camera-alt" size={40} color={c.muted} />
            <Text style={[styles.comidasHoyTitle, { color: c.text }]}>
              Aún no has registrado nada hoy
            </Text>
            <Text style={[styles.comidasHoySub, { color: c.textSecondary }]}>
              ¡Empieza tomando una foto de tu comida!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal resultado del análisis */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResultModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResultModal(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Análisis NutriLens</Text>
            <Text style={[styles.modalBody, { color: c.textSecondary }]}>{analysisResult}</Text>
            <TouchableOpacity
              onPress={() => setShowResultModal(false)}
              style={[styles.modalBtn, { backgroundColor: c.primary }]}
            >
              <Text style={styles.modalBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
  },
  greeting: { fontSize: 24, fontWeight: '700' },
  objetivoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  objetivoPillText: { fontSize: 14, fontWeight: '600' },

  cardDia: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  cardDiaTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  circleBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  circleSub: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statsCol: {},
  statsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  statsValue: { fontSize: 18, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  registrarRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  btnFoto: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  btnDecir: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: 140,
  },
  btnIconWrap: { marginBottom: 10 },
  btnIconWrapDecir: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  btnFotoTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnFotoSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  btnDecirTitle: { fontSize: 16, fontWeight: '700' },
  btnDecirSub: { fontSize: 12 },

  analyzingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  analyzingText: { fontSize: 14, fontWeight: '600' },

  comidasHoy: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  comidasHoyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  comidasHoySub: { fontSize: 13, marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalBody: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
