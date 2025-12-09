// ============================================
// PANTALLA: REGISTER
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Usuario, RolUsuario } from '../types';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>('usuario');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validaciones
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const nuevoUsuario: Usuario = {
      id: `U${Date.now()}`,
      nombre,
      email: email.trim().toLowerCase(),
      telefono,
      password,
      rol,
      fechaCreacion: new Date().toISOString(),
    };

    setLoading(true);
    const success = await register(nuevoUsuario);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', 'El email ya está registrado');
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Complete sus datos para registrarse</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre Completo *"
              placeholder="Juan Pérez"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />

            <Input
              label="Email *"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Teléfono"
              placeholder="+593999888777"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Rol *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={rol}
                  onValueChange={(value) => setRol(value as RolUsuario)}
                  style={styles.picker}
                >
                  <Picker.Item label="Usuario" value="usuario" />
                  <Picker.Item label="Administrador" value="admin" />
                </Picker>
              </View>
            </View>

            <Input
              label="Contraseña *"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirmar Contraseña *"
              placeholder="Repita su contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Registrarse"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <Button
              title="Ya tengo cuenta"
              onPress={() => navigation.goBack()}
              variant="text"
              style={styles.loginButton}
            />
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  pickerContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerWrapper: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});
