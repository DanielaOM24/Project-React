import { ErrorMessage } from '@/components/error-message';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { sendChatMessage } from '@/services/ai.service';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const IA_ERROR_MESSAGE = 'No se pudo conectar con la IA. Intenta más tarde.';

/**
 * Chat IA. Loading mientras envía; si falla IA → mensaje simple.
 */
export default function ChatScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setReply(null);
    setLoading(true);
    try {
      const res = await sendChatMessage(trimmed);
      const msg = res.reply ?? res.message ?? (typeof res === 'string' ? res : 'Respuesta recibida.');
      setReply(msg);
      setText('');
    } catch {
      setError(IA_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Chat IA</ThemedText>
        <ThemedText style={styles.sub}>Pregunta sobre nutrición o comidas.</ThemedText>
      </ThemedView>

      {error ? (
        <ErrorMessage message={error} onRetry={() => setError(null)} retryLabel="Intentar de nuevo" />
      ) : null}

      {reply ? (
        <View style={styles.replyBox}>
          <ThemedText type="defaultSemiBold">IA:</ThemedText>
          <ThemedText style={styles.replyText}>{reply}</ThemedText>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <ThemedText style={styles.loadingText}>Enviando...</ThemedText>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#687076"
          value={text}
          onChangeText={setText}
          editable={!loading}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={loading || !text.trim()}
          activeOpacity={0.8}>
          <ThemedText type="defaultSemiBold" style={styles.sendBtnText}>
            Enviar
          </ThemedText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { padding: 20, paddingBottom: 12 },
  sub: { marginTop: 4, opacity: 0.8 },
  replyBox: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10,126,164,0.3)',
    backgroundColor: 'rgba(10,126,164,0.06)',
    gap: 8,
  },
  replyText: { opacity: 0.9 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
  loadingText: { opacity: 0.7 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 16,
    paddingBottom: 24,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#111',
    fontSize: 16,
  },
  sendBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff' },
});
