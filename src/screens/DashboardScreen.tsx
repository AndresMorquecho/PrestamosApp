// ============================================
// PANTALLA: DASHBOARD ADMIN
// ============================================

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { colors, spacing, typography } from '../theme';
import { formatearFecha } from '../utils/dateUtils';
import { obtenerProximaCuota, calcularSaldoPendiente } from '../utils/amortizacion';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { usuario } = useAuth();
  const { prestamos, clientes, cuotas, pagos, isLoading } = useApp();

  // Calcular métricas
  const metricas = useMemo(() => {
    const creditosActivos = prestamos.filter(p => p.estado === 'activo');
    const creditosPagados = prestamos.filter(p => p.estado === 'pagado').length;
    
    const creditosConcedidos = {
      cantidad: prestamos.length,
      suma: prestamos.reduce((sum, p) => sum + p.monto, 0),
    };

    // Total ingresos (suma de pagos aprobados)
    const totalIngresos = pagos
      .filter(p => p.estadoValidacion === 'aprobado')
      .reduce((sum, p) => sum + p.valorPagado, 0);

    // Próximos cobros
    const proximosCobros = creditosActivos
      .map(prestamo => {
        const cuotasPrestamo = cuotas.filter(c => c.prestamoId === prestamo.id);
        const proximaCuota = obtenerProximaCuota(cuotasPrestamo);
        const cliente = clientes.find(c => c.id === prestamo.clienteId);

        if (proximaCuota && cliente) {
          return {
            clienteNombre: cliente.nombre,
            clienteId: cliente.id,
            prestamoId: prestamo.id,
            fecha: proximaCuota.fechaVencimiento,
            valorCuota: proximaCuota.valorCuota,
            numeroCuota: proximaCuota.numeroCuota,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a!.fecha).getTime() - new Date(b!.fecha).getTime())
      .slice(0, 5);

    // Solicitudes pendientes
    const solicitudesPendientes = prestamos.filter(p => p.estado === 'pendiente');

    return {
      totalIngresos,
      creditosConcedidos,
      creditosPagados,
      creditosPendientes: creditosActivos.length,
      proximosCobros,
      solicitudesPendientes,
    };
  }, [prestamos, clientes, cuotas, pagos]);

  // Pagos pendientes de validación (solo admin)
  const pagosPendientes = useMemo(() => {
    if (usuario?.rol !== 'admin') return [];
    return pagos.filter(p => p.estadoValidacion === 'pendiente');
  }, [pagos, usuario]);

  if (isLoading) {
    return <Loading />;
  }

  // Si es usuario regular, mostrar solo sus préstamos
  if (usuario?.rol === 'usuario') {
    const misPrestamos = prestamos.filter(p => {
      // Aquí podrías filtrar por los préstamos del cliente asociado al usuario
      // Por ahora mostramos todos
      return true;
    });

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {usuario?.nombre?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Mis Préstamos</Text>
        </View>

        {/* Mis Préstamos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préstamos Activos</Text>
          {misPrestamos.filter(p => p.estado === 'activo').length > 0 ? (
            misPrestamos.filter(p => p.estado === 'activo').map(prestamo => {
              const cliente = clientes.find(c => c.id === prestamo.clienteId);
              const cuotasPrestamo = cuotas.filter(c => c.prestamoId === prestamo.id);
              const cuotasPendientes = cuotasPrestamo.filter(c => c.estado === 'pendiente');
              const saldoPendiente = calcularSaldoPendiente(cuotasPrestamo);

              return (
                <TouchableOpacity
                  key={prestamo.id}
                  onPress={() => navigation.navigate('DetallePrestamo', { prestamoId: prestamo.id })}
                  activeOpacity={0.7}
                >
                  <Card style={styles.prestamoCard}>
                    <View style={styles.prestamoHeader}>
                      <Text style={styles.prestamoMonto}>${prestamo.monto.toFixed(2)}</Text>
                      <Text style={styles.prestamoPlazo}>{prestamo.plazo} cuotas</Text>
                    </View>
                    <Text style={styles.prestamoCliente}>{cliente?.nombre}</Text>
                    <View style={styles.prestamoDetalles}>
                      <Text style={styles.prestamoDetalle}>
                        Cuotas pendientes: {cuotasPendientes.length}
                      </Text>
                      <Text style={styles.prestamoDetalle}>
                        Saldo: ${saldoPendiente.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.verDetalle}>Ver detalle ›</Text>
                  </Card>
                </TouchableOpacity>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tienes préstamos activos</Text>
            </Card>
          )}
        </View>

        <View style={styles.section}>
          <Button
            title="Ver todos mis préstamos"
            onPress={() => navigation.navigate('Prestamos')}
            variant="outline"
          />
        </View>
      </ScrollView>
    );
  }

  // Vista de administrador
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {usuario?.nombre?.split(' ')[0]} 👋</Text>
        <Text style={styles.subtitle}>Panel de Control</Text>
      </View>

      {/* Alerta de pagos pendientes */}
      {pagosPendientes.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Notificaciones')}
          activeOpacity={0.7}
        >
          <Card style={styles.alertCard}>
            <View style={styles.alertContent}>
              <View style={styles.alertIcon}>
                <Text style={styles.alertEmoji}>🔔</Text>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{pagosPendientes.length}</Text>
                </View>
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.alertTitle}>Pagos pendientes de validación</Text>
                <Text style={styles.alertText}>
                  Tienes {pagosPendientes.length} pago{pagosPendientes.length !== 1 ? 's' : ''} esperando tu aprobación
                </Text>
              </View>
              <Text style={styles.alertArrow}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>
      )}

      {/* Métricas */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>
            ${metricas.totalIngresos.toFixed(2)}
          </Text>
          <Text style={styles.metricLabel}>Total Ingresos</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{metricas.creditosConcedidos.cantidad}</Text>
          <Text style={styles.metricLabel}>Créditos Concedidos</Text>
          <Text style={styles.metricSubtext}>
            ${metricas.creditosConcedidos.suma.toFixed(2)}
          </Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{metricas.creditosPagados}</Text>
          <Text style={styles.metricLabel}>Créditos Pagados</Text>
        </Card>

        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{metricas.creditosPendientes}</Text>
          <Text style={styles.metricLabel}>Créditos Activos</Text>
        </Card>
      </View>

      {/* Próximos Cobros */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Cobros</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cobros')}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {metricas.proximosCobros.length > 0 ? (
          metricas.proximosCobros.map((cobro, index) => (
            <Card
              key={index}
              style={styles.cobroCard}
              onPress={() => navigation.navigate('DetallePrestamo', { prestamoId: cobro!.prestamoId })}
            >
              <View style={styles.cobroRow}>
                <View style={styles.cobroInfo}>
                  <Text style={styles.cobroCliente}>{cobro!.clienteNombre}</Text>
                  <Text style={styles.cobroDetalle}>
                    Cuota #{cobro!.numeroCuota} · {formatearFecha(cobro!.fecha)}
                  </Text>
                </View>
                <Text style={styles.cobroMonto}>${cobro!.valorCuota.toFixed(2)}</Text>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay cobros próximos</Text>
          </Card>
        )}
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <Button
            title="Nuevo Cliente"
            onPress={() => navigation.navigate('Clientes')}
            variant="secondary"
            size="small"
          />
          <Button
            title="Nuevo Préstamo"
            onPress={() => navigation.navigate('CrearPrestamo')}
            variant="secondary"
            size="small"
          />
        </View>
        <Button
          title="Registrar Cobro"
          onPress={() => navigation.navigate('Cobros')}
          style={styles.cobroButton}
        />
      </View>
    </ScrollView>
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
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '48%',
    margin: spacing.xs,
    padding: spacing.md,
  },
  metricValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  metricSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.secondary,
    fontWeight: '600',
  },
  cobroCard: {
    marginBottom: spacing.sm,
  },
  cobroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cobroInfo: {
    flex: 1,
  },
  cobroCliente: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  cobroDetalle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cobroMonto: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cobroButton: {
    marginTop: spacing.xs,
  },
  alertCard: {
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
    marginBottom: spacing.lg,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    position: 'relative',
    marginRight: spacing.md,
  },
  alertEmoji: {
    fontSize: 32,
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  alertBadgeText: {
    ...typography.caption,
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 2,
  },
  alertText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  alertArrow: {
    ...typography.h3,
    color: colors.textLight,
  },
  prestamoCard: {
    marginBottom: spacing.sm,
  },
  prestamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  prestamoMonto: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  prestamoPlazo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  prestamoCliente: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  prestamoDetalles: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  verDetalle: {
    ...typography.bodySmall,
    color: colors.primary,
    textAlign: 'right',
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  prestamoDetalle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
