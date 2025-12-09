// ============================================
// PANTALLA: PRÉSTAMOS
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { colors, spacing, typography } from '../theme';
import { formatearFecha } from '../utils/dateUtils';
import { EstadoPrestamo } from '../types';

export const PrestamosScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { usuario } = useAuth();
  const { prestamos, clientes, cuotas, pagos, isLoading } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPrestamo | 'todos'>('todos');

  // Filtrar préstamos
  const prestamosFiltrados = useMemo(() => {
    let resultado = prestamos;

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    // Filtrar por búsqueda (nombre de cliente)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(p => {
        const cliente = clientes.find(c => c.id === p.clienteId);
        return cliente?.nombre.toLowerCase().includes(busquedaLower);
      });
    }

    // Ordenar por fecha (más recientes primero)
    return resultado.sort((a, b) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }, [prestamos, clientes, filtroEstado, busqueda]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const activos = prestamos.filter(p => p.estado === 'activo').length;
    const pendientes = prestamos.filter(p => p.estado === 'pendiente').length;
    const pagados = prestamos.filter(p => p.estado === 'pagado').length;
    const vencidos = prestamos.filter(p => p.estado === 'vencido').length;
    const montoTotal = prestamos
      .filter(p => p.estado === 'activo' || p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0);

    return { activos, pendientes, pagados, vencidos, montoTotal };
  }, [prestamos]);

  const calcularProgresoPrestamo = (prestamoId: string) => {
    const cuotasPrestamo = cuotas.filter(c => c.prestamoId === prestamoId);
    const cuotasPagadas = cuotasPrestamo.filter(c => c.estado === 'pagado').length;
    const totalCuotas = cuotasPrestamo.length;
    return totalCuotas > 0 ? (cuotasPagadas / totalCuotas) * 100 : 0;
  };

  const calcularSaldoPendiente = (prestamoId: string) => {
    const cuotasPrestamo = cuotas.filter(c => c.prestamoId === prestamoId);
    return cuotasPrestamo.reduce((sum, c) => {
      if (c.estado !== 'pagado') {
        return sum + c.valorCuota;
      }
      return sum;
    }, 0);
  };

  const getEstadoColor = (estado: EstadoPrestamo) => {
    switch (estado) {
      case 'activo': return colors.success;
      case 'pendiente': return colors.warning;
      case 'pagado': return colors.primary;
      case 'vencido': return colors.error;
      case 'rechazado': return colors.textLight;
      default: return colors.textSecondary;
    }
  };

  const getEstadoTexto = (estado: EstadoPrestamo) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'pendiente': return 'Pendiente';
      case 'pagado': return 'Pagado';
      case 'vencido': return 'Vencido';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.headerStats}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{estadisticas.activos}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {estadisticas.pendientes}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {estadisticas.pagados}
            </Text>
            <Text style={styles.statLabel}>Pagados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {estadisticas.vencidos}
            </Text>
            <Text style={styles.statLabel}>Vencidos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>${estadisticas.montoTotal.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Monto Total</Text>
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente..."
            value={busqueda}
            onChangeText={setBusqueda}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'todos' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('todos')}
          >
            <Text style={[styles.filterText, filtroEstado === 'todos' && styles.filterTextActive]}>
              Todos ({prestamos.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'activo' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('activo')}
          >
            <Text style={[styles.filterText, filtroEstado === 'activo' && styles.filterTextActive]}>
              Activos ({estadisticas.activos})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'pendiente' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('pendiente')}
          >
            <Text style={[styles.filterText, filtroEstado === 'pendiente' && styles.filterTextActive]}>
              Pendientes ({estadisticas.pendientes})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filtroEstado === 'pagado' && styles.filterChipActive]}
            onPress={() => setFiltroEstado('pagado')}
          >
            <Text style={[styles.filterText, filtroEstado === 'pagado' && styles.filterTextActive]}>
              Pagados ({estadisticas.pagados})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Botón crear nuevo préstamo */}
        {usuario?.rol === 'admin' && (
          <Button
            title="+ Nuevo Préstamo"
            onPress={() => navigation.navigate('CrearPrestamo')}
            style={styles.crearButton}
          />
        )}

        {/* Lista de préstamos */}
        {prestamosFiltrados.length === 0 ? (
          <Card>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No hay préstamos</Text>
              <Text style={styles.emptyText}>
                {busqueda ? 'No se encontraron resultados' : 'Aún no hay préstamos registrados'}
              </Text>
            </View>
          </Card>
        ) : (
          prestamosFiltrados.map((prestamo) => {
            const cliente = clientes.find(c => c.id === prestamo.clienteId);
            const progreso = calcularProgresoPrestamo(prestamo.id);
            const saldoPendiente = calcularSaldoPendiente(prestamo.id);

            return (
              <TouchableOpacity
                key={prestamo.id}
                onPress={() => navigation.navigate('DetallePrestamo', { prestamoId: prestamo.id })}
                activeOpacity={0.7}
              >
                <Card style={styles.prestamoCard}>
                  {/* Header */}
                  <View style={styles.prestamoHeader}>
                    <View style={styles.prestamoInfo}>
                      <Text style={styles.clienteNombre}>{cliente?.nombre || 'Cliente'}</Text>
                      <Text style={styles.prestamoMonto}>${prestamo.monto.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(prestamo.estado) + '20' }]}>
                      <Text style={[styles.estadoTexto, { color: getEstadoColor(prestamo.estado) }]}>
                        {getEstadoTexto(prestamo.estado)}
                      </Text>
                    </View>
                  </View>

                  {/* Detalles */}
                  <View style={styles.prestamoDetalles}>
                    <View style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>Plazo:</Text>
                      <Text style={styles.detalleValue}>
                        {prestamo.plazo} cuotas {prestamo.tipoCuota}s
                      </Text>
                    </View>
                    <View style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>Tasa:</Text>
                      <Text style={styles.detalleValue}>{prestamo.tasa}% anual</Text>
                    </View>
                    <View style={styles.detalleRow}>
                      <Text style={styles.detalleLabel}>Concedido:</Text>
                      <Text style={styles.detalleValue}>{formatearFecha(prestamo.fechaConcesion)}</Text>
                    </View>
                    {prestamo.estado === 'activo' && (
                      <View style={styles.detalleRow}>
                        <Text style={styles.detalleLabel}>Saldo pendiente:</Text>
                        <Text style={[styles.detalleValue, styles.saldoPendiente]}>
                          ${saldoPendiente.toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Barra de progreso */}
                  {(prestamo.estado === 'activo' || prestamo.estado === 'pagado') && (
                    <View style={styles.progresoContainer}>
                      <View style={styles.progresoHeader}>
                        <Text style={styles.progresoLabel}>Progreso</Text>
                        <Text style={styles.progresoPercent}>{progreso.toFixed(0)}%</Text>
                      </View>
                      <View style={styles.progresoBar}>
                        <View style={[styles.progresoFill, { width: `${progreso}%` }]} />
                      </View>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerStats: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  crearButton: {
    marginBottom: spacing.md,
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
  prestamoCard: {
    marginBottom: spacing.md,
  },
  prestamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  prestamoInfo: {
    flex: 1,
  },
  clienteNombre: {
    ...typography.h5,
    color: colors.text,
    marginBottom: 2,
  },
  prestamoMonto: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    ...typography.caption,
    fontWeight: '600',
  },
  prestamoDetalles: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detalleLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detalleValue: {
    ...typography.body,
    color: colors.text,
  },
  saldoPendiente: {
    color: colors.primary,
    fontWeight: '600',
  },
  progresoContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  progresoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progresoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progresoPercent: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  progresoBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
