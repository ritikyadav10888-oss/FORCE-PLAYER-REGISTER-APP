import { LucideTrendingUp, LucideTrophy, LucideUser } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Button';
import Container from '../../components/Container';
import { API_URL } from '../../config';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

export default function LeaderboardScreen({ navigation }) {
    const { leaderboard, loadLeaderboard } = useTournaments();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLeaderboard();
        setRefreshing(false);
    };

    const renderItem = ({ item, index }) => {
        const isTopThree = index < 3;
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

        return (
            <View style={styles.recordItem}>
                <View style={styles.rankContainer}>
                    {isTopThree ? (
                        <LucideTrophy size={20} color={colors[index]} />
                    ) : (
                        <Text style={styles.rankText}>{index + 1}</Text>
                    )}
                </View>

                <View style={styles.avatarContainer}>
                    {item.profileImage ? (
                        <Image
                            source={{ uri: `${API_URL.replace('/api', '')}/${item.profileImage}` }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <LucideUser size={20} color={theme.colors.textSecondary} />
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Text style={[styles.name, isTopThree && { fontWeight: 'bold' }]}>{item.name}</Text>
                    <Text style={styles.game}>{item.game || 'Athelete'}</Text>
                </View>

                <View style={styles.pointsContainer}>
                    <LucideTrendingUp size={14} color={theme.colors.primary} />
                    <Text style={styles.pointsText}>{item.points || 0}</Text>
                </View>
            </View>
        );
    };

    return (
        <Container>
            <View style={styles.header}>
                <Button title="←" variant="outline" onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15 }} />
                <Text style={styles.headerTitle}>Leaderboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.topThreeRow}>
                {leaderboard.length >= 2 && (
                    <View style={[styles.topAthlete, { marginTop: 30 }]}>
                        <View style={[styles.bigAvatar, { borderColor: '#C0C0C0' }]}>
                            <Image source={{ uri: `${API_URL.replace('/api', '')}/${leaderboard[1].profileImage}` }} style={styles.fill} />
                        </View>
                        <Text style={styles.topName}>{leaderboard[1].name}</Text>
                        <Text style={styles.topPoints}>{leaderboard[1].points} pts</Text>
                        <View style={[styles.podium, { height: 60, backgroundColor: '#C0C0C0' }]}>
                            <Text style={styles.podiumRank}>2</Text>
                        </View>
                    </View>
                )}

                {leaderboard.length >= 1 && (
                    <View style={styles.topAthlete}>
                        <View style={[styles.bigAvatar, { width: 90, height: 90, borderRadius: 45, borderColor: '#FFD700', borderWidth: 3 }]}>
                            <Image source={{ uri: `${API_URL.replace('/api', '')}/${leaderboard[0].profileImage}` }} style={styles.fill} />
                            <View style={styles.crown}>
                                <LucideTrophy size={24} color="#FFD700" fill="#FFD700" />
                            </View>
                        </View>
                        <Text style={[styles.topName, { fontSize: 18 }]}>{leaderboard[0].name}</Text>
                        <Text style={styles.topPoints}>{leaderboard[0].points} pts</Text>
                        <View style={[styles.podium, { height: 90, backgroundColor: '#FFD700' }]}>
                            <Text style={styles.podiumRank}>1</Text>
                        </View>
                    </View>
                )}

                {leaderboard.length >= 3 && (
                    <View style={[styles.topAthlete, { marginTop: 50 }]}>
                        <View style={[styles.bigAvatar, { borderColor: '#CD7F32' }]}>
                            <Image source={{ uri: `${API_URL.replace('/api', '')}/${leaderboard[2].profileImage}` }} style={styles.fill} />
                        </View>
                        <Text style={styles.topName}>{leaderboard[2].name}</Text>
                        <Text style={styles.topPoints}>{leaderboard[2].points} pts</Text>
                        <View style={[styles.podium, { height: 40, backgroundColor: '#CD7F32' }]}>
                            <Text style={styles.podiumRank}>3</Text>
                        </View>
                    </View>
                )}
            </View>

            <FlatList
                data={leaderboard.slice(3)}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                onRefresh={onRefresh}
                refreshing={refreshing}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={leaderboard.length <= 3 ? null : <Text style={styles.emptyText}>No more players yet</Text>}
            />
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
    headerTitle: {
        ...theme.typography.header,
        fontSize: 20,
    },
    topThreeRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 250,
        marginBottom: 20,
        paddingBottom: 10,
    },
    topAthlete: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    bigAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        backgroundColor: theme.colors.surfaceHighlight,
        overflow: 'hidden',
        position: 'relative',
    },
    fill: {
        width: '100%',
        height: '100%',
    },
    crown: {
        position: 'absolute',
        top: -20,
        left: '25%',
    },
    topName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
    },
    topPoints: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    podium: {
        width: 60,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    podiumRank: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    rankContainer: {
        width: 30,
        alignItems: 'center',
    },
    rankText: {
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        marginHorizontal: 12,
        backgroundColor: theme.colors.surfaceHighlight,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        color: theme.colors.text,
        fontSize: 16,
    },
    game: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pointsText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: 20,
    }
});
