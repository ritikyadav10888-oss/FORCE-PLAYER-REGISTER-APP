import { Platform } from 'react-native';
import { API_URL, RAZORPAY_KEY_ID } from '../config';

/**
 * Service to handle Razorpay payments for both Web and Mobile.
 */
class RazorpayService {
    /**
     * Creates a Razorpay order on the backend.
     */
    static async createOrder(amount, currency = 'INR') {
        try {
            const response = await fetch(`${API_URL}/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create order');
            return data;
        } catch (error) {
            console.error('RazorpayService.createOrder Error:', error);
            throw error;
        }
    }

    /**
     * Verifies the payment on the backend.
     */
    static async verifyPayment(paymentData) {
        try {
            const response = await fetch(`${API_URL}/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Payment verification failed');
            return data;
        } catch (error) {
            console.error('RazorpayService.verifyPayment Error:', error);
            throw error;
        }
    }

    /**
     * Opens the Razorpay Checkout.
     */
    static async openCheckout(orderData, user, options = {}) {
        if (Platform.OS === 'web') {
            return this.openWebCheckout(orderData, user, options);
        } else {
            return this.openMobileCheckout(orderData, user, options);
        }
    }

    /**
     * Web-specific Checkout logic.
     */
    static openWebCheckout(orderData, user, options) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => {
                const rzpOptions = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Force App',
                    description: options.description || 'Wallet Top-up',
                    order_id: orderData.id,
                    handler: (response) => {
                        resolve(response);
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: user.mobile || '',
                    },
                    theme: {
                        color: '#4CAF50',
                    },
                    modal: {
                        ondismiss: () => {
                            reject(new Error('Payment cancelled by user'));
                        }
                    }
                };
                const rzp = new window.Razorpay(rzpOptions);
                rzp.open();
            };
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        });
    }

    /**
     * Mobile-specific Checkout logic using react-native-razorpay.
     */
    static async openMobileCheckout(orderData, user, options) {
        console.warn('Razorpay native module not available in Expo Go.');
        throw new Error('Razorpay Native is not supported in Expo Go. Use Web or a Custom Dev Client.');
    }
}

export default RazorpayService;
