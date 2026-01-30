/**
 * Servicio Backend — Consume endpoints definidos por Sebastián.
 * Si falla → retry (hasta 2 reintentos).
 */

import { withRetry } from '@/utils/retry';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.nutrilens.app';

export type UsuarioPayload = {
  id?: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  meta?: {
    caloriasObjetivo: number;
    vasosAguaObjetivo: number;
    fechaRegistro?: string;
  };
};

export type UsuarioGuardado = {
  id: string;
  name: string;
  email: string;
  [key: string]: unknown;
};

export type ComidaPayload = {
  usuarioId?: string;
  descripcion: string;
  calorias?: number;
  imagenUri?: string | null;
  fecha?: string;
  [key: string]: unknown;
};

export type ComidaGuardada = {
  id: string;
  descripcion: string;
  [key: string]: unknown;
};

export type Receta = {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUri: string | null;
  calorias: number;
  tiempoMinutos: number;
  porciones: number;
  categoria: string;
  ingredientes: string[];
  pasos: string[];
};

/**
 * Guarda o actualiza el usuario en el backend.
 * Endpoint definido por Sebastián.
 */
export async function guardarUsuario(usuario: UsuarioPayload): Promise<UsuarioGuardado> {
  return withRetry(async () => {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });
    if (!res.ok) throw new Error(`API guardar usuario: ${res.status}`);
    return res.json();
  }, { maxAttempts: 3, delayMs: 1000 });
}

/**
 * Guarda un registro de comida (por ejemplo tras registrar o analizar con IA).
 * Endpoint definido por Sebastián.
 */
export async function guardarComida(comida: ComidaPayload): Promise<ComidaGuardada> {
  return withRetry(async () => {
    const res = await fetch(`${API_BASE_URL}/comidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comida),
    });
    if (!res.ok) throw new Error(`API guardar comida: ${res.status}`);
    return res.json();
  }, { maxAttempts: 3, delayMs: 1000 });
}

/**
 * Obtiene la lista de recetas desde el backend.
 * Endpoint definido por Sebastián.
 */
export async function obtenerRecetas(): Promise<Receta[]> {
  return withRetry(async () => {
    const res = await fetch(`${API_BASE_URL}/recetas`);
    if (!res.ok) throw new Error(`API obtener recetas: ${res.status}`);
    return res.json();
  }, { maxAttempts: 3, delayMs: 1000 });
}
