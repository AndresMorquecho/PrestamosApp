// ============================================
// CONTEXT DE AUTENTICACIÓN
// ============================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import {
  obtenerSesion,
  guardarSesion,
  cerrarSesion,
  obtenerUsuarioPorEmail,
  crearUsuario,
  inicializarDatosDemo,
} from '../services/storageService';

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (usuario: Usuario) => Promise<boolean>;
  logout: () => Promise<void>;
  inicializarDatos: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al iniciar
  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const sesion = await obtenerSesion();
      setUsuario(sesion);
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN EN AUTH CONTEXT ===');
      console.log('Email recibido:', email, 'Longitud:', email.length);
      console.log('Password recibido:', password, 'Longitud:', password.length);
      
      const usuarioEncontrado = await obtenerUsuarioPorEmail(email);
      console.log('Usuario encontrado:', usuarioEncontrado);

      if (!usuarioEncontrado) {
        console.log('Usuario no encontrado');
        return false;
      }

      console.log('Password del usuario en BD:', usuarioEncontrado.password, 'Longitud:', usuarioEncontrado.password.length);
      console.log('Password ingresado:', password, 'Longitud:', password.length);
      console.log('Son iguales?:', usuarioEncontrado.password === password);
      console.log('Comparación estricta:', JSON.stringify(usuarioEncontrado.password) === JSON.stringify(password));

      if (usuarioEncontrado.password !== password) {
        console.log('❌ Contraseña incorrecta');
        console.log('Esperado:', usuarioEncontrado.password);
        console.log('Recibido:', password);
        return false;
      }

      console.log('✅ Login exitoso, guardando sesión...');
      await guardarSesion(usuarioEncontrado);
      setUsuario(usuarioEncontrado);
      console.log('Sesión guardada, usuario:', usuarioEncontrado.nombre);
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const register = async (nuevoUsuario: Usuario): Promise<boolean> => {
    try {
      const usuarioExistente = await obtenerUsuarioPorEmail(nuevoUsuario.email);

      if (usuarioExistente) {
        return false;
      }

      await crearUsuario(nuevoUsuario);
      await guardarSesion(nuevoUsuario);
      setUsuario(nuevoUsuario);
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await cerrarSesion();
      setUsuario(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const inicializarDatos = async (): Promise<void> => {
    try {
      await inicializarDatosDemo();
    } catch (error) {
      console.error('Error al inicializar datos:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        login,
        register,
        logout,
        inicializarDatos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
