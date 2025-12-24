import { LucideActivity, LucideSearch, LucideTrophy, LucideUser, LucideZap } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Container from '../../components/Container';
import JoinTournamentModal from '../../components/JoinTournamentModal';
import PaymentModal from '../../components/PaymentModal';
import RateOrganizerModal from '../../components/RateOrganizerModal';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

export default function PlayerDashboard({ navigation, route }) {
    const { user } = useAuth();
    const { tournaments, joinTournament, leaveTournament, loadTournaments, rateOrganizer } = useTournaments();
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [selectedJoinTournament, setSelectedJoinTournament] = useState(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [pendingJoinData, setPendingJoinData] = useState(null);
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [tournamentToRate, setTournamentToRate] = useState(null);

    // Effect to handle join initiation from Details Screen
    useEffect(() => {
        if (route.params?.initiateJoin) {
            const tournament = route.params.initiateJoin;
            // Clear param to prevent loop (if necessary, though navigation param consumption usually one-off until set again)
            navigation.setParams({ initiateJoin: null });

            // Trigger Join Flow
            const normalizedType = (tournament.type || '').toUpperCase();
            if (normalizedType === 'SINGLE') {
                prepareJoin(tournament);
            } else {
                setSelectedJoinTournament(tournament);
                setJoinModalVisible(true);
            }
        }
    }, [route.params?.initiateJoin]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTournaments();
        setRefreshing(false);
    }, [loadTournaments]);

    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = (t.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (t.gameType?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (activeFilter === 'My Sport') return t.gameType?.toLowerCase() === user.game?.toLowerCase();
        if (activeFilter === 'Upcoming') return t.status === 'PENDING';
        return true;
    }).sort((a, b) => {
        // Sort by Date Ascending (Nearest first)
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // If Dates match, sort by Time
        const timeA = a.time || '';
        const timeB = b.time || '';
        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    });

    const prepareJoin = (tournamentOrData = {}, extraData = {}) => {
        // Handle both Modal call (data only) and Direct call (tournament object)
        const tournament = (tournamentOrData.id ? tournamentOrData : selectedJoinTournament);
        const details = (tournamentOrData.id ? extraData : tournamentOrData);

        setPendingJoinData({ tournament, details });

        // Close Join Details Modal if open
        setJoinModalVisible(false);
        // Open Payment Modal
        setPaymentModalVisible(true);
    };

    const handlePaymentSubmit = async (transactionId) => {
        if (!pendingJoinData) return;
        const { tournament, details } = pendingJoinData;

        try {
            await joinTournament(tournament.id, user, { ...details, transactionId });
            setPaymentModalVisible(false);
            setPendingJoinData(null);
            setSelectedJoinTournament(null);
            Alert.alert("Success", "You have successfully joined the tournament!");
            loadTournaments(); // Refresh list
        } catch (e) {
            Alert.alert("Error", e.message);
        }
    };

    const executeLeave = async (tournament) => {
        try {
            await leaveTournament(tournament.id, user.id);
            Alert.alert("Success", `You have left ${tournament.name}.`);
        } catch (e) {
            Alert.alert("Error", e.message);
        }
    };

    const renderTournament = ({ item }) => {
        const isJoined = item.players.some(p => (p.user?._id || p.user) === user.id);
        const canJoin = item.status === 'PENDING' && !isJoined;
        const normalizedType = (item.type || '').toUpperCase();

        const handleJoinPress = () => {
            console.log("Join Pressed. Item:", item.name, "Status:", item.status, "IsJoined:", isJoined);

            if (isJoined) {
                Alert.alert("Info", "You are already enrolled.");
                return;
            }
            if (item.status !== 'PENDING') {
                Alert.alert("Closed", "Tournament is " + (item.status || 'Unknown'));
                return;
            }

            Alert.alert("Debug", "Redirecting to Details...");
            navigation.navigate('TournamentDetails', { tournament: item });
        };

        return (
            <View>
                <Card variant="surface" padding="m" style={styles.tCard}>
                    <TouchableOpacity onPress={() => navigation.navigate('TournamentDetails', { tournament: item })} activeOpacity={0.9}>
                        <View>
                            {item.banner && (
                                <Image
                                    source={{ uri: `${API_URL.replace('/api', '')}/${item.banner}` }}
                                    style={styles.tBanner}
                                    resizeMode="cover"
                                />
                            )}
                            <View style={styles.tHeader}>
                                <View style={styles.tBadge}>
                                    <Text style={styles.tBadgeText}>{item.gameType}</Text>
                                </View>
                                <Text style={styles.tPrice}>₹{item.entryFee || 500}</Text>
                            </View>

                            <Text style={styles.tName}>{item.name}</Text>

                            <View style={styles.tInfoRow}>
                                <LucideActivity size={14} color={theme.colors.textTertiary} />
                                <Text style={styles.tInfoText}>{item.date} • {item.time || 'TBD'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.tFooter}>
                        <View style={styles.playerCount}>
                            <Text style={styles.countText}>{item.players.length} Competitors</Text>
                        </View>
                        <Button
                            title={isJoined ? "ENROLLED" : (item.status === 'PENDING' ? `JOIN (₹${item.entryFee || 500})` : "CLOSED")}
                            variant={isJoined ? "outline" : (item.status === 'PENDING' ? "primary" : "ghost")}
                            disabled={false}
                            onPress={handleJoinPress}
                            small
                            style={styles.joinBtn}
                        />
                    </View>
                </Card>
            </View>
        );


    };

    return (
        <Container style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Modern Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Elite Status</Text>
                        <Text style={styles.userName}>{user.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('PlayerProfile')} style={styles.profileBox}>
                        {user.profileImage ? (
                            <Image source={{ uri: `${API_URL.replace('/api', '')}/${user.profileImage}` }} style={styles.pImg} />
                        ) : (
                            <LucideUser size={24} color={theme.colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Bar */}
                <View style={styles.statsBar}>


                    <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')} style={styles.statBox}>
                        <LucideTrophy size={20} color={theme.colors.warning} />
                        <View>
                            <Text style={styles.statLabel}>POINTS</Text>
                            <Text style={styles.statVal}>{user.points || 0}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search & Filters */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <LucideSearch size={20} color={theme.colors.textTertiary} />
                        <TextInput
                            placeholder="Find your next challenge..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.sInput}
                        />
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
                        {['All', 'My Sport', 'Upcoming'].map(f => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setActiveFilter(f)}
                                style={[styles.fChip, activeFilter === f && styles.fChipActive]}
                            >
                                <Text style={[styles.fText, activeFilter === f && styles.fTextActive]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tournaments List */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>FEATURED TOURNAMENTS</Text>
                    <LucideZap size={16} color={theme.colors.primary} />
                </View>

                <FlatList
                    data={filteredTournaments}
                    renderItem={renderTournament}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No events found</Text>}
                />

                <View style={{ height: 40 }} />
            </ScrollView>

            <JoinTournamentModal
                visible={joinModalVisible}
                tournament={selectedJoinTournament}
                onClose={() => setJoinModalVisible(false)}
                onJoin={prepareJoin}
            />
            <PaymentModal
                visible={paymentModalVisible}
                tournamentName={pendingJoinData?.tournament?.name}
                amount={pendingJoinData?.tournament?.entryFee !== undefined ? pendingJoinData.tournament.entryFee : 500}
                payToUpi={pendingJoinData?.tournament?.organizerId?.upiId}
                onClose={() => setPaymentModalVisible(false)}
                onSubmit={handlePaymentSubmit}
            />
            <RateOrganizerModal
                visible={rateModalVisible}
                organizerName={tournamentToRate?.organizerId?.name || "Organizer"}
                onClose={() => setRateModalVisible(false)}
                onSubmit={(r, rev) => rateOrganizer(tournamentToRate.organizerId, user.id, r, rev)}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.appBackground,
        paddingHorizontal: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    greeting: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '900',
    },
    userName: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginTop: 2,
    },
    profileBox: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary + '30',
        overflow: 'hidden',
    },
    pImg: {
        width: '100%',
        height: '100%',
    },
    statsBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32,
    },
    statBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    vDivider: {
        width: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 15,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 9,
        color: theme.colors.textTertiary,
    },
    statVal: {
        ...theme.typography.header,
        fontSize: 18,
        color: theme.colors.text,
    },
    searchSection: {
        marginBottom: 32,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceLight,
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        marginBottom: 16,
    },
    sInput: {
        flex: 1,
        marginLeft: 11,
        color: theme.colors.text,
        fontSize: 15,
        ...Platform.select({ web: { outlineStyle: 'none' } })
    },
    filterList: {
        flexDirection: 'row',
    },
    fChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    fChipActive: {
        backgroundColor: theme.colors.primary + '10',
        borderColor: theme.colors.primary,
    },
    fText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        fontWeight: '700',
    },
    fTextActive: {
        color: theme.colors.primary,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        fontWeight: '900',
        letterSpacing: 2,
    },
    tCard: {
        marginBottom: 16,
    },
    tHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    tBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tBadgeText: {
        color: theme.colors.primary,
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    tPrice: {
        ...theme.typography.header,
        fontSize: 16,
        color: theme.colors.text,
    },
    tName: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 12,
    },
    tInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    tInfoText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
    },
    tFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 16,
    },
    playerCount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countText: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        fontSize: 11,
    },
    joinBtn: {
        minHeight: 40,
        minWidth: 100,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textTertiary,
        marginTop: 40,
    },
    tBanner: {
        width: '100%',
        height: 140,
        borderRadius: theme.borderRadius.s,
        marginBottom: 12,
    }
});
