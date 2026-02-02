import { colors, spacing } from "@/styles/designSystem";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface Props {
    style?: ViewStyle;
    color?: string;
    vertical?: boolean;
}

export const Divider = ({
    style,
    color = colors.whiteOverlay,
    vertical = false
}: Props) => {
    return (
        <View style={[
            vertical ? styles.vertical : styles.horizontal,
            { backgroundColor: color },
            style
        ]} />
    );
}

const styles = StyleSheet.create({
    horizontal: {
        height: 1,
        width: '100%',
        marginVertical: spacing.sm,
    },
    vertical: {
        width: 1,
        height: '100%',
        marginHorizontal: spacing.sm,
    },
});
