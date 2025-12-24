import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { API_URL } from '../../config';
import { theme } from '../../styles/theme';

export default function ForgotPasswordScreen({ navigation, route }) {
    const defaultRole = route.params?.role || 'PLAYER';
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateEmail = () => {
        if (!email) {
            setErrors({ email: "Email is required" });
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Invalid email format" });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateReset = () => {
        let newErrors = {};
        if (!otp) newErrors.otp = "OTP is required";
        if (!newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "Min 6 characters required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOTP = async () => {
        if (!validateEmail()) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase().trim(), role: defaultRole })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            Alert.alert("OTP Sent", "Check your email for the reset code");
            setStep(2);
        } catch (e) {
            Alert.alert("Error", e.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!validateReset()) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    role: defaultRole,
                    otp,
                    newPassword
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            Alert.alert("Success", "Your password is reset", [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]);
        } catch (e) {
            Alert.alert("Reset Failed", e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Logo and Branding */}
                <View style={styles.brandSection}>
                    <View style={styles.logoRing}>
                        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.brandName}>FORCE</Text>
                    <Text style={styles.brandTagline}>DOMINATE THE FIELD.</Text>
                </View>

                <View style={styles.header}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>{defaultRole} Account Recovery</Text>
                </View>

                {step === 1 ? (
                    <>
                        <Text style={styles.instructions}>Enter your registered email address to receive a reset code.</Text>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({}); }}
                            placeholder="anand@example.com"
                            keyboardType="email-address"
                            error={errors.email}
                        />
                        <Button title="Send OTP" onPress={handleSendOTP} loading={loading} style={styles.actionBtn} />
                    </>
                ) : (
                    <>
                        <Text style={styles.instructions}>Enter the 4-digit OTP sent to {email}</Text>
                        <Input
                            label="OTP"
                            value={otp}
                            onChangeText={(t) => { setOtp(t); if (errors.otp) setErrors(prev => ({ ...prev, otp: null })); }}
                            placeholder="1234"
                            keyboardType="numeric"
                            error={errors.otp}
                        />
                        <Input
                            label="New Password"
                            value={newPassword}
                            onChangeText={(t) => { setNewPassword(t); if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: null })); }}
                            placeholder="******"
                            secureTextEntry
                            error={errors.newPassword}
                        />
                        <Button title="Reset Password" onPress={handleResetPassword} loading={loading} style={styles.actionBtn} />
                    </>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
                    <Text style={styles.footerText}>Back to <Text style={styles.boldText}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0a0e1a',
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoRing: {
        width: 180,
        height: 180,
        borderRadius: 30,
        borderWidth: 0,
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: 16,
        overflow: 'hidden',
    },
    logo: {
        width: 180,
        height: 180,
        borderRadius: 30,
    },
    brandName: {
        display: 'none',
        fontSize: 28,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 6,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: 12,
        color: '#6b7280',
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginTop: -10,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    instructions: {
        color: theme.colors.textSecondary,
        marginBottom: 20,
        fontSize: 14,
    },
    actionBtn: {
        marginTop: 20,
        backgroundColor: '#10b981',
    },
    footerLink: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    boldText: {
        color: '#10b981',
        fontWeight: 'bold',
    },
});
