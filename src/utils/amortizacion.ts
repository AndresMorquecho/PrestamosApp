// ============================================
// UTILIDADES DE AMORTIZACIÓN
// ============================================

import { Cuota, TipoCuota } from '../types';
import { calcularFechaCuota, stringAFecha } from './dateUtils';

/**
 * Convierte la tasa anual a tasa periódica según el tipo de cuota
 * @param tasaAnual - Tasa de interés anual en porcentaje (ej: 5 para 5%)
 * @param tipoCuota - Tipo de periodicidad
 * @returns Tasa periódica como decimal
 */
export const calcularTasaPeriodica = (tasaAnual: number, tipoCuota: TipoCuota): number => {
  const tasaAnualDecimal = tasaAnual / 100;

  switch (tipoCuota) {
    case 'diario':
      return tasaAnualDecimal / 365;
    case 'semanal':
      return tasaAnualDecimal / 52;
    case 'quincenal':
      return tasaAnualDecimal / 26;
    case 'mensual':
      return tasaAnualDecimal / 12;
    default:
      return tasaAnualDecimal / 12;
  }
};

/**
 * Calcula el valor de la cuota fija usando el sistema francés (amortización constante)
 * Fórmula: C = P * [i * (1+i)^n] / [(1+i)^n - 1]
 * Donde:
 * - C = Cuota
 * - P = Principal (monto del préstamo)
 * - i = Tasa de interés periódica
 * - n = Número de períodos
 */
export const calcularCuotaFija = (
  monto: number,
  tasaPeriodica: number,
  numeroCuotas: number
): number => {
  if (tasaPeriodica === 0) {
    // Si no hay interés, solo dividir el monto
    return monto / numeroCuotas;
  }

  const factorPotencia = Math.pow(1 + tasaPeriodica, numeroCuotas);
  const cuota = monto * (tasaPeriodica * factorPotencia) / (factorPotencia - 1);

  return Math.round(cuota * 100) / 100; // Redondear a 2 decimales
};

/**
 * Genera la tabla de amortización completa usando sistema francés
 * Sistema Francés: Cuota fija, donde cada pago incluye intereses sobre el saldo
 * y amortización del capital. Al inicio se pagan más intereses, al final más capital.
 * 
 * @param prestamoId - ID del préstamo
 * @param monto - Monto del préstamo
 * @param tasaAnual - Tasa de interés anual en porcentaje
 * @param plazo - Número de cuotas
 * @param tipoCuota - Tipo de periodicidad
 * @param fechaPrimerCobro - Fecha de la primera cuota
 * @param omitirFinesSemana - Si debe omitir fines de semana
 * @param ajuste - Cómo ajustar fechas en fin de semana
 */
export const generarTablaAmortizacion = (
  prestamoId: string,
  monto: number,
  tasaAnual: number,
  plazo: number,
  tipoCuota: TipoCuota,
  fechaPrimerCobro: string,
  omitirFinesSemana: boolean = false,
  ajuste: 'adelantar' | 'retroceder' = 'adelantar'
): Cuota[] => {
  const cuotas: Cuota[] = [];
  const tasaPeriodica = calcularTasaPeriodica(tasaAnual, tipoCuota);
  const valorCuotaFija = calcularCuotaFija(monto, tasaPeriodica, plazo);
  
  let saldoActual = monto;
  const fechaInicio = stringAFecha(fechaPrimerCobro);

  for (let i = 0; i < plazo; i++) {
    // Calcular interés sobre el saldo actual
    const interes = Math.round(saldoActual * tasaPeriodica * 100) / 100;
    
    // Calcular capital amortizado
    let capitalAmortizado = valorCuotaFija - interes;
    
    // Ajuste para la última cuota (evitar saldo negativo por redondeos)
    if (i === plazo - 1) {
      capitalAmortizado = saldoActual;
    }
    
    // Valor final de la cuota (puede variar en la última por redondeos)
    const valorCuota = interes + capitalAmortizado;
    
    // Calcular nuevo saldo
    const nuevoSaldo = Math.max(0, saldoActual - capitalAmortizado);
    
    // Calcular fecha de vencimiento
    const fechaVencimiento = calcularFechaCuota(
      fechaInicio,
      tipoCuota,
      i,
      omitirFinesSemana,
      ajuste
    );

    cuotas.push({
      id: `${prestamoId}-cuota-${i + 1}`,
      prestamoId,
      numeroCuota: i + 1,
      fechaVencimiento: fechaVencimiento.toISOString(),
      saldoInicial: Math.round(saldoActual * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      capitalAmortizado: Math.round(capitalAmortizado * 100) / 100,
      valorCuota: Math.round(valorCuota * 100) / 100,
      saldoFinal: Math.round(nuevoSaldo * 100) / 100,
      estado: 'pendiente',
      montoPagado: 0,
    });

    saldoActual = nuevoSaldo;
  }

  return cuotas;
};

/**
 * Calcula el total a pagar (suma de todas las cuotas)
 */
export const calcularTotalAPagar = (cuotas: Cuota[]): number => {
  return cuotas.reduce((total, cuota) => total + cuota.valorCuota, 0);
};

/**
 * Calcula el total de intereses a pagar
 */
export const calcularTotalIntereses = (cuotas: Cuota[]): number => {
  return cuotas.reduce((total, cuota) => total + cuota.interes, 0);
};

/**
 * Calcula el saldo pendiente de un préstamo
 */
export const calcularSaldoPendiente = (cuotas: Cuota[]): number => {
  const ultimaCuotaPendiente = cuotas.find(c => c.estado === 'pendiente' || c.estado === 'parcial');
  return ultimaCuotaPendiente ? ultimaCuotaPendiente.saldoInicial : 0;
};

/**
 * Calcula el progreso de pago del préstamo (porcentaje)
 */
export const calcularProgresoPago = (cuotas: Cuota[]): number => {
  const totalCuotas = cuotas.length;
  const cuotasPagadas = cuotas.filter(c => c.estado === 'pagado').length;
  return Math.round((cuotasPagadas / totalCuotas) * 100);
};

/**
 * Obtiene la próxima cuota a pagar
 */
export const obtenerProximaCuota = (cuotas: Cuota[]): Cuota | undefined => {
  return cuotas.find(c => c.estado === 'pendiente' || c.estado === 'parcial');
};
