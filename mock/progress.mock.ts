/**
 * Mock de progreso (nutrición, calorías, agua, racha).
 * Reemplazar por API/backend cuando esté disponible (Sebastián).
 */

export type MockProgress = {
  hoy: {
    caloriasConsumidas: number;
    caloriasObjetivo: number;
    vasosAgua: number;
    vasosObjetivo: number;
    comidasRegistradas: number;
  };
  rachaDias: number;
  resumenSemanal: {
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
    domingo: number;
  };
};

const MOCK_PROGRESS: MockProgress = {
  hoy: {
    caloriasConsumidas: 1240,
    caloriasObjetivo: 2000,
    vasosAgua: 5,
    vasosObjetivo: 8,
    comidasRegistradas: 2,
  },
  rachaDias: 7,
  resumenSemanal: {
    lunes: 1850,
    martes: 1920,
    miercoles: 2100,
    jueves: 1780,
    viernes: 1990,
    sabado: 2200,
    domingo: 1240,
  },
};

export function getMockProgress(): MockProgress {
  return MOCK_PROGRESS;
}
