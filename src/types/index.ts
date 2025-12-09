// ============================================
// INTERFACES Y TIPOS DE LA APLICACIÓN
// ============================================

export type RolUsuario = 'admin' | 'usuario';

export type EstadoPrestamo = 'pendiente' | 'activo' | 'pagado' | 'vencido' | 'rechazado';

export type EstadoCuota = 'pendiente' | 'pagado' | 'parcial' | 'vencido';

export type TipoCuota = 'diario' | 'semanal' | 'quincenal' | 'mensual';

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta';

export type TipoTransaccion = 'ingreso' | 'gasto';

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';

// ============================================
// USUARIO
// ============================================
export interface Usuario {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
  telefono?: string;
  fechaCreacion: string;
}

// ============================================
// CLIENTE
// ============================================
export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  documento: string; // Cédula o identificación
  email?: string;
  fechaRegistro: string;
  activo: boolean;
}

// ============================================
// PRÉSTAMO
// ============================================
export interface Prestamo {
  id: string;
  clienteId: string;
  monto: number;
  tasa: number; // Tasa de interés anual en porcentaje
  plazo: number; // Número de cuotas
  tipoCuota: TipoCuota;
  fechaConcesion: string;
  fechaPrimerCobro: string;
  fechaUltimoPago?: string;
  estado: EstadoPrestamo;
  observaciones?: string;
  creadoPor: string; // userId del admin que creó
  fechaCreacion: string;
}

// ============================================
// CUOTA (TABLA DE AMORTIZACIÓN)
// ============================================
export interface Cuota {
  id: string;
  prestamoId: string;
  numeroCuota: number;
  fechaVencimiento: string;
  saldoInicial: number; // Saldo del préstamo antes del pago
  interes: number; // Interés de la cuota
  capitalAmortizado: number; // Capital que se amortiza
  valorCuota: number; // Pago total de la cuota
  saldoFinal: number; // Saldo después del pago
  estado: EstadoCuota;
  montoPagado: number; // Monto realmente pagado (puede ser parcial)
}

// ============================================
// PAGO
// ============================================
export interface Pago {
  id: string;
  prestamoId: string;
  cuotaId: string;
  numeroCuota: number;
  fechaPago: string;
  valorCuota: number; // Valor que debía pagarse
  valorPagado: number; // Valor realmente pagado
  metodoPago: MetodoPago;
  comprobanteUrl?: string; // URI de la imagen del comprobante
  observaciones?: string;
  registradoPor: string; // userId
  estadoValidacion: EstadoPago; // Para validación por admin
  comentarioValidacion?: string;
  fechaValidacion?: string;
  validadoPor?: string; // userId del admin
}

// ============================================
// TRANSACCIÓN (INGRESOS Y GASTOS)
// ============================================
export interface Transaccion {
  id: string;
  tipo: TipoTransaccion;
  monto: number;
  categoria: string;
  descripcion: string;
  fecha: string;
  registradoPor: string;
}

// ============================================
// CONFIGURACIÓN
// ============================================
export interface Configuracion {
  id: string;
  clave: string;
  valor: string;
}

export interface ConfiguracionApp {
  omitirFinesSemana: boolean; // true para omitir sábado y domingo
  ajusteFechaFinSemana: 'adelantar' | 'retroceder'; // Qué hacer si cae en fin de semana
  tasaPredeterminada: number; // Tasa de interés predeterminada
  tiposCuotaDisponibles: TipoCuota[];
}

// ============================================
// NOTIFICACIÓN
// ============================================
export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'solicitud' | 'aprobacion' | 'rechazo' | 'pago' | 'validacion';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  referenceId?: string; // ID del préstamo o pago relacionado
}

// ============================================
// MÉTRICAS DASHBOARD
// ============================================
export interface MetricasDashboard {
  totalIngresos: number;
  creditosConcedidos: {
    cantidad: number;
    suma: number;
  };
  creditosPagados: number;
  creditosPendientes: number;
  proximosCobros: ProximoCobro[];
  solicitudesPendientes: Prestamo[];
}

export interface ProximoCobro {
  clienteNombre: string;
  clienteId: string;
  prestamoId: string;
  fecha: string;
  valorCuota: number;
  numeroCuota: number;
}

// ============================================
// DATOS DEMO (QUEMADOS)
// ============================================
export interface DatosDemo {
  usuarios: Usuario[];
  clientes: Cliente[];
  prestamos: Prestamo[];
  pagos: Pago[];
}
