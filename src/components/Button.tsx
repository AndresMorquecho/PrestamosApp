// ============================================
// COMPONENTE: BUTTON (BOTÓN)
// ============================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyles: any[] = [styles.button];
    
    if (variant === 'primary') baseStyles.push(styles.primary);
    if (variant === 'secondary') baseStyles.push(styles.secondary);
    if (variant === 'outline') baseStyles.push(styles.outline);
    if (variant === 'text') baseStyles.push(styles.textVariant);
    if (variant === 'danger') baseStyles.push(styles.danger);
    
    if (size === 'small') baseStyles.push(styles.smallButton);
    if (size === 'medium') baseStyles.push(styles.mediumButton);
    if (size === 'large') baseStyles.push(styles.largeButton);
    
    if (disabled) baseStyles.push(styles.disabled);
    if (style) baseStyles.push(style);
    
    return baseStyles;
  };

  const getTextStyle = () => {
    const baseStyles: any[] = [styles.buttonText];
    
    if (variant === 'primary') baseStyles.push(styles.primaryText);
    if (variant === 'secondary') baseStyles.push(styles.secondaryText);
    if (variant === 'outline') baseStyles.push(styles.outlineText);
    if (variant === 'text') baseStyles.push(styles.textText);
    if (variant === 'danger') baseStyles.push(styles.dangerText);
    
    if (size === 'small') baseStyles.push(styles.smallText);
    if (size === 'medium') baseStyles.push(styles.mediumText);
    if (size === 'large') baseStyles.push(styles.largeText);
    
    if (disabled) baseStyles.push(styles.disabledText);
    if (textStyle) baseStyles.push(textStyle);
    
    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.surface}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variantes
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  textVariant: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    backgroundColor: colors.borderLight,
    borderColor: colors.borderLight,
  },
  // Tamaños
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },
  mediumButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  // Texto
  buttonText: {
    ...typography.button,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.surface,
  },
  outlineText: {
    color: colors.primary,
  },
  textText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.surface,
  },
  disabledText: {
    color: colors.textLight,
  },
  // Tamaños de texto
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
