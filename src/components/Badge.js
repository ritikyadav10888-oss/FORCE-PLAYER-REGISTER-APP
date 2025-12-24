import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

export default function Badge({ label, variant = 'default', size = 'medium', style }) {
    const getColors = () => {
        switch (variant) {
            case 'success':
                return { bg: `${theme.colors.success}20`, text: theme.colors.success };
            case 'warning':
                return { bg: `${theme.colors.warning}20`, text: theme.colors.warning };
            case 'error':
                return { bg: `${theme.colors.error}20`, text: theme.colors.error };
            case 'primary':
                return { bg: `${theme.colors.primary}20`, text: theme.colors.primary };
            case 'secondary':
                return { bg: `${theme.colors.secondary}20`, text: theme.colors.secondary };
            default:
                return { bg: theme.colors.surfaceHighlight, text: theme.colors.textSecondary };
        }
    };

    const colors = getColors();
    const sizeStyle = size === 'small' ? styles.small : styles.medium;

    return (
        <View style={[styles.badge, { backgroundColor: colors.bg }, sizeStyle, style]}>
            <Text style={[styles.text, { color: colors.text }, size === 'small' && styles.textSmall]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
    },
    small: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: 2,
    },
    medium: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
    },
    text: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    textSmall: {
        fontSize: 10,
        fontWeight: '600',
    },
});
