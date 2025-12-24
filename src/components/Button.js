import { useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { theme } from '../styles/theme';

/**
 * Premium Button Component
 * Features: Scale animation, Neon shadows, Sharp variants.
 */
export default function Button({ title, onPress, variant = 'primary', style, textStyle, loading = false, small = false, disabled = false, icon: Icon }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Define colors based on variant
    let backgroundColor = theme.colors.primary;
    let textColor = '#000000'; // Dark text on light neon primary
    let borderColor = 'transparent';

    if (variant === 'secondary') {
        backgroundColor = theme.colors.secondary;
    } else if (variant === 'outline') {
        backgroundColor = 'transparent';
        textColor = theme.colors.primary;
        borderColor = theme.colors.primary;
    } else if (variant === 'glass') {
        backgroundColor = theme.colors.glass;
        textColor = theme.colors.text;
        borderColor = theme.colors.glassBorder;
    } else if (variant === 'danger') {
        backgroundColor = theme.colors.error;
        textColor = '#FFFFFF';
    } else if (variant === 'ghost') {
        backgroundColor = 'transparent';
        textColor = theme.colors.textSecondary;
    }

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.94,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={loading || disabled}
        >
            <Animated.View
                style={[
                    styles.button,
                    {
                        backgroundColor,
                        borderColor,
                        borderWidth: (variant === 'outline' || variant === 'glass') ? 1.5 : 0,
                        transform: [{ scale: scaleAnim }],
                        opacity: (loading || disabled) ? 0.6 : 1,
                    },
                    variant === 'primary' && theme.shadows.neon,
                    small && styles.buttonSmall,
                    style
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={textColor} size="small" />
                ) : (
                    <View style={styles.content}>
                        {Icon && <Icon size={small ? 16 : 20} color={textColor} style={{ marginRight: 8 }} />}
                        <Text style={[
                            styles.text,
                            { color: textColor },
                            small && styles.textSmall,
                            textStyle
                        ]}>
                            {title}
                        </Text>
                    </View>
                )}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 54,
    },
    buttonSmall: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        minHeight: 40,
        borderRadius: theme.borderRadius.s,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...theme.typography.button,
    },
    textSmall: {
        fontSize: 14,
    },
});
