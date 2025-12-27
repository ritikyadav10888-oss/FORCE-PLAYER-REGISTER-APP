import { LucideArrowLeft, LucideCalendar, LucideClock, LucideIndianRupee, LucideMapPin, LucideTrophy, LucideUsers } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Removed Share from here

import Button from '../../components/Button';
import { API_URL, RAZORPAY_KEY_ID } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { theme } from '../../styles/theme';
import { openRazorpayCheckout } from '../../utils/razorpayPayment';

export default function TournamentDetailsScreen({ route, navigation }) {
    const { tournament } = route.params;
    const { user, refreshUser } = useAuth();
    const { joinTournament, leaveTournament, loadTournaments } = useTournaments();

    // We need fresh state to reflect join/leave changes immediately
    const isJoined = tournament.players.some(p => (p.user?._id || p.user) === user.id);

    // Check Registration Deadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null;
    const isDeadlinePassed = deadlineDate ? deadlineDate < today : false;

    const canJoin = tournament.status === 'PENDING' && !isJoined && !isDeadlinePassed;

    // --- Dynamic Sport Profiles ---
    const [showProfileModal, setShowProfileModal] = React.useState(false);
    const [sportDetails, setSportDetails] = React.useState({});
    const [profileLoaded, setProfileLoaded] = React.useState(false);















    // Config for supported sports
    const SPORT_CONFIGS = {
        'Archery': [
            { key: 'bowType', label: 'Bow Type', type: 'select', options: ['Recurve', 'Compound', 'Barebow'] },
            { key: 'drawWeight', label: 'Draw Weight (lbs)', type: 'select', options: ['< 30', '30-40', '40-50', '> 50'] }
        ],
        'Athletics': [
            { key: 'mainEvent', label: 'Main Event', type: 'select', options: ['Sprints (100m-400m)', 'Middle Distance (800m-1500m)', 'Long Distance', 'Jumps', 'Throws'] }
        ],
        'Badminton': [
            { key: 'hand', label: 'Playing Hand', type: 'select', options: ['Right', 'Left'] },
            { key: 'category', label: 'Preferred Category', type: 'select', options: ['Singles', 'Doubles', 'Mixed Doubles'] }
        ],
        'Basketball': [
            { key: 'position', label: 'Position', type: 'select', options: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'] }
        ],
        'Billiards & Snooker': [
            { key: 'cueHand', label: 'Cue Hand', type: 'select', options: ['Right', 'Left'] },
            { key: 'highestBreak', label: 'Highest Break Range', type: 'select', options: ['< 30', '30-50', '50-100', '100+'] }
        ],
        'Boxing': [
            { key: 'weightClass', label: 'Weight Class', type: 'select', options: ['Flyweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Heavyweight'] },
            { key: 'stance', label: 'Stance', type: 'select', options: ['Orthodox', 'Southpaw'] }
        ],
        'Carrom': [
            { key: 'style', label: 'Style', type: 'select', options: ['Defensive', 'Attacking'] }
        ],
        'Chess': [
            { key: 'rating', label: 'FIDE/Online Rating', type: 'select', options: ['Beginner (<1000)', 'Intermediate (1000-1600)', 'Advanced (1600-2200)', 'Master (2200+)'] }
        ],
        'Cricket': [
            { key: 'role', label: 'Role', type: 'select', options: ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'] },
            { key: 'batStyle', label: 'Batting Style', type: 'select', options: ['Right Hand', 'Left Hand'] },
            { key: 'bowlStyle', label: 'Bowling Style', type: 'select', options: ['None', 'Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin', 'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin'] }
        ],
        'Cycling': [
            { key: 'type', label: 'Discipline', type: 'select', options: ['Road', 'Track', 'Mountain Bike', 'BMX'] }
        ],
        'Football': [
            { key: 'position', label: 'Position', type: 'select', options: ['Striker', 'Midfielder', 'Defender', 'Goalkeeper'] },
            { key: 'foot', label: 'Preferred Foot', type: 'select', options: ['Right', 'Left', 'Both'] }
        ],
        'Golf': [
            { key: 'handicap', label: 'Handicap', type: 'select', options: ['0-10', '11-20', '21-30', '30+'] }
        ],
        'Gymnastics': [
            { key: 'apparatus', label: 'Main Apparatus', type: 'select', options: ['Floor', 'Vault', 'Bars', 'Beam', 'Rings', 'Pommel Horse'] }
        ],
        'Handball': [
            { key: 'position', label: 'Position', type: 'select', options: ['Goalkeeper', 'Winger', 'Pivot', 'Back'] }
        ],
        'Hockey': [
            { key: 'position', label: 'Position', type: 'select', options: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] }
        ],
        'Judo': [
            { key: 'belt', label: 'Belt Rank', type: 'select', options: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Brown', 'Black'] },
            { key: 'weightClass', label: 'Weight Category', type: 'select', options: ['-60kg', '-73kg', '-90kg', '+90kg'] }
        ],
        'Kabaddi': [
            { key: 'role', label: 'Position', type: 'select', options: ['Raider', 'Defender - Corner', 'Defender - Cover', 'All Rounder'] }
        ],
        'Karate': [
            { key: 'style', label: 'Style', type: 'select', options: ['Shotokan', 'Goju-Ryu', 'Wado-Ryu', 'Shito-Ryu', 'Kyokushin'] },
            { key: 'belt', label: 'Belt', type: 'select', options: ['White', 'Colored', 'Black'] }
        ],
        'Kho Kho': [
            { key: 'role', label: 'Role', type: 'select', options: ['Chaser', 'Runner', 'All Rounder'] }
        ],
        'Rugby': [
            { key: 'position', label: 'Position', type: 'select', options: ['Forward', 'Back'] }
        ],
        'Shooting': [
            { key: 'gunType', label: 'Category', type: 'select', options: ['Pistol', 'Rifle', 'Shotgun'] },
            { key: 'distance', label: 'Distance', type: 'select', options: ['10m', '25m', '50m'] }
        ],
        'Squash': [
            { key: 'hand', label: 'Playing Hand', type: 'select', options: ['Right', 'Left'] }
        ],
        'Swimming': [
            { key: 'stroke', label: 'Main Stroke', type: 'select', options: ['Freestyle', 'Breaststroke', 'Backstroke', 'Butterfly'] }
        ],
        'Table Tennis': [
            { key: 'grip', label: 'Grip Style', type: 'select', options: ['Shakehand', 'Penhold'] },
            { key: 'style', label: 'Play Style', type: 'select', options: ['Attacker', 'Defender', 'All Rounder'] }
        ],
        'Taekwondo': [
            { key: 'belt', label: 'Belt Rank', type: 'select', options: ['White', 'Color', 'Black'] },
            { key: 'weight', label: 'Weight Class', type: 'select', options: ['Fly', 'Feather', 'Welter', 'Heavy'] }
        ],
        'Tennis': [
            { key: 'hand', label: 'Playing Hand', type: 'select', options: ['Right', 'Left'] },
            { key: 'backhand', label: 'Backhand', type: 'select', options: ['One-handed', 'Two-handed'] }
        ],
        'Throwball': [
            { key: 'position', label: 'Position', type: 'select', options: ['Service', 'Net', 'Back'] }
        ],
        'Volleyball': [
            { key: 'position', label: 'Position', type: 'select', options: ['Setter', 'Outside Hitter', 'Opposite', 'Middle Blocker', 'Libero'] }
        ],
        'Wrestling': [
            { key: 'style', label: 'Style', type: 'select', options: ['Freestyle', 'Greco-Roman'] },
            { key: 'weight', label: 'Weight Class', type: 'select', options: ['Light', 'Middle', 'Heavy'] }
        ]
    };

    const currentSportConfig = SPORT_CONFIGS[tournament.gameType];

    React.useEffect(() => {
        // Fetch latest user profile to get saved sport details
        const fetchUserProfile = async () => {
            if (user && currentSportConfig && !profileLoaded) {
                try {
                    // Assuming we can get full user details including sportProfiles
                    // Since useAuth might only have basic info, let's fetch fresh
                    const res = await fetch(`${API_URL}/users/${user.id}`); // Need a route for this or rely on auth context if updated
                    // Fallback: if auth context doesn't have it, we might need to rely on local state or fetch
                    // For now, let's check if user object has sportProfiles (it might not if not refreshed)

                    // Optimization: Just check if user object has it. 
                    if (user.sportProfiles && user.sportProfiles[tournament.gameType]) {
                        setSportDetails(user.sportProfiles[tournament.gameType]);
                    }
                } catch (e) { console.log("Profile fetch err", e); }
                setProfileLoaded(true);
            }
        };
        fetchUserProfile();
    }, [user, tournament.gameType]);

    const initiateJoinFlow = () => {
        if (currentSportConfig) {
            setShowProfileModal(true);
        } else {
            handlePayAndJoin();
        }
    };

    const SERVER_URL = API_URL.replace('/api', '');

    React.useEffect(() => {
        if (route.params?.paymentSuccess) {
            loadTournaments();
            Alert.alert("Success", "Payment Successful! You have joined the tournament.");
            navigation.setParams({ paymentSuccess: null });
            navigation.goBack();
        }
    }, [route.params?.paymentSuccess]);






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

            // 2. Open Checkout (Cross-Platform)
            const result = await openRazorpayCheckout(options, verifyPayment, null);

            if (result?.fallbackToWebView) {
                console.log("Navigating to PaymentScreen form Details...");
                const html = `
                    <!DOCTYPE html>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <body>
                        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                        <script>
                            var options = ${JSON.stringify(options)};
                            options.handler = function(response){
                                window.ReactNativeWebView.postMessage(JSON.stringify({status: 'success', data: response}));
                            };
                            options.modal = {
                                ondismiss: function(){
                                    window.ReactNativeWebView.postMessage(JSON.stringify({status: 'dismiss'}));
                                }
                            };
                            var rzp = new Razorpay(options);
                            rzp.open();
                        </script>
                    </body>
                `;
                navigation.navigate('PaymentScreen', {
                    html,
                    tournamentId: tournament.id,
                    userId: user.id
                });
            }

        } catch (e) {
            console.error(e);
            Alert.alert("Error", e.message || "Payment initiation failed");
        }
    };

    const handleProfileSubmit = () => {
        // Validate required fields
        const isValid = currentSportConfig.every(field => sportDetails[field.key]);
        if (!isValid) {
            Alert.alert("Missing Details", "Please fill all player details to proceed.");
            return;
        }
        setShowProfileModal(false);
        handlePayAndJoin();
    };

    const updateDetail = (key, value) => {
        setSportDetails(prev => ({ ...prev, [key]: value }));
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
                        strength: user.strength,
                        gameDetails: sportDetails // Include the captured sport details
                    }
                })
            });

            const result = await verifyRes.json();
            if (verifyRes.ok) {
                Alert.alert("Success", "Payment Successful! You have joined the tournament.");
                await loadTournaments();
                if (refreshUser) await refreshUser();
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
        <View style={styles.container}>
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
                        {tournament.registrationDeadline && (
                            <View style={styles.infoRow}>
                                <LucideClock size={20} color={theme.colors.error} />
                                <Text style={{ color: isDeadlinePassed ? theme.colors.error : theme.colors.textSecondary, fontWeight: 'bold' }}>
                                    Register by: {tournament.registrationDeadline}
                                </Text>
                            </View>
                        )}
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
                            title={isJoined ? "ENROLLED" : (isDeadlinePassed ? "REGISTRATION CLOSED" : (tournament.status === 'PENDING' ? (tournament.entryFee > 0 ? `PAY ₹${tournament.entryFee} & JOIN` : "JOIN NOW") : "TOURNAMENT ENDED"))}
                            variant={isJoined ? "outline" : (canJoin ? "primary" : "ghost")}
                            onPress={canJoin ? initiateJoinFlow : null}
                            disabled={!canJoin && !isJoined}
                            style={{ minWidth: 160, borderColor: isJoined ? theme.colors.success : undefined, opacity: (!canJoin && !isJoined) ? 0.6 : 1 }}
                            textStyle={{ color: isJoined ? theme.colors.success : undefined }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Profile Detail Modal */}
            <Modal visible={showProfileModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Player Profile: {tournament.gameType}</Text>
                        <Text style={styles.modalSub}>Complete your profile for this sport.</Text>

                        <ScrollView style={{ maxHeight: 400 }}>
                            {currentSportConfig?.map((field) => (
                                <View key={field.key} style={{ marginBottom: 16 }}>
                                    <Text style={styles.inputLabel}>{field.label}</Text>
                                    <View style={styles.optionsContainer}>
                                        {field.options.map(opt => (
                                            <TouchableOpacity
                                                key={opt}
                                                style={[
                                                    styles.optionChip,
                                                    sportDetails[field.key] === opt && styles.optionChipSelected
                                                ]}
                                                onPress={() => updateDetail(field.key, opt)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    sportDetails[field.key] === opt && styles.optionTextSelected
                                                ]}>{opt}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <Button title="Cancel" variant="outline" onPress={() => setShowProfileModal(false)} style={{ flex: 1 }} />
                            <Button title="Continue to Payment" onPress={handleProfileSubmit} style={{ flex: 1 }} />
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
    },
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
        backgroundColor: '#EEEEEE',
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
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
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusLabel: {
        color: '#666666',
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
        color: '#666666',
        fontSize: 12,
        marginBottom: 2,
    },
    infoText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
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
        backgroundColor: '#F0F0F0',
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
        color: '#000000',
    },
    orgContact: {
        fontSize: 14,
        color: '#666666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    priceLabel: {
        fontSize: 12,
        color: '#666666',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginLeft: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        maxHeight: '80%'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8
    },
    modalSub: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333'
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    optionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9'
    },
    optionChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary
    },
    optionText: {
        fontSize: 12,
        color: '#333'
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
