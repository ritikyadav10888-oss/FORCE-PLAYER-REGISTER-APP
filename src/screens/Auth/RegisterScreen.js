import * as DocumentPicker from 'expo-document-picker';
import { LucideDribbble, LucideFingerprint, LucideLayers, LucideLineChart, LucideLock, LucideMail, LucideMapPin, LucidePhone, LucideUpload, LucideUser, LucideX } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { ROLES, useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

const GAME_FORMATS = ['Single', 'Double', 'Team'];
const GAMES_MAPPING = {
    'Single': ['Badminton', 'Tennis', 'Table Tennis', 'Squash', 'Athletics', 'Swimming', 'Shooting', 'Archery', 'Boxing', 'Wrestling', 'Chess', 'Weightlifting', 'Gymnastics', 'Cycling', 'Judo', 'Karate', 'Taekwondo', 'Other'],
    'Double': ['Badminton', 'Tennis', 'Table Tennis', 'Squash', 'Carrom', 'Other'],
    'Team': ['Cricket', 'Football', 'Hockey', 'Kabaddi', 'Basketball', 'Volleyball', 'Kho Kho', 'Rugby', 'Handball', 'Baseball', 'Water Polo', 'Throwball', 'Other']
};
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

export default function RegisterScreen({ navigation, route }) {
    const { registerUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState(route?.params?.role || ROLES.PLAYER);
    const [aadharFile, setAadharFile] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState('');
    const [formatModalVisible, setFormatModalVisible] = useState(false);
    const [sportModalVisible, setSportModalVisible] = useState(false);
    const [skillModalVisible, setSkillModalVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);

    const [formData, setFormData] = useState({
        name: '', address: '', mobile: '', email: '', aadharNumber: '', password: '', game: '', strength: '',
    });

    const validate = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = "Required";
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid Email";

        // Strong Password Validation
        const password = formData.password;
        if (!password) {
            newErrors.password = "Required";
        } else if (password.length < 8) {
            newErrors.password = "Min 8 characters";
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = "Need 1 uppercase (A-Z)";
        } else if (!/[a-z]/.test(password)) {
            newErrors.password = "Need 1 lowercase (a-z)";
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = "Need 1 number (0-9)";
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            newErrors.password = "Need 1 special char (!@#$)";
        }

        if (!formData.mobile || formData.mobile.length < 10) newErrors.mobile = "Invalid Mobile";
        if (!formData.aadharNumber || formData.aadharNumber.length !== 12) newErrors.aadharNumber = "Must be 12 digits";
        if (selectedRole === ROLES.PLAYER) {
            if (!selectedFormat) newErrors.format = "Required";
            if (!formData.game) newErrors.game = "Required";
            if (!formData.strength) newErrors.strength = "Required";
            if (!aadharFile) newErrors.aadharFile = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const pickDocument = async () => {
        try {
            let result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (!result.canceled && result.assets) {
                setAadharFile(result.assets[0]);
                if (errors.aadharFile) setErrors(prev => ({ ...prev, aadharFile: null }));
            }
        } catch (err) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const handleRegister = async () => {
        if (!validate()) return;
        try {
            setIsRegistering(true);
            await registerUser({ ...formData, email: formData.email.toLowerCase().trim(), gameType: selectedFormat }, selectedRole, aadharFile);
            console.log("Registration API Success - Auto Logging In");
        } catch (error) {
            console.error("Registration API Failed:", error);
            const msg = error.message?.toLowerCase() || "";

            // Map backend errors to fields
            if (msg.includes('email')) {
                setErrors(prev => ({ ...prev, email: error.message }));
            } else if (msg.includes('mobile') || msg.includes('phone')) {
                setErrors(prev => ({ ...prev, mobile: error.message }));
            } else if (msg.includes('aadhar')) {
                setErrors(prev => ({ ...prev, aadharNumber: error.message }));
            } else {
                // detailed alert if not specific field
                Alert.alert("Registration Failed", error.message);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const renderModal = (visible, setVisible, title, data, onSelect) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <LucideX size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {data.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.modalOption}
                                onPress={() => {
                                    onSelect(item);
                                    setVisible(false);
                                }}
                            >
                                <Text style={styles.modalOptionText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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
                    <Text style={styles.title}>Join the Force</Text>
                    <Text style={styles.subtitle}>Begin your professional sports journey</Text>
                </View>

                <Card variant="surface" padding="xl" style={styles.formCard}>
                    <Text style={styles.sectionHeader}>BASIC IDENTITY</Text>
                    <Input label="Identity Name" placeholder="Full legal name" value={formData.name} onChangeText={t => handleChange('name', t)} error={errors.name} leftIcon={LucideUser} />
                    <Input label="Email Access" placeholder="player@force.com" value={formData.email} onChangeText={t => handleChange('email', t)} keyboardType="email-address" error={errors.email} leftIcon={LucideMail} />

                    <Input label="Security Key" placeholder="Min 8 chars, Upper, Number, Special" value={formData.password} onChangeText={t => handleChange('password', t)} secureTextEntry error={errors.password} leftIcon={LucideLock} />
                    <Text style={{ fontSize: 10, color: theme.colors.textTertiary, paddingHorizontal: 4, marginTop: -12, marginBottom: 16 }}>
                        * Must contain A-Z, 0-9, and Special Character (!@#$)
                    </Text>

                    <Input label="Living Address" placeholder="Your current city" value={formData.address} onChangeText={t => handleChange('address', t)} multiline error={errors.address} leftIcon={LucideMapPin} />

                    <Text style={[styles.sectionHeader, { marginTop: 12 }]}>VERIFICATION</Text>
                    <Input label="Contact Number" placeholder="+91 XXXX-XXXXXX" value={formData.mobile} onChangeText={t => handleChange('mobile', t)} keyboardType="phone-pad" error={errors.mobile} leftIcon={LucidePhone} />
                    <Input label="National ID (Aadhar)" placeholder="12-digit number" value={formData.aadharNumber} onChangeText={t => handleChange('aadharNumber', t)} error={errors.aadharNumber} leftIcon={LucideFingerprint} />

                    <View style={styles.uploadSection}>
                        <Text style={styles.inputLabel}>ID DOCUMENT UPLOAD</Text>
                        <TouchableOpacity style={[styles.uploadBox, errors.aadharFile && styles.errorUpload]} onPress={pickDocument}>
                            <LucideUpload color={aadharFile ? theme.colors.primary : theme.colors.textTertiary} size={28} />
                            <Text style={[styles.uploadText, aadharFile && { color: theme.colors.text }]}>
                                {aadharFile ? aadharFile.name : "Tap to upload Aadhar PDF/Image"}
                            </Text>
                        </TouchableOpacity>
                        {errors.aadharFile && <Text style={styles.errorText}>{errors.aadharFile}</Text>}
                    </View>

                    <Text style={[styles.sectionHeader, { marginTop: 12 }]}>SPORTS PROFILE</Text>
                    <TouchableOpacity onPress={() => setFormatModalVisible(true)}>
                        <Input label="Specialization Format" placeholder="Single / Team" value={selectedFormat} editable={false} error={errors.format} leftIcon={LucideLayers} pointerEvents="none" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectedFormat ? setSportModalVisible(true) : Alert.alert("Hold up", "Select a format first")}>
                        <Input label="Primary Discipline" placeholder="Select your sport" value={formData.game} editable={false} error={errors.game} leftIcon={LucideDribbble} pointerEvents="none" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSkillModalVisible(true)}>
                        <Input label="Current Mastery" placeholder="Skill level" value={formData.strength} editable={false} error={errors.strength} leftIcon={LucideLineChart} pointerEvents="none" />
                    </TouchableOpacity>

                    <Button title="SUBMIT CLEARANCE" onPress={handleRegister} style={styles.submitBtn} loading={isRegistering} />

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                        <Text style={styles.linkText}>Already a member? <Text style={styles.boldText}>Enter Portal</Text></Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>

            {renderModal(formatModalVisible, setFormatModalVisible, "Game Format", GAME_FORMATS, (v) => { setSelectedFormat(v); handleChange('game', ''); })}
            {renderModal(sportModalVisible, setSportModalVisible, "Select Sport", selectedFormat ? GAMES_MAPPING[selectedFormat] : [], (v) => handleChange('game', v))}
            {renderModal(skillModalVisible, setSkillModalVisible, "Skill Level", SKILL_LEVELS, (v) => handleChange('strength', v))}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#0a0e1a' },
    scrollContent: { paddingTop: 40, paddingBottom: 40 },
    brandSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
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
    header: { paddingHorizontal: 24, marginBottom: 24 },
    title: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center' },
    subtitle: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
    formCard: { marginHorizontal: 16, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 },
    sectionHeader: { ...theme.typography.caption, color: theme.colors.primary, marginBottom: 20, letterSpacing: 2 },
    inputLabel: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
    uploadSection: { marginBottom: 24 },
    uploadBox: { height: 100, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', gap: 10 },
    errorUpload: { borderColor: theme.colors.error },
    uploadText: { fontSize: 13, color: theme.colors.textTertiary, fontWeight: '600' },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 6, fontWeight: '600' },
    submitBtn: { marginTop: 20, width: '100%', backgroundColor: '#10b981' },
    loginLink: { marginTop: 24, alignItems: 'center' },
    linkText: { color: theme.colors.textSecondary, fontSize: 14 },
    boldText: { color: '#10b981', fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    modalOptionText: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' }
});
