// ============================================
// PANTALLA: DETALLE DEL PRÉSTAMO
// ============================================

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { colors, spacing, typography } from '../theme';
import { formatearFecha } from '../utils/dateUtils';
import { Cuota, EstadoCuota } from '../types';

export const DetallePrestamoScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { prestamoId } = route.params;
  const { usuario } = useAuth();
  const { prestamos, clientes, cuotas, pagos, isLoading } = useApp();
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const prestamo = prestamos.find(p => p.id === prestamoId);
  const cliente = prestamo ? clientes.find(c => c.id === prestamo.clienteId) : null;

  const cuotasPrestamo = useMemo(() => {
    if (!prestamo) return [];
    return cuotas
      .filter(c => c.prestamoId === prestamo.id)
      .sort((a, b) => a.numeroCuota - b.numeroCuota);
  }, [cuotas, prestamo]);

  const estadisticas = useMemo(() => {
    if (!prestamo) return null;

    const totalPagado = cuotasPrestamo
      .filter(c => c.estado === 'pagado')
      .reduce((sum, c) => sum + c.valorCuota, 0);

    const totalPendiente = cuotasPrestamo
      .filter(c => c.estado !== 'pagado')
      .reduce((sum, c) => sum + c.valorCuota, 0);

    const cuotasPagadas = cuotasPrestamo.filter(c => c.estado === 'pagado').length;
    const cuotasPendientes = cuotasPrestamo.filter(c => c.estado === 'pendiente').length;
    const cuotasVencidas = cuotasPrestamo.filter(c => c.estado === 'vencido').length;

    const progreso = cuotasPrestamo.length > 0 ? (cuotasPagadas / cuotasPrestamo.length) * 100 : 0;

    const totalInteres = cuotasPrestamo.reduce((sum, c) => sum + c.interes, 0);
    const totalCapital = cuotasPrestamo.reduce((sum, c) => sum + c.capitalAmortizado, 0);
    const totalPagar = cuotasPrestamo.reduce((sum, c) => sum + c.valorCuota, 0);

    return {
      totalPagado,
      totalPendiente,
      cuotasPagadas,
      cuotasPendientes,
      cuotasVencidas,
      progreso,
      totalInteres,
      totalCapital,
      totalPagar,
    };
  }, [cuotasPrestamo, prestamo]);

  const getEstadoColor = (estado: EstadoCuota) => {
    switch (estado) {
      case 'pagado': return colors.success;
      case 'pendiente': return colors.warning;
      case 'parcial': return colors.secondary;
      case 'vencido': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getEstadoTexto = (estado: EstadoCuota) => {
    switch (estado) {
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente';
      case 'parcial': return 'Parcial';
      case 'vencido': return 'Vencido';
      default: return estado;
    }
  };

  const generarHTML = () => {
    if (!prestamo || !cliente) return '';

    const filasTabla = cuotasPrestamo
      .map(
        cuota => `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 8px; text-align: center;">${cuota.numeroCuota}</td>
          <td style="padding: 12px 8px; text-align: center;">${formatearFecha(cuota.fechaVencimiento)}</td>
          <td style="padding: 12px 8px; text-align: right;">$${cuota.saldoInicial.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right;">$${cuota.interes.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right;">$${cuota.capitalAmortizado.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold;">$${cuota.valorCuota.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: right;">$${cuota.saldoFinal.toFixed(2)}</td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: bold;
              background-color: ${cuota.estado === 'pagado' ? '#e8f5e9' : '#fff3e0'};
              color: ${cuota.estado === 'pagado' ? '#2e7d32' : '#f57c00'};
            ">
              ${getEstadoTexto(cuota.estado)}
            </span>
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tabla de Amortización - ${cliente.nombre}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              padding: 20px;
              color: #333;
              font-size: 13px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #6366f1;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #6366f1;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header h2 {
              color: #666;
              font-size: 18px;
              font-weight: normal;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
            }
            .info-box {
              flex: 1;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              margin: 0 5px;
            }
            .info-box h3 {
              color: #6366f1;
              font-size: 14px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #666;
              font-weight: 500;
            }
            .info-value {
              color: #333;
              font-weight: bold;
            }
            .resumen {
              background: #e8eaf6;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-around;
            }
            .resumen-item {
              text-align: center;
            }
            .resumen-label {
              color: #666;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .resumen-value {
              color: #6366f1;
              font-size: 18px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            thead {
              background: #6366f1;
              color: white;
            }
            th {
              padding: 12px 8px;
              text-align: center;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            tbody tr:nth-child(even) {
              background: #f8f9fa;
            }
            tbody tr:hover {
              background: #e8eaf6;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #999;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 TABLA DE AMORTIZACIÓN</h1>
            <h2>Préstamo #${prestamo.id}</h2>
          </div>

          <div class="info-section">
            <div class="info-box">
              <h3>📋 Datos del Cliente</h3>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${cliente.nombre}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Documento:</span>
                <span class="info-value">${cliente.documento}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Teléfono:</span>
                <span class="info-value">${cliente.telefono}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${cliente.email || 'N/A'}</span>
              </div>
            </div>

            <div class="info-box">
              <h3>💵 Datos del Préstamo</h3>
              <div class="info-row">
                <span class="info-label">Monto:</span>
                <span class="info-value">$${prestamo.monto.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tasa:</span>
                <span class="info-value">${prestamo.tasa}% anual</span>
              </div>
              <div class="info-row">
                <span class="info-label">Plazo:</span>
                <span class="info-value">${prestamo.plazo} cuotas ${prestamo.tipoCuota}s</span>
              </div>
              <div class="info-row">
                <span class="info-label">Fecha Concesión:</span>
                <span class="info-value">${formatearFecha(prestamo.fechaConcesion)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Primer Cobro:</span>
                <span class="info-value">${formatearFecha(prestamo.fechaPrimerCobro)}</span>
              </div>
            </div>
          </div>

          <div class="resumen">
            <div class="resumen-item">
              <div class="resumen-label">Capital</div>
              <div class="resumen-value">$${estadisticas?.totalCapital.toFixed(2)}</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Intereses</div>
              <div class="resumen-value">$${estadisticas?.totalInteres.toFixed(2)}</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Total a Pagar</div>
              <div class="resumen-value">$${estadisticas?.totalPagar.toFixed(2)}</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Pagado</div>
              <div class="resumen-value">$${estadisticas?.totalPagado.toFixed(2)}</div>
            </div>
            <div class="resumen-item">
              <div class="resumen-label">Pendiente</div>
              <div class="resumen-value">$${estadisticas?.totalPendiente.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Saldo Inicial</th>
                <th>Interés</th>
                <th>Capital</th>
                <th>Cuota</th>
                <th>Saldo Final</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${filasTabla}
            </tbody>
          </table>

          <div class="footer">
            <p>Generado el ${formatearFecha(new Date().toISOString())}</p>
            <p>PréstamosApp - Sistema de Gestión de Préstamos</p>
          </div>
        </body>
      </html>
    `;
  };

  const exportarPDF = async () => {
    try {
      setGenerandoPDF(true);
      const html = generarHTML();

      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'web') {
        const printWindow = window.open(uri);
        if (printWindow) {
          printWindow.focus();
        }
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Tabla de Amortización - ${cliente?.nombre}`,
          });
        } else {
          Alert.alert('Éxito', 'PDF generado: ' + uri);
        }
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (isLoading || !prestamo || !cliente) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Información Resumida */}
        <Card style={styles.infoCard}>
          <View style={styles.clienteHeader}>
            <View>
              <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
              <Text style={styles.clienteDoc}>{cliente.documento}</Text>
            </View>
            <View style={styles.montoContainer}>
              <Text style={styles.montoLabel}>Préstamo</Text>
              <Text style={styles.montoValue}>${prestamo.monto.toFixed(2)}</Text>
            </View>
          </View>
        </Card>

        {/* Progreso */}
        <Card style={styles.section}>
          <View style={styles.progresoResumen}>
            <View style={styles.progresoCol}>
              <Text style={styles.progresoLabel}>Pagado</Text>
              <Text style={[styles.progresoValue, { color: colors.success }]}>
                ${estadisticas?.totalPagado.toFixed(2)}
              </Text>
            </View>
            <View style={styles.progresoCol}>
              <Text style={styles.progresoLabel}>Pendiente</Text>
              <Text style={[styles.progresoValue, { color: colors.warning }]}>
                ${estadisticas?.totalPendiente.toFixed(2)}
              </Text>
            </View>
            <View style={styles.progresoCol}>
              <Text style={styles.progresoLabel}>Progreso</Text>
              <Text style={[styles.progresoValue, { color: colors.primary }]}>
                {estadisticas?.progreso.toFixed(0)}%
              </Text>
            </View>
          </View>
          <View style={styles.progresoBarContainer}>
            <View style={styles.progresoBar}>
              <View 
                style={[
                  styles.progresoFill, 
                  { width: `${estadisticas?.progreso || 0}%` as any }
                ]} 
              />
            </View>
            <Text style={styles.progresoText}>
              {estadisticas?.cuotasPagadas} de {cuotasPrestamo.length} cuotas
            </Text>
          </View>
        </Card>

        {/* Botón Exportar */}
        <Button
          title="📄 Exportar PDF"
          onPress={exportarPDF}
          loading={generandoPDF}
          style={styles.exportButton}
        />

        {/* Tabla de Amortización */}
        <Card style={styles.tableCard}>
          <View style={styles.tableHeaderContainer}>
            <Text style={styles.tableTitle}>Tabla de Amortización</Text>
            <View style={styles.tableBadge}>
              <Text style={styles.tableBadgeText}>{cuotasPrestamo.length} cuotas</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={styles.tableScrollHorizontal}
          >
            <View>
              {/* Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, { width: 50 }]}>
                  <Text style={styles.tableHeaderText}>#</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 90 }]}>
                  <Text style={styles.tableHeaderText}>Fecha</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 85 }]}>
                  <Text style={styles.tableHeaderText}>Cuota</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 80 }]}>
                  <Text style={styles.tableHeaderText}>Capital</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 75 }]}>
                  <Text style={styles.tableHeaderText}>Interés</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 85 }]}>
                  <Text style={styles.tableHeaderText}>Saldo</Text>
                </View>
                <View style={[styles.tableHeaderCell, { width: 70 }]}>
                  <Text style={styles.tableHeaderText}>Estado</Text>
                </View>
              </View>

              {/* Filas */}
              {cuotasPrestamo.map((cuota, index) => (
                <View
                  key={cuota.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 && styles.tableRowEven,
                  ]}
                >
                  <View style={[styles.tableCell, { width: 50 }]}>
                    <Text style={styles.tableCellText}>{cuota.numeroCuota}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: 90 }]}>
                    <Text style={[styles.tableCellText, { fontSize: 10 }]}>
                      {formatearFecha(cuota.fechaVencimiento).substring(0, 10)}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 85 }]}>
                    <Text style={[styles.tableCellText, styles.tableCellBold]}>
                      ${cuota.valorCuota.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 80 }]}>
                    <Text style={styles.tableCellText}>
                      ${cuota.capitalAmortizado.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 75 }]}>
                    <Text style={styles.tableCellText}>
                      ${cuota.interes.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 85 }]}>
                    <Text style={styles.tableCellText}>
                      ${cuota.saldoFinal.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 70 }]}>
                    <View
                      style={[
                        styles.estadoChip,
                        { backgroundColor: getEstadoColor(cuota.estado) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.estadoChipText,
                          { color: getEstadoColor(cuota.estado) },
                        ]}
                      >
                        {cuota.estado === 'pagado' ? '✓' : '○'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.tableFooter}>
            <Text style={styles.tableFooterText}>
              ← Desliza horizontalmente para ver más →
            </Text>
          </View>
        </Card>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clienteNombre: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  clienteDoc: {
    ...typography.body,
    color: colors.textSecondary,
  },
  montoContainer: {
    alignItems: 'flex-end',
  },
  montoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  montoValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.md,
  },
  progresoResumen: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  progresoCol: {
    alignItems: 'center',
  },
  progresoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progresoValue: {
    ...typography.h5,
    fontWeight: 'bold',
  },
  progresoBarContainer: {
    marginTop: spacing.sm,
  },
  progresoBar: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progresoFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progresoText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  exportButton: {
    marginBottom: spacing.md,
  },
  tableCard: {
    marginBottom: spacing.md,
    padding: 0,
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableTitle: {
    ...typography.h5,
    color: colors.text,
    fontWeight: 'bold',
  },
  tableBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tableBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  tableScrollHorizontal: {
    maxHeight: 500,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
  },
  tableHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tableHeaderText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    minHeight: 44,
  },
  tableRowEven: {
    backgroundColor: colors.background,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: 4,
  },
  tableCellText: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  tableCellBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  estadoChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoChipText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableFooter: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  tableFooterText: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
  },
});
