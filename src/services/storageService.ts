// ============================================
// SERVICIO DE ALMACENAMIENTO LOCAL
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  Usuario,
  Cliente,
  Prestamo,
  Cuota,
  Pago,
  Transaccion,
  Configuracion,
  Notificacion,
} from '../types';
import {
  USUARIOS_DEMO,
  CLIENTES_DEMO,
  PRESTAMOS_DEMO,
  PAGOS_DEMO,
  CONFIGURACION_DEMO,
} from '../data/demoData';
import { generarTablaAmortizacion } from '../utils/amortizacion';

// Claves de almacenamiento
const KEYS = {
  USUARIOS: 'prestamos_usuarios',
  CLIENTES: 'prestamos_clientes',
  PRESTAMOS: 'prestamos_prestamos',
  CUOTAS: 'prestamos_cuotas',
  PAGOS: 'prestamos_pagos',
  TRANSACCIONES: 'prestamos_transacciones',
  CONFIGURACION: 'prestamos_configuracion',
  NOTIFICACIONES: 'prestamos_notificaciones',
  SESSION: 'prestamos_session',
};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la base de datos con datos demo
 */
export const inicializarDatosDemo = async (): Promise<void> => {
  try {
    // Verificar si ya hay usuarios guardados
    const usuariosExistentes = await AsyncStorage.getItem(KEYS.USUARIOS);
    if (usuariosExistentes) {
      console.log('Los datos ya están inicializados');
      return;
    }

    console.log('Inicializando datos demo...');
    // Guardar usuarios
    await AsyncStorage.setItem(KEYS.USUARIOS, JSON.stringify(USUARIOS_DEMO));

    // Guardar clientes
    await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(CLIENTES_DEMO));

    // Guardar préstamos
    await AsyncStorage.setItem(KEYS.PRESTAMOS, JSON.stringify(PRESTAMOS_DEMO));

    // Generar y guardar cuotas para cada préstamo
    const todasLasCuotas: Cuota[] = [];
    for (const prestamo of PRESTAMOS_DEMO) {
      const cuotas = generarTablaAmortizacion(
        prestamo.id,
        prestamo.monto,
        prestamo.tasa,
        prestamo.plazo,
        prestamo.tipoCuota,
        prestamo.fechaPrimerCobro,
        true,
        'adelantar'
      );
      todasLasCuotas.push(...cuotas);
    }
    await AsyncStorage.setItem(KEYS.CUOTAS, JSON.stringify(todasLasCuotas));

    // Guardar pagos
    await AsyncStorage.setItem(KEYS.PAGOS, JSON.stringify(PAGOS_DEMO));

    // Actualizar estado de cuotas pagadas SOLO para pagos aprobados
    for (const pago of PAGOS_DEMO) {
      if (pago.estadoValidacion === 'aprobado') {
        const cuotaIndex = todasLasCuotas.findIndex(c => c.id === pago.cuotaId);
        if (cuotaIndex !== -1) {
          todasLasCuotas[cuotaIndex].estado = 'pagado';
          todasLasCuotas[cuotaIndex].montoPagado = pago.valorPagado;
        }
      }
    }
    await AsyncStorage.setItem(KEYS.CUOTAS, JSON.stringify(todasLasCuotas));

    // Guardar configuración
    await AsyncStorage.setItem(KEYS.CONFIGURACION, JSON.stringify(CONFIGURACION_DEMO));

    // Inicializar transacciones vacías
    await AsyncStorage.setItem(KEYS.TRANSACCIONES, JSON.stringify([]));

    // Inicializar notificaciones vacías
    await AsyncStorage.setItem(KEYS.NOTIFICACIONES, JSON.stringify([]));

    console.log('Datos demo inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos demo:', error);
    throw error;
  }
};

/**
 * Limpia todos los datos
 */
export const limpiarTodosLosDatos = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USUARIOS,
      KEYS.CLIENTES,
      KEYS.PRESTAMOS,
      KEYS.CUOTAS,
      KEYS.PAGOS,
      KEYS.TRANSACCIONES,
      KEYS.CONFIGURACION,
      KEYS.NOTIFICACIONES,
    ]);
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(KEYS.SESSION);
      } else {
        await SecureStore.deleteItemAsync(KEYS.SESSION);
      }
    } catch (sessionError) {
      // Ignorar error si la sesión no existe
      console.log('No hay sesión para eliminar');
    }
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    throw error;
  }
};

// ============================================
// SESIÓN
// ============================================

