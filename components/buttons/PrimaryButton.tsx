import { colors, radious, spacing, typography } from '@/styles/designSystem';
import React from 'react';
import { ActivityIndicator, Pressable, Text , StyleSheet } from 'react-native';

interface Props {
    text: string;                    // texto del botón
    onPress?: () => void;            // función al presionar
    disabled?: boolean;              // estado deshabilitado
    loading?: boolean;               // estado cargando
    fullWidth?: boolean;             // ocupa todo el ancho
}


export const PrimaryButton = ({
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
                <ActivityIndicator color={colors.textdark} />
            ) : (
                <Text style={styles.text}>{text}</Text>
            )}
        </Pressable>

    )
};


const styles = StyleSheet.create ({
    button: {
        backgroundColor: colors.greenprimary,
        borderRadius: radious.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        justifyContent: "center",
        alignItems: 'center',
        minHeight: 48,

    },
    text: {
        fontFamily: typography.fontfamily.bold,
        color: colors.textdark,                  
        fontSize: typography.size.body,      
        textAlign: 'center',
    },
})



