import React from "react";
import { colors, radius, spacing, typography } from '@/styles/designSystem';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
    text: string;                    // texto del botón
    onPress?: () => void;            // función al presionar
    disabled?: boolean;              // estado deshabilitado
    loading?: boolean;               // estado cargando
    fullWidth?: boolean;             // ocupa todo el ancho
    icon?: React.ReactNode;          // icono opcional
    iconPosition?: 'left' | 'right'; // posición del icono
}

export const SecondaryButton = ({
    text,
    onPress,
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
}: Props) => {
    
    return (
        <Pressable
        onPress={disabled || loading ? undefined : onPress}
        disabled={disabled || loading}
        style={[
            styles.button,
            {
                width: fullWidth ? '100%' : undefined,
                alignSelf: fullWidth ? 'stretch' : 'flex-start',
                opacity: disabled ? 0.5 : 1,
            },
        ]}
    >
        {loading ? (
            <ActivityIndicator color={colors.primaryText} />
        ) : (
            <View style={styles.content}>
                {icon && iconPosition === 'left' && icon}
                <Text style={styles.text}>{text}</Text>
                {icon && iconPosition === 'right' && icon}
            </View>
        )}
    </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.background,
        opacity: 0.2,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 48,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    text: {
        color: colors.primaryText,
        fontSize: typography.size.body,
        fontFamily: typography.fontfamily.semibold,
        textAlign: 'center',
    },

})

