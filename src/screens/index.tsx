// Exportar todas las pantallas desde un solo archivo
export { LoginScreen } from './LoginScreen';
export { RegisterScreen } from './RegisterScreen';
export { DashboardScreen } from './DashboardScreen';
export { ClientesScreen } from './ClientesScreen';

// Pantalla placeholder para las demás pantallas (puedes expandirlas después)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../theme';

const PlaceholderScreen: React.FC<{ title: string; navigation: any }> = ({ title, navigation }) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <Text style={styles.title}>🚧 {title}</Text>
      <Text style={styles.subtitle}>Esta pantalla está en desarrollo</Text>
      <Button
        title="Volver"
        onPress={() => navigation.goBack()}
        style={styles.button}
      />
    </View>
  </View>
);

export const DetalleClienteScreen: React.FC<{ navigation: any; route: any }> = (props) => (
  <PlaceholderScreen title="Detalle Cliente" {...props} />
);

export const FormClienteScreen: React.FC<{ navigation: any }> = (props) => (
  <PlaceholderScreen title="Formulario Cliente" {...props} />
);

// Exportar PrestamosScreen desde su propio archivo
export { PrestamosScreen } from './PrestamosScreen';

// Exportar NotificacionesScreen desde su propio archivo
export { NotificacionesScreen } from './NotificacionesScreen';

export const CrearPrestamoScreen: React.FC<{ navigation: any }> = (props) => (
  <PlaceholderScreen title="Crear Préstamo" {...props} />
);

// Exportar DetallePrestamoScreen desde su propio archivo
export { DetallePrestamoScreen } from './DetallePrestamoScreen';

// Exportar CobrosScreen desde su propio archivo
export { CobrosScreen } from './CobrosScreen';

export const IngresosGastosScreen: React.FC<{ navigation: any }> = (props) => (
  <PlaceholderScreen title="Ingresos y Gastos" {...props} />
);

export const ConfiguracionScreen: React.FC<{ navigation: any }> = (props) => (
  <PlaceholderScreen title="Configuración" {...props} />
);

export const PerfilScreen: React.FC<{ navigation: any }> = (props) => {
  const { useAuth } = require('../context/AuthContext');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const { usuario, logout } = useAuth();
  const [reiniciando, setReiniciando] = React.useState(false);

  const reiniciarDatos = async () => {
    try {
      setReiniciando(true);
      await AsyncStorage.clear();
      alert('✅ Datos reiniciados. La app se recargará.');
      // Recargar la página/app
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      alert('❌ Error al reiniciar datos');
      console.error(error);
    } finally {
      setReiniciando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {usuario?.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
          <Text style={styles.title}>{usuario?.nombre}</Text>
          <Text style={styles.subtitle}>{usuario?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {usuario?.rol === 'admin' ? '👑 Administrador' : '👤 Usuario'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{usuario?.telefono || 'No especificado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol:</Text>
            <Text style={styles.infoValue}>{usuario?.rol}</Text>
          </View>
        </View>

        {usuario?.rol === 'admin' && (
          <Button
            title="🔄 Reiniciar Datos Demo"
            onPress={reiniciarDatos}
            variant="outline"
            style={styles.button}
            loading={reiniciando}
          />
        )}

        <Button
          title="Cerrar Sesión"
          onPress={logout}
          variant="danger"
          style={styles.button}
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.surface,
    fontWeight: '700',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.md,
  },
});
