import { Alert, Platform } from 'react-native';

export const openRazorpayCheckout = async (options, verifyPaymentCallback, setLoading) => {
    // NATIVE IMPLEMENTATION (Expo Go Fallback)
    if (Platform.OS !== 'web') {
        // We cannot use native Razorpay SDK in Expo Go.
        // We return a flag to tell the caller to use a WebView instead.
        return { fallbackToWebView: true };
    }

    // WEB IMPLEMENTATION
    return new Promise((resolve, reject) => {
        const loadRazorpay = () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const startPayment = async () => {
            const res = await loadRazorpay();
            if (!res) {
                Alert.alert("Error", "Razorpay SDK failed to load. Are you online?");
                if (setLoading) setLoading(false);
                resolve({ success: false });
                return;
            }

            const checkoutOptions = {
                ...options,
                handler: async function (response) {
                    await verifyPaymentCallback(response);
                    resolve({ success: true });
                },
                modal: {
                    ondismiss: function () {
                        if (setLoading) setLoading(false);
                        resolve({ success: false });
                    }
                }
            };

            const rzp = new window.Razorpay(checkoutOptions);
            rzp.on('payment.failed', function (response) {
                Alert.alert('Payment Failed', response.error.description);
                if (setLoading) setLoading(false);
                resolve({ success: false });
            });
            rzp.open();
        };

        startPayment();
    });
};
