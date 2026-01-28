/**
 * Mock de usuario.
 * Reemplazar por llamadas al backend cuando esté disponible (Sebastián).
 */

export type MockUser = {
  id: string;
  name: string;
  email: string;
  avatarUri: string | null;
  meta: {
    caloriasObjetivo: number;
    vasosAguaObjetivo: number;
    fechaRegistro: string;
  };
};

const MOCK_USER: MockUser = {
  id: 'usr-1',
  name: 'Usuario Nutrilens',
  email: 'usuario@nutrilens.app',
  avatarUri: null,
  meta: {
    caloriasObjetivo: 2000,
    vasosAguaObjetivo: 8,
    fechaRegistro: '2025-01-15',
  },
};

export function getMockUser(): MockUser {
  return MOCK_USER;
}
