# 🚀 Razorpay Real Payment Integration Guide

I've implemented the **Real Razorpay Integration** in your Force App! This includes backend order creation, secure frontend checkout, and backend payment verification.

---

## 🛠️ Step 1: Get Your API Keys
1.  Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Go to **Settings** > **API Keys**.
3.  Click **Generate Key ID and Secret**.
4.  **Important**: Keep the Secret safe! You won't be able to see it again.

---

## 🛠️ Step 2: Update Backend Configuration
Open `backend/.env` and replace the placeholders with your actual keys:
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=YYYYYYYYYYYYYYYYYYYYYYYY
```

---

## 🛠️ Step 3: Update Frontend Configuration
Open `src/config.js` and replace the placeholder with your actual Key ID:
```javascript
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXX';
```

---

## 📱 Step 4: For Mobile (Android/iOS)
Since this app uses native modules (`react-native-razorpay`), you need to prebuild and install the native dependencies:

1.  **Stop the current server**.
2.  Run prebuild (to generate android/ios folders):
    ```bash
    npx expo prebuild
    ```
3.  Install the native app:
    - **Android**: `npx expo run:android`
    - **iOS**: `npx expo run:ios` (Mac only)

---

## 🌐 Step 5: For Web
No extra steps needed! The Web integration loads the Razorpay script dynamically and works instantly once you provide the keys.

---

## 🧪 Testing the Integration
1.  Open the **Wallet Screen**.
2.  Enter an amount (e.g., 500).
3.  Select **Secure Online Payment (Razorpay)**.
4.  Click **Proceed to Payment**.
5.  Wait for the Razorpay Checkout to open.
6.  Use Razorpay's **Test Mode** credentials:
    - **UPI**: success@razorpay
    - **Cards**: Use test card numbers provided on the screen.

---

## ✅ What's Been Implemented:
1.  **Backend**:
    - `POST /api/payments/create-order`: Creates a Razorpay order.
    - `POST /api/payments/verify`: Verifies the payment signature and updates the wallet securely.
2.  **Frontend**:
    - `RazorpayService.js`: An abstract service that handles both Web and Mobile payment flows.
    - `PaymentModal.js`: Updated to include the Real Payment flow along with simulations.
    - `config.js`: Centralized Razorpay Key ID.

---

**Note**: I've kept the simulated payment methods (UPI, Bank, Card) so you can still test the UI flows without needing real API keys. Use the **Razorpay (Recommended)** option for the real experience!

🎉 **Happy Payments!** 🎉
