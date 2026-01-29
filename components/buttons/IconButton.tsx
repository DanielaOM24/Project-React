import { radious, spacing } from '@/styles/designSystem';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

interface Props {
    icon: React.ReactNode;             // el icono (componente)
    onPress?: () => void;              // función al presionar
    disabled?: boolean;                // estado deshabilitado
    size?: 'sm' | 'md' | 'lg';         // tamaño del botón
    style?: ViewStyle;                 // libertad sobreescribir algun estilo
}


export const IconButton = ({
    icon,
    onPress,
    disabled = false,
    size = 'md',
    style,
}: Props) => {

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            style={[
                styles.button,
                styles[`size_${size}`],  // estilo dinámico según el tamaño
                { opacity: disabled ? 0.5 : 1 },
                style,
            ]}
        >
            {icon}
        </Pressable>
    );
};


const styles = StyleSheet.create({
    button: {
        backgroundColor: '#FFFFFF80',
        borderRadius: radious.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ffffff59', 
    },
    size_sm: {
        width: 40,
        height: 40,
        padding: spacing.xs,
    },
    size_md: {
        width: 56,
        height: 56,
        padding: spacing.sm,
    },
    size_lg: {
        width: 72,
        height: 72,
        padding: spacing.md,
        borderRadius: radious.lg
    },
})