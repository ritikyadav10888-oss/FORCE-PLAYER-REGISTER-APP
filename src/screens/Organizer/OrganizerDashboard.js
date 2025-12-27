import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { LucideCalendar, LucideCheckCircle, LucideChevronDown, LucideClock, LucideImagePlus, LucideIndianRupee, LucideUser } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

export default function OrganizerDashboard({ navigation }) {
    const { user, logout } = useAuth();
    const { tournaments, fetchEarnings, createTournament, updateStatus, updateMatchScore, loadTournaments, deleteTournament, updateTournament } = useTournaments();
    const [showCreate, setShowCreate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [confirmModal, setConfirmModal] = useState({ visible: false, message: '', onConfirm: null });
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [earnings, setEarnings] = useState({ totalEarnings: 0, history: [] });

    const [selectedBanner, setSelectedBanner] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showSportPicker, setShowSportPicker] = useState(false);
    const [showTournamentFormatPicker, setShowTournamentFormatPicker] = useState(false);
    const [showRegistrationPicker, setShowRegistrationPicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [newTournament, setNewTournament] = useState({ name: '', gameType: '', date: '', time: '', endTime: '', registrationDeadline: '', entryFee: '', type: 'Single', format: 'KNOCKOUT', address: '' });
    const [formErrors, setFormErrors] = useState({});
    const [selectedAnalytic, setSelectedAnalytic] = useState(null); // For analytics drill-down

    const TOURNAMENT_FORMATS = ['KNOCKOUT', 'ROUND_ROBIN'];
    const ALL_SPORTS = [
        'Archery', 'Athletics', 'Badminton', 'Basketball', 'Billiards & Snooker', 'Boxing',
        'Carrom', 'Chess', 'Cricket', 'Cycling', 'Football', 'Golf', 'Gymnastics',
        'Handball', 'Hockey', 'Judo', 'Kabaddi', 'Karate', 'Kho Kho', 'Rugby',
        'Shooting', 'Squash', 'Swimming', 'Table Tennis', 'Taekwondo', 'Tennis',
        'Throwball', 'Volleyball', 'Wrestling'
    ].sort();

    const normalizedGame = user.game ? user.game.charAt(0).toUpperCase() + user.game.slice(1).toLowerCase() : null;

    // Filter sports based only on User Specialization if applicable
    const SPORTS = normalizedGame
        ? (ALL_SPORTS.includes(normalizedGame) ? [normalizedGame] : ALL_SPORTS)
        : ALL_SPORTS;

    useEffect(() => {
        const fetchOrganizerEarnings = async () => {
            try {
                const response = await fetch(`${API_URL}/organizers/${user.id}/earnings`);
                const data = await response.json();
                setEarnings(data);
            } catch (e) {
                console.error("Failed to fetch earnings", e);
            }
        };
        if (user) fetchOrganizerEarnings();
    }, [user.id, tournaments]);

    const [filterMode, setFilterMode] = useState('ALL'); // 'MY' or 'ALL'

    // Filter tournaments based on mode
    const displayedTournaments = filterMode === 'MY'
        ? tournaments.filter(t => {
            const tOrgId = (t.organizerId && t.organizerId._id) ? t.organizerId._id.toString() : (t.organizerId ? t.organizerId.toString() : '');
            return tOrgId === (user.id || '');
        })
        : tournaments;

    const pickBanner = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });
            if (!result.canceled) {
                setSelectedBanner(result.assets[0]);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error picking image");
        }
    };

    const fileToBase64 = async (file) => {
        if (!file) return null;
        try {
            if (Platform.OS === 'web') {
                if (file.file) { // Web DocumentPicker result
                    return await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file.file);
                    });
                } else if (file.uri) {
                    // Sometimes web uri is blob:
                    const response = await fetch(file.uri);
                    const blob = await response.blob();
                    return await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                }
            } else {
                const FileSystem = require('expo-file-system');
                return await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            }
        } catch (e) {
            console.error("File conversion error", e);
            return null;
        }
        return null;
    };

    const validateTournamentForm = () => {
        let errors = {};

        if (!newTournament.name || newTournament.name.trim().length < 3) {
            errors.name = "Tournament name must be at least 3 characters";
        }

        if (!newTournament.gameType || newTournament.gameType.trim().length < 2) {
            errors.gameType = "Game type is required";
        }

        if (!newTournament.address || newTournament.address.trim().length < 5) {
            errors.address = "Valid address is required";
        }

        if (!newTournament.date) {
            errors.date = "Date is required";
        } else {
            // Validate date format YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(newTournament.date)) {
                errors.date = "Date must be in YYYY-MM-DD format";
            } else {
                const inputDate = new Date(newTournament.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (inputDate < today) {
                    errors.date = "Date cannot be in the past";
                }
            }
        }

        if (!newTournament.time) {
            errors.time = "Time is required";
        } else {
            // Validate time format HH:MM
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(newTournament.time)) {
                errors.time = "Time must be in HH:MM format (e.g., 14:30)";
            } else if (!errors.date && newTournament.date) {
                // If date is valid and is Today, check Time
                const inputDate = new Date(newTournament.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (inputDate.getTime() === today.getTime()) {
                    const now = new Date();
                    const [h, m] = newTournament.time.split(':');
                    const tournamentTime = new Date();
                    tournamentTime.setHours(parseInt(h), parseInt(m), 0, 0);

                    if (tournamentTime < now) {
                        errors.time = "For today, time must be in the future";
                    }
                }
            }
        }

        if (!newTournament.entryFee) {
            errors.entryFee = "Entry fee is required";
        } else if (isNaN(newTournament.entryFee) || Number(newTournament.entryFee) < 0) {
            errors.entryFee = "Entry fee must be a valid number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateTournamentForm()) return;

        try {
            setIsUploading(true);
            let bannerBase64 = null;
            if (selectedBanner) {
                bannerBase64 = await fileToBase64(selectedBanner);
            }

            const payload = {
                ...newTournament,
                type: (newTournament.type || 'SINGLE').toUpperCase(),
                organizerId: user.id,
                bannerBase64
            };

            if (isEditing && editingId) {
                await updateTournament(editingId, payload);
                Alert.alert("Success", "Tournament Updated!");
            } else {
                await createTournament(payload);
                Alert.alert("Success", "Tournament Created!");
            }

            await loadTournaments(); // Refresh

            setShowCreate(false);
            setIsEditing(false);
            setEditingId(null);
            setNewTournament({ name: '', gameType: 'Single', date: '', time: '', endTime: '', registrationDeadline: '', entryFee: '', address: '' });
            setSelectedBanner(null);
            setFormErrors({});
        } catch (error) {
            Alert.alert("Error", error.message || "Operation failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFormChange = (field, value) => {
        setNewTournament({ ...newTournament, [field]: value });
        if (formErrors[field]) {
            setFormErrors({ ...formErrors, [field]: null });
        }
    };

    const handleStatusUpdate = async (status) => {
        if (selectedTournament) {
            await updateStatus(selectedTournament.id, status);
            // Update local state to reflect change immediately in the detailed view
            setSelectedTournament(prev => ({ ...prev, status }));
            Alert.alert("Success", `Tournament marked as ${status}`);
        }
    };

    const handleEdit = (t) => {
        setNewTournament({
            name: t.name,
            gameType: t.gameType,
            date: t.date,
            time: t.time,
            entryFee: t.entryFee ? String(t.entryFee) : '',
            type: t.type,
            format: t.format || 'KNOCKOUT',
            address: t.address || '',
            endTime: t.endTime || '',
            registrationDeadline: t.registrationDeadline || ''
        });
        setEditingId(t.id);
        setIsEditing(true);
        setShowCreate(true);
    };

    const handleDelete = (t) => {
        setConfirmModal({
            visible: true,
            message: `Are you sure you want to delete "${t.name}"? This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deleteTournament(t.id);
                    await loadTournaments();
                    setSelectedTournament(null);
                    setConfirmModal({ visible: false, message: '', onConfirm: null });
                } catch (e) {
                    console.error(e);
                    // Could show error in modal if extended, for now just log
                }
            }
        });
    };

    const renderItem = ({ item }) => {
        const SERVER_URL = API_URL.replace('/api', '');
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedTournament(item)}
                activeOpacity={0.7}
            >
                {/* Tournament Banner */}
                {item.banner && (
                    <Image
                        source={{ uri: `${SERVER_URL}/${item.banner}` }}
                        style={styles.cardBanner}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.cardContent}>
                    <View>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardSubtitle}>{item.type} • {item.gameType} • {item.status}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                            <LucideIndianRupee size={12} color={theme.colors.success} />
                            <Text style={{ color: theme.colors.success, fontSize: 12, fontWeight: 'bold' }}>
                                {item.entryFee ? (item.players.length * item.entryFee) : 0}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.players.length} Players</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetailView = () => {
        // Use selectedTournament directly to respect local optimistic updates
        const currentTournament = selectedTournament;
        const SERVER_URL = API_URL.replace('/api', '');

        if (selectedPlayer) {
            return (
                <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                        <Button
                            title="← Back to Players"
                            variant="outline"
                            onPress={() => setSelectedPlayer(null)}
                            style={{ alignSelf: 'flex-start', marginBottom: 20 }}
                        />

                        <View style={styles.profileHeader}>
                            <View style={styles.largeAvatar}>
                                {selectedPlayer.user?.profileImage ? (
                                    <Image
                                        source={{ uri: `${SERVER_URL}/${selectedPlayer.user.profileImage}` }}
                                        style={styles.fullImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarLetter}>{selectedPlayer.name?.charAt(0) || '?'}</Text>
                                )}
                            </View>
                            <View>
                                <Text style={styles.detailTitle}>{selectedPlayer.name || 'Unknown'}</Text>
                                <Text style={styles.detailSubText}>{selectedPlayer.email || 'No Email'}</Text>
                                <Text style={styles.detailSubText}>{selectedPlayer.mobile || 'No Mobile'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{selectedPlayer.user?.address || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Game/Sport</Text>
                            <Text style={styles.infoValue}>{selectedPlayer.game || selectedPlayer.user?.game || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Skill Level</Text>
                            <Text style={styles.infoValue}>{selectedPlayer.strength || selectedPlayer.user?.strength || 'N/A'}</Text>
                        </View>

                        <View style={styles.infoSection}>
                            <Text style={styles.infoLabel}>Aadhar Number</Text>
                            <Text style={styles.infoValue}>{selectedPlayer.user?.aadharNumber || 'N/A'}</Text>
                        </View>

                        {selectedPlayer.user?.aadharCard && (
                            <View style={styles.documentSection}>
                                <Text style={styles.infoLabel}>Aadhar Card Document</Text>
                                <Image
                                    source={{ uri: `${SERVER_URL}/${selectedPlayer.user.aadharCard}` }}
                                    style={styles.documentImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            );
        }



        return (
            <View style={{ flex: 1 }}>
                <Button
                    title="← Back to Dashboard"
                    variant="outline"
                    onPress={() => setSelectedTournament(null)}
                    style={{ alignSelf: 'flex-start', marginBottom: 16 }}
                />

                {/* Tournament Banner */}
                {currentTournament.banner && (
                    <Image
                        source={{ uri: `${SERVER_URL}/${currentTournament.banner}` }}
                        style={styles.detailBanner}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>{currentTournament.name}</Text>
                    <Text style={[
                        styles.statusBadge,
                        { color: currentTournament.status === 'ONGOING' ? theme.colors.success : theme.colors.textSecondary }
                    ]}>
                        {currentTournament.status === 'PENDING' ? 'Registration Open' : currentTournament.status}
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    <Text style={styles.detailSub}>📍 {currentTournament.address || 'Address not provided'}</Text>
                    <Text style={styles.detailSub}>{currentTournament.type} | {currentTournament.gameType}</Text>
                    <Text style={styles.detailSub}>
                        📅 {currentTournament.date} {currentTournament.time} {currentTournament.endTime ? `- ${currentTournament.endTime}` : ''}
                    </Text>
                    {currentTournament.registrationDeadline && (
                        <Text style={{ color: theme.colors.error, fontSize: 13, marginTop: 4, fontWeight: '500' }}>
                            🛑 Reg. Deadline: {currentTournament.registrationDeadline}
                        </Text>
                    )}

                    <View style={styles.actionButtons}>
                        <Text style={styles.label}>Control Panel:</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                            {currentTournament.status === 'PENDING' && (
                                <Button title="Start & Generate Matches" onPress={() => handleStatusUpdate('ONGOING')} style={{ flexGrow: 1, backgroundColor: theme.colors.success }} />
                            )}
                            {currentTournament.status === 'ONGOING' && (
                                <Button title="Complete Tournament" onPress={() => handleStatusUpdate('COMPLETED')} style={{ flexGrow: 1, backgroundColor: theme.colors.secondary }} />
                            )}
                            <Button title="✏️ Edit Info" variant="outline" onPress={() => handleEdit(currentTournament)} style={{ flexGrow: 1 }} />
                            <Button title="🗑️ Delete" variant="outline" onPress={() => handleDelete(currentTournament)} style={{ flexGrow: 1, borderColor: 'red' }} />
                            <Button
                                title="📢 Broadcast"
                                onPress={() => setShowBroadcast(true)}
                                style={{ flexGrow: 1, backgroundColor: theme.colors.primary }}
                            />
                        </View>
                    </View>

                    {/* Match Center - Grouped by Round */}
                    {currentTournament.matches && currentTournament.matches.length > 0 && (
                        <View style={{ marginTop: 24 }}>
                            <Text style={styles.sectionTitle}>Live Match Center</Text>

                            {/* Group Matches by Round */}
                            {Object.entries(currentTournament.matches.reduce((acc, match) => {
                                (acc[match.round] = acc[match.round] || []).push(match);
                                return acc;
                            }, {})).map(([round, roundMatches]) => {
                                // Get round name from first match in this round
                                const roundName = roundMatches[0]?.roundName || `Round ${round}`;
                                return (
                                    <View key={round} style={{ marginBottom: 20 }}>
                                        <View style={{ backgroundColor: theme.colors.surfaceLight, padding: 8, borderRadius: 8, marginBottom: 8 }}>
                                            <Text style={{ ...theme.typography.body, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' }}>
                                                {roundName.toUpperCase()}
                                            </Text>
                                        </View>

                                        {roundMatches.map((match, idx) => {
                                            // Need original index for update
                                            const originalIdx = currentTournament.matches.indexOf(match);
                                            return (
                                                <View key={idx} style={styles.matchCard}>
                                                    <View style={styles.matchHeader}>
                                                        <Text style={styles.matchRound}>{match.status}</Text>
                                                    </View>
                                                    <View style={styles.scoreRow}>
                                                        <View style={styles.matchTeam}>
                                                            <Text style={styles.matchPlayerName}>{match.player1.name}</Text>
                                                            <Text style={styles.matchPoints}>{match.score1}</Text>
                                                            {match.status === 'LIVE' && (
                                                                <TouchableOpacity style={styles.plusBtn} onPress={() => updateMatchScore(currentTournament.id, originalIdx, { score1: match.score1 + 1 })}>
                                                                    <Text style={styles.plusText}>+</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                        <View style={styles.vsContainer}>
                                                            <Text style={styles.vsText}>VS</Text>
                                                        </View>
                                                        <View style={styles.matchTeam}>
                                                            <Text style={styles.matchPlayerName}>{match.player2.name}</Text>
                                                            <Text style={styles.matchPoints}>{match.score2}</Text>
                                                            {match.status === 'LIVE' && (
                                                                <TouchableOpacity style={styles.plusBtn} onPress={() => updateMatchScore(currentTournament.id, originalIdx, { score2: match.score2 + 1 })}>
                                                                    <Text style={styles.plusText}>+</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </View>
                                                    <View style={styles.matchFooter}>
                                                        {match.status === 'UPCOMING' && (
                                                            <Button title="Start Match" variant="outline" onPress={() => updateMatchScore(currentTournament.id, originalIdx, { status: 'LIVE' })} style={{ flex: 1 }} />
                                                        )}
                                                        {match.status === 'LIVE' && (
                                                            <Button title="End Match" variant="outline" onPress={() => updateMatchScore(currentTournament.id, originalIdx, {
                                                                status: 'FINISHED',
                                                                winner: match.score1 > match.score2 ? match.player1.user : match.player2.user
                                                            })} style={{ flex: 1, borderColor: theme.colors.success }} />
                                                        )}
                                                        {match.status === 'FINISHED' && (
                                                            <Text style={styles.matchWinner}>Winner: {match.score1 > match.score2 ? match.player1.name : match.player2.name}</Text>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Player Stats Analytics */}
                    {currentTournament.players.length > 0 && currentTournament.gameType && (
                        <View style={{ marginTop: 20, marginBottom: 10, padding: 15, backgroundColor: theme.colors.surfaceLight, borderRadius: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.sectionTitle}>
                                    📊 {currentTournament.gameType} Analytics
                                </Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.primary }}>{currentTournament.players.length}</Text>
                                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>Total Enrolled</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginBottom: 10 }}> Breakdown of enrolled players</Text>

                            <View style={{ marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }}>
                                {/* Header */}
                                <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                                    <Text style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: '#666' }}>Category</Text>
                                    <Text style={{ width: 60, fontSize: 12, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>Count</Text>
                                </View>
                                {(() => {
                                    const stats = {};
                                    const sport = currentTournament.gameType;

                                    currentTournament.players.forEach(p => {
                                        const details = p.gameDetails || {};
                                        if (!details || Object.keys(details).length === 0) return;

                                        let key = '';

                                        // --- DEEP ANALYTICS LOGIC ---
                                        if (sport === 'Cricket') {
                                            if (details.role) {
                                                key = details.role;
                                                if ((details.role === 'Batsman' || details.role === 'Wicket Keeper') && details.batStyle) {
                                                    key += ` (${details.batStyle})`;
                                                } else if (details.role === 'Bowler' && details.bowlStyle && details.bowlStyle !== 'None') {
                                                    key += ` (${details.bowlStyle})`;
                                                } else if (details.role === 'All Rounder') {
                                                    if (details.batStyle) key += ` (${details.batStyle})`;
                                                }
                                            }
                                        }
                                        else if (sport === 'Football') {
                                            if (details.position) {
                                                key = details.position;
                                                if (details.foot && details.foot !== 'Both') key += ` (${details.foot})`;
                                            }
                                        }
                                        else if (['Badminton', 'Tennis', 'Squash', 'Table Tennis'].includes(sport)) {
                                            // Racquet Sports
                                            const hand = details.hand || details.grip; // Hand or Grip
                                            const style = details.style || details.category || details.backhand;
                                            if (hand) key = hand;
                                            if (style) key += ` - ${style}`;
                                        }
                                        else if (['Kabaddi', 'Kho Kho', 'Basketball', 'Hockey', 'Handball', 'Rugby', 'Volleyball'].includes(sport)) {
                                            // Position/Role based team sports
                                            key = details.position || details.role || '';
                                        }
                                        else if (['Boxing', 'Judo', 'Karate', 'Taekwondo', 'Wrestling'].includes(sport)) {
                                            // Combat Sports
                                            const weight = details.weightClass || details.weight;
                                            const belt = details.belt || details.style || details.stance;
                                            if (weight) key = weight;
                                            if (belt) key += ` (${belt})`;
                                        }
                                        else if (['Archery', 'Shooting'].includes(sport)) {
                                            const type = details.bowType || details.gunType;
                                            if (type) key = type;
                                        }

                                        // Fallback if specific logic didn't catch or produced empty
                                        if (!key) {
                                            Object.values(details).forEach(val => {
                                                if (val && typeof val === 'string' && val !== 'None') {
                                                    stats[val] = (stats[val] || 0) + 1;
                                                }
                                            });
                                            return; // Logic handled by generic fallback returning multiple keys
                                        }

                                        if (key) {
                                            stats[key] = (stats[key] || 0) + 1;
                                        }
                                    });

                                    const keys = Object.keys(stats).sort();
                                    if (keys.length === 0) return (
                                        <View style={{ padding: 10 }}>
                                            <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#888' }}>No {sport} stats available.</Text>
                                        </View>
                                    );

                                    return keys.map((key, idx) => (
                                        <View key={key} style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: idx < keys.length - 1 ? 1 : 0, borderBottomColor: '#f0f0f0', alignItems: 'center' }}>
                                            <Text style={{ flex: 1, fontSize: 13, color: '#333' }}>{key}</Text>
                                            <View style={{ width: 60, alignItems: 'center' }}>
                                                <View style={{ backgroundColor: theme.colors.surfaceLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.primary }}>{stats[key]}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ));
                                })()}
                            </View>

                            {/* Detailed Roster Table */}
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>Player Roster Details</Text>
                                <View style={{ backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }}>
                                    {/* Header */}
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                                        <Text style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: '#666' }}>Name</Text>
                                        <Text style={{ flex: 2, fontSize: 12, fontWeight: 'bold', color: '#666' }}>Role & Attributes</Text>
                                    </View>
                                    {currentTournament.players.map((p, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: idx < currentTournament.players.length - 1 ? 1 : 0, borderBottomColor: '#f0f0f0' }}>
                                            <Text style={{ flex: 1, fontSize: 13, color: '#333', fontWeight: '500' }}>{p.name}</Text>
                                            <Text style={{ flex: 2, fontSize: 13, color: '#555' }}>
                                                {p.gameDetails ? (() => {
                                                    const sport = currentTournament.gameType;
                                                    const details = p.gameDetails;
                                                    let text = '';

                                                    if (sport === 'Cricket' && details.role) {
                                                        text = details.role;
                                                        if (details.role === 'Batsman' || details.role === 'Wicket Keeper') {
                                                            if (details.batStyle) text += ` (${details.batStyle})`;
                                                        } else if (details.role === 'Bowler') {
                                                            if (details.bowlStyle && details.bowlStyle !== 'None') text += ` (${details.bowlStyle})`;
                                                        } else if (details.role === 'All Rounder') {
                                                            const parts = [];
                                                            if (details.batStyle) parts.push(details.batStyle);
                                                            if (details.bowlStyle && details.bowlStyle !== 'None') parts.push(details.bowlStyle);
                                                            if (parts.length > 0) text += ` (${parts.join(' / ')})`;
                                                        }
                                                    }
                                                    else if (sport === 'Football' && details.position) {
                                                        text = details.position;
                                                        if (details.foot && details.foot !== 'Both') text += ` (${details.foot})`;
                                                    }
                                                    else if (['Badminton', 'Tennis', 'Squash', 'Table Tennis'].includes(sport)) {
                                                        const hand = details.hand || details.grip;
                                                        const style = details.style || details.category || details.backhand;
                                                        if (hand) text = hand;
                                                        if (style) text += ` - ${style}`;
                                                    }
                                                    else if (['Kabaddi', 'Kho Kho', 'Basketball', 'Hockey', 'Handball', 'Rugby', 'Volleyball'].includes(sport)) {
                                                        text = details.position || details.role || '';
                                                    }
                                                    else if (['Boxing', 'Judo', 'Karate', 'Taekwondo', 'Wrestling'].includes(sport)) {
                                                        const weight = details.weightClass || details.weight;
                                                        const belt = details.belt || details.style || details.stance;
                                                        if (weight) text = weight;
                                                        if (belt) text += ` (${belt})`;
                                                    }
                                                    else if (['Archery', 'Shooting'].includes(sport)) {
                                                        text = details.bowType || details.gunType || '';
                                                    }

                                                    if (text) return text;
                                                    return Object.values(details).filter(v => v && v !== 'None').join(' • ');
                                                })() : 'No details'}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )
                    }

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Joined Athletes ({currentTournament.players.length})</Text>
                    {
                        currentTournament.players.map((p, index) => (
                            <TouchableOpacity key={index} style={styles.playerRow} onPress={() => { console.log('Selected Player:', p); setSelectedPlayer(p); }}>
                                {/* Check-In Toggle */}
                                {/* Check-In Verification Button */}
                                <View style={{ marginRight: 12, justifyContent: 'center' }}>
                                    <Button
                                        title={p.checkInStatus ? "VERIFIED" : "VERIFY"}
                                        small
                                        variant="outline"
                                        onPress={() => toggleCheckIn(currentTournament.id, p.user?._id || p.user, p.checkInStatus)}
                                        style={{
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            minHeight: 36,
                                            borderColor: p.checkInStatus ? theme.colors.success : theme.colors.primary,
                                            backgroundColor: p.checkInStatus ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                                        }}
                                        textStyle={{
                                            color: p.checkInStatus ? theme.colors.success : theme.colors.primary,
                                            fontSize: 11,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.playerName}>{p.name}</Text>
                                        {p.checkInStatus && (
                                            <LucideCheckCircle size={14} color={theme.colors.success} fill={theme.colors.success + '20'} />
                                        )}
                                    </View>
                                    <Text style={styles.playerDetail}>{p.email} • {p.mobile}</Text>
                                    <Text style={[styles.playerDetail, { color: theme.colors.primary, fontWeight: '500' }]}>
                                        {p.gameDetails ? Object.values(p.gameDetails).join(' • ') : `${p.strength} • ${p.game}`}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <View style={styles.payBadge}>
                                        <Text style={styles.payText}>{p.paymentStatus}</Text>
                                    </View>
                                    <Text style={{ color: theme.colors.primary, fontSize: 10, marginTop: 4 }}>View Details →</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    }
                    {
                        currentTournament.players.length === 0 && (
                            <Text style={styles.emptyText}>Recruiting players...</Text>
                        )
                    }
                </ScrollView >
            </View >
        );
    };

    const toggleCheckIn = async (tournamentId, playerId, currentStatus) => {
        try {
            // Fix: Backend expects 'userId' and 'status'
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: playerId, status: !currentStatus })
            });

            if (response.ok) {
                await loadTournaments(); // Sync with backend

                // Optimistic Local Update
                setSelectedTournament(prev => ({
                    ...prev,
                    players: prev.players.map(p => {
                        const pId = p.user?._id || p.user; // Handle populated vs string
                        return pId === playerId ? { ...p, checkInStatus: !currentStatus } : p;
                    })
                }));
            } else {
                const err = await response.json();
                console.error('Check-in failed:', err);
                Alert.alert("Error", err.error || "Check-in failed");
            }
        } catch (e) {
            console.error('Check-in toggle failed', e);
            Alert.alert("Error", "Network error during check-in");
        }
    };


    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim()) return;

        try {
            await fetch(`${API_URL}/tournaments/${currentTournament.id}/announce`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: broadcastMessage })
            });
            Alert.alert("Success", "Broadcast sent to all players");
            setBroadcastMessage('');
            setShowBroadcast(false);
        } catch (e) {
            Alert.alert("Error", "Failed to send broadcast");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Organizer Dashboard</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Welcome, {user.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <View style={styles.earningsSummary}>
                        <LucideIndianRupee size={14} color={theme.colors.success} />
                        <Text style={styles.earningsText}>{earnings.totalEarnings}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('OrganizerProfile')} style={[styles.profileBtn, { borderWidth: 1, borderColor: theme.colors.primary }]}>
                        {user.profileImage ? (
                            <Image
                                source={{ uri: `${API_URL.replace('/api', '')}/${user.profileImage}` }}
                                style={styles.headerProfileImg}
                                onError={(e) => console.log('Image Load Error', e.nativeEvent.error)}
                            />
                        ) : (
                            <LucideUser size={24} color={theme.colors.text} />
                        )}
                    </TouchableOpacity>
                    <Button title="Logout" onPress={logout} variant="outline" style={{ paddingVertical: 4, paddingHorizontal: 12 }} />
                </View>
            </View>

            {showCreate ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Button title="← Cancel" variant="outline" onPress={() => { setShowCreate(false); setIsEditing(false); }} style={{ alignSelf: 'flex-start', marginBottom: 10 }} />
                    <Text style={styles.sectionTitle}>{isEditing ? "Edit Tournament" : "New Tournament"}</Text>

                    {/* Banner Upload */}
                    <TouchableOpacity onPress={pickBanner} style={styles.bannerUpload}>
                        {selectedBanner ? (
                            <Image source={{ uri: selectedBanner.uri }} style={styles.bannerPreview} resizeMode="cover" />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <LucideImagePlus size={32} color={theme.colors.textSecondary} />
                                <Text style={styles.uploadText}>{isEditing ? "Change Banner" : "Add Tournament Banner"}</Text>
                                <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                                    Rec: 16:9 (1280x720) | Max 5MB
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Input
                        label="Tournament Name"
                        placeholder="e.g., Summer Cricket Championship"
                        value={newTournament.name}
                        onChangeText={t => handleFormChange('name', t)}
                        error={formErrors.name}
                        variant="light"
                    />

                    <Input
                        label="Venue Address"
                        placeholder="e.g., Force Arena, Mumbai"
                        value={newTournament.address}
                        onChangeText={t => handleFormChange('address', t)}
                        error={formErrors.address}
                        variant="light"
                    />



                    {/* Sport Dropdown */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Sport</Text>
                        <TouchableOpacity onPress={() => setShowSportPicker(true)} style={styles.dropdownBtn}>
                            <Text style={{ color: newTournament.gameType ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                {newTournament.gameType || 'Select Sport'}
                            </Text>
                            <LucideChevronDown size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        {formErrors.gameType && <Text style={styles.errorText}>{formErrors.gameType}</Text>}
                    </View>

                    {/* Tournament Format Dropdown */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Tournament Format</Text>
                        <TouchableOpacity onPress={() => setShowTournamentFormatPicker(true)} style={styles.dropdownBtn}>
                            <Text style={{ color: newTournament.format ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                {newTournament.format === 'KNOCKOUT' ? 'Knockout (Elimination)' : newTournament.format === 'ROUND_ROBIN' ? 'Round Robin (League)' : 'Select Format'}
                            </Text>
                            <LucideChevronDown size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 }}>
                            {newTournament.format === 'KNOCKOUT' ? 'Single elimination - lose and you\'re out' : 'Everyone plays everyone - most wins takes the title'}
                        </Text>
                    </View>

                    {/* Modals placed at end */}


                    {/* Modals */}
                    <Modal visible={showSportPicker} transparent animationType="slide" onRequestClose={() => setShowSportPicker(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Sport</Text>
                                <ScrollView>
                                    {SPORTS.map(s => (
                                        <TouchableOpacity key={s} onPress={() => { handleFormChange('gameType', s); setShowSportPicker(false); }} style={styles.modalItem}>
                                            <Text style={styles.modalItemText}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <Button title="Close" variant="outline" onPress={() => setShowSportPicker(false)} style={{ marginTop: 10 }} />
                            </View>
                        </View>
                    </Modal>



                    <Modal visible={showTournamentFormatPicker} transparent animationType="slide" onRequestClose={() => setShowTournamentFormatPicker(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Select Tournament Format</Text>
                                <ScrollView>
                                    {TOURNAMENT_FORMATS.map(f => (
                                        <TouchableOpacity key={f} onPress={() => { handleFormChange('format', f); setShowTournamentFormatPicker(false); }} style={styles.modalItem}>
                                            <View>
                                                <Text style={styles.modalItemText}>
                                                    {f === 'KNOCKOUT' ? '🏆 Knockout (Elimination)' : '🔄 Round Robin (League)'}
                                                </Text>
                                                <Text style={{ fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                                                    {f === 'KNOCKOUT' ? 'Single elimination tournament' : 'Every player plays every other player'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <Button title="Close" variant="outline" onPress={() => setShowTournamentFormatPicker(false)} style={{ marginTop: 10 }} />
                            </View>
                        </View>
                    </Modal>

                    {/* Date Picker */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Date</Text>
                        {Platform.OS === 'web' ? (
                            <View style={styles.pickerWrapper}>
                                <LucideCalendar size={20} color={theme.colors.textSecondary} style={{ marginLeft: 16 }} />
                                {React.createElement('input', {
                                    type: 'date',
                                    value: newTournament.date,
                                    onChange: (e) => handleFormChange('date', e.target.value),
                                    style: {
                                        flex: 1,
                                        height: '100%',
                                        paddingLeft: 10,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontSize: '16px',
                                        outline: 'none',
                                        colorScheme: 'light'
                                    }
                                })}
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.nativeInput}>
                                    <LucideCalendar size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                                    <Text style={{ color: newTournament.date ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                        {newTournament.date || 'Select Date'}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={newTournament.date ? new Date(newTournament.date) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(e, d) => {
                                            setShowDatePicker(false);
                                            if (d) {
                                                const year = d.getFullYear();
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const day = String(d.getDate()).padStart(2, '0');
                                                handleFormChange('date', `${year}-${month}-${day}`);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                        {formErrors.date && <Text style={styles.errorText}>{formErrors.date}</Text>}
                    </View>

                    {/* Time Picker */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Time</Text>
                        {Platform.OS === 'web' ? (
                            <View style={styles.pickerWrapper}>
                                <LucideClock size={20} color={theme.colors.textSecondary} style={{ marginLeft: 16 }} />
                                {React.createElement('input', {
                                    type: 'time',
                                    value: newTournament.time,
                                    onChange: (e) => handleFormChange('time', e.target.value),
                                    style: {
                                        flex: 1,
                                        height: '100%',
                                        paddingLeft: 10,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontSize: '16px',
                                        outline: 'none',
                                        colorScheme: 'light'
                                    }
                                })}
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.nativeInput}>
                                    <LucideClock size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                                    <Text style={{ color: newTournament.time ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                        {newTournament.time || 'Select Time'}
                                    </Text>
                                </TouchableOpacity>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={newTournament.time ? new Date(`2000-01-01T${newTournament.time}`) : new Date()}
                                        mode="time"
                                        display="default"
                                        is24Hour={true}
                                        onChange={(e, d) => {
                                            setShowTimePicker(false);
                                            if (d) {
                                                const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).slice(0, 5); // Ensure HH:MM
                                                handleFormChange('time', timeStr);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                        {formErrors.time && <Text style={styles.errorText}>{formErrors.time}</Text>}
                    </View>

                    {/* End Time Picker */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>End Time (Optional)</Text>
                        {Platform.OS === 'web' ? (
                            <View style={styles.pickerWrapper}>
                                <LucideClock size={20} color={theme.colors.textSecondary} style={{ marginLeft: 16 }} />
                                {React.createElement('input', {
                                    type: 'time',
                                    value: newTournament.endTime,
                                    onChange: (e) => handleFormChange('endTime', e.target.value),
                                    style: {
                                        flex: 1,
                                        height: '100%',
                                        paddingLeft: 10,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontSize: '16px',
                                        outline: 'none',
                                        colorScheme: 'light'
                                    }
                                })}
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.nativeInput}>
                                    <LucideClock size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                                    <Text style={{ color: newTournament.endTime ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                        {newTournament.endTime || 'Select End Time'}
                                    </Text>
                                </TouchableOpacity>
                                {showEndTimePicker && (
                                    <DateTimePicker
                                        value={newTournament.endTime ? new Date(`2000-01-01T${newTournament.endTime}`) : new Date()}
                                        mode="time"
                                        display="default"
                                        is24Hour={true}
                                        onChange={(e, d) => {
                                            setShowEndTimePicker(false);
                                            if (d) {
                                                const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }).slice(0, 5);
                                                handleFormChange('endTime', timeStr);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </View>

                    {/* Registration Deadline Picker */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Registration Deadline</Text>
                        {Platform.OS === 'web' ? (
                            <View style={styles.pickerWrapper}>
                                <LucideCalendar size={20} color={theme.colors.textSecondary} style={{ marginLeft: 16 }} />
                                {React.createElement('input', {
                                    type: 'date',
                                    value: newTournament.registrationDeadline,
                                    onChange: (e) => handleFormChange('registrationDeadline', e.target.value),
                                    style: {
                                        flex: 1,
                                        height: '100%',
                                        paddingLeft: 10,
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        fontSize: '16px',
                                        outline: 'none',
                                        colorScheme: 'light'
                                    }
                                })}
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={() => setShowRegistrationPicker(true)} style={styles.nativeInput}>
                                    <LucideCalendar size={20} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
                                    <Text style={{ color: newTournament.registrationDeadline ? '#000' : theme.colors.textSecondary, fontSize: 16 }}>
                                        {newTournament.registrationDeadline || 'Select Deadline'}
                                    </Text>
                                </TouchableOpacity>
                                {showRegistrationPicker && (
                                    <DateTimePicker
                                        value={newTournament.registrationDeadline ? new Date(newTournament.registrationDeadline) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(e, d) => {
                                            setShowRegistrationPicker(false);
                                            if (d) {
                                                const year = d.getFullYear();
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const day = String(d.getDate()).padStart(2, '0');
                                                handleFormChange('registrationDeadline', `${year}-${month}-${day}`);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </View>
                    <Input
                        label="Entry Fee (₹)"
                        placeholder="500"
                        keyboardType="numeric"
                        value={String(newTournament.entryFee || '')}
                        onChangeText={t => handleFormChange('entryFee', t)}
                        error={formErrors.entryFee}
                        variant="light"
                    />



                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 30 }}>
                        <Button title="Cancel" variant="outline" onPress={() => { setShowCreate(false); setFormErrors({}); setSelectedBanner(null); }} style={{ flex: 1 }} />
                        <Button title="Create Tournament" onPress={handleCreate} style={{ flex: 1 }} loading={isUploading} />
                    </View>
                </ScrollView>
            ) : selectedTournament ? (
                renderDetailView()
            ) : (
                <>
                    <Button title="+ Create Tournament" onPress={() => setShowCreate(true)} style={{ marginBottom: 20 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={styles.sectionTitle}>{filterMode === 'MY' ? 'My Tournaments' : 'All Tournaments'}</Text>
                        <View style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceHighlight, borderRadius: 8, padding: 2 }}>
                            <TouchableOpacity
                                onPress={() => setFilterMode('ALL')}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: filterMode === 'ALL' ? theme.colors.primary : 'transparent',
                                    borderRadius: 6
                                }}
                            >
                                <Text style={{ color: filterMode === 'ALL' ? '#fff' : theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFilterMode('MY')}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    backgroundColor: filterMode === 'MY' ? theme.colors.primary : 'transparent',
                                    borderRadius: 6
                                }}
                            >
                                <Text style={{ color: filterMode === 'MY' ? '#fff' : theme.colors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>My</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <FlatList
                        data={displayedTournaments}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={styles.emptyText}>No tournaments created yet.</Text>}
                    />
                </>
            )}

            {/* Global Modals */}
            <Modal visible={showBroadcast} transparent animationType="fade" onRequestClose={() => setShowBroadcast(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>📢 Send Broadcast</Text>
                        <Input
                            label="Message"
                            placeholder="e.g., Match delayed by 30 mins"
                            value={broadcastMessage}
                            onChangeText={setBroadcastMessage}
                            multiline
                            style={{ height: 80, textAlignVertical: 'top' }}
                            variant="light"
                        />
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                            <Button title="Cancel" variant="outline" onPress={() => setShowBroadcast(false)} style={{ flex: 1 }} />
                            <Button title="Send" onPress={handleSendBroadcast} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={confirmModal.visible} transparent animationType="fade" onRequestClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmation</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginBottom: 20, fontSize: 16 }}>{confirmModal.message}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <Button title="Cancel" variant="outline" onPress={() => setConfirmModal(prev => ({ ...prev, visible: false }))} style={{ flex: 1 }} />
                            <Button title="Confirm" onPress={confirmModal.onConfirm} style={{ flex: 1 }} />
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    sectionTitle: {
        fontSize: 18,
        color: '#000000',
        marginBottom: 10,
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardBanner: {
        width: '100%',
        height: 140,
        backgroundColor: '#EEEEEE',
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: '#666666',
        fontSize: 14,
        marginTop: 4,
    },
    badge: {
        backgroundColor: '#EEEEEE',
        padding: 6,
        borderRadius: 4,
    },
    badgeText: {
        color: theme.colors.primary,
        fontSize: 12,
    },
    emptyText: {
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailBanner: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: '#EEEEEE',
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    detailSub: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 20,
    },
    statusBadge: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    actionButtons: {
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    label: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '500',
    },
    matchCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    matchHeader: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 8,
    },
    matchRound: {
        color: '#666666',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    matchTeam: {
        flex: 1,
        alignItems: 'center',
    },
    matchPlayerName: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    matchPoints: {
        color: theme.colors.primary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    vsContainer: {
        paddingHorizontal: 20,
    },
    vsText: {
        color: '#999999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    plusBtn: {
        backgroundColor: theme.colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    plusText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    matchFooter: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    matchWinner: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    payBadge: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        height: 24,
    },
    payText: {
        color: theme.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    playerName: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    playerDetail: {
        color: '#666666',
        fontSize: 12,
        marginTop: 2,
    },
    earningsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 2,
    },
    earningsText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold',
    },
    playerList: {
        marginTop: 10,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 10,
        maxHeight: 300,
    },
    paymentStatus: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    profileBtn: {
        padding: 4,
        backgroundColor: '#FAFAFA',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    headerProfileImg: {
        width: '100%',
        height: '100%',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 30,
        backgroundColor: '#FAFAFA',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EEEEEE',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    avatarLetter: {
        color: theme.colors.primary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    detailSubText: {
        color: '#666666',
        fontSize: 12,
    },
    infoSection: {
        marginBottom: 20,
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    infoLabel: {
        color: '#666666',
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '500',
    },
    documentSection: {
        marginTop: 10,
        marginBottom: 30,
        backgroundColor: '#FAFAFA',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    documentImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginTop: 12,
        backgroundColor: '#000',
    },
    typeChip: {
        flex: 1,
        padding: 12,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        alignItems: 'center',
    },
    activeTypeChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeText: {
        color: '#666666',
        fontWeight: '600',
        fontSize: 12,
    },
    activeTypeText: {
        color: '#fff',
    },
    bannerUpload: {
        height: 150,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderStyle: 'dashed',
    },
    bannerPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    uploadText: {
        color: '#666666',
        marginTop: 8,
        fontSize: 14,
    },
    helperChip: {
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    helperText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    pickerWrapper: {
        borderWidth: 1.5,
        borderColor: '#CCCCCC',
        borderRadius: theme.borderRadius.m,
        backgroundColor: '#FAFAFA',
        overflow: 'hidden',
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
    },
    webPicker: {
        flex: 1,
        height: '100%',
        backgroundColor: '#ffffff',
        color: '#000000',
        paddingHorizontal: 10,
    },
    nativeInput: {
        borderWidth: 1.5,
        borderColor: '#CCCCCC',
        borderRadius: theme.borderRadius.m,
        backgroundColor: '#FAFAFA',
        height: 56,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownBtn: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: '#CCCCCC',
        borderRadius: theme.borderRadius.m,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    modalItemText: {
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginLeft: 4,
        marginTop: 4,
    }
});
