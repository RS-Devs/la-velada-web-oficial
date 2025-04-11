import type { TwitchUser } from './auth';

export interface Pronostico {
  combateId: string;
  ganadorId: string;
  metodo: string;
  ronda: string;
}

export interface PronosticoUsuario {
  userId: string;
  userName: string;
  userImage: string;
  fecha: number;
  pronosticos: Pronostico[];
}

// Verificar si estamos en el navegador
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Función para guardar un pronóstico
export const guardarPronostico = (user: TwitchUser, pronosticos: Pronostico[]): boolean => {
  if (!isBrowser) return false;
  
  try {
    // Obtener pronósticos existentes
    const pronosticosGuardados = obtenerTodosPronosticos();
    
    // Crear nuevo pronóstico
    const nuevoPronostico: PronosticoUsuario = {
      userId: user.id,
      userName: user.display_name,
      userImage: user.profile_image_url,
      fecha: Date.now(),
      pronosticos
    };
    
    // Verificar si el usuario ya ha votado
    const indiceExistente = pronosticosGuardados.findIndex(p => p.userId === user.id);
    
    if (indiceExistente !== -1) {
      // Actualizar pronóstico existente
      pronosticosGuardados[indiceExistente] = nuevoPronostico;
    } else {
      // Añadir nuevo pronóstico
      pronosticosGuardados.push(nuevoPronostico);
    }
    
    // Guardar en localStorage
    localStorage.setItem('velada_pronosticos', JSON.stringify(pronosticosGuardados));
    
    // Disparar evento para actualizar estadísticas
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('pronostico:actualizado'));
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar pronóstico:', error);
    return false;
  }
};

// Función para obtener todos los pronósticos
export const obtenerTodosPronosticos = (): PronosticoUsuario[] => {
  if (!isBrowser) return [];
  
  try {
    const pronosticosJson = localStorage.getItem('velada_pronosticos');
    if (!pronosticosJson) return [];
    
    return JSON.parse(pronosticosJson);
  } catch (error) {
    console.error('Error al obtener pronósticos:', error);
    return [];
  }
};

// Función para obtener el pronóstico de un usuario
export const obtenerPronosticoUsuario = (userId: string): PronosticoUsuario | null => {
  if (!isBrowser) return null;
  
  const pronosticos = obtenerTodosPronosticos();
  return pronosticos.find(p => p.userId === userId) || null;
};

// Función para obtener estadísticas de un combate
export const obtenerEstadisticasCombate = (combateId: string) => {
  // Datos por defecto
  const defaultStats = {
    total: 0,
    ganadores: {},
    metodos: {},
    rondas: {}
  };
  
  if (!isBrowser) return defaultStats;
  
  const pronosticos = obtenerTodosPronosticos();
  
  // Filtrar pronósticos para este combate
  const pronosticosCombate = pronosticos
    .flatMap(p => p.pronosticos)
    .filter(p => p.combateId === combateId);
  
  if (pronosticosCombate.length === 0) {
    return defaultStats;
  }
  
  const total = pronosticosCombate.length;
  
  // Contar ganadores
  const ganadores: Record<string, number> = {};
  pronosticosCombate.forEach(p => {
    ganadores[p.ganadorId] = (ganadores[p.ganadorId] || 0) + 1;
  });
  
  // Contar métodos
  const metodos: Record<string, number> = {};
  pronosticosCombate.forEach(p => {
    metodos[p.metodo] = (metodos[p.metodo] || 0) + 1;
  });
  
  // Contar rondas
  const rondas: Record<string, number> = {};
  pronosticosCombate.forEach(p => {
    rondas[p.ronda] = (rondas[p.ronda] || 0) + 1;
  });
  
  // Calcular porcentajes
  Object.keys(ganadores).forEach(key => {
    ganadores[key] = (ganadores[key] / total) * 100;
  });
  
  Object.keys(metodos).forEach(key => {
    metodos[key] = (metodos[key] / total) * 100;
  });
  
  Object.keys(rondas).forEach(key => {
    rondas[key] = (rondas[key] / total) * 100;
  });
  
  return {
    total,
    ganadores,
    metodos,
    rondas
  };
};