export const guardarSesion = async (usuario: Usuario): Promise<void> => {
  try {
    const usuarioString = JSON.stringify(usuario);
    if (Platform.OS === 'web') {
      // En web, usar AsyncStorage
      await AsyncStorage.setItem(KEYS.SESSION, usuarioString);
    } else {
      // En móvil, usar SecureStore
      await SecureStore.setItemAsync(KEYS.SESSION, usuarioString);
    }
    console.log('✅ Sesión guardada correctamente');
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    throw error;
  }
};

export const obtenerSesion = async (): Promise<Usuario | null> => {
  try {
    let session: string | null = null;
    if (Platform.OS === 'web') {
      // En web, usar AsyncStorage
      session = await AsyncStorage.getItem(KEYS.SESSION);
    } else {
      // En móvil, usar SecureStore
      session = await SecureStore.getItemAsync(KEYS.SESSION);
    }
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return null;
  }
};

export const cerrarSesion = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // En web, usar AsyncStorage
      await AsyncStorage.removeItem(KEYS.SESSION);
    } else {
      // En móvil, usar SecureStore
      await SecureStore.deleteItemAsync(KEYS.SESSION);
    }
    console.log('✅ Sesión cerrada correctamente');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // No lanzar error, solo loguear
  }
};

// ============================================
// USUARIOS
// ============================================

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const data = await AsyncStorage.getItem(KEYS.USUARIOS);
  const usuarios = data ? JSON.parse(data) : [];
  console.log('Usuarios en storage:', usuarios.length, usuarios);
  return usuarios;
};

export const obtenerUsuarioPorEmail = async (email: string): Promise<Usuario | null> => {
  const usuarios = await obtenerUsuarios();
  const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  console.log('Buscando email:', email, 'Encontrado:', usuario);
  return usuario;
};

export const crearUsuario = async (usuario: Usuario): Promise<void> => {
  const usuarios = await obtenerUsuarios();
  usuarios.push(usuario);
  await AsyncStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuarios));
};

// ============================================
// CLIENTES
// ============================================

export const obtenerClientes = async (): Promise<Cliente[]> => {
  const data = await AsyncStorage.getItem(KEYS.CLIENTES);
  return data ? JSON.parse(data) : [];
};

export const obtenerClientePorId = async (id: string): Promise<Cliente | null> => {
  const clientes = await obtenerClientes();
  return clientes.find(c => c.id === id) || null;
};

export const crearCliente = async (cliente: Cliente): Promise<void> => {
  const clientes = await obtenerClientes();
  clientes.push(cliente);
  await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes));
};

export const actualizarCliente = async (id: string, clienteActualizado: Partial<Cliente>): Promise<void> => {
  const clientes = await obtenerClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...clienteActualizado };
    await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientes));
  }
};

export const eliminarCliente = async (id: string): Promise<void> => {
  const clientes = await obtenerClientes();
  const clientesFiltrados = clientes.filter(c => c.id !== id);
  await AsyncStorage.setItem(KEYS.CLIENTES, JSON.stringify(clientesFiltrados));
};

// ============================================
// PRÉSTAMOS
// ============================================

export const obtenerPrestamos = async (): Promise<Prestamo[]> => {
  const data = await AsyncStorage.getItem(KEYS.PRESTAMOS);
  return data ? JSON.parse(data) : [];
};

export const obtenerPrestamoPorId = async (id: string): Promise<Prestamo | null> => {
  const prestamos = await obtenerPrestamos();
  return prestamos.find(p => p.id === id) || null;
};

export const obtenerPrestamosPorCliente = async (clienteId: string): Promise<Prestamo[]> => {
  const prestamos = await obtenerPrestamos();
  return prestamos.filter(p => p.clienteId === clienteId);
};

export const crearPrestamo = async (prestamo: Prestamo, cuotas: Cuota[]): Promise<void> => {
  const prestamos = await obtenerPrestamos();
  prestamos.push(prestamo);
  await AsyncStorage.setItem(KEYS.PRESTAMOS, JSON.stringify(prestamos));

  // Guardar cuotas
  const cuotasExistentes = await obtenerCuotas();
  cuotasExistentes.push(...cuotas);
  await AsyncStorage.setItem(KEYS.CUOTAS, JSON.stringify(cuotasExistentes));
};

export const actualizarPrestamo = async (id: string, prestamoActualizado: Partial<Prestamo>): Promise<void> => {
  const prestamos = await obtenerPrestamos();
  const index = prestamos.findIndex(p => p.id === id);
  if (index !== -1) {
    prestamos[index] = { ...prestamos[index], ...prestamoActualizado };
    await AsyncStorage.setItem(KEYS.PRESTAMOS, JSON.stringify(prestamos));
  }
};

// ============================================
// CUOTAS
// ============================================

export const obtenerCuotas = async (): Promise<Cuota[]> => {
  const data = await AsyncStorage.getItem(KEYS.CUOTAS);
  return data ? JSON.parse(data) : [];
};

export const obtenerCuotasPorPrestamo = async (prestamoId: string): Promise<Cuota[]> => {
  const cuotas = await obtenerCuotas();
  return cuotas.filter(c => c.prestamoId === prestamoId);
};

export const actualizarCuota = async (id: string, cuotaActualizada: Partial<Cuota>): Promise<void> => {
  const cuotas = await obtenerCuotas();
  const index = cuotas.findIndex(c => c.id === id);
  if (index !== -1) {
    cuotas[index] = { ...cuotas[index], ...cuotaActualizada };
    await AsyncStorage.setItem(KEYS.CUOTAS, JSON.stringify(cuotas));
  }
};

// ============================================
// PAGOS
// ============================================

export const obtenerPagos = async (): Promise<Pago[]> => {
  const data = await AsyncStorage.getItem(KEYS.PAGOS);
  return data ? JSON.parse(data) : [];
};

export const obtenerPagosPorPrestamo = async (prestamoId: string): Promise<Pago[]> => {
  const pagos = await obtenerPagos();
  return pagos.filter(p => p.prestamoId === prestamoId);
};

export const crearPago = async (pago: Pago): Promise<void> => {
  const pagos = await obtenerPagos();
  pagos.push(pago);
  await AsyncStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
};

export const actualizarPago = async (id: string, pagoActualizado: Partial<Pago>): Promise<void> => {
  const pagos = await obtenerPagos();
  const index = pagos.findIndex(p => p.id === id);
  if (index !== -1) {
    pagos[index] = { ...pagos[index], ...pagoActualizado };
    await AsyncStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
  }
};

// ============================================
// TRANSACCIONES
// ============================================

export const obtenerTransacciones = async (): Promise<Transaccion[]> => {
  const data = await AsyncStorage.getItem(KEYS.TRANSACCIONES);
  return data ? JSON.parse(data) : [];
};

export const crearTransaccion = async (transaccion: Transaccion): Promise<void> => {
  const transacciones = await obtenerTransacciones();
  transacciones.push(transaccion);
  await AsyncStorage.setItem(KEYS.TRANSACCIONES, JSON.stringify(transacciones));
};

// ============================================
// CONFIGURACIÓN
// ============================================

export const obtenerConfiguracion = async (): Promise<Configuracion[]> => {
  const data = await AsyncStorage.getItem(KEYS.CONFIGURACION);
  return data ? JSON.parse(data) : CONFIGURACION_DEMO;
};

export const obtenerValorConfiguracion = async (clave: string): Promise<string | null> => {
  const config = await obtenerConfiguracion();
  const item = config.find(c => c.clave === clave);
  return item ? item.valor : null;
};

export const actualizarConfiguracion = async (clave: string, valor: string): Promise<void> => {
  const config = await obtenerConfiguracion();
  const index = config.findIndex(c => c.clave === clave);
  if (index !== -1) {
    config[index].valor = valor;
  } else {
    config.push({ id: Date.now().toString(), clave, valor });
  }
  await AsyncStorage.setItem(KEYS.CONFIGURACION, JSON.stringify(config));
};

// ============================================
// NOTIFICACIONES
// ============================================

export const obtenerNotificaciones = async (): Promise<Notificacion[]> => {
  const data = await AsyncStorage.getItem(KEYS.NOTIFICACIONES);
  return data ? JSON.parse(data) : [];
};

export const obtenerNotificacionesPorUsuario = async (usuarioId: string): Promise<Notificacion[]> => {
  const notificaciones = await obtenerNotificaciones();
  return notificaciones.filter(n => n.usuarioId === usuarioId);
};

export const crearNotificacion = async (notificacion: Notificacion): Promise<void> => {
  const notificaciones = await obtenerNotificaciones();
  notificaciones.push(notificacion);
  await AsyncStorage.setItem(KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
};

export const marcarNotificacionLeida = async (id: string): Promise<void> => {
  const notificaciones = await obtenerNotificaciones();
  const index = notificaciones.findIndex(n => n.id === id);
  if (index !== -1) {
    notificaciones[index].leida = true;
    await AsyncStorage.setItem(KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
  }
};
