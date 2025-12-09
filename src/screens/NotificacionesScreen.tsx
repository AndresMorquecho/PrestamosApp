// ============================================
// PANTALLA: NOTIFICACIONES (PAGOS PENDIENTES)
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { colors, spacing, typography } from '../theme';
import { formatearFecha } from '../utils/dateUtils';
import { Pago } from '../types';

export const NotificacionesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { usuario } = useAuth();
  const { pagos, prestamos, clientes, cuotas, validarPago, rechazarPago, isLoading } = useApp();
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [comentario, setComentario] = useState('');
  const [accion, setAccion] = useState<'validar' | 'rechazar' | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Filtrar pagos pendientes
  const pagosPendientes = useMemo(() => {
    return pagos
      .filter(p => p.estadoValidacion === 'pendiente')
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  }, [pagos]);

  const abrirDetallePago = (pago: Pago) => {
    setPagoSeleccionado(pago);
    setModalVisible(true);
    setComentario('');
    setAccion(null);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setPagoSeleccionado(null);
    setComentario('');
    setAccion(null);
  };

  const confirmarAccion = async () => {
    if (!pagoSeleccionado || !accion) return;

    if (accion === 'rechazar' && !comentario.trim()) {
      Alert.alert('Error', 'Debes ingresar un comentario para rechazar el pago');
      return;
    }

    setProcesando(true);
    try {
      if (accion === 'validar') {
        await validarPago(pagoSeleccionado.id, usuario!.id, comentario || 'Pago validado correctamente');
        Alert.alert('Éxito', 'Pago validado correctamente');
      } else {
        await rechazarPago(pagoSeleccionado.id, usuario!.id, comentario);
        Alert.alert('Pago Rechazado', 'Se ha notificado al usuario sobre el rechazo');
      }
      cerrarModal();
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la acción');
      console.error('Error al procesar pago:', error);
    } finally {
      setProcesando(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pagos Pendientes</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pagosPendientes.length}</Text>
          </View>
        </View>

        {/* Lista de pagos pendientes */}
        {pagosPendientes.length === 0 ? (
          <Card>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyTitle}>¡Todo al día!</Text>
              <Text style={styles.emptyText}>No hay pagos pendientes de validación</Text>
            </View>
          </Card>
        ) : (
          pagosPendientes.map((pago) => {
            const prestamo = prestamos.find(p => p.id === pago.prestamoId);
            const cliente = clientes.find(c => c.id === prestamo?.clienteId);
            const cuota = cuotas.find(c => c.id === pago.cuotaId);

            return (
              <TouchableOpacity
                key={pago.id}
                onPress={() => abrirDetallePago(pago)}
                activeOpacity={0.7}
              >
                <Card style={styles.pagoCard}>
                  <View style={styles.pagoHeader}>
                    <View style={styles.pagoInfo}>
                      <Text style={styles.clienteNombre}>{cliente?.nombre || 'Cliente'}</Text>
                      <Text style={styles.prestamoInfo}>
                        💰 Préstamo: ${prestamo?.monto.toFixed(2)} • {prestamo?.tipoCuota}
                      </Text>
                      <Text style={styles.pagoDetalle}>
                        📅 Cuota #{pago.numeroCuota} de {prestamo?.plazo} • ${pago.valorPagado.toFixed(2)}
                      </Text>
                      {cuota && (
                        <Text style={styles.cuotaDetalle}>
                          Vencimiento: {formatearFecha(cuota.fechaVencimiento)}
                        </Text>
                      )}
                      <Text style={styles.pagoFecha}>
                        Reportado: {formatearFecha(pago.fechaPago)}
                      </Text>
                    </View>
                    <View style={styles.pagoMetodo}>
                      <Text style={styles.metodoText}>
                        {pago.metodoPago === 'transferencia' ? '💳' : '💵'}
                      </Text>
                      <Text style={styles.metodoBadge}>
                        {pago.metodoPago === 'transferencia' ? 'Transf.' : 'Efectivo'}
                      </Text>
                    </View>
                  </View>
                  
                  {pago.comprobanteUrl && (
                    <View style={styles.voucherIndicator}>
                      <Text style={styles.voucherText}>📎 Voucher adjunto • Toca para validar</Text>
                    </View>
                  )}
                  
                  {pago.observaciones && (
                    <Text style={styles.observaciones} numberOfLines={2}>
                      💬 {pago.observaciones}
                    </Text>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal de detalle de pago */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {pagoSeleccionado && (() => {
                const prestamo = prestamos.find(p => p.id === pagoSeleccionado.prestamoId);
                const cliente = clientes.find(c => c.id === prestamo?.clienteId);
                const cuota = cuotas.find(c => c.id === pagoSeleccionado.cuotaId);

                return (
                  <>
                    {/* Header del modal */}
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Validación de Pago</Text>
                      <TouchableOpacity onPress={cerrarModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Información del cliente */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>👤 Cliente</Text>
                      <Text style={styles.sectionValue}>{cliente?.nombre}</Text>
                      <Text style={styles.sectionSubValue}>📞 {cliente?.telefono}</Text>
                      <Text style={styles.sectionSubValue}>🆔 {cliente?.documento}</Text>
                    </View>

                    {/* Información del préstamo */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>💰 Préstamo Asociado</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>ID Préstamo:</Text>
                        <Text style={styles.detailValue}>{prestamo?.id}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Monto Total:</Text>
                        <Text style={styles.detailValue}>${prestamo?.monto.toFixed(2)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tasa:</Text>
                        <Text style={styles.detailValue}>{prestamo?.tasa}% anual</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Plazo:</Text>
                        <Text style={styles.detailValue}>
                          {prestamo?.plazo} cuotas {prestamo?.tipoCuota}s
                        </Text>
                      </View>
                    </View>

                    {/* Información de la cuota */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>📋 Detalles de la Cuota #{pagoSeleccionado.numeroCuota}</Text>
                      {cuota && (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Fecha Vencimiento:</Text>
                            <Text style={styles.detailValue}>{formatearFecha(cuota.fechaVencimiento)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Capital:</Text>
                            <Text style={styles.detailValue}>${cuota.capitalAmortizado.toFixed(2)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Interés:</Text>
                            <Text style={styles.detailValue}>${cuota.interes.toFixed(2)}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Saldo Restante:</Text>
                            <Text style={styles.detailValue}>${cuota.saldoFinal.toFixed(2)}</Text>
                          </View>
                        </>
                      )}
                      <View style={styles.divider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Valor Cuota:</Text>
                        <Text style={[styles.detailValue, { fontWeight: 'bold', fontSize: 16 }]}>
                          ${pagoSeleccionado.valorCuota.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Valor Pagado:</Text>
                        <Text style={[
                          styles.detailValue,
                          { fontWeight: 'bold', fontSize: 16 },
                          pagoSeleccionado.valorPagado < pagoSeleccionado.valorCuota && styles.valorParcial
                        ]}>
                          ${pagoSeleccionado.valorPagado.toFixed(2)}
                        </Text>
                      </View>
                      {pagoSeleccionado.valorPagado < pagoSeleccionado.valorCuota && (
                        <View style={[styles.detailRow, styles.alertRow]}>
                          <Text style={styles.detailLabel}>⚠️ Faltante:</Text>
                          <Text style={[styles.detailValue, styles.valorFaltante, { fontWeight: 'bold' }]}>
                            ${(pagoSeleccionado.valorCuota - pagoSeleccionado.valorPagado).toFixed(2)}
                          </Text>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Método de Pago:</Text>
                        <Text style={styles.detailValue}>
                          {pagoSeleccionado.metodoPago === 'transferencia' ? '💳 Transferencia' : 
                           pagoSeleccionado.metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha del Pago:</Text>
                        <Text style={styles.detailValue}>
                          {formatearFecha(pagoSeleccionado.fechaPago)}
                        </Text>
                      </View>
                    </View>

                    {/* Voucher/Comprobante */}
                    {pagoSeleccionado.comprobanteUrl && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Comprobante</Text>
                        <Image
                          source={{ uri: pagoSeleccionado.comprobanteUrl }}
                          style={styles.voucherImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}

                    {/* Observaciones del cliente */}
                    {pagoSeleccionado.observaciones && (
                      <View style={styles.modalSection}>
                        <Text style={styles.sectionLabel}>Observaciones</Text>
                        <Text style={styles.sectionValue}>{pagoSeleccionado.observaciones}</Text>
                      </View>
                    )}

                    {/* Campo de comentario */}
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>
                        Comentario {accion === 'rechazar' && <Text style={styles.required}>*</Text>}
                      </Text>
                      <TextInput
                        style={styles.comentarioInput}
                        placeholder={
                          accion === 'rechazar'
                            ? 'Indica el motivo del rechazo...'
                            : 'Comentario opcional...'
                        }
                        value={comentario}
                        onChangeText={setComentario}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.modalActions}>
                      {accion === null ? (
                        <>
                          <Button
                            title="✓ Validar Pago"
                            onPress={() => setAccion('validar')}
                            style={styles.actionButton}
                            variant="primary"
                          />
                          <Button
                            title="✕ Rechazar Pago"
                            onPress={() => setAccion('rechazar')}
                            style={styles.actionButton}
                            variant="outline"
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            title={accion === 'validar' ? 'Confirmar Validación' : 'Confirmar Rechazo'}
                            onPress={confirmarAccion}
                            loading={procesando}
                            style={styles.actionButton}
                            variant={accion === 'validar' ? 'primary' : 'outline'}
                          />
                          <Button
                            title="Cancelar"
                            onPress={() => {
                              setAccion(null);
                              setComentario('');
                            }}
                            style={styles.actionButton}
                            variant="text"
                          />
                        </>
                      )}
                    </View>
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pagoCard: {
    marginBottom: spacing.md,
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pagoInfo: {
    flex: 1,
  },
  clienteNombre: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  prestamoInfo: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  pagoDetalle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cuotaDetalle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  pagoFecha: {
    ...typography.caption,
    color: colors.textLight,
  },
  pagoMetodo: {
    alignItems: 'center',
  },
  metodoText: {
    fontSize: 24,
    marginBottom: 4,
  },
  metodoBadge: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  voucherIndicator: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  voucherText: {
    ...typography.caption,
    color: colors.primary,
  },
  observaciones: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.h5,
    color: colors.textSecondary,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sectionValue: {
    ...typography.h5,
    color: colors.text,
  },
  sectionSubValue: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  valorParcial: {
    color: colors.warning,
  },
  valorFaltante: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  alertRow: {
    backgroundColor: colors.error + '10',
    padding: spacing.xs,
    borderRadius: 4,
    marginVertical: spacing.xs,
  },
  voucherImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  required: {
    color: colors.error,
  },
  comentarioInput: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    minHeight: 80,
    color: colors.text,
  },
  modalActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});
