import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button';
import Input from './Input';

export default function JoinTournamentModal({ visible, onClose, onJoin, tournament }) {
    const [teamName, setTeamName] = useState('');
    const [teammates, setTeammates] = useState('');
    const [error, setError] = useState('');

    if (!visible || !tournament) return null;

    const isTeam = tournament.type === 'TEAM' || tournament.type === 'DOUBLE';

    const handleJoin = () => {
        if (isTeam) {
            if (!teamName.trim()) {
                setError('Team Name is required');
                return;
            }
            if (tournament.type === 'DOUBLE' && !teammates.trim()) {
                setError('Partner name is required');
                return;
            }
        }

        // Parse teammates string into array
        const teammateList = teammates.split(',').map(t => t.trim()).filter(Boolean);

        Alert.alert(
            "Confirm Entry & T&C",
            `Join ${tournament.name}?\n\nBy joining, you agree:\n1. You cannot withdraw your name once joined.\n2. Entry fees are non-refundable.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Agree & Pay",
                    onPress: () => {
                        onJoin({
                            teamName,
                            teammates: teammateList
                        });
                    }
                }
            ]
        );

        // Reset and close handled by parent usually, but let's reset form logic on submit? 
        // Better to wait for success in parent. For now user closes manually or parent closes.
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Join Tournament</Text>
                    <Text style={styles.subtitle}>{tournament.name}</Text>
                    <Text style={styles.info}>Format: {tournament.type}</Text>
                    <Text style={styles.info}>Fee: ₹{tournament.entryFee}</Text>

                    {isTeam && (
                        <View style={styles.form}>
                            <Input
                                label="Team Name"
                                placeholder="Enter your team name"
                                value={teamName}
                                onChangeText={(t) => { setTeamName(t); setError(''); }}
                            />
                            <Input
                                label={tournament.type === 'DOUBLE' ? "Partner's Name" : "Teammates (comma separated)"}
                                placeholder={tournament.type === 'DOUBLE' ? "e.g. John Doe" : "e.g. John, Mike, Sarah"}
                                value={teammates}
                                onChangeText={(t) => { setTeammates(t); setError(''); }}
                            />
                        </View>
                    )}

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.buttons}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={onClose}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title={`Pay ₹${tournament.entryFee} & Join`}
                            onPress={handleJoin}
                            style={{ flex: 1, backgroundColor: theme.colors.success }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    info: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
        textAlign: 'center',
    },
    form: {
        marginTop: 20,
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    error: {
        color: theme.colors.error,
        marginTop: 10,
        textAlign: 'center',
    }
});
