import * as DocumentPicker from 'expo-document-picker';
import { LucideActivity, LucideAward, LucideCamera, LucideDribbble, LucideEdit2, LucideFingerprint, LucideLayers, LucideLineChart, LucideLogOut, LucideMail, LucideMapPin, LucidePhone, LucideTrophy, LucideX } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

const GAME_FORMATS = ['Single', 'Double', 'Team'];
const GAMES_MAPPING = {
    'Single': ['Badminton', 'Tennis', 'Table Tennis', 'Squash', 'Athletics', 'Swimming', 'Shooting', 'Archery', 'Boxing', 'Wrestling', 'Chess', 'Weightlifting', 'Gymnastics', 'Cycling', 'Judo', 'Karate', 'Taekwondo', 'Other'],
    'Double': ['Badminton', 'Tennis', 'Table Tennis', 'Squash', 'Carrom', 'Other'],
    'Team': ['Cricket', 'Football', 'Hockey', 'Kabaddi', 'Basketball', 'Volleyball', 'Kho Kho', 'Rugby', 'Handball', 'Baseball', 'Water Polo', 'Throwball', 'Other']
};
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

const InfoItem = ({ icon: Icon, label, value, isEditing, onChangeText, onPress, placeholder }) => (
    <View style={styles.infoItem}>
        <View style={styles.iconContainer}>
            <Icon size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            {isEditing ? (
                onPress ? (
                    <TouchableOpacity onPress={onPress}>
                        <Text style={[styles.infoValue, { color: theme.colors.text, borderBottomWidth: 1, borderColor: theme.colors.border, paddingBottom: 4 }]}>
                            {value || 'Select'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Input
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        style={{ marginBottom: 0 }}
                    />
                )
            ) : (
                <Text style={styles.infoValue}>{value || 'N/A'}</Text>
            )}
        </View>
    </View>
);

export default function PlayerProfile({ navigation }) {
    const { user, logout, updateUser } = useAuth();
    const { loadTournaments } = useTournaments();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Dropdown States
    const [formatModalVisible, setFormatModalVisible] = useState(false);
    const [sportModalVisible, setSportModalVisible] = useState(false);
    const [skillModalVisible, setSkillModalVisible] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState(user.gameType || ''); // Assuming user has gameType

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        game: user.game,
        strength: user.strength,
        aadharNumber: user.aadharNumber || '',
    });

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const pickImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleUpdate = async () => {
        try {
            setIsSaving(true);
            await updateUser({ ...formData, gameType: selectedFormat }, selectedImage);
            await loadTournaments(); // Refresh tournaments to update stats and player details
            setIsEditing(false);
            setSelectedImage(null);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    // Construct image URL if available
    const SERVER_URL = API_URL.replace('/api', '');
    const profileImgUrl = user.profileImage ? `${SERVER_URL}/${user.profileImage}` : null;
    const previewUrl = selectedImage ? selectedImage.uri : profileImgUrl;
    const aadharImgUrl = user.aadharCard ? `${SERVER_URL}/${user.aadharCard}` : null;

    const renderModal = (visible, setVisible, title, data, onSelect) => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}><LucideX color={theme.colors.text} size={24} /></TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalOption} onPress={() => { onSelect(item); setVisible(false); }}>
                                <Text style={styles.modalOptionText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                                <LucideEdit2 size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <LucideLogOut size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={isEditing ? pickImage : null}
                        disabled={!isEditing}
                    >
                        <View style={styles.avatar}>
                            {previewUrl ? (
                                <Image source={{ uri: previewUrl }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            )}
                            {isEditing && (
                                <View style={styles.cameraOverlay}>
                                    <LucideCamera size={20} color="#fff" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    {isEditing ? (
                        <View style={{ width: '100%', paddingHorizontal: 20 }}>
                            <Input
                                label="Full Name"
                                value={formData.name}
                                onChangeText={(text) => updateField('name', text)}
                            />
                        </View>
                    ) : (
                        <Text style={styles.userName}>{user.name}</Text>
                    )}
                    {!isEditing && (
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user.game || 'Athlete'}</Text>
                        </View>
                    )}
                </View>

                {/* Stats / Game Info */}
                {!isEditing && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Performance Stats</Text>
                        <View style={styles.grid}>
                            <View style={styles.statCard}>
                                <LucideActivity size={24} color={theme.colors.secondary} style={{ marginBottom: 8 }} />
                                <Text style={styles.statValue}>{formData.strength || 'Beginner'}</Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </View>
                            <View style={styles.statCard}>
                                <LucideTrophy size={24} color="#FFD700" style={{ marginBottom: 8 }} />
                                <Text style={styles.statValue}>0</Text>
                                <Text style={styles.statLabel}>Won</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    <View style={styles.infoCard}>
                        <InfoItem icon={LucideMail} label="Email" value={formData.email} onChangeText={t => updateField('email', t)} isEditing={isEditing} />
                        <View style={styles.divider} />
                        <InfoItem icon={LucidePhone} label="Mobile" value={formData.mobile} onChangeText={t => updateField('mobile', t)} isEditing={isEditing} />
                        <View style={styles.divider} />
                        <InfoItem icon={LucideMapPin} label="Address" value={formData.address} onChangeText={t => updateField('address', t)} isEditing={isEditing} />

                        <View style={styles.divider} />
                        {isEditing && (
                            <>
                                <InfoItem icon={LucideLayers} label="Format (Tap to Select)" value={selectedFormat} isEditing={true} onPress={() => setFormatModalVisible(true)} />
                                <View style={styles.divider} />
                            </>
                        )}

                        <InfoItem
                            icon={LucideDribbble}
                            label="Primary Sport"
                            value={formData.game}
                            isEditing={isEditing}
                            onPress={isEditing ? () => selectedFormat ? setSportModalVisible(true) : Alert.alert("Select Format first") : null}
                        />

                        <View style={styles.divider} />

                        <InfoItem
                            icon={LucideLineChart}
                            label="Skill Level"
                            value={formData.strength}
                            isEditing={isEditing}
                            onPress={isEditing ? () => setSkillModalVisible(true) : null}
                        />

                        <View style={styles.divider} />
                        <InfoItem icon={LucideFingerprint} label="Aadhar Number" value={formData.aadharNumber} onChangeText={t => updateField('aadharNumber', t)} isEditing={isEditing} />

                    </View>
                </View>

                {isEditing && (
                    <View style={styles.actionRow}>
                        <Button
                            title="Cancel"
                            onPress={() => setIsEditing(false)}
                            variant="outline"
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Save Changes"
                            onPress={handleUpdate}
                            loading={isSaving}
                            style={{ flex: 1 }}
                        />
                    </View>
                )}

                {/* Documents - Aadhar Image Display */}
                {!isEditing && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Documents</Text>
                        <View style={styles.docCard}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <LucideAward size={24} color={theme.colors.textSecondary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.docTitle}>Aadhar Card</Text>
                                        <Text style={styles.docStatus}>{user.aadharCard ? 'Uploaded & Verified' : 'Not Uploaded'}</Text>
                                    </View>
                                </View>

                                {aadharImgUrl ? (
                                    <Image
                                        source={{ uri: aadharImgUrl }}
                                        style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text style={{ color: theme.colors.textTertiary, fontStyle: 'italic', marginTop: 8 }}>
                                        No document uploaded.
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

            </ScrollView>

            {renderModal(formatModalVisible, setFormatModalVisible, "Game Format", GAME_FORMATS, (v) => { setSelectedFormat(v); setFormData(p => ({ ...p, game: '' })); })}
            {renderModal(sportModalVisible, setSportModalVisible, "Select Sport", selectedFormat ? GAMES_MAPPING[selectedFormat] : [], (v) => setFormData(p => ({ ...p, game: v })))}
            {renderModal(skillModalVisible, setSkillModalVisible, "Skill Level", SKILL_LEVELS, (v) => setFormData(p => ({ ...p, strength: v })))}

        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    backText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    headerTitle: { // Add headerTitle style
        ...theme.typography.header,
        fontSize: 20,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        marginBottom: 15,
        ...theme.shadows.colored,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    userName: {
        ...theme.typography.header,
        fontSize: 24,
        marginBottom: 5,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.3)',
    },
    roleText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 15,
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 10,
        marginLeft: 55, // Offset for icon
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    docTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text,
    },
    docStatus: {
        color: theme.colors.primary,
        marginTop: 2,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        marginBottom: 30,
    },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: theme.colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { ...theme.typography.h3, color: theme.colors.text },
    modalOption: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    modalOptionText: { ...theme.typography.body, color: theme.colors.text, fontWeight: '600' }
});
