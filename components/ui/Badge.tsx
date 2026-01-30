import { colors, radious, spacing, typography } from "@/styles/designSystem";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { SecondaryButton } from '../buttons/SecondaryButton';

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
            variant === 'secondary' ? colors.darkgreen :
                variant === 'success' ? colors.success :
                    variant === 'warning' ? colors.warning :
                        colors.error;

    const textColor =
        variant === 'primary' ? colors.darkgreen :
            variant === 'secondary' ? colors.secondaryText :
                variant === 'success' ? colors.primaryText :
                    variant === 'warning' ? colors.darkgreen :
                        colors.primaryText;

    return (
        <View style={[
            styles.badge,
            { backgroundColor },
            style
        ]}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            {text && <Text style={[styles.badgeText, { color: textColor }, textStyle]}>{text}</Text>}
            {value && <Text style={[styles.badgeValue, { color: textColor }, textStyle]}>{value}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radious.md,
        overflow: 'hidden',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
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
});