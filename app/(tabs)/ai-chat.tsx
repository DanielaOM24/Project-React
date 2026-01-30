/**
 * Chat con IA Nutricional — NutriLens
 * Verde innovador, elegante y profesional. Solo texto por ahora.
 * Historial: POST y GET a la API de NutriLens.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getChatResponse } from '@/ai/chat.service';
import { isAPIKeyConfigured } from '@/ai/config';
import { UserContext } from '@/ai/prompts';
import { InnovationColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getChatHistory, postChatMessage } from '@/lib/chatHistoryApi';

function generateConversationId(): string {
  return `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const OBJETIVOS_PREDEFINIDOS = [
  'perder peso',
  'ganar masa muscular',
  'mantener peso',
] as const;

function buildUserContextFromObjetivo(objetivo: string): UserContext {
  return {
    objetivo,
    dieta: 'sin restricciones',
    comidasPreferidas: [],
    restricciones: [],
    infoAdicional: '',
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const IC = InnovationColors;

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c = IC[isDark ? 'dark' : 'light'];
  const [conversationId, setConversationId] = useState(generateConversationId);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [objetivoCustom, setObjetivoCustom] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const setObjetivo = (objetivo: string) => {
    setUserContext(buildUserContextFromObjetivo(objetivo.trim()));
    setObjetivoCustom('');
  };

  const cambiarObjetivo = () => {
    setUserContext(null);
    setMessages([]);
    setConversationId(generateConversationId());
    setHistoryLoaded(false);
  };

  // Cargar historial al tener objetivo y aún no haber cargado
  useEffect(() => {
    if (!userContext || historyLoaded || messages.length > 0) return;
    let cancelled = false;
    getChatHistory(conversationId)
      .then(history => {
        if (cancelled || !history.length) return;
        const mapped: Message[] = history.map((m, i) => ({
          id: `hist_${i}_${m.role}`,
          text: m.content,
          isUser: m.role === 'USER',
          timestamp: new Date(),
        }));
        setMessages(mapped);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHistoryLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userContext, conversationId, historyLoaded, messages.length]);

  const sendMessage = async () => {
    if (!userContext || !inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text, isUser: true, timestamp: new Date() },
    ]);
    setInputText('');
    setIsLoading(true);

    try {
      await postChatMessage(conversationId, 'USER', text);
    } catch (e) {
      console.warn('No se pudo guardar mensaje en historial:', e);
    }

    try {
      const res = await getChatResponse(text, userContext);
      const assistantText = res.message;
      try {
        await postChatMessage(conversationId, 'ASSISTANT', assistantText);
      } catch (e) {
        console.warn('No se pudo guardar respuesta en historial:', e);
      }
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: assistantText,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error(e);
      const errorText = 'No pude procesar tu mensaje. Revisa la conexión e inténtalo de nuevo.';
      try {
        await postChatMessage(conversationId, 'ASSISTANT', errorText);
      } catch (err) {
        console.warn('No se pudo guardar respuesta de error en historial:', err);
      }
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: errorText,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    '¿Qué puedo comer para cenar? 🥗',
    '¿Cómo aumento mi proteína? 💪',
    'Ideas de snacks saludables 🥜',
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.msgRow,
        item.isUser ? styles.msgRowUser : styles.msgRowAI,
      ]}
    >
      {!item.isUser && (
        <View style={[styles.avatar, { backgroundColor: c.surfaceElevated }]}>
          <MaterialIcons name="eco" size={18} color={c.primary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          item.isUser ? styles.bubbleUser : styles.bubbleAI,
          {
            backgroundColor: item.isUser ? c.primary : c.surfaceCard,
            borderColor: item.isUser ? 'transparent' : c.border,
            ...(Platform.OS === 'ios'
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.06,
                  shadowRadius: 12,
                }
              : { elevation: 3 }),
          },
        ]}
      >
        <Text
          style={[styles.bubbleText, { color: item.isUser ? '#fff' : c.text }]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.surface }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <View style={[styles.header, { backgroundColor: c.primaryDark }]} />
          <View style={[styles.headerAccent, { backgroundColor: c.primary }]} />
          <View style={styles.headerContent}>
            <View style={[styles.logoIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialIcons name="restaurant" size={26} color="#fff" />
            </View>
            <View>
              <Text style={styles.logoTitle}>NutriLens</Text>
              <Text style={styles.logoSub}>Asistente nutricional</Text>
            </View>
          </View>
        </View>

        <View style={styles.pillRow}>
          <View style={[styles.pill, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
            <View style={[styles.pillDot, { backgroundColor: isAPIKeyConfigured() ? c.accent : '#eab308' }]} />
            <Text style={[styles.pillText, { color: c.textSecondary }]}>
              {isAPIKeyConfigured() ? 'Gemini' : 'Demo'}
              {userContext ? ` · ${userContext.objetivo}` : ' · ¿Cuál es tu objetivo?'}
            </Text>
          </View>
          {userContext && (
            <TouchableOpacity
              onPress={cambiarObjetivo}
              style={[styles.cambiarObjetivoBtn, { borderColor: c.border }]}
            >
              <MaterialIcons name="edit" size={14} color={c.primary} />
              <Text style={[styles.cambiarObjetivoText, { color: c.primary }]}>Cambiar objetivo</Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.chat}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={100}
        >
          {!userContext ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: c.surfaceElevated }]} />
              <View style={[styles.emptyIcon, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                <Text style={styles.emptyEmoji}>🎯</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: c.text }]}>
                ¿Cuál es tu objetivo?
              </Text>
              <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
                Elige uno o escribe el tuyo. El chat se enfocará en este objetivo.
              </Text>
              <View style={styles.suggestions}>
                {OBJETIVOS_PREDEFINIDOS.map((obj, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setObjetivo(obj)}
                    style={[styles.suggestionChip, { backgroundColor: c.surfaceCard, borderColor: c.border }]}
                  >
                    <Text style={[styles.suggestionText, { color: c.textSecondary }]}>{obj}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.objetivoCustomRow, { borderColor: c.border }]}>
                <TextInput
                  style={[styles.objetivoCustomInput, { color: c.text }]}
                  placeholder="O escribe tu objetivo…"
                  placeholderTextColor={c.muted}
                  value={objetivoCustom}
                  onChangeText={setObjetivoCustom}
                  onSubmitEditing={() => objetivoCustom.trim() && setObjetivo(objetivoCustom)}
                />
                <TouchableOpacity
                  onPress={() => objetivoCustom.trim() && setObjetivo(objetivoCustom)}
                  disabled={!objetivoCustom.trim()}
                  style={[
                    styles.objetivoCustomBtn,
                    { backgroundColor: objetivoCustom.trim() ? c.primary : c.border },
                  ]}
                >
                  <Text style={styles.objetivoCustomBtnText}>Usar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: c.surfaceElevated }]} />
              <View style={[styles.emptyIcon, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                <Text style={styles.emptyEmoji}>🥗</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: c.text }]}>
                ¡Hola! Soy NutriLens
              </Text>
              <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
                Pregúntame sobre nutrición, recetas saludables o consejos para tu objetivo: {userContext.objetivo}. 💬
              </Text>
              <Text style={[styles.suggestLabel, { color: c.muted }]}>Prueba preguntar</Text>
              <View style={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setInputText(s)}
                    style={[styles.suggestionChip, { backgroundColor: c.surfaceCard, borderColor: c.border }]}
                  >
                    <Text style={[styles.suggestionText, { color: c.textSecondary }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {isLoading && (
            <View style={[styles.loading, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.loadingText, { color: c.textSecondary }]}>Pensando…</Text>
            </View>
          )}

          {userContext && (
            <View style={[styles.inputWrap, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.inputRow, { backgroundColor: c.surfaceCard, borderColor: c.border }]}>
                <TextInput
                  style={[styles.input, { color: c.text }]}
                  placeholder="Escribe tu mensaje…"
                  placeholderTextColor={c.muted}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  style={[
                    styles.sendBtn,
                    { backgroundColor: inputText.trim() && !isLoading ? c.primary : c.border },
                  ]}
                >
                  <MaterialIcons
                    name="send"
                    size={20}
                    color={inputText.trim() && !isLoading ? '#fff' : c.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },

  headerWrap: {
    position: 'relative',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    opacity: 0.85,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },

  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
  },
  pillDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 12, fontWeight: '600' },
  cambiarObjetivoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  cambiarObjetivoText: { fontSize: 12, fontWeight: '600' },
  objetivoCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  objetivoCustomInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  objetivoCustomBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  objetivoCustomBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  chat: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.6,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 20,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
  suggestLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 10,
  },
  suggestions: { gap: 8, width: '100%' },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 14 },

  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  bubbleUser: { borderBottomRightRadius: 6 },
  bubbleAI: { borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: 15, lineHeight: 22 },

  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
  },
  loadingText: { fontSize: 13, fontWeight: '600' },

  inputWrap: {
    padding: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
