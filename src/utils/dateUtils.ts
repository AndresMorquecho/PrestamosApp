// ============================================
// UTILIDADES DE MANEJO DE FECHAS
// ============================================

import { addDays, addWeeks, addMonths, format, isWeekend, isSaturday, isSunday } from 'date-fns';
import { es } from 'date-fns/locale';
import { TipoCuota } from '../types';

/**
 * Formatea una fecha a string legible
 */
export const formatearFecha = (fecha: Date | string, formato: string = 'dd/MM/yyyy'): string => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return format(fechaObj, formato, { locale: es });
};

/**
 * Obtiene la fecha actual en formato ISO
 */
export const obtenerFechaActual = (): string => {
  return new Date().toISOString();
};

/**
 * Convierte string ISO a Date
 */
export const stringAFecha = (fechaStr: string): Date => {
  return new Date(fechaStr);
};

/**
 * Ajusta una fecha si cae en fin de semana según configuración
 * @param fecha - Fecha a ajustar
 * @param omitirFinesSemana - Si debe omitir fines de semana
 * @param ajuste - 'adelantar' para mover al lunes, 'retroceder' para mover al viernes
 */
export const ajustarFechaFinSemana = (
  fecha: Date,
  omitirFinesSemana: boolean,
  ajuste: 'adelantar' | 'retroceder'
): Date => {
  if (!omitirFinesSemana) return fecha;

  let fechaAjustada = new Date(fecha);

  if (isSaturday(fechaAjustada)) {
    // Si es sábado
    if (ajuste === 'adelantar') {
      fechaAjustada = addDays(fechaAjustada, 2); // Mover al lunes
    } else {
      fechaAjustada = addDays(fechaAjustada, -1); // Mover al viernes
    }
  } else if (isSunday(fechaAjustada)) {
    // Si es domingo
    if (ajuste === 'adelantar') {
      fechaAjustada = addDays(fechaAjustada, 1); // Mover al lunes
    } else {
      fechaAjustada = addDays(fechaAjustada, -2); // Mover al viernes
    }
  }

  return fechaAjustada;
};

/**
 * Calcula la fecha de la próxima cuota según el tipo
 * @param fechaInicio - Fecha de inicio
 * @param tipoCuota - Tipo de periodicidad
 * @param numeroCuota - Número de cuota (0 = primera)
 * @param omitirFinesSemana - Si debe omitir fines de semana
 * @param ajuste - Cómo ajustar si cae en fin de semana
 */
export const calcularFechaCuota = (
  fechaInicio: Date,
  tipoCuota: TipoCuota,
  numeroCuota: number,
  omitirFinesSemana: boolean = false,
  ajuste: 'adelantar' | 'retroceder' = 'adelantar'
): Date => {
  let fechaCuota: Date;

  switch (tipoCuota) {
    case 'diario':
      fechaCuota = addDays(fechaInicio, numeroCuota);
      break;
    case 'semanal':
      fechaCuota = addWeeks(fechaInicio, numeroCuota);
      break;
    case 'quincenal':
      fechaCuota = addWeeks(fechaInicio, numeroCuota * 2);
      break;
    case 'mensual':
      fechaCuota = addMonths(fechaInicio, numeroCuota);
      break;
    default:
      fechaCuota = addMonths(fechaInicio, numeroCuota);
  }

  return ajustarFechaFinSemana(fechaCuota, omitirFinesSemana, ajuste);
};

/**
 * Calcula el número de días entre dos fechas
 */
export const calcularDiasEntreFechas = (fecha1: Date, fecha2: Date): number => {
  const diff = Math.abs(fecha2.getTime() - fecha1.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24));
};

/**
 * Verifica si una fecha está vencida
 */
export const estaVencida = (fechaVencimiento: string): boolean => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  return vencimiento < hoy;
};
