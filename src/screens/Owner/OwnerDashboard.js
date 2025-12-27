import { useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Container from '../../components/Container';
import Input from '../../components/Input';
import { API_URL } from '../../config';
import { ROLES, useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

export default function OwnerDashboard() {
    const { logout, registerUser } = useAuth();
    const { tournaments, organizers, players, verifyUser, blockUser, loadOrganizers, updateAccess, payOrganizer } = useTournaments();
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [view, setView] = useState('tournaments'); // 'tournaments', 'organizers', or 'players'
    const [showAddOrg, setShowAddOrg] = useState(false);
    const [newOrg, setNewOrg] = useState({ name: '', email: '', password: '', mobile: '', address: '', accessDurationDays: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedOrganizer, setSelectedOrganizer] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterGame, setFilterGame] = useState('All');

    // Derived State for Searching and Filtering
    const getUniqueGames = () => {
        if (view === 'tournaments') {
            return [...new Set(tournaments.map(t => t.gameType).filter(Boolean))];
        } else if (view === 'players') {
            return [...new Set(players.map(p => p.game).filter(Boolean))];
        }
        return [];
    };
    const uniqueGames = getUniqueGames();

    const filteredTournaments = tournaments.filter(t => {
        const name = t.name || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterGame === 'All' || t.gameType === filterGame;
        return matchesSearch && matchesFilter;
    });

    const filteredOrganizers = organizers.filter(o => {
        const name = o.name || '';
        const email = o.email || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredPlayers = players.filter(p => {
        const name = p.name || '';
        const email = p.email || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterGame === 'All' || p.game === filterGame;
        return matchesSearch && matchesFilter;
    });

    const handleCreateOrg = async () => {
        if (!newOrg.name || !newOrg.email || !newOrg.password) {
            Alert.alert("Error", "Name, Email and Password are required");
            return;
        }
        try {
            setIsCreating(true);
            // skipLogin = true so Owner doesn't get logged out
            await registerUser(newOrg, ROLES.ORGANIZER, null, true);
            await loadOrganizers();
            setShowAddOrg(false);
            setNewOrg({ name: '', email: '', password: '', mobile: '', address: '' });
            Alert.alert("Success", "Organizer created successfully!");
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setIsCreating(false);
        }
    };

    const calculateRevenue = (players) => {
        return players.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    };

    const totalRevenue = tournaments.reduce((acc, t) => acc + calculateRevenue(t.players), 0);
    const totalPlatformIncome = totalRevenue * 0.05;

    // Calculate sum of all pending payouts across organizers
    const totalPendingPayouts = organizers.reduce((acc, org) => {
        const hosted = tournaments.filter(t => t.organizerId === org.id || t.organizerId?.id === org.id || t.organizerId?._id === org.id);
        const orgRevenue = hosted.reduce((sum, t) => sum + calculateRevenue(t.players), 0);
        const orgShare = orgRevenue * 0.95;
        const paid = org.totalPaidOut || 0;
        return acc + Math.max(0, orgShare - paid);
    }, 0);

    const SERVER_URL = API_URL.replace('/api', '');

    const renderTournament = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedTournament(item)}
        >
            <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.gameType} • {item.status}</Text>
                <Text style={styles.organizerName}>Org: {item.organizerId?.name || 'Unknown'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.revenueText}>Rev: {calculateRevenue(item.players)}</Text>
                <Text style={styles.badgeText}>{item.players.length} Players</Text>
            </View>
        </TouchableOpacity>
    );

    const [showUpdateAccess, setShowUpdateAccess] = useState(false);
    const [updateAccessData, setUpdateAccessData] = useState({ id: '', name: '', duration: '' });

    const handleUpdateAccess = async () => {
        if (!updateAccessData.id) return;
        await updateAccess(updateAccessData.id, updateAccessData.duration);
        setShowUpdateAccess(false);
        setUpdateAccessData({ id: '', name: '', duration: '' });
        Alert.alert("Success", "Access updated successfully!");
    };

    const renderOrganizer = ({ item }) => {
        const hostedTournaments = tournaments.filter(t =>
            t.organizerId === item.id || t.organizerId?._id === item.id
        );

        const expiryDate = item.accessExpiryDate ? new Date(item.accessExpiryDate).toLocaleDateString() : 'Unlimited';

        // Calculate Rating
        const totalRating = item.ratings?.reduce((acc, r) => acc + r.rating, 0) || 0;
        const avgRating = item.ratings?.length ? (totalRating / item.ratings.length).toFixed(1) : 'New';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedOrganizer({ ...item, hostedTournaments })}
                activeOpacity={0.7}
            >
                <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        {item.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: 'rgba(255, 215, 0, 0.2)', paddingHorizontal: 6, borderRadius: 8 }}>
                            <Text style={{ color: '#FFD700', fontSize: 10, fontWeight: 'bold' }}>★ {avgRating}</Text>
                        </View>
                    </View>
                    <Text style={styles.cardSubtitle}>{item.email}</Text>
                    <Text style={styles.cardSubtitle}>{item.mobile}</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.secondary }]}>Access: {expiryDate}</Text>

                    <View style={styles.moderationRow}>
                        {!item.isVerified && (
                            <TouchableOpacity style={styles.modBtnVerify} onPress={() => verifyUser(item.id)}>
                                <Text style={styles.modBtnText}>Verify</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.modBtnBlock, { backgroundColor: item.isBlocked ? theme.colors.success : theme.colors.error }]}
                            onPress={() => blockUser(item.id, !item.isBlocked)}
                        >
                            <Text style={styles.modBtnText}>{item.isBlocked ? 'Unblock' : 'Block'}</Text>
                        </TouchableOpacity>
                        {/* Prevent onPress propagation to parent card for these buttons if necessary, or let it open detail view is fine */}
                        <TouchableOpacity
                            style={[styles.modBtnBlock, { backgroundColor: theme.colors.surfaceHighlight, borderWidth: 1, borderColor: theme.colors.border }]}
                            onPress={() => {
                                setUpdateAccessData({ id: item.id, name: item.name, duration: '' });
                                setShowUpdateAccess(true);
                            }}
                        >
                            <Text style={[styles.modBtnText, { color: theme.colors.text }]}>Access</Text>
                        </TouchableOpacity>
                    </View>

                    {hostedTournaments.length > 0 && (
                        <View style={styles.joinedList}>
                            <Text style={styles.joinedTitle}>Hosted Tournaments:</Text>
                            {hostedTournaments.map(t => (
                                <Text key={t.id} style={styles.joinedItem}>• {t.name} ({t.status})</Text>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                    <Text style={[styles.badgeText, { fontSize: 10 }]}>Organizer</Text>
                    <Text style={styles.detailSubText}>{hostedTournaments.length} Events</Text>
                    {item.isBlocked && <Text style={{ color: theme.colors.error, fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>BLOCKED</Text>}
                    <Text style={{ color: theme.colors.primary, fontSize: 9, marginTop: 8 }}>Details →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderPlayer = ({ item }) => {
        const joinedTournaments = tournaments.map(t => {
            const playerEntry = t.players.find(p => p.user === item.id || p._id === item.id);
            if (playerEntry) {
                return {
                    tournament: t,
                    entry: playerEntry,
                    amount: playerEntry.amount || t.entryFee || 0
                };
            }
            return null;
        }).filter(Boolean);

        const totalSpent = joinedTournaments.reduce((sum, item) => sum + item.amount, 0);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setSelectedPlayer({ ...item, joinedTournaments, totalSpent })}
                activeOpacity={0.7}
            >
                <View style={[styles.avatarSmall, { marginRight: 12 }]}>
                    {item.profileImage ? (
                        <Image
                            source={{ uri: `${SERVER_URL}/${item.profileImage}` }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                            {item.name.charAt(0)}
                        </Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        {item.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cardSubtitle}>{item.email}</Text>
                    <Text style={styles.cardSubtitle}>{item.mobile}</Text>
                    {item.address && <Text style={styles.cardSubtitle} numberOfLines={1}>{item.address}</Text>}
                    <Text style={styles.playerGame}>{item.game} • {item.strength}</Text>
                    {item.aadharNumber && <Text style={styles.cardSubtitle}>Aadhar: {item.aadharNumber}</Text>}

                    <View style={styles.moderationRow}>
                        {!item.isVerified && (
                            <TouchableOpacity style={styles.modBtnVerify} onPress={() => verifyUser(item.id)}>
                                <Text style={styles.modBtnText}>Verify</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.modBtnBlock, { backgroundColor: item.isBlocked ? theme.colors.success : theme.colors.error }]}
                            onPress={() => blockUser(item.id, !item.isBlocked)}
                        >
                            <Text style={styles.modBtnText}>{item.isBlocked ? 'Unblock Now' : 'Block'}</Text>
                        </TouchableOpacity>
                    </View>

                    {joinedTournaments.length > 0 && (
                        <View style={styles.joinedList}>
                            <Text style={styles.joinedTitle}>Joined Tournaments:</Text>
                            {joinedTournaments.map(jt => (
                                <View key={jt.tournament.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.joinedItem}>• {jt.tournament.name}</Text>
                                    <Text style={[styles.joinedItem, { color: theme.colors.success }]}>₹{jt.amount}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.badgeText, { color: theme.colors.secondary }]}>Player</Text>
                    <Text style={styles.detailSubText}>{joinedTournaments.length} Joined</Text>
                    {joinedTournaments.length > 0 && (
                        <Text style={[styles.detailSubText, { color: theme.colors.success, fontWeight: 'bold', marginTop: 4 }]}>Spent: ₹{totalSpent}</Text>
                    )}
                    {item.isBlocked && <Text style={{ color: theme.colors.error, fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>BLOCKED</Text>}
                    <Text style={{ color: theme.colors.primary, fontSize: 10, marginTop: 8 }}>View Details →</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const dashboardHeader = (
        <>
            <View style={styles.statsOverview}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{tournaments.length}</Text>
                    <Text style={styles.statLabel}>Events</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{organizers.length}</Text>
                    <Text style={styles.statLabel}>Orgs</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{players.length}</Text>
                    <Text style={styles.statLabel}>Players</Text>
                </View>
                <View style={[styles.statBox, { borderRightWidth: 0 }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.text }]}>₹{totalRevenue}</Text>
                    <Text style={styles.statLabel}>Gross Vol</Text>
                </View>
            </View>

            {/* Financials Row */}
            <View style={[styles.statsOverview, { marginTop: -16 }]}>
                <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>₹{totalPlatformIncome.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Net Income</Text>
                </View>
                <View style={[styles.statBox, { borderRightWidth: 0 }]}>
                    <Text style={[styles.statNumber, { color: totalPendingPayouts > 0 ? theme.colors.warning : theme.colors.success }]}>₹{totalPendingPayouts.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Pending Payouts</Text>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, view === 'tournaments' && styles.activeTab]}
                    onPress={() => { setView('tournaments'); setFilterGame('All'); setSearchQuery(''); }}
                >
                    <Text style={[styles.tabText, view === 'tournaments' && styles.activeTabText]}>Tournaments</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, view === 'organizers' && styles.activeTab]}
                    onPress={() => { setView('organizers'); setFilterGame('All'); setSearchQuery(''); }}
                >
                    <Text style={[styles.tabText, view === 'organizers' && styles.activeTabText]}>Organizers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, view === 'players' && styles.activeTab]}
                    onPress={() => { setView('players'); setFilterGame('All'); setSearchQuery(''); }}
                >
                    <Text style={[styles.tabText, view === 'players' && styles.activeTabText]}>Players</Text>
                </TouchableOpacity>
            </View>

            {/* SEARCH AND FILTER SECTION */}
            <View style={{ marginBottom: 20 }}>
                <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ marginBottom: 10 }}
                />

                {view !== 'organizers' && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        <TouchableOpacity
                            style={[styles.filterChip, filterGame === 'All' && styles.activeFilterChip]}
                            onPress={() => setFilterGame('All')}
                        >
                            <Text style={[styles.filterChipText, filterGame === 'All' && styles.activeFilterChipText]}>All</Text>
                        </TouchableOpacity>

                        {uniqueGames.map((game, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.filterChip, filterGame === game && styles.activeFilterChip]}
                                onPress={() => setFilterGame(game)}
                            >
                                <Text style={[styles.filterChipText, filterGame === game && styles.activeFilterChipText]}>{game}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        </>
    );

    return (
        <Container variant="light">
            <View style={styles.header}>
                <Text style={styles.title}>Super Admin (Owner)</Text>
                <Button title="Logout" onPress={logout} variant="outline" style={{ paddingVertical: 4, paddingHorizontal: 12 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {selectedPlayer ? (
                    <View style={{ flex: 1 }}>
                        <Button
                            title={selectedTournament ? "← Back to Tournament" : "← Back to Players"}
                            variant="outline"
                            onPress={() => setSelectedPlayer(null)}
                            style={{ alignSelf: 'flex-start', marginBottom: 20 }}
                        />

                        <View style={styles.profileHeader}>
                            <View style={styles.largeAvatar}>
                                {selectedPlayer.user?.profileImage || selectedPlayer.profileImage ? (
                                    <Image
                                        source={{ uri: `${SERVER_URL}/${selectedPlayer.user?.profileImage || selectedPlayer.profileImage}` }}
                                        style={styles.fullImage}
                                    />
                                ) : (
                                    <Text style={styles.avatarLetter}>{selectedPlayer.name.charAt(0)}</Text>
                                )}
                            </View>
                            <View>
                                <Text style={styles.detailTitle}>{selectedPlayer.name}</Text>
                                <Text style={styles.detailSubText}>{selectedPlayer.email}</Text>
                                <Text style={styles.detailSubText}>{selectedPlayer.mobile}</Text>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>{selectedPlayer.user?.role || selectedPlayer.role || 'PLAYER'}</Text>
                            </View>

                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>{selectedPlayer.user?.address || selectedPlayer.address || 'N/A'}</Text>
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
                                <Text style={styles.infoValue}>{selectedPlayer.user?.aadharNumber || selectedPlayer.aadharNumber || 'N/A'}</Text>
                            </View>

                            {(selectedPlayer.user?.aadharCard || selectedPlayer.aadharCard) && (
                                <View style={styles.documentSection}>
                                    <Text style={styles.infoLabel}>Aadhar Card Document</Text>
                                    <Image
                                        source={{ uri: `${SERVER_URL}/${selectedPlayer.user?.aadharCard || selectedPlayer.aadharCard}` }}
                                        style={styles.documentImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}

                            {selectedPlayer.joinedTournaments && selectedPlayer.joinedTournaments.length > 0 && (
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoLabel}>Spending History (Total: ₹{selectedPlayer.totalSpent})</Text>
                                    {selectedPlayer.joinedTournaments.map((jt, index) => (
                                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                                            <View>
                                                <Text style={{ color: '#fff', fontSize: 14 }}>{jt.tournament.name}</Text>
                                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{jt.tournament.date}</Text>
                                            </View>
                                            <Text style={{ color: theme.colors.success, fontWeight: 'bold' }}>₹{jt.amount}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                ) : selectedOrganizer ? (
                    <View style={{ flex: 1 }}>
                        <Button
                            title={"← Back to Organizers"}
                            variant="outline"
                            onPress={() => setSelectedOrganizer(null)}
                            style={{ alignSelf: 'flex-start', marginBottom: 20 }}
                        />

                        <View style={styles.profileHeader}>
                            <View style={styles.largeAvatar}>
                                <Text style={styles.avatarLetter}>{selectedOrganizer.name.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.detailTitle}>{selectedOrganizer.name}</Text>
                                <Text style={styles.detailSubText}>{selectedOrganizer.email}</Text>
                                <Text style={styles.detailSubText}>{selectedOrganizer.mobile}</Text>
                            </View>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Role</Text>
                                <Text style={styles.infoValue}>ORGANIZER</Text>
                            </View>

                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Address</Text>
                                <Text style={styles.infoValue}>{selectedOrganizer.address || 'N/A'}</Text>
                            </View>

                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Access Expiry</Text>
                                <Text style={styles.infoValue}>
                                    {selectedOrganizer.accessExpiryDate
                                        ? new Date(selectedOrganizer.accessExpiryDate).toLocaleDateString()
                                        : 'Unlimited'}
                                </Text>
                            </View>

                            {/* Revenue & Payout Section */}
                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Financials</Text>
                                {(() => {
                                    const hosted = selectedOrganizer.hostedTournaments || [];
                                    const totalRevenue = hosted.reduce((sum, t) => sum + (t.players.reduce((s, p) => s + (p.amount || 0), 0)), 0);
                                    const platformFee = totalRevenue * 0.05;
                                    const netEarnings = totalRevenue - platformFee;
                                    const totalPaid = selectedOrganizer.totalPaidOut || 0;
                                    const pendingAmount = netEarnings - totalPaid;

                                    return (
                                        <View style={{ marginTop: 10, backgroundColor: theme.colors.surfaceHighlight, padding: 15, borderRadius: 12 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ color: theme.colors.textSecondary }}>Total Revenue</Text>
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>₹{totalRevenue.toFixed(2)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ color: theme.colors.textSecondary }}>Platform Fee (5%)</Text>
                                                <Text style={{ color: theme.colors.error }}>-₹{platformFee.toFixed(2)}</Text>
                                            </View>
                                            <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 8 }} />
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ color: theme.colors.textSecondary }}>Net Earnings</Text>
                                                <Text style={{ color: theme.colors.success, fontWeight: 'bold' }}>₹{netEarnings.toFixed(2)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ color: theme.colors.textSecondary }}>Total Paid</Text>
                                                <Text style={{ color: theme.colors.text }}>₹{totalPaid.toFixed(2)}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Pending Payout</Text>
                                                <Text style={{ color: pendingAmount > 0 ? theme.colors.primary : theme.colors.textSecondary, fontWeight: 'bold', fontSize: 16 }}>
                                                    ₹{pendingAmount.toFixed(2)}
                                                </Text>
                                            </View>

                                            {pendingAmount > 1 && (
                                                <Button
                                                    title={`Pay ₹${pendingAmount.toFixed(0)} Now`}
                                                    style={{ marginTop: 15 }}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            "Confirm Payout",
                                                            `Are you sure you want to transfer ₹${pendingAmount.toFixed(2)} to ${selectedOrganizer.name}?`,
                                                            [
                                                                { text: "Cancel", style: "cancel" },
                                                                {
                                                                    text: "Confirm",
                                                                    onPress: async () => {
                                                                        try {
                                                                            const updated = await payOrganizer(selectedOrganizer.id, pendingAmount);
                                                                            // Update local state to reflect new paid amount immediately
                                                                            setSelectedOrganizer(prev => ({ ...prev, totalPaidOut: updated.totalPaidOut }));
                                                                            Alert.alert("Success", "Payout processed successfully.");
                                                                        } catch (e) {
                                                                            Alert.alert("Error", "Payout failed.");
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                />
                                            )}
                                        </View>
                                    );
                                })()}
                            </View>

                            <View style={styles.infoSection}>
                                <Text style={styles.infoLabel}>Hosted Tournaments ({selectedOrganizer.hostedTournaments?.length || 0})</Text>
                                {selectedOrganizer.hostedTournaments && selectedOrganizer.hostedTournaments.length > 0 ? (
                                    selectedOrganizer.hostedTournaments.map((t, index) => (
                                        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                                            <View>
                                                <Text style={{ color: '#fff', fontSize: 14 }}>{t.name}</Text>
                                                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{t.status}</Text>
                                            </View>
                                            <Text style={{ color: theme.colors.success, fontWeight: 'bold' }}>
                                                {t.players.length} Players
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}>No tournaments hosted yet.</Text>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                ) : !selectedTournament ? (
                    <View style={{ flex: 1 }}>
                        {view === 'tournaments' ? (
                            <FlatList
                                data={filteredTournaments}
                                renderItem={renderTournament}
                                keyExtractor={item => item.id}
                                ListHeaderComponent={
                                    <>
                                        {dashboardHeader}
                                        <Text style={styles.sectionTitle}>All Tournaments ({filteredTournaments.length})</Text>
                                    </>
                                }
                                ListEmptyComponent={<Text style={styles.emptyText}>No tournaments found.</Text>}
                            />
                        ) : view === 'organizers' ? (
                            <FlatList
                                data={filteredOrganizers}
                                renderItem={renderOrganizer}
                                keyExtractor={item => item.id}
                                ListHeaderComponent={
                                    <>
                                        {dashboardHeader}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>All Organizers ({filteredOrganizers.length})</Text>
                                            <Button
                                                title={showAddOrg ? "Close" : "+ Add Organizer"}
                                                small
                                                onPress={() => setShowAddOrg(!showAddOrg)}
                                                style={{ paddingHorizontal: 15 }}
                                            />
                                        </View>

                                        {showAddOrg && (
                                            <View style={styles.addOrgBox}>
                                                <Text style={styles.addOrgTitle}>Register New Organizer</Text>
                                                <Input label="Full Name" value={newOrg.name} onChangeText={t => setNewOrg({ ...newOrg, name: t })} />
                                                <Input label="Email" value={newOrg.email} onChangeText={t => setNewOrg({ ...newOrg, email: t })} keyboardType="email-address" />
                                                <Input label="Password" value={newOrg.password} onChangeText={t => setNewOrg({ ...newOrg, password: t })} secureTextEntry />
                                                <Input label="Mobile" value={newOrg.mobile} onChangeText={t => setNewOrg({ ...newOrg, mobile: t })} keyboardType="phone-pad" />
                                                <Input label="Address" value={newOrg.address} onChangeText={t => setNewOrg({ ...newOrg, address: t })} multiline />
                                                <Input
                                                    label="Access Duration (Days)"
                                                    placeholder="e.g. 30 (Leave empty for unlimited)"
                                                    value={newOrg.accessDurationDays}
                                                    onChangeText={t => setNewOrg({ ...newOrg, accessDurationDays: t })}
                                                    keyboardType="numeric"
                                                />

                                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                                    <Button title="Cancel" variant="outline" onPress={() => setShowAddOrg(false)} style={{ flex: 1 }} />
                                                    <Button title="Register" onPress={handleCreateOrg} loading={isCreating} style={{ flex: 1 }} />
                                                </View>
                                            </View>
                                        )}

                                        {showUpdateAccess && (
                                            <View style={styles.addOrgBox}>
                                                <Text style={styles.addOrgTitle}>Manage Access: {updateAccessData.name}</Text>
                                                <Text style={{ color: theme.colors.textSecondary, marginBottom: 10, fontSize: 12 }}>
                                                    Enter the number of days to extend access from today. Leave empty to grant unlimited access.
                                                </Text>
                                                <Input
                                                    label="Access Duration (Days)"
                                                    placeholder="e.g. 7 (Leave empty for unlimited)"
                                                    value={updateAccessData.duration}
                                                    onChangeText={t => setUpdateAccessData({ ...updateAccessData, duration: t })}
                                                    keyboardType="numeric"
                                                />
                                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                                    <Button title="Cancel" variant="outline" onPress={() => setShowUpdateAccess(false)} style={{ flex: 1 }} />
                                                    <Button title="Update Access" onPress={handleUpdateAccess} style={{ flex: 1 }} />
                                                </View>
                                            </View>
                                        )}
                                    </>
                                }
                                ListEmptyComponent={<Text style={styles.emptyText}>No organizers found.</Text>}
                            />
                        ) : (
                            <FlatList
                                data={filteredPlayers}
                                renderItem={renderPlayer}
                                keyExtractor={item => item.id}
                                ListHeaderComponent={
                                    <>
                                        {dashboardHeader}
                                        <Text style={styles.sectionTitle}>All Players ({filteredPlayers.length})</Text>
                                    </>
                                }
                                ListEmptyComponent={<Text style={styles.emptyText}>No players found.</Text>}
                            />
                        )}
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <Button title="← Back" variant="outline" onPress={() => setSelectedTournament(null)} style={{ alignSelf: 'flex-start', marginBottom: 10 }} />
                        <Text style={styles.detailTitle}>{selectedTournament.name}</Text>
                        <Text style={styles.detailSubText}>{selectedTournament.gameType} | {selectedTournament.date} {selectedTournament.time ? `at ${selectedTournament.time}` : ''}</Text>
                        <Text style={styles.detailSub}>Total Revenue: ₹{calculateRevenue(selectedTournament.players)}</Text>

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Player Payments</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedTournament.players.map((p, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.playerRow}
                                    onPress={() => setSelectedPlayer(p)}
                                >
                                    <View>
                                        <Text style={styles.playerName}>{p.name}</Text>
                                        <Text style={styles.playerDetail}>{p.mobile}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.paymentStatus}>{p.paymentStatus}</Text>
                                        <Text style={styles.amount}>₹{p.amount}</Text>
                                        <Text style={{ color: theme.colors.primary, fontSize: 10, marginTop: 4 }}>View Details →</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {selectedTournament.players.length === 0 && (
                                <Text style={styles.emptyText}>No players joined yet.</Text>
                            )}
                        </ScrollView>
                    </View>
                )}
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        ...theme.typography.header,
        fontSize: 20,
        color: theme.colors.text,
    },
    statsOverview: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    statLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: theme.colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 15,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    organizerName: {
        color: theme.colors.primary,
        fontSize: 12,
        marginTop: 4,
    },
    revenueText: {
        color: theme.colors.success,
        fontSize: 14,
        fontWeight: 'bold',
    },
    badgeText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: 20,
    },
    verifiedBadge: {
        backgroundColor: theme.colors.success,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    moderationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    modBtnVerify: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 60,
    },
    modBtnBlock: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 60,
    },
    modBtnText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    joinedList: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    joinedTitle: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    joinedItem: {
        color: theme.colors.text,
        fontSize: 11,
    },
    detailSubText: {
        color: theme.colors.textSecondary,
        fontSize: 11,
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    playerGame: {
        color: theme.colors.secondary,
        fontSize: 12,
        marginTop: 2,
    },
    addOrgBox: {
        backgroundColor: theme.colors.surfaceHighlight,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addOrgTitle: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    detailTitle: {
        ...theme.typography.header,
        fontSize: 22,
        marginBottom: 5,
    },
    detailSub: {
        color: theme.colors.success,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    playerName: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerDetail: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    paymentStatus: {
        color: theme.colors.success,
        fontSize: 12,
        fontWeight: 'bold',
    },
    amount: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 30,
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 16,
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surfaceHighlight,
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
    infoSection: {
        marginBottom: 20,
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
    },
    infoLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    documentSection: {
        marginTop: 10,
        marginBottom: 30,
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
    },
    documentImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginTop: 12,
        backgroundColor: '#000',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    activeFilterChip: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    activeFilterChipText: {
        color: '#fff',
    },
});
