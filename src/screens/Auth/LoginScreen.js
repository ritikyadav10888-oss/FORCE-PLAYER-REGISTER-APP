import { LucideActivity, LucideArrowRight, LucideLock, LucideMail, LucideShieldCheck, LucideTrophy } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        let newErrors = {};
        if (!email) {
            newErrors.email = "Required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Invalid format";
        }
        if (!password) {
            newErrors.password = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        try {
            setIsLoggingIn(true);
            await login(null, { email: email.toLowerCase().trim(), password });
        } catch (e) {
            Alert.alert("Access Denied", e.message || "Invalid credentials");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <Container style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Brand Hero */}
                <View style={styles.hero}>
                    <View style={styles.logoRing}>
                        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.brandName}>FORCE</Text>
                    <Text style={styles.tagline}>DOMINATE THE FIELD.</Text>
                </View>

                {/* Login Form */}
                <Card variant="surface" padding="xl" style={styles.authCard}>
                    <Text style={styles.loginTitle}>Welcome Back</Text>
                    <Text style={styles.loginSubtitle}>Sign in to continue your journey</Text>

                    <Input
                        label="Email Identity"
                        placeholder="player@force.com"
                        value={email}
                        onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }}
                        keyboardType="email-address"
                        error={errors.email}
                        leftIcon={LucideMail}
                    />

                    <Input
                        label="Security Key"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }}
                        secureTextEntry
                        error={errors.password}
                        leftIcon={LucideLock}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotBtn}
                    >
                        <Text style={styles.forgotText}>Lost access?</Text>
                    </TouchableOpacity>

                    <Button
                        title="GO TO DASHBOARD"
                        onPress={handleLogin}
                        style={styles.loginBtn}
                        loading={isLoggingIn}
                        icon={LucideArrowRight}
                    />

                </Card>

                <View style={styles.registerContainer}>
                    <Text style={styles.noAccountText}>New to Force?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Register as Player</Text>
                    </TouchableOpacity>
                </View>

                {/* Selling Points */}
                <View style={styles.featuresSection}>
                    <Text style={styles.sectionHeader}>WHY FORCE?</Text>

                    <View style={styles.featureGrid}>
                        <Card variant="glass" padding="m" style={styles.featureBox}>
                            <LucideTrophy color={theme.colors.primary} size={24} />
                            <Text style={styles.featureTitle}>Pro Events</Text>
                        </Card>
                        <Card variant="glass" padding="m" style={styles.featureBox}>
                            <LucideActivity color={theme.colors.secondary} size={24} />
                            <Text style={styles.featureTitle}>Live Stats</Text>
                        </Card>
                        <Card variant="glass" padding="m" style={styles.featureBox}>
                            <LucideShieldCheck color={theme.colors.accent} size={24} />
                            <Text style={styles.featureTitle}>Secure Pay</Text>
                        </Card>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statLine}>
                            <Text style={styles.statVal}>5.0k+</Text>
                            <Text style={styles.statLabel}>Elite Players</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statLine}>
                            <Text style={styles.statVal}>120+</Text>
                            <Text style={styles.statLabel}>Active Leagues</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.appBackground,
    },
    scrollContent: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 2,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoRing: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 2,
        borderColor: theme.colors.primary + '30',
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '08',
        marginBottom: 16,
    },
    logo: {
        width: 130,
        height: 130,
    },
    brandName: {
        ...theme.typography.h1,
        color: theme.colors.text,
        letterSpacing: 4,
    },
    tagline: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginTop: 6,
        letterSpacing: 2,
    },
    authCard: {
        marginHorizontal: theme.spacing.m,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
    },
    loginTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 4,
    },
    loginSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginBottom: 24,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: theme.colors.primary,
        ...theme.typography.caption,
        fontWeight: '800',
    },
    loginBtn: {
        width: '100%',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 12,
        marginHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        gap: 8,
    },
    noAccountText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
        opacity: 0.8,
        fontWeight: '600',
    },
    registerLink: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    featuresSection: {
        marginTop: 48,
        paddingHorizontal: theme.spacing.m,
    },
    sectionHeader: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
    },
    featureGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    featureBox: {
        width: (SCREEN_WIDTH - 64) / 3,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    featureTitle: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surfaceLight,
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    statLine: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.border,
        marginHorizontal: 40,
    },
    statVal: {
        ...theme.typography.h3,
        color: theme.colors.primary,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 9,
        color: theme.colors.textTertiary,
        marginTop: 2,
    }
});
