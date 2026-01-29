import { colors, radious, spacing } from "@/styles/designSystem";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'white' | 'green' | 'dark' | 'solid';
}

export const CardBase = ({
    children,
    style,
    variant = 'white'
}: Props) => {

    const backgroundColor =
        variant === 'white' ? colors.whiteOverlay :
            variant === 'green' ? colors.greenOverlay :
                variant === 'solid' ? '#FFFFFFEE' :
                    colors.background
    return (
        <View style={[styles.card, { backgroundColor }, style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radious.md,
        padding: spacing.lg,
    },
})