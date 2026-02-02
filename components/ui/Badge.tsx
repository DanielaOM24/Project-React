import { colors, radius, spacing, typography } from "@/styles/designSystem";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

interface Props {
    text?: string; // Texto opcional
    value?: string | number; // Valor adicional (ej: "50g", "120g")
    icon?: React.ReactNode; // Icono opcional
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    style?: ViewStyle; // Estilos del contenedor (View)
    textStyle?: TextStyle; // Estilos del texto (color, fontSize, etc.)
}

export const Badge = ({
    text,
    value,
    icon,
    variant = 'primary',
    style,
    textStyle
}: Props) => {
    const backgroundColor =
        variant === 'primary' ? colors.greenprimary :
            variant === 'secondary' ? colors.greenprimary :
                variant === 'success' ? colors.success :
                    variant === 'warning' ? colors.warning :
                        colors.error;

    const textColor =
        variant === 'primary' ? colors.darkgreen :
            variant === 'secondary' ? colors.darkgreen :
                variant === 'success' ? colors.primaryText :
                    variant === 'warning' ? colors.darkgreen :
                        colors.primaryText;

    // Si hay value, mostrar en columna (texto arriba, valor abajo)
    const isColumnLayout = !!value && !icon;
    
    return (
        <View style={[
            styles.badge,
            { backgroundColor },
            isColumnLayout && styles.badgeColumn,
            style
        ]}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            {text && (
                <Text style={[
                    styles.badgeText, 
                    { color: textColor }, 
                    textStyle,
                    isColumnLayout && styles.badgeTextColumn
                ]}>
                    {text}
                </Text>
            )}
            {value && (
                <Text style={[
                    styles.badgeValue, 
                    { color: textColor }, 
                    textStyle,
                    isColumnLayout && styles.badgeValueColumn
                ]}>
                    {value}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        overflow: 'hidden',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        flexDirection: 'row',
    },
    badgeColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.xs / 2,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: typography.size.body,
        fontFamily: typography.fontfamily.medium,
        color: colors.darkgreen,
    },
    badgeValue: {
        fontSize: typography.size.caption,
        fontFamily: typography.fontfamily.bold,
        color: colors.darkgreen,
    },
    badgeTextColumn: {
        fontSize: typography.size.caption - 1,
        fontFamily: typography.fontfamily.medium,
    },
    badgeValueColumn: {
        fontSize: typography.size.body,
        fontFamily: typography.fontfamily.bold,
    },
});
