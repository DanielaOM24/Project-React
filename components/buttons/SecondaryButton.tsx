import React from "react";
import { colors, radious, spacing, typography } from '@/styles/designSystem';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
    text: string;                    // texto del botón
    onPress?: () => void;            // función al presionar
    disabled?: boolean;              // estado deshabilitado
    loading?: boolean;               // estado cargando
    fullWidth?: boolean;             // ocupa todo el ancho
}

export const SecondaryButton = ({
    text,
    onPress,
    disabled = false,
    loading = false,
    fullWidth = false,
}: Props) => {
    
    return (
        <Pressable
        onPress={disabled || loading ? undefined : onPress}
        disabled={disabled || loading}
        style={{
            ...styles.button,
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.5 : 1,
        }}
    >
        {loading ? (
            <ActivityIndicator color={colors.primaryText} />
        ) : (
            <Text style={styles.text}>{text}</Text>
        )}
    </Pressable>
    );
};

const styles = StyleSheet.create ({
    button: {
        backgroundColor: colors.background,  //   darkgreen con opacidad 80%
        opacity: 0.2,
        borderRadius: radious.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 48,
    },   
    text: {
        color: colors.primaryText,        // texto blanco
        fontSize: typography.size.body,
        fontFamily: typography.fontfamily.semibold,
        textAlign: 'center',
    },

})