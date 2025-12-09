// ============================================
// CONTEXT DE DATOS DE LA APLICACIÓN
// ============================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Cliente,
  Prestamo,
  Cuota,
  Pago,
  Transaccion,
  Notificacion,
  ConfiguracionApp,
} from '../types';
import {
  obtenerClientes,
  obtenerPrestamos,
  obtenerCuotas,
  obtenerPagos,
  obtenerTransacciones,
  obtenerNotificaciones,
  obtenerConfiguracion,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  crearPrestamo,
  actualizarPrestamo,
  actualizarCuota,
  crearPago,
  actualizarPago,
  crearTransaccion,
  crearNotificacion,
  marcarNotificacionLeida,
  actualizarConfiguracion,
} from '../services/storageService';
import { useAuth } from './AuthContext';

interface AppContextType {
  // Estados
  clientes: Cliente[];
  prestamos: Prestamo[];
  cuotas: Cuota[];
  pagos: Pago[];
  transacciones: Transaccion[];
  notificaciones: Notificacion[];
  configuracion: ConfiguracionApp;
  isLoading: boolean;

  // Métodos
  recargarDatos: () => Promise<void>;

  // Clientes
  agregarCliente: (cliente: Cliente) => Promise<void>;
  modificarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;

  // Préstamos
  agregarPrestamo: (prestamo: Prestamo, cuotas: Cuota[]) => Promise<void>;
  modificarPrestamo: (id: string, prestamo: Partial<Prestamo>) => Promise<void>;

  // Cuotas
  modificarCuota: (id: string, cuota: Partial<Cuota>) => Promise<void>;

  // Pagos
  agregarPago: (pago: Pago) => Promise<void>;
  modificarPago: (id: string, pago: Partial<Pago>) => Promise<void>;
  validarPago: (pagoId: string, adminId: string, comentario?: string) => Promise<void>;
  rechazarPago: (pagoId: string, adminId: string, comentario: string) => Promise<void>;

  // Transacciones
  agregarTransaccion: (transaccion: Transaccion) => Promise<void>;

  // Notificaciones
  agregarNotificacion: (notificacion: Notificacion) => Promise<void>;
  marcarLeida: (id: string) => Promise<void>;

