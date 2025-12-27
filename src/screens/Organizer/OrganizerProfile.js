import * as DocumentPicker from 'expo-document-picker';
import { LucideCamera, LucideEdit2, LucideLogOut, LucideMail, LucideMapPin, LucidePhone, LucideTrophy, LucideUser } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';

export default function OrganizerProfile({ navigation }) {
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
    });

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
            await updateUser(formData, selectedImage);
            setIsEditing(false);
            setSelectedImage(null);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const SERVER_URL = API_URL.replace('/api', '');
    const profileImgUrl = user.profileImage ? `${SERVER_URL}/${user.profileImage}` : null;
    const previewUrl = selectedImage ? selectedImage.uri : profileImgUrl;

    const InfoItem = ({ icon: Icon, label, value, field }) => (
        <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
                <Icon size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                {isEditing ? (
                    <Input
                        value={formData[field]}
                        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                        style={{ marginBottom: 0 }}
                        variant="light"
                    />
                ) : (
                    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Organizer Profile</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {!isEditing && (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <LucideEdit2 size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={logout}>
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
                                <LucideUser size={50} color={theme.colors.primary} />
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
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                variant="light"
                            />
                        </View>
                    ) : (
                        <Text style={styles.userName}>{user.name}</Text>
                    )}
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>ORGANIZER</Text>
                    </View>
                </View>

                {/* Stats */}
                {!isEditing && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dashboard Stats</Text>
                        <View style={styles.grid}>
                            <View style={styles.statCard}>
                                <LucideTrophy size={24} color={theme.colors.secondary} style={{ marginBottom: 8 }} />
                                <Text style={styles.statValue}>ACTIVE</Text>
                                <Text style={styles.statLabel}>Status</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Details</Text>
                    <View style={styles.infoCard}>
                        <InfoItem icon={LucideMail} label="Email" value={user.email} field="email" />
                        <View style={styles.divider} />
                        <InfoItem icon={LucidePhone} label="Mobile" value={user.mobile} field="mobile" />
                        <View style={styles.divider} />
                        <InfoItem icon={LucideMapPin} label="Address" value={user.address} field="address" />
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
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
        color: '#666666',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FAFAFA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000000',
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
        color: '#000000',
        marginBottom: 15,
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666666',
    },
    infoCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
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
        color: '#666666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#000000',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 10,
        marginLeft: 55,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        marginBottom: 30,
    }
});
