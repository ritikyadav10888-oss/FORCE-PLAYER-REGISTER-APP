import { Alert } from 'react-native';

export const openRazorpayCheckout = async (options, verifyPaymentCallback, setLoading) => {
    // NATIVE IMPLEMENTATION
    console.log("Starting Native Razorpay Flow...");
    let result = { success: false };

    try {
        const RazorpayCheckout = require('react-native-razorpay').default;

        try {
            const data = await RazorpayCheckout.open(options);
            // Success
            verifyPaymentCallback(data);
            result = { success: true };
        } catch (error) {
            console.log("Razorpay Native Error:", error);

            // Check if Native Module Missing (Expo Go)
            // TypeError usually comes from 'open' being undefined on null export
            if ((error instanceof TypeError) || (!error.code && !error.description)) {
                console.log("Detected Expo Go / Missing Module. Setting fallback flag.");
                result = { fallbackToWebView: true };
            } else if (error.code == 0) {
                // User Cancelled
                Alert.alert('Payment Cancelled', 'User cancelled the payment.');
            } else {
                // Genuine Error
                Alert.alert('Error', `Error: ${error.code} | ${error.description}`);
            }

            if (setLoading) setLoading(false);
        }
    } catch (error) {
        // Require failed (Module not found)
        console.warn("Razorpay Native Module not found (require failed).");
        result = { fallbackToWebView: true };
    }

    console.log("Native Flow Result:", JSON.stringify(result));
    return result;
};
