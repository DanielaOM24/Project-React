// Chat Screen Component

import MainBottomTabs from '@/components/MainBottomTabs';
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getChatResponse } from '@/ai/chat.service';
import { isAPIKeyConfigured } from '@/ai/config';
import { UserContext } from '@/ai/prompts';
import { getChatHistory, postChatMessage } from '@/lib/chatHistoryApi';

// Helper Functions
function generateConversationId(): string {
  return `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// Constants
const OBJETIVOS_PREDEFINIDOS = [
  { label: 'Perder peso', icon: 'trending-down-outline' },
  { label: 'Ganar masa muscular', icon: 'barbell-outline' },
  { label: 'Mantener peso', icon: 'scale-outline' },
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

// Types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  // Component State
  const insets = useSafeAreaInsets();
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

  // Effects
  useEffect(() => {
    if (!userContext || historyLoaded || messages.length > 0) return;
    let cancelled = false;
    getChatHistory(conversationId)
      .then(history => {
        if (cancelled || !history.length) return;
        const mapped: Message[] = history.map((m) => ({
          id: m.id || `hist_${m.role}_${Date.now()}`,
          text: m.content,
          isUser: m.role === 'USER',
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
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
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={18} color={colors.greenprimary} />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          item.isUser ? styles.bubbleUser : styles.bubbleAI,
        ]}
      >
        <Text style={item.isUser ? styles.bubbleTextUser : styles.bubbleTextAI}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.headerGradient}>
          <View style={[styles.headerContent, { paddingTop: insets.top + 4 }]}>
            <View style={styles.logoIcon}>
              <Ionicons name="restaurant" size={18} color={colors.darkgreen} />
            </View>
            <View>
              <Text style={styles.logoTitle}>NutriLens</Text>
              <Text style={styles.logoSub}>Asistente nutricional</Text>
            </View>
          </View>
        </View>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <View style={[styles.pillDot, { backgroundColor: isAPIKeyConfigured() ? colors.greenprimary : '#F2C94C' }]} />
            <Text style={styles.pillText}>
              {isAPIKeyConfigured() ? 'Gemini' : 'Demo'}
              {userContext ? ` · ${userContext.objetivo}` : ' · ¿Cuál es tu objetivo?'}
            </Text>
          </View>
          {userContext && (
            <TouchableOpacity
              onPress={cambiarObjetivo}
              style={styles.cambiarObjetivoBtn}
            >
              <Ionicons name="create-outline" size={14} color={colors.darkgreen} />
              <Text style={styles.cambiarObjetivoText}>Cambiar</Text>
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.chat}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {!userContext ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyEmoji}>🎯</Text>
                  </View>
                </View>
                <Text style={styles.emptyTitle}>
                  ¿Cuál es tu objetivo?
                </Text>
                <Text style={styles.emptyDesc}>
                  Elige uno o escribe el tuyo. El chat se enfocará en este objetivo.
                </Text>
                
                <View style={styles.objetivosContainer}>
                  {OBJETIVOS_PREDEFINIDOS.map((obj, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setObjetivo(obj.label)}
                      style={styles.objetivoCard}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={obj.icon as any} size={28} color={colors.greenprimary} />
                      <Text style={styles.objetivoText}>{obj.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.objetivoCustomContainer}>
                  <Text style={styles.customObjetivoLabel}>O escribe tu objetivo personalizado</Text>
                  <View style={styles.objetivoCustomRow}>
                    <TextInput
                      style={[styles.objetivoCustomInput, { opacity: 0.5 }]}
                      placeholder="Ej: Mejorar mi digestión"
                      placeholderTextColor={colors.textdark}
                      value={objetivoCustom}
                      onChangeText={setObjetivoCustom}
                      onSubmitEditing={() => objetivoCustom.trim() && setObjetivo(objetivoCustom)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={() => objetivoCustom.trim() && setObjetivo(objetivoCustom)}
                      disabled={!objetivoCustom.trim()}
                      style={[
                        styles.objetivoCustomBtn,
                        { backgroundColor: objetivoCustom.trim() ? colors.greenprimary : '#F3F4F6' },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.darkgreen} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : messages.length === 0 ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyEmoji}>🥗</Text>
                  </View>
                </View>
                <Text style={styles.emptyTitle}>
                  ¡Hola! Soy NutriLens
                </Text>
                <Text style={styles.emptyDesc}>
                  Pregúntame sobre nutrición, recetas saludables o consejos para tu objetivo: <Text style={styles.objetivoHighlight}>{userContext.objetivo}</Text>. 💬
                </Text>
                <Text style={styles.suggestLabel}>Prueba preguntar</Text>
                <View style={styles.suggestionsContainer}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setInputText(s)}
                      style={styles.suggestionCard}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.suggestHint}>
                  O escribe directamente en el chat para comenzar
                </Text>
              </View>
            </ScrollView>
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
            <View style={styles.loading}>
              <ActivityIndicator size="small" color={colors.greenprimary} />
              <Text style={styles.loadingText}>Pensando…</Text>
            </View>
          )}

          {userContext && (
            <View style={styles.inputWrap}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu mensaje…"
                  placeholderTextColor={colors.textdark}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  style={[
                    styles.sendBtn,
                    { backgroundColor: inputText.trim() && !isLoading ? colors.greenprimary : '#F3F4F6' },
                  ]}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() && !isLoading ? colors.darkgreen : colors.textdark}
                    style={{ opacity: inputText.trim() && !isLoading ? 1 : 0.5 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
      <MainBottomTabs activeTab="chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(14, 42, 37, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: typography.size.subtitle,
    fontFamily: typography.fontfamily.bold,
    color: colors.darkgreen,
    letterSpacing: 0.2,
  },
  logoSub: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.darkgreen,
    marginTop: 0,
    opacity: 0.75,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: radius.sm,
  },
  pillText: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: colors.textdark,
  },
  cambiarObjetivoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.greenprimary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cambiarObjetivoText: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  objetivoCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    gap: spacing.xs,
    paddingRight: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  objetivoCustomInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    minHeight: 48,
    borderRadius: radius.pill,
  },
  objetivoCustomBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  objetivoCustomBtnText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.semibold,
    color: colors.darkgreen,
  },
  chat: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: typography.size.title,
    fontFamily: typography.fontfamily.bold,
    color: colors.textdark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  objetivoHighlight: {
    fontFamily: typography.fontfamily.semibold,
    color: colors.greenprimary,
  },
  suggestLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: '#9CA3AF',
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  objetivosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
  },
  objetivoCard: {
    width: '30%',
    aspectRatio: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  objetivoText: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    textAlign: 'center',
    lineHeight: 16,
  },
  suggestionsContainer: {
    gap: spacing.sm,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  suggestionCard: {
    width: '80%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.appBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  suggestionText: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.medium,
    color: colors.textdark,
    textAlign: 'left',
    lineHeight: 20,
  },
  suggestHint: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.regular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  objetivoCustomContainer: {
    width: '100%',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  customObjetivoLabel: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: '#6B7280',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  bubbleUser: {
    backgroundColor: colors.greenprimary,
    borderBottomRightRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bubbleAI: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bubbleTextUser: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.darkgreen,
    lineHeight: 22,
    padding: spacing.md,
  },
  bubbleTextAI: {
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
    lineHeight: 22,
    padding: spacing.md,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  loadingText: {
    fontSize: typography.size.caption,
    fontFamily: typography.fontfamily.semibold,
    color: '#6B7280',
  },
  inputWrap: {
    padding: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    maxHeight: 100,
    fontSize: typography.size.body,
    fontFamily: typography.fontfamily.regular,
    color: colors.textdark,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
