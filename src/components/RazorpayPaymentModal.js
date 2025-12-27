import { LucideX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../config';
import { theme } from '../styles/theme';
import Button from './Button';

export default function RazorpayPaymentModal({ visible, onClose, onSuccess, tournamentId, userId, playerDetails, amount, tournamentName, navigation }) {
    const [loading, setLoading] = useState(false);
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);

    useEffect(() => {
        // Fetch Razorpay Key from backend
        const fetchConfig = async () => {
            try {
                const response = await fetch(`${API_URL}/config`);
                const data = await response.json();
                setRazorpayKeyId(data.razorpayKeyId);
            } catch (error) {
                console.error('Failed to fetch config:', error);
            }
        };
        fetchConfig();
    }, []);



    const handlePayment = async () => {
        if (!razorpayKeyId) {
            Alert.alert('Error', 'Payment gateway not configured');
            return;
        }

        try {
            setLoading(true);

            // Step 1: Create Order
            const orderResponse = await fetch(`${API_URL}/payments/create-tournament-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentId, userId })
            });

            const orderData = await orderResponse.json();
            if (!orderResponse.ok) {
                throw new Error(orderData.error || 'Failed to create order');
            }

            setCurrentOrderId(orderData.id);

            // Step 2: Open Razorpay Checkout (Cross-Platform)
            const options = {
                key: razorpayKeyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Force Sports',
                description: `Entry Fee for ${tournamentName}`,
                order_id: orderData.id,
                prefill: {
                    name: playerDetails.name,
                    email: playerDetails.email,
                    contact: playerDetails.mobile
                },
                theme: { color: theme.colors.primary }
            };

            const result = await openRazorpayCheckout(
                options,
                async (response) => {
                    await verifyPayment(response, orderData.id);
                },
                setLoading
            );

            console.log("PAYMENT RESULT:", JSON.stringify(result));

            if (result?.fallbackToWebView) {
                console.log("Navigating to PaymentScreen...");

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

                setLoading(false);
                onClose(); // Close the modal
                navigation.navigate('PaymentScreen', {
                    html,
                    tournamentId,
                    userId,
                    amount
                });
            }
        } catch (error) {
            console.error('Payment Error:', error);
            Alert.alert('Error', error.message || 'Payment failed');
            setLoading(false);
        }
    };

    const verifyPayment = async (paymentResponse, orderId) => {
        try {
            const verifyResponse = await fetch(`${API_URL}/payments/verify-and-join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: paymentResponse.razorpay_order_id || orderId,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    tournamentId,
                    userId,
                    playerDetails: {
                        ...playerDetails,
                        amount: amount
                    }
                })
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
                throw new Error(verifyData.error || 'Payment verification failed');
            }

            setLoading(false);
            Alert.alert('Success', 'Payment successful! You have joined the tournament.');
            onSuccess(verifyData);
            onClose();
        } catch (error) {
            console.error('Verification Error:', error);
            Alert.alert('Error', error.message || 'Payment verification failed');
            setLoading(false);
        }
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
                                <TouchableOpacity onPress={onClose} disabled={loading}>
                                    <LucideX size={24} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>
                                To join <Text style={{ color: theme.colors.primary }}>{tournamentName}</Text>, please complete the payment.
                            </Text>

                            <View style={styles.amountBox}>
                                <Text style={styles.amountLabel}>Entry Fee</Text>
                                <Text style={styles.amountVal}>₹{amount}</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>🔒 Secure payment powered by Razorpay</Text>
                                <Text style={styles.infoText}>✓ UPI, Cards, Netbanking supported</Text>
                                <Text style={styles.infoText}>✓ Instant confirmation</Text>
                            </View>

                            <Button
                                title="Pay Now"
                                onPress={handlePayment}
                                loading={loading}
                                disabled={loading}
                                style={styles.payButton}
                            />

                            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
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
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    infoBox: {
        backgroundColor: theme.colors.surfaceHighlight,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoText: {
        ...theme.typography.bodySmall,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    payButton: {
        marginBottom: 12,
    },
    cancelButton: {
        padding: 12,
        alignItems: 'center',
    },
    cancelText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    }
});