  // Configuración
  actualizarConfig: (clave: string, valor: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionApp>({
    omitirFinesSemana: true,
    ajusteFechaFinSemana: 'adelantar',
    tasaPredeterminada: 12,
    tiposCuotaDisponibles: ['diario', 'semanal', 'quincenal', 'mensual'],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      const [
        clientesData,
        prestamosData,
        cuotasData,
        pagosData,
        transaccionesData,
        notificacionesData,
        configData,
      ] = await Promise.all([
        obtenerClientes(),
        obtenerPrestamos(),
        obtenerCuotas(),
        obtenerPagos(),
        obtenerTransacciones(),
        obtenerNotificaciones(),
        obtenerConfiguracion(),
      ]);

      setClientes(clientesData);
      setPrestamos(prestamosData);
      setCuotas(cuotasData);
      setPagos(pagosData);
      setTransacciones(transaccionesData);
      setNotificaciones(
        usuario ? notificacionesData.filter(n => n.usuarioId === usuario.id) : []
      );

      // Parsear configuración
      const omitirFines = configData.find(c => c.clave === 'omitirFinesSemana')?.valor;
      const ajusteFecha = configData.find(c => c.clave === 'ajusteFechaFinSemana')?.valor;
      const tasa = configData.find(c => c.clave === 'tasaPredeterminada')?.valor;
      const tipos = configData.find(c => c.clave === 'tiposCuotaDisponibles')?.valor;
      
      const config: ConfiguracionApp = {
        omitirFinesSemana: omitirFines === 'true',
        ajusteFechaFinSemana: (ajusteFecha === 'adelantar' || ajusteFecha === 'retroceder') ? ajusteFecha : 'adelantar',
        tasaPredeterminada: tasa ? parseFloat(tasa) : 12,
        tiposCuotaDisponibles: tipos ? tipos.split(',') as any : ['diario', 'semanal', 'quincenal', 'mensual'],
      };
      setConfiguracion(config);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recargarDatos = async () => {
    await cargarDatos();
  };

  // Métodos de Clientes
  const agregarCliente = async (cliente: Cliente) => {
    await crearCliente(cliente);
    await recargarDatos();
  };

  const modificarCliente = async (id: string, cliente: Partial<Cliente>) => {
    await actualizarCliente(id, cliente);
    await recargarDatos();
  };

  const borrarCliente = async (id: string) => {
    await eliminarCliente(id);
    await recargarDatos();
  };

  // Métodos de Préstamos
  const agregarPrestamo = async (prestamo: Prestamo, cuotasList: Cuota[]) => {
    await crearPrestamo(prestamo, cuotasList);
    await recargarDatos();
  };

  const modificarPrestamo = async (id: string, prestamo: Partial<Prestamo>) => {
    await actualizarPrestamo(id, prestamo);
    await recargarDatos();
  };

  // Métodos de Cuotas
  const modificarCuota = async (id: string, cuota: Partial<Cuota>) => {
    await actualizarCuota(id, cuota);
    await recargarDatos();
  };

  // Métodos de Pagos
  const agregarPago = async (pago: Pago) => {
    await crearPago(pago);
    await recargarDatos();
  };

  const modificarPago = async (id: string, pago: Partial<Pago>) => {
    await actualizarPago(id, pago);
    await recargarDatos();
  };

  const validarPago = async (pagoId: string, adminId: string, comentario?: string) => {
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) throw new Error('Pago no encontrado');

    // Actualizar el pago como aprobado
    await actualizarPago(pagoId, {
      estadoValidacion: 'aprobado',
      validadoPor: adminId,
      fechaValidacion: new Date().toISOString(),
      comentarioValidacion: comentario,
    });

    // Actualizar la cuota como pagada
    await actualizarCuota(pago.cuotaId, {
      estado: 'pagado',
      montoPagado: pago.valorPagado,
    });

    await recargarDatos();
  };

  const rechazarPago = async (pagoId: string, adminId: string, comentario: string) => {
    const pago = pagos.find(p => p.id === pagoId);
    if (!pago) throw new Error('Pago no encontrado');

    // Actualizar el pago como rechazado
    await actualizarPago(pagoId, {
      estadoValidacion: 'rechazado',
      validadoPor: adminId,
      fechaValidacion: new Date().toISOString(),
      comentarioValidacion: comentario,
    });
    await recargarDatos();
  };

  // Métodos de Transacciones
  const agregarTransaccion = async (transaccion: Transaccion) => {
    await crearTransaccion(transaccion);
    await recargarDatos();
  };

  // Métodos de Notificaciones
  const agregarNotificacion = async (notificacion: Notificacion) => {
    await crearNotificacion(notificacion);
    await recargarDatos();
  };

  const marcarLeida = async (id: string) => {
    await marcarNotificacionLeida(id);
    await recargarDatos();
  };

  // Métodos de Configuración
  const actualizarConfig = async (clave: string, valor: string) => {
    await actualizarConfiguracion(clave, valor);
    await cargarDatos();
  };

  return (
    <AppContext.Provider
      value={{
        clientes,
        prestamos,
        cuotas,
        pagos,
        transacciones,
        notificaciones,
        configuracion,
        isLoading,
        recargarDatos,
        agregarCliente,
        modificarCliente,
        borrarCliente,
        agregarPrestamo,
        modificarPrestamo,
        modificarCuota,
        agregarPago,
        modificarPago,
        validarPago,
        rechazarPago,
        agregarTransaccion,
        agregarNotificacion,
        marcarLeida,
        actualizarConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};
