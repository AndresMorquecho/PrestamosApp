// ============================================
// PANTALLA: LOGIN
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, inicializarDatos } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Inicializar datos demo la primera vez
    const init = async () => {
      try {
        await inicializarDatos();
      } catch (error) {
        console.error('Error al inicializar:', error);
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    console.log('=== INICIO handleLogin ===');
    console.log('Email ingresado:', email);
    console.log('Password ingresado:', password);
    
    if (!email || !password) {
      if (Platform.OS === 'web') {
        alert('Por favor ingrese email y contraseña');
      } else {
        alert('Por favor ingrese email y contraseña');
      }
      return;
    }

    setLoading(true);
    try {
      console.log('Llamando a login() con:', email.trim(), password);
      const success = await login(email.trim(), password);
      console.log('Resultado de login():', success);
      setLoading(false);

      if (!success) {
        console.log('Login falló - mostrando alerta');
        if (Platform.OS === 'web') {
          alert('Credenciales incorrectas\nEmail: ' + email + '\nPassword: ' + password);
        } else {
          alert('Credenciales incorrectas');
        }
      } else {
        console.log('Login exitoso!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error en login:', error);
      if (Platform.OS === 'web') {
        alert('Error al iniciar sesión: ' + error);
      } else {
        alert('Error al iniciar sesión');
      }
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'usuario') => {
    if (role === 'admin') {
      setEmail('admin@demo.com');
      setPassword('Admin123!');
    } else {
      setEmail('user@demo.com');
      setPassword('User123!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💰 PréstamosApp</Text>
            <Text style={styles.subtitle}>Gestión de préstamos simplificada</Text>
          </View>

          {/* Demo Info */}
          <View style={styles.demoInfo}>
            <Text style={styles.demoTitle}>🎯 Credenciales Demo</Text>
            <View style={styles.demoButtons}>
              <Button
                title="Admin"
                onPress={() => fillDemoCredentials('admin')}
                variant="outline"
                size="small"
                style={styles.demoButton}
              />
              <Button
                title="Usuario"
                onPress={() => fillDemoCredentials('usuario')}
                variant="outline"
                size="small"
                style={styles.demoButton}
              />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="Crear Cuenta"
              onPress={() => navigation.navigate('Register')}
              variant="text"
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Admin: admin@demo.com / Admin123!
            </Text>
            <Text style={styles.footerText}>
              Usuario: user@demo.com / User123!
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  demoInfo: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  demoTitle: {
    ...typography.h5,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  form: {
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: 2,
  },
});
