// ============================================
// PANTALLA: COBROS (REGISTRAR PAGOS)
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { colors, spacing, typography } from '../theme';
import { formatearFecha } from '../utils/dateUtils';
import { Pago } from '../types';

type TipoPago = 'cuota_completa' | 'capital' | 'capital_interes';

export const CobrosScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { usuario } = useAuth();
  const { prestamos, clientes, cuotas, pagos, agregarPago, isLoading } = useApp();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<string | null>(null);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<string | null>(null);
  const [tipoPago, setTipoPago] = useState<TipoPago>('cuota_completa');
  const [valorPago, setValorPago] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'tarjeta'>('transferencia');
  const [observaciones, setObservaciones] = useState('');
  const [imagenVoucher, setImagenVoucher] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Filtrar préstamos activos
  const prestamosActivos = useMemo(() => {
    return prestamos.filter(p => p.estado === 'activo');
  }, [prestamos]);

  // Mis pagos enviados
  const misPagos = useMemo(() => {
    return pagos
      .filter(p => p.registradoPor === usuario?.id)
      .sort((a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime());
  }, [pagos, usuario]);

  const abrirModalPago = () => {
    setModalVisible(true);
    resetearFormulario();
  };

  const cerrarModal = () => {
    setModalVisible(false);
    resetearFormulario();
  };

  const resetearFormulario = () => {
    setPrestamoSeleccionado(null);
    setCuotaSeleccionada(null);
    setTipoPago('cuota_completa');
    setValorPago('');
    setMetodoPago('transferencia');
    setObservaciones('');
    setImagenVoucher(null);
  };

  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar el comprobante');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImagenVoucher(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const cuotasDisponibles = useMemo(() => {
    if (!prestamoSeleccionado) return [];
    return cuotas
      .filter(c => c.prestamoId === prestamoSeleccionado && c.estado === 'pendiente')
      .sort((a, b) => a.numeroCuota - b.numeroCuota);
  }, [prestamoSeleccionado, cuotas]);

  const calcularValorSugerido = () => {
    if (!cuotaSeleccionada) return 0;
    const cuota = cuotas.find(c => c.id === cuotaSeleccionada);
    if (!cuota) return 0;

    switch (tipoPago) {
      case 'cuota_completa':
        return cuota.valorCuota;
      case 'capital':
        return cuota.capitalAmortizado;
      case 'capital_interes':
        return cuota.valorCuota;
      default:
        return 0;
    }
  };

  const enviarPago = async () => {
    // Validaciones
    if (!prestamoSeleccionado) {
      Alert.alert('Error', 'Selecciona un préstamo');
      return;
    }

    if (!cuotaSeleccionada) {
      Alert.alert('Error', 'Selecciona una cuota');
      return;
    }

    const valor = parseFloat(valorPago);
    if (isNaN(valor) || valor <= 0) {
      Alert.alert('Error', 'Ingresa un valor válido');
      return;
    }

    if (!imagenVoucher) {
      Alert.alert('Error', 'Debes adjuntar el comprobante de pago');
      return;
    }

    try {
      setEnviando(true);

      const cuota = cuotas.find(c => c.id === cuotaSeleccionada);
      if (!cuota) throw new Error('Cuota no encontrada');

      const nuevoPago: Pago = {
        id: `P${Date.now()}`,
        prestamoId: prestamoSeleccionado,
        cuotaId: cuotaSeleccionada,
        numeroCuota: cuota.numeroCuota,
        fechaPago: new Date().toISOString(),
        valorCuota: cuota.valorCuota,
        valorPagado: valor,
        metodoPago: metodoPago,
        comprobanteUrl: imagenVoucher,
        observaciones: observaciones || `Pago ${tipoPago === 'cuota_completa' ? 'cuota completa' : tipoPago === 'capital' ? 'solo capital' : 'capital + interés'}`,
        registradoPor: usuario!.id,
        estadoValidacion: 'pendiente',
      };

      await agregarPago(nuevoPago);

      Alert.alert(
        '✅ Pago Enviado',
        'Tu pago ha sido enviado y está esperando validación del administrador.',
        [{ text: 'OK', onPress: cerrarModal }]
      );
    } catch (error) {
      console.error('Error al enviar pago:', error);
      Alert.alert('Error', 'No se pudo enviar el pago');
    } finally {
      setEnviando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return colors.success;
      case 'rechazado': return colors.error;
      case 'pendiente': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'aprobado': return '✓ Aprobado';
      case 'rechazado': return '✕ Rechazado';
      case 'pendiente': return '⏳ Esperando validación';
      default: return estado;
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
          <Text style={styles.title}>Registrar Pago</Text>
          <Button
            title="+ Nuevo Pago"
            onPress={abrirModalPago}
            style={styles.nuevoPagoBtn}
          />
        </View>

        {/* Historial de pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Pagos Enviados</Text>
          
          {misPagos.length > 0 ? (
            misPagos.map(pago => {
              const prestamo = prestamos.find(p => p.id === pago.prestamoId);
              const cliente = clientes.find(c => c.id === prestamo?.clienteId);

              return (
                <Card key={pago.id} style={styles.pagoCard}>
                  <View style={styles.pagoHeader}>
                    <View style={styles.pagoInfo}>
                      <Text style={styles.pagoCliente}>{cliente?.nombre}</Text>
                      <Text style={styles.pagoDetalle}>
                        Cuota #{pago.numeroCuota} • ${pago.valorPagado.toFixed(2)}
                      </Text>
                      <Text style={styles.pagoFecha}>
                        {formatearFecha(pago.fechaPago)}
                      </Text>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pago.estadoValidacion) + '20' }]}>
                      <Text style={[styles.estadoText, { color: getEstadoColor(pago.estadoValidacion) }]}>
                        {getEstadoTexto(pago.estadoValidacion)}
                      </Text>
                    </View>
                  </View>

                  {pago.estadoValidacion === 'rechazado' && pago.comentarioValidacion && (
                    <View style={styles.comentarioRechazo}>
                      <Text style={styles.comentarioLabel}>Motivo del rechazo:</Text>
                      <Text style={styles.comentarioTexto}>{pago.comentarioValidacion}</Text>
                    </View>
                  )}

                  {pago.comprobanteUrl && (
                    <TouchableOpacity onPress={() => Alert.alert('Voucher', pago.comprobanteUrl)}>
                      <Text style={styles.verVoucher}>📎 Ver comprobante</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              );
            })
          ) : (
            <Card>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💳</Text>
                <Text style={styles.emptyText}>No has registrado pagos aún</Text>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Modal de registro de pago */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Registrar Nuevo Pago</Text>
                <TouchableOpacity onPress={cerrarModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Seleccionar Préstamo */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>1. Selecciona el Préstamo</Text>
                {prestamosActivos.map(prestamo => {
                  const cliente = clientes.find(c => c.id === prestamo.clienteId);
                  const isSelected = prestamoSeleccionado === prestamo.id;

                  return (
                    <TouchableOpacity
                      key={prestamo.id}
                      onPress={() => {
                        setPrestamoSeleccionado(prestamo.id);
                        setCuotaSeleccionada(null);
                      }}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>{cliente?.nombre}</Text>
                        <Text style={styles.optionSubtitle}>
                          ${prestamo.monto.toFixed(2)} • {prestamo.plazo} cuotas {prestamo.tipoCuota}s
                        </Text>
                      </View>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seleccionar Cuota */}
              {prestamoSeleccionado && (
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>2. Selecciona la Cuota a Pagar</Text>
                  {cuotasDisponibles.length > 0 ? (
                    cuotasDisponibles.slice(0, 5).map(cuota => {
                      const isSelected = cuotaSeleccionada === cuota.id;

                      return (
                        <TouchableOpacity
                          key={cuota.id}
                          onPress={() => {
                            setCuotaSeleccionada(cuota.id);
                            setValorPago(cuota.valorCuota.toFixed(2));
                          }}
                          style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                        >
                          <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Cuota #{cuota.numeroCuota}</Text>
                            <Text style={styles.optionSubtitle}>
                              Vence: {formatearFecha(cuota.fechaVencimiento)} • ${cuota.valorCuota.toFixed(2)}
                            </Text>
                          </View>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={styles.noCuotas}>No hay cuotas pendientes</Text>
                  )}
                </View>
              )}

              {/* Tipo de Pago */}
              {cuotaSeleccionada && (
                <>
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>3. Tipo de Pago</Text>
                    
                    <TouchableOpacity
                      onPress={() => {
                        setTipoPago('cuota_completa');
                        setValorPago(calcularValorSugerido().toFixed(2));
                      }}
                      style={[styles.optionCard, tipoPago === 'cuota_completa' && styles.optionCardSelected]}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Cuota Completa</Text>
                        <Text style={styles.optionSubtitle}>Capital + Intereses</Text>
                      </View>
                      {tipoPago === 'cuota_completa' && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setTipoPago('capital');
                        const cuota = cuotas.find(c => c.id === cuotaSeleccionada);
                        setValorPago(cuota?.capitalAmortizado.toFixed(2) || '');
                      }}
                      style={[styles.optionCard, tipoPago === 'capital' && styles.optionCardSelected]}
                    >
                      <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Solo Capital</Text>
                        <Text style={styles.optionSubtitle}>Sin intereses</Text>
                      </View>
                      {tipoPago === 'capital' && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  </View>

                  {/* Valor a Pagar */}
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>4. Valor a Pagar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={valorPago}
                      onChangeText={setValorPago}
                    />
                    <Text style={styles.valorSugerido}>
                      Valor sugerido: ${calcularValorSugerido().toFixed(2)}
                    </Text>
                  </View>

                  {/* Método de Pago */}
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>5. Método de Pago</Text>
                    <View style={styles.metodosGrid}>
                      <TouchableOpacity
                        onPress={() => setMetodoPago('transferencia')}
                        style={[styles.metodoCard, metodoPago === 'transferencia' && styles.metodoCardSelected]}
                      >
                        <Text style={styles.metodoIcon}>💳</Text>
                        <Text style={styles.metodoText}>Transferencia</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setMetodoPago('efectivo')}
                        style={[styles.metodoCard, metodoPago === 'efectivo' && styles.metodoCardSelected]}
                      >
                        <Text style={styles.metodoIcon}>💵</Text>
                        <Text style={styles.metodoText}>Efectivo</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setMetodoPago('tarjeta')}
                        style={[styles.metodoCard, metodoPago === 'tarjeta' && styles.metodoCardSelected]}
                      >
                        <Text style={styles.metodoIcon}>💳</Text>
                        <Text style={styles.metodoText}>Tarjeta</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Comprobante */}
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>6. Comprobante de Pago *</Text>
                    {imagenVoucher ? (
                      <View style={styles.imagenContainer}>
                        <Image source={{ uri: imagenVoucher }} style={styles.imagenPreview} />
                        <Button
                          title="Cambiar imagen"
                          onPress={seleccionarImagen}
                          variant="outline"
                          style={styles.cambiarImagenBtn}
                        />
                      </View>
                    ) : (
                      <Button
                        title="📷 Adjuntar Comprobante"
                        onPress={seleccionarImagen}
                        variant="outline"
                      />
                    )}
                  </View>

                  {/* Observaciones */}
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>7. Observaciones (opcional)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Comentarios adicionales..."
                      multiline
                      numberOfLines={3}
                      value={observaciones}
                      onChangeText={setObservaciones}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Botones */}
                  <View style={styles.modalActions}>
                    <Button
                      title="Enviar Pago"
                      onPress={enviarPago}
                      loading={enviando}
                      disabled={!imagenVoucher || !valorPago}
                    />
                    <Button
                      title="Cancelar"
                      onPress={cerrarModal}
                      variant="outline"
                      style={styles.cancelBtn}
                    />
                  </View>
                </>
              )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  nuevoPagoBtn: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  pagoCard: {
    marginBottom: spacing.sm,
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pagoInfo: {
    flex: 1,
  },
  pagoCliente: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pagoDetalle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pagoFecha: {
    ...typography.caption,
    color: colors.textLight,
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  estadoText: {
    ...typography.caption,
    fontWeight: '600',
  },
  comentarioRechazo: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  comentarioLabel: {
    ...typography.caption,
    color: colors.error,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comentarioTexto: {
    ...typography.bodySmall,
    color: colors.text,
  },
  verVoucher: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
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
  formSection: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    ...typography.h5,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  noCuotas: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
  },
  valorSugerido: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  metodosGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metodoCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  metodoCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  metodoIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  metodoText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  imagenContainer: {
    alignItems: 'center',
  },
  imagenPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  cambiarImagenBtn: {
    width: '100%',
  },
  modalActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelBtn: {
    marginTop: spacing.xs,
  },
});
