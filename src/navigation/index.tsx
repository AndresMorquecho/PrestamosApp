// ============================================
// NAVEGACIÓN PRINCIPAL
// ============================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Loading';
import { colors } from '../theme';

// Importar pantallas
import {
  LoginScreen,
  RegisterScreen,
  DashboardScreen,
  ClientesScreen,
  DetalleClienteScreen,
  FormClienteScreen,
  PrestamosScreen,
  CrearPrestamoScreen,
  DetallePrestamoScreen,
  CobrosScreen,
  IngresosGastosScreen,
  ConfiguracionScreen,
  NotificacionesScreen,
  PerfilScreen,
} from '../screens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación de autenticación
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.surface,
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Registro' }}
    />
  </Stack.Navigator>
);

// Navegación principal con tabs (Admin)
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.surface,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Inicio',
        tabBarLabel: 'Inicio',
      }}
    />
    <Tab.Screen
      name="Notificaciones"
      component={NotificacionesScreen}
      options={{
        title: 'Pagos Pendientes',
        tabBarLabel: 'Validar',
      }}
    />
    <Tab.Screen
      name="Clientes"
      component={ClientesScreen}
      options={{
        title: 'Clientes',
        tabBarLabel: 'Clientes',
      }}
    />
    <Tab.Screen
      name="Prestamos"
      component={PrestamosScreen}
      options={{
        title: 'Préstamos',
        tabBarLabel: 'Préstamos',
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{
        title: 'Perfil',
        tabBarLabel: 'Perfil',
      }}
    />
  </Tab.Navigator>
);

// Navegación principal con tabs (Usuario)
const UserTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.surface,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Mis Préstamos',
        tabBarLabel: 'Préstamos',
      }}
    />
    <Tab.Screen
      name="Cobros"
      component={CobrosScreen}
      options={{
        title: 'Pagos',
        tabBarLabel: 'Pagos',
      }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{
        title: 'Perfil',
        tabBarLabel: 'Perfil',
      }}
    />
  </Tab.Navigator>
);

// Stack principal (incluye tabs + pantallas adicionales)
const MainNavigator = () => {
  const { usuario } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={usuario?.rol === 'admin' ? AdminTabNavigator : UserTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalleCliente"
        component={DetalleClienteScreen}
        options={{ title: 'Detalle Cliente' }}
      />
      <Stack.Screen
        name="FormCliente"
        component={FormClienteScreen}
        options={{ title: 'Agregar Cliente' }}
      />
      <Stack.Screen
        name="CrearPrestamo"
        component={CrearPrestamoScreen}
        options={{ title: 'Nuevo Préstamo' }}
      />
      <Stack.Screen
        name="DetallePrestamo"
        component={DetallePrestamoScreen}
        options={{ title: 'Detalle Préstamo' }}
      />
      <Stack.Screen
        name="Cobros"
        component={CobrosScreen}
        options={{ title: 'Registrar Cobro' }}
      />
      <Stack.Screen
        name="IngresosGastos"
        component={IngresosGastosScreen}
        options={{ title: 'Ingresos y Gastos' }}
      />
      <Stack.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen
        name="Notificaciones"
        component={NotificacionesScreen}
        options={{ title: 'Notificaciones' }}
      />
    </Stack.Navigator>
  );
};

// Navegador raíz
export const RootNavigator = () => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {usuario ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
