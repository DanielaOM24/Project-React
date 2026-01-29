import { colors, radious, spacing, typography } from "@/styles/designSystem";
import { StyleSheet, Text, TextStyle } from "react-native";

interface Props {
    text: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    style?: TextStyle;
}

export const Badge = ({
    text,
    variant = 'primary',
    style
}: Props) => {
    const backgroundColor =
        variant === 'primary' ? colors.greenprimary :
            variant === 'secondary' ? colors.background :
                variant === 'success' ? colors.success :
                    variant === 'warning' ? colors.warning :
                        colors.error;

    return (
        <Text style={[
            styles.badge,
            { backgroundColor },
            style
        ]}>
            {text}
        </Text>
    );
}

const styles = StyleSheet.create({
    badge: {
        fontSize: typography.size.body,      // 12
        fontFamily: typography.fontfamily.bold,
        color: colors.darkgreen,                 // texto oscuro
        paddingVertical: spacing.sm,            // 4
        paddingHorizontal: spacing.md,          // 8
        borderRadius: radious.md,               // 10
        overflow: 'hidden',
        alignSelf: 'flex-start',                // ajusta al contenido
    },
});