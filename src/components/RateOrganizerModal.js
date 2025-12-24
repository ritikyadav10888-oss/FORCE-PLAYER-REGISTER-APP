import { LucideStar } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../styles/theme';
import Button from './Button';
import Input from './Input';

export default function RateOrganizerModal({ visible, onClose, onSubmit, organizerName }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setLoading(true);
        await onSubmit(rating, review);
        setLoading(false);
        setRating(0);
        setReview('');
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Rate Organizer</Text>
                    <Text style={styles.subtitle}>
                        How was your experience with {organizerName}?
                    </Text>

                    <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <LucideStar
                                    size={32}
                                    color={star <= rating ? "#FFD700" : theme.colors.textSecondary}
                                    fill={star <= rating ? "#FFD700" : "none"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Input
                        label="Review (Optional)"
                        placeholder="Share your experience..."
                        value={review}
                        onChangeText={setReview}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            onPress={onClose}
                            variant="outline"
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Submit"
                            onPress={handleSubmit}
                            loading={loading}
                            disabled={rating === 0}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
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
        color: theme.colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 20,
        textAlign: 'center',
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    }
});
