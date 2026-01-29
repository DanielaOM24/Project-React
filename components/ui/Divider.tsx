import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/styles/designSystem';

interface Props {
    style?: ViewStyle;
    color?: string;  
}

export const Divider = ({ style, color }: Props) => {
    return (
        <View 
            style={[
                styles.divider, 
                { backgroundColor: color || colors.whiteOverlay },
                style
            ]} 
        />
    );
};

const styles = StyleSheet.create({
    divider: {
        height: 1,                      // grosor de la línea
        width: '100%',                  // ancho completo
        marginVertical: spacing.md,     // 16 arriba y abajo
    },
});