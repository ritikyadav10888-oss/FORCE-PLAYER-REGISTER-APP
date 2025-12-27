
import { LucideArrowRight, LucideLock, LucideMail } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SimpleLoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const validate = () => {
        let newErrors = {};
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email";
        }
        if (!password) {
            newErrors.password = "Password is required";
        }
        setErrors(newErrors);
        setFormError('');
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        try {
            setIsLoggingIn(true);
            setFormError('');
            await login(null, { email: email.toLowerCase().trim(), password });
        } catch (e) {
            const msg = e.message?.toLowerCase() || "";
            if (msg.includes('email') || msg.includes('user not found')) {
                setErrors(prev => ({ ...prev, email: e.message }));
                setFormError('');
            } else if (msg.includes('password')) {
                setErrors(prev => ({ ...prev, password: e.message }));
                setFormError('');
            } else {
                setFormError(e.message || "Invalid credentials. Please try again.");
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <View style={styles.container}>




            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(800).springify()}
                        style={styles.headerSection}
                    >
                        <View style={styles.logoContainer}>

                            <Image
                                source={require('../../../assets/force_logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.brandName}>FORCE</Text>
                        <Text style={styles.tagline}>DOMINATE THE FIELD.</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(300).duration(800).springify()}
                        style={styles.formCard}
                    >
                        <View style={styles.welcomeTextContainer}>
                            <Text style={styles.welcomeTitle}>Welcome Back</Text>
                            <Text style={styles.welcomeSubtitle}>Sign in to access your dashboard</Text>
                        </View>

                        {formError ? (
                            <Animated.View entering={FadeInDown} style={styles.errorBanner}>
                                <Text style={styles.errorText}>{formError}</Text>
                            </Animated.View>
                        ) : null}

                        <Input
                            label="EMAIL ADDRESS"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }}
                            keyboardType="email-address"
                            error={errors.email}
                            leftIcon={LucideMail}
                            style={styles.inputSpacing}
                        />

                        <Input
                            label="PASSWORD"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }}
                            secureTextEntry
                            error={errors.password}
                            leftIcon={LucideLock}
                            style={styles.inputSpacing}
                        />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            style={styles.forgotBtn}
                        >
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="SIGN IN"
                            onPress={handleLogin}
                            loading={isLoggingIn}
                            icon={LucideArrowRight}
                            style={styles.loginBtn}
                            textStyle={{ fontSize: 16, letterSpacing: 1 }}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.noAccountText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Register Now</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.appBackground,
    },

    glowOrb: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_WIDTH * 0.8,
        borderRadius: (SCREEN_WIDTH * 0.8) / 2,
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Primary color low opacity
        // Faking blur with opacity since simple view
        opacity: 0.6,
        transform: [{ scale: 1.5 }],
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 20,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    brandName: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.text,
        letterSpacing: 6,
    },
    tagline: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        letterSpacing: 4,
        marginTop: 4,
        fontWeight: '600',
    },
    formCard: {
        backgroundColor: '#FFFFFF', // Clean white
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    welcomeTextContainer: {
        marginBottom: 24,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    errorBanner: {
        backgroundColor: 'rgba(255, 61, 113, 0.15)',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
        padding: 12,
        marginBottom: 20,
        borderRadius: 4,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 13,
        fontWeight: '600',
    },
    inputSpacing: {
        marginBottom: 20,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 32,
        marginTop: -8,
        padding: 4,
    },
    forgotText: {
        color: theme.colors.info,
        fontSize: 13,
        fontWeight: '600',
    },
    loginBtn: {
        width: '100%',
        marginBottom: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        opacity: 0.6,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        color: theme.colors.textSecondary,
        paddingHorizontal: 16,
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    noAccountText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    registerLink: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
