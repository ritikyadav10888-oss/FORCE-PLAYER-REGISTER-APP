import { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../styles/theme';

/**
 * Premium Input Component
 * Features: Animated border focus, Clean label design, Error handling.
 */
export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, style, keyboardType, multiline, error, leftIcon: Icon, ...props }) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(focusAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    };

    const isLight = props.variant === 'light';

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [error ? theme.colors.error : (isLight ? '#E0E0E0' : theme.colors.border), theme.colors.primary],
    });

    const backgroundColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [isLight ? '#FAFAFA' : theme.colors.surface, isLight ? '#FFFFFF' : theme.colors.surfaceLight],
    });

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={[styles.label, isFocused && { color: theme.colors.primary }]}>{label}</Text>}
            <Animated.View style={[
                styles.inputWrapper,
                { borderColor, backgroundColor },
                error && styles.inputWrapperError,
            ]}>
                {Icon && <Icon size={20} color={isFocused ? theme.colors.primary : theme.colors.textSecondary} style={{ marginLeft: 16 }} />}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        { color: isLight ? '#000000' : theme.colors.text }
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isLight ? '#999999' : (theme.colors.textSecondary + '80')}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    autoCapitalize="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.l,
    },
    label: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.m,
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    inputWrapperError: {
        borderColor: theme.colors.error,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 56,
        ...Platform.select({
            web: { outlineStyle: 'none' }
        })
    },
    inputMultiline: {
        minHeight: 120,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600',
    },
});
