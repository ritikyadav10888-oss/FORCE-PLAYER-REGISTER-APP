import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { LucideCalendar, LucideFingerprint, LucideLock, LucideMail, LucideMapPin, LucidePhone, LucideUpload, LucideUser, LucideX } from 'lucide-react-native';
import { createElement, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { INDIAN_STATES } from '../../constants/indianStateDistricts';
import { ROLES, useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';



export default function RegisterScreen({ navigation, route }) {
    const { registerUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState(route?.params?.role || ROLES.PLAYER);
    const [aadharFile, setAadharFile] = useState(null);

    const [errors, setErrors] = useState({});
    const [isRegistering, setIsRegistering] = useState(false);
    const [stateModalVisible, setStateModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        name: '', address: '', state: '', district: '', pincode: '', mobile: '', email: '', aadharNumber: '', password: '', dob: '',
        coordinates: null
    });

    const validate = () => {
        let newErrors = {};
        if (!formData.name) newErrors.name = "Required";

        if (!formData.dob) {
            newErrors.dob = "Required";
        } else {
            // Validate Age (Min 10 Years)
            const [d, m, y] = formData.dob.split('/');
            const birthDate = new Date(y, m - 1, d);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const mDiff = today.getMonth() - birthDate.getMonth();
            if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 10) newErrors.dob = "Must be at least 10 years old";
        }

        if (!formData.address) newErrors.address = "Required";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.district) newErrors.district = "Required";
        if (!formData.pincode) newErrors.pincode = "Required";
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

            if (!aadharFile) newErrors.aadharFile = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };


    const handleRegister = async () => {
        if (!validate()) return;
        try {
            setIsRegistering(true);
            await registerUser({ ...formData, email: formData.email.toLowerCase().trim() }, selectedRole, aadharFile);
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

    const handleGetLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to auto-fill address.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse Geocode
            try {
                const addressResponse = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (addressResponse.length > 0) {
                    const addr = addressResponse[0];
                    const parts = [
                        addr.street,
                        addr.district || addr.subregion,
                        addr.city,
                        addr.region,
                        addr.postalCode
                    ].filter(Boolean);

                    const addressString = parts.join(', ');

                    setFormData(prev => ({
                        ...prev,
                        address: addressString,
                        state: addr.region || prev.state,
                        district: addr.district || addr.city || prev.district,
                        pincode: addr.postalCode || prev.pincode,
                        coordinates: { latitude, longitude }
                    }));
                }
            } catch (e) {
                console.log("Reverse geocode error", e);
            }

        } catch (error) {
            Alert.alert("Error", "Could not fetch location: " + error.message);
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
                    <Text style={styles.title}>Join the Force</Text>
                    <Text style={styles.subtitle}>Begin your professional sports journey</Text>
                </View>

                <Card variant="surface" padding="xl" style={styles.formCard}>
                    <Text style={styles.sectionHeader}>PERSONAL DETAILS</Text>
                    <Input label="Full Name" placeholder="Enter Full Name" value={formData.name} onChangeText={t => handleChange('name', t)} error={errors.name} leftIcon={LucideUser} />

                    <Input label="Email ID" placeholder="Enter Email ID" value={formData.email} onChangeText={t => handleChange('email', t)} keyboardType="email-address" error={errors.email} leftIcon={LucideMail} />

                    <Input label="Password" placeholder="Enter Password" value={formData.password} onChangeText={t => handleChange('password', t)} secureTextEntry error={errors.password} leftIcon={LucideLock} />
                    <Text style={{ fontSize: 10, color: theme.colors.textTertiary, paddingHorizontal: 4, marginTop: -12, marginBottom: 16 }}>
                        * Must contain A-Z, 0-9, and Special Character (!@#$)
                    </Text>
                    {Platform.OS === 'web' ? (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.inputLabel}>Date of Birth</Text>
                            <View style={{
                                height: 50,
                                backgroundColor: theme.colors.surfaceLight,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: theme.colors.border,
                                justifyContent: 'center',
                                paddingHorizontal: 15
                            }}>
                                {createElement('input', {
                                    type: 'date',
                                    value: formData.dob ? formData.dob.split('/').reverse().join('-') : '',
                                    onChange: (e) => {
                                        const dateVal = e.target.value;
                                        if (dateVal) {
                                            const [y, m, d] = dateVal.split('-');
                                            setFormData(prev => ({ ...prev, dob: `${d}/${m}/${y}` }));
                                        } else {
                                            setFormData(prev => ({ ...prev, dob: '' }));
                                        }
                                    },
                                    style: {
                                        height: '100%',
                                        width: '100%',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        outline: 'none',
                                        color: theme.colors.text,
                                        fontSize: 16,
                                        fontFamily: 'System'
                                    }
                                })}
                            </View>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <Input label="Date of Birth" placeholder="DD/MM/YYYY" value={formData.dob} editable={false} error={errors.dob} leftIcon={LucideCalendar} pointerEvents="none" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={(() => {
                                        if (formData.dob) {
                                            const [d, m, y] = formData.dob.split('/');
                                            return new Date(y, m - 1, d);
                                        }
                                        return new Date();
                                    })()}
                                    mode="date"
                                    display="default"
                                    maximumDate={new Date()} // Prevent future dates
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setFormData(prev => ({ ...prev, dob: selectedDate.toLocaleDateString('en-GB') }));
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}


                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 5 }}>
                        <Text style={styles.inputLabel}></Text>
                        <TouchableOpacity onPress={handleGetLocation} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LucideMapPin size={14} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.primary, fontSize: 12, marginLeft: 4, fontWeight: '600' }}>Auto-Fill Location</Text>
                        </TouchableOpacity>
                    </View>
                    {formData.state ? (
                        <View style={{ marginBottom: 15, backgroundColor: theme.colors.surfaceLight, padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <LucideMapPin size={16} color="#10b981" />
                            <Text style={{ marginLeft: 8, color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>
                                Detected: {formData.district ? `${formData.district}, ` : ''}{formData.state}
                            </Text>
                        </View>
                    ) : null}
                    <Input label="Address Line" placeholder="House No, Street, Locality" value={formData.address} onChangeText={t => handleChange('address', t)} multiline error={errors.address} leftIcon={LucideMapPin} />

                    <Input label="Pincode" placeholder="Pincode" value={formData.pincode} onChangeText={t => handleChange('pincode', t)} keyboardType="numeric" maxLength={6} error={errors.pincode} leftIcon={LucideMapPin} />

                    <Text style={[styles.sectionHeader, { marginTop: 12 }]}>CONTACT & ID</Text>
                    <Input label="Mobile Number" placeholder="Enter Mobile Number" value={formData.mobile} onChangeText={t => handleChange('mobile', t)} keyboardType="phone-pad" error={errors.mobile} leftIcon={LucidePhone} />
                    <Input label="Aadhar Number" placeholder="Enter Aadhar Number" value={formData.aadharNumber} onChangeText={t => handleChange('aadharNumber', t)} error={errors.aadharNumber} leftIcon={LucideFingerprint} />

                    <View style={styles.uploadSection}>
                        <Text style={styles.inputLabel}>UPLOAD AADHAR CARD</Text>
                        <TouchableOpacity style={[styles.uploadBox, errors.aadharFile && styles.errorUpload]} onPress={pickDocument}>
                            <LucideUpload color={aadharFile ? theme.colors.primary : theme.colors.textTertiary} size={28} />
                            <Text style={[styles.uploadText, aadharFile && { color: theme.colors.text }]}>
                                {aadharFile ? aadharFile.name : "Tap to upload Aadhar PDF/Image"}
                            </Text>
                        </TouchableOpacity>
                        {errors.aadharFile && <Text style={styles.errorText}>{errors.aadharFile}</Text>}
                    </View>



                    <Button title="REGISTER" onPress={handleRegister} style={styles.submitBtn} loading={isRegistering} />

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                        <Text style={styles.linkText}>Already a member? <Text style={styles.boldText}>Login</Text></Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>

            {renderModal(stateModalVisible, setStateModalVisible, "Select State", INDIAN_STATES.map(s => s.state), (v) => {
                setFormData(prev => ({ ...prev, state: v, district: '' }));
            })}
            {renderModal(districtModalVisible, setDistrictModalVisible, "Select District", formData.state ? (INDIAN_STATES.find(s => s.state === formData.state)?.districts || []) : [], (v) => handleChange('district', v))}


        </Container>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: theme.colors.appBackground },
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
        color: theme.colors.text,
        letterSpacing: 6,
        marginBottom: 4,
    },
    brandTagline: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginTop: -10,
    },
    header: { paddingHorizontal: 24, marginBottom: 24 },
    title: { ...theme.typography.h2, color: theme.colors.text, textAlign: 'center' },
    subtitle: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
    formCard: { marginHorizontal: 16, borderColor: theme.colors.border, borderWidth: 1 },
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
