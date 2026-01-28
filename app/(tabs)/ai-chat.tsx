/**
 * Pantalla de Chat con IA Nutricional
 * Para probar el servicio de chat de Nutrilens
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getChatResponse, ChatResponse } from '@/ai/chat.service';
import { UserContext } from '@/ai/prompts';
import { isAPIKeyConfigured } from '@/ai/config';

// Contexto de usuario de prueba (esto vendrá del onboarding)
const testUserContext: UserContext = {
  objetivo: 'perder peso',
  dieta: 'sin restricciones',
  comidasPreferidas: ['pollo', 'ensaladas', 'frutas'],
  restricciones: ['lactosa'],
  infoAdicional: 'Hago ejercicio 3 veces por semana',
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  response?: ChatResponse;
  timestamp: Date;
}

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Nota: En React 19 el ref de FlatList tiene problemas de tipos

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Obtener respuesta de la IA (usa OpenAI si está configurado, sino mock)
      const response = await getChatResponse(userMessage.text, testUserContext);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al obtener respuesta:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
        {
          backgroundColor: item.isUser
            ? colors.tint
            : colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
        },
      ]}
    >
      <ThemedText
        style={[
          styles.messageText,
          { color: item.isUser ? '#fff' : colors.text },
        ]}
      >
        {item.text}
      </ThemedText>

      {/* Mostrar detalles adicionales de la respuesta de IA */}
      {!item.isUser && item.response && (
        <View style={styles.responseDetails}>
          {item.response.recomendaciones && item.response.recomendaciones.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>📋 Recomendaciones:</ThemedText>
              <Text style={[styles.listItem, { color: colors.text }]}>
                {item.response.recomendaciones.map(rec => `• ${rec}`).join('\n')}
              </Text>
            </View>
          )}

          {item.response.tips && item.response.tips.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>💡 Tips:</ThemedText>
              <Text style={[styles.listItem, { color: colors.text }]}>
                {item.response.tips.map(tip => `• ${tip}`).join('\n')}
              </Text>
            </View>
          )}

          {item.response.preguntasSeguimiento && item.response.preguntasSeguimiento.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>❓ Preguntas:</ThemedText>
              {item.response.preguntasSeguimiento.map((pregunta, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(pregunta)}
                  style={styles.questionButton}
                >
                  <ThemedText style={[styles.listItem, styles.questionText]}>
                    {pregunta}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          🥗 NutriLens AI
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Tu asistente nutricional
        </ThemedText>
      </ThemedView>

      {/* Info del contexto de prueba */}
      <View style={[styles.contextInfo, { 
        backgroundColor: isAPIKeyConfigured() 
          ? (colorScheme === 'dark' ? '#1a2a1a' : '#e8f5e9')
          : (colorScheme === 'dark' ? '#2a2a1a' : '#fff3e0')
      }]}>
        <ThemedText style={styles.contextText}>
          {isAPIKeyConfigured() ? '🟢 OpenAI conectado' : '🟡 Modo mock (configura API key)'} | Objetivo: {testUserContext.objetivo}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              ¡Hola! Soy tu asistente nutricional. 👋
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Pregúntame sobre nutrición, recetas saludables, o pídeme consejos para alcanzar tus objetivos.
            </ThemedText>
            <View style={styles.suggestionsContainer}>
              <ThemedText style={styles.suggestionsTitle}>Prueba preguntar:</ThemedText>
              {[
                '¿Qué puedo comer para cenar?',
                '¿Cómo puedo aumentar mi proteína?',
                'Dame ideas de snacks saludables',
              ].map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionButton, { borderColor: colors.tint }]}
                  onPress={() => setInputText(suggestion)}
                >
                  <ThemedText style={[styles.suggestionText, { color: colors.tint }]}>
                    {suggestion}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
          />
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Pensando...</ThemedText>
          </View>
        )}

        <View style={[styles.inputContainer, { borderTopColor: colors.icon }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                color: colors.text,
              },
            ]}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={colors.icon}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.tint : colors.icon },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <ThemedText style={styles.sendButtonText}>➤</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
  },
  headerSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  contextInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  contextText: {
    fontSize: 12,
    opacity: 0.8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  responseDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  listItem: {
    fontSize: 14,
    marginLeft: 8,
    marginTop: 2,
    lineHeight: 20,
  },
  questionButton: {
    marginTop: 4,
  },
  questionText: {
    color: '#0a7ea4',
    textDecorationLine: 'underline',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  suggestionsContainer: {
    marginTop: 24,
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  suggestionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});
