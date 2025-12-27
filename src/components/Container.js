import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';

const { width, height } = Dimensions.get('window');

export default function Container({ children, style, useSafeArea = true, variant = 'dark' }) {
    // On web, use regular View instead of SafeAreaView by default, or handle differently
    const Wrapper = (Platform.OS === 'web' || !useSafeArea) ? View : SafeAreaView;

    const isLight = variant === 'light';

    return (
        <Wrapper style={[styles.safeArea, isLight && { backgroundColor: theme.colors.appBackground }]}>
            {/* Premium Background Gradient - Only for Dark Mode */}
            {!isLight && (
                <>
                    <LinearGradient
                        colors={['#04060D', '#0B1021', '#161B33']}
                        style={styles.background}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    {/* Sports "Speed Lines" Texture */}
                    <View style={styles.textureContainer} pointerEvents="none">
                        <View style={[styles.speedLine, { top: '10%', left: -50, width: width + 100 }]} />
                        <View style={[styles.speedLine, { top: '25%', left: -50, width: width + 100, opacity: 0.03 }]} />
                        <View style={[styles.speedLine, { top: '60%', left: -50, width: width + 100, opacity: 0.04 }]} />

                        {/* Abstract Hex-like shape or dynamic accent */}
                        <View style={styles.accentShape} />
                    </View>
                </>
            )}

            <View style={[styles.content, style]}>
                {children}
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.appBackground,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    textureContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    speedLine: {
        position: 'absolute',
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        transform: [{ rotate: '-15deg' }],
    },
    accentShape: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        backgroundColor: 'rgba(0, 245, 160, 0.05)',
        transform: [{ rotate: '45deg' }],
        borderRadius: 40,
    },
    content: {
        flex: 1,
        padding: theme.spacing.m,
    },
});
