// ============================================
// PANTALLA: LISTA DE CLIENTES
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../theme';
import { Cliente } from '../types';

export const ClientesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { clientes } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.documento.includes(searchQuery) ||
    cliente.telefono.includes(searchQuery)
  );

  const renderCliente = ({ item }: { item: Cliente }) => (
    <Card
      style={styles.clienteCard}
      onPress={() => navigation.navigate('DetalleCliente', { clienteId: item.id })}
    >
      <View style={styles.clienteHeader}>
        <View style={styles.clienteAvatar}>
          <Text style={styles.clienteInitials}>
            {item.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </Text>
        </View>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>{item.nombre}</Text>
          <Text style={styles.clienteDetalle}>{item.telefono}</Text>
          <Text style={styles.clienteDetalle}>{item.documento}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={clientesFiltrados}
        renderItem={renderCliente}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
          </View>
        }
      />

      {/* Botón Agregar */}
      <Button
        title="+ Agregar Cliente"
        onPress={() => navigation.navigate('FormCliente')}
        style={styles.addButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    padding: spacing.md,
  },
  clienteCard: {
    marginBottom: spacing.sm,
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clienteAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  clienteInitials: {
    ...typography.h5,
    color: colors.surface,
    fontWeight: '700',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  clienteDetalle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
  },
  addButton: {
    margin: spacing.md,
  },
});
