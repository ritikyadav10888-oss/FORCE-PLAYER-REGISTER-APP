import { LucideArrowLeft, LucideCalendar, LucideClock, LucideIndianRupee, LucideMapPin, LucideTrophy, LucideUsers } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Removed Share from here

import Button from '../../components/Button';
import Container from '../../components/Container';
import { API_URL, RAZORPAY_KEY_ID } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';

export default function TournamentDetailsScreen({ route, navigation }) {
    const { tournament } = route.params;
    const { user } = useAuth();
    const { joinTournament, leaveTournament, loadTournaments } = useTournaments();

    // We need fresh state to reflect join/leave changes immediately
    // For now we use the passed param, but ideally we should fetch fresh details or update context
    const isJoined = tournament.players.some(p => (p.user?._id || p.user) === user.id);
    const canJoin = tournament.status === 'PENDING' && !isJoined;

    const SERVER_URL = API_URL.replace('/api', '');

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };




    const handlePayAndJoin = async () => {
        if (!tournament.entryFee) {
            handleJoin(); // Fallback for free tournaments
            return;
        }

        try {
            // Fetch Public Key (with Local Fallback)
            let rzpKeyId;
            try {
                const configRes = await fetch(`${API_URL}/config`);
                const config = await configRes.json();
                rzpKeyId = config.razorpayKeyId;
            } catch (err) {
                console.warn("Failed to fetch config from server, using local fallback", err);
            }
            if (!rzpKeyId) rzpKeyId = RAZORPAY_KEY_ID;

            if (!rzpKeyId) {
                Alert.alert("Configuration Error", "Payment Gateway Key missing.");
                return;
            }

            // 1. Create Order
            const orderResponse = await fetch(`${API_URL}/payments/create-tournament-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentId: tournament.id, userId: user.id })
            });

            const order = await orderResponse.json();
            if (!orderResponse.ok) throw new Error(order.error);

            // Payment Options
            const options = {
                description: `Entry Fee for ${tournament.name}`,
                image: 'https://via.placeholder.com/150',
                currency: order.currency,
                key: rzpKeyId,
                amount: order.amount,
                name: 'Force Sports',
                order_id: order.id,
                prefill: {
                    email: user.email,
                    contact: user.mobile,
                    name: user.name
                },
                theme: { color: theme.colors.primary }
            };

            // 2. Open Checkout (Platform Specific)
            if (Platform.OS === 'web') {
                const res = await loadRazorpay();
                if (!res) {
                    Alert.alert("Error", "Razorpay SDK failed to load. Are you online?");
                    return;
                }

                options.handler = async function (response) {
                    await verifyPayment(response);
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    Alert.alert("Payment Failed", response.error.description);
                });
                rzp1.open();

            } else {
                // Native (Android/iOS)
                const RazorpayCheckout = require('react-native-razorpay').default;
                RazorpayCheckout.open(options).then((data) => {
                    // handle success
                    verifyPayment(data);
                }).catch((error) => {
                    // handle failure
                    Alert.alert('Error', `Error: ${error.code} | ${error.description}`);
                });
            }

        } catch (e) {
            console.error(e);
            Alert.alert("Error", e.message || "Payment initiation failed");
        }
    };

    const verifyPayment = async (response) => {
        try {
            const verifyRes = await fetch(`${API_URL}/payments/verify-and-join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    tournamentId: tournament.id,
                    userId: user.id,
                    playerDetails: {
                        name: user.name,
                        email: user.email,
                        mobile: user.mobile,
                        game: user.game,
                        strength: user.strength
                    }
                })
            });

            const result = await verifyRes.json();
            if (verifyRes.ok) {
                Alert.alert("Success", "Payment Successful! You have joined the tournament.");
                await loadTournaments();
                navigation.goBack();
            } else {
                Alert.alert("Verification Failed", result.error);
            }
        } catch (e) {
            Alert.alert("Error", "Payment Verification Failed: " + e.message);
        }
    };

    const handleJoin = () => {
        // ... (as before)
        navigation.navigate('PlayerDashboard', { initiateJoin: tournament });
    };

    const handleLeave = () => {
        Alert.alert(
            "Withdraw",
            `Leave ${tournament.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Leave",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await leaveTournament(tournament.id, user.id);
                            Alert.alert("Success", "You have left the tournament");
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <LucideArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    {tournament.banner ? (
                        <Image
                            source={{ uri: `${SERVER_URL}/${tournament.banner}` }}
                            style={styles.banner}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.banner, styles.placeholderBanner]}>
                            <LucideTrophy size={60} color={theme.colors.textSecondary} />
                        </View>
                    )}
                    <View style={styles.overlay} />
                    <View style={styles.headerContent}>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{tournament.gameType}</Text>
                            </View>
                            {isJoined && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.success }]}>
                                    <Text style={styles.badgeText}>ENROLLED</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.title}>{tournament.name}</Text>
                        <Text style={styles.subtitle}>Occupancy: {tournament.players.length} Players</Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.content}>

                    {/* Status Bar */}
                    <View style={styles.statusBar}>
                        <Text style={styles.statusLabel}>STATUS</Text>
                        <Text style={[
                            styles.statusValue,
                            { color: tournament.status === 'ONGOING' ? theme.colors.success : theme.colors.primary }
                        ]}>
                            {tournament.status}
                        </Text>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.grid}>
                        <View style={styles.infoRow}>
                            <LucideCalendar size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>{tournament.date}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <LucideClock size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>{tournament.time}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <LucideUsers size={20} color={theme.colors.textSecondary} />
                            <Text style={styles.infoText}>{tournament.type || 'Single'} Format</Text>
                        </View>
                        <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                            <LucideMapPin size={20} color={theme.colors.error} style={{ marginTop: 2 }} />
                            <View>
                                <Text style={styles.label}>Venue</Text>
                                <Text style={[styles.infoText, { flex: 1 }]}>{tournament.address || 'Venue details not provided'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Organizer Info */}
                    <View style={styles.organizerSection}>
                        <Text style={styles.sectionTitle}>Organized By</Text>
                        <View style={styles.organizerRow}>
                            {/* Ideally show Organizer Avatar if populated */}
                            <View style={styles.orgAvatar}>
                                <Text style={styles.orgInitials}>
                                    {tournament.organizerId?.name?.charAt(0) || 'O'}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.orgName}>{tournament.organizerId?.name || 'Unknown Organizer'}</Text>
                                <Text style={styles.orgContact}>{tournament.organizerId?.email || 'Contact Hidden'}</Text>
                                {tournament.organizerId?.mobile && (
                                    <Text style={styles.orgContact}>{tournament.organizerId.mobile}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Price & Action */}
                    <View style={styles.footer}>
                        <View>
                            <Text style={styles.priceLabel}>Entry Fee</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <LucideIndianRupee size={20} color={theme.colors.text} />
                                <Text style={styles.price}>{tournament.entryFee}</Text>
                            </View>
                        </View>

                        <Button
                            title={isJoined ? "ENROLLED" : (tournament.status === 'PENDING' ? (tournament.entryFee > 0 ? `PAY ₹${tournament.entryFee} & JOIN` : "JOIN NOW") : "REGISTRATION CLOSED")}
                            variant={isJoined ? "outline" : (tournament.status === 'PENDING' ? "primary" : "ghost")}
                            disabled={!canJoin && !isJoined} /* Disabled only if closed */
                            onPress={!isJoined && canJoin ? handlePayAndJoin : null}
                            style={{ minWidth: 160, borderColor: isJoined ? theme.colors.success : undefined }}
                            textStyle={{ color: isJoined ? theme.colors.success : undefined }}
                        />
                    </View>

                </View>

            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        height: 280,
        width: '100%',
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    placeholderBanner: {
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    title: {
        ...theme.typography.h1,
        color: '#fff',
        fontSize: 28,
        marginBottom: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    statusBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statusLabel: {
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    statusValue: {
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    grid: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 2,
    },
    infoText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 16,
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    orgAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orgInitials: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    orgName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    orgContact: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    priceLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginLeft: 4,
    },
});
