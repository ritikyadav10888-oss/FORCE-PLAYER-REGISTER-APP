import { LucideArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';

export default function PaymentScreen({ route, navigation }) {
    const { html, onPaymentSuccess, onPaymentFailure } = route.params || {};

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.status === 'success') {
                // We can't pass callbacks via navigation params easily across screens if they aren't serializable
                // But we can navigate back with params
                if (onPaymentSuccess) {
                    // This won't work well if onPaymentSuccess is a function
                    // We should likely just go back and trigger an event/context or use navigation result
                }

                // For now, assume success means we go back with a success flag
                navigation.navigate('TournamentDetails', { paymentSuccess: true, paymentData: message.data });
            } else if (message.status === 'dismiss') {
                navigation.goBack();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <LucideArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Secure Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            {html ? (
                <WebView
                    originWhitelist={['*']}
                    source={{ html: html }}
                    onMessage={handleWebViewMessage}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            ) : (
                <View style={styles.errorView}>
                    <Text>Invalid Payment Request</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 40 : 0,
    },
    header: {
        flexDirection: 'row', // Use row to layout items horizontally
        alignItems: 'center', // Center items vertically
        justifyContent: 'space-between', // Distribute space between items
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f8f9fa',
        height: 60, // Fixed height or minHeight
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    errorView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
