import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Animation Sequence (Simpler, smoother fade in)
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate away after 3 seconds
        const timer = setTimeout(() => {
            if (onFinish) onFinish();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/force_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* App Name */}
                <Text style={styles.title}>FORCE SPORTS</Text>
                <Text style={styles.subtitle}>Play. Compete. Win.</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // White background
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        marginBottom: 30,
        // Removed white bg circle, assuming transparent logo works best on white
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000', // Black text
        letterSpacing: 2,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '500',
        letterSpacing: 4,
        textTransform: 'uppercase',
    }
});
