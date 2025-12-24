import { LucideCopy, LucideX } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Clipboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../styles/theme';

export default function PaymentModal({ visible, onClose, onSubmit, amount, payToUpi, tournamentName }) {
    const [transactionId, setTransactionId] = useState('');

    const handleCopy = () => {
        Clipboard.setString(payToUpi);
        Alert.alert("Copied", "UPI ID copied to clipboard");
    };

    const handleSubmit = () => {
        if (!transactionId.trim()) {
            Alert.alert("Required", "Please enter the Transaction ID / UTR from your payment app.");
            return;
        }
        onSubmit(transactionId);
        setTransactionId('');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ width: '100%' }}
                >
                    <View style={styles.modalView}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.header}>
                                <Text style={styles.modalTitle}>Complete Payment</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <LucideX size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>
                                To join <Text style={{ color: theme.colors.primary }}>{tournamentName}</Text>, please pay the entry fee.
                            </Text>

                            <View style={styles.amountBox}>
                                <Text style={styles.amountLabel}>Entry Fee</Text>
                                <Text style={styles.amountVal}>₹{amount}</Text>
                            </View>

                            <View style={styles.upiContainer}>
                                <Text style={styles.label}>Pay to UPI ID:</Text>
                                <View style={styles.upiBox}>
                                    <Text style={styles.upiText}>{payToUpi || 'force@upi'}</Text>
                                    <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
                                        <LucideCopy size={18} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Enter Transaction ID / UTR:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 345218765432"
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={transactionId}
                                    onChangeText={setTransactionId}
                                />
                                <Text style={styles.hint}>
                                    Check your payment app (GPay, PhonePe, Paytm) for the 12-digit UTR/Reference number.
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Text style={styles.submitText}>Submit Payment Details</Text>
                            </TouchableOpacity>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalView: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        width: '100%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 24,
    },
    amountBox: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: theme.colors.surfaceLight,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    amountLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    amountVal: {
        ...theme.typography.hero,
        fontSize: 40,
        color: theme.colors.primary,
    },
    upiContainer: {
        marginBottom: 24,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.text,
        marginBottom: 8,
        fontWeight: '700',
    },
    upiBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderStyle: 'dashed',
    },
    upiText: {
        ...theme.typography.h3,
        color: theme.colors.text,
        fontFamily: 'monospace',
    },
    copyBtn: {
        padding: 4,
    },
    inputContainer: {
        marginBottom: 32,
    },
    input: {
        backgroundColor: theme.colors.surfaceLight,
        padding: 16,
        borderRadius: 12,
        color: theme.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    hint: {
        ...theme.typography.caption,
        color: theme.colors.textTertiary,
        marginTop: 8,
        fontSize: 12,
    },
    submitBtn: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        ...theme.typography.button,
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
