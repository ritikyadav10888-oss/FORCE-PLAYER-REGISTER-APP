import { useRef } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../styles/theme';

/**
 * Premium Card Component
 * Features: Scale animation, Glassmorphism, Sophisticated shadows.
 */
export default function Card({ children, onPress, style, variant = 'surface', padding = 'l' }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                useNativeDriver: true,
                speed: 60,
                bounciness: 4,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 60,
                bounciness: 4,
            }).start();
        }
    };

    const cardStyles = [
        styles.card,
        { padding: theme.spacing[padding] },
        variant === 'glass' && theme.shadows.glass,
        variant === 'neon' && theme.shadows.neon,
        variant === 'surface' && styles.surfaceCard,
        { transform: [{ scale: scaleAnim }] },
        style,
    ];

    const CardContent = (
        <Animated.View style={cardStyles}>
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableWithoutFeedback
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                {CardContent}
            </TouchableWithoutFeedback>
        );
    }

    return CardContent;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
    },
    surfaceCard: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.soft,
    }
});
