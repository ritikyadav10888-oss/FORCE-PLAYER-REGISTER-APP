# 📧 Email Service Setup Guide - Force App

## ✅ Implementation Complete!

Your Force App now has a **professional email service** for password reset using **Gmail's free SMTP service**.

---

## 🎯 What Was Implemented

### 1. **Email Service** (`backend/services/emailService.js`)
- ✅ Password reset emails with OTP
- ✅ Welcome emails for new users
- ✅ Beautiful HTML email templates
- ✅ Professional branding with Force logo
- ✅ Secure OTP delivery

### 2. **Updated Endpoints**
- ✅ `/api/auth/forgot-password` - Now sends email with OTP
- ✅ `/api/auth/reset-password` - Validates OTP and resets password
- ✅ Fallback to console logging if email fails (development mode)

### 3. **Email Templates**
- 🎨 Modern, responsive HTML design
- 🔐 Security warnings and best practices
- ⏰ OTP expiry information (1 hour)
- 💼 Professional Force Sports branding

---

## 🔧 Gmail Setup Instructions

### Step 1: Create/Use Gmail Account

1. Go to [Gmail](https://mail.google.com)
2. Sign in or create a new account
3. **Recommended**: Create a dedicated account for your app (e.g., `forceapp.noreply@gmail.com`)

### Step 2: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Follow the steps to enable it
4. **This is required** to create App Passwords

### Step 3: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Force App**
5. Click **Generate**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 4: Update .env File

Open `backend/.env` and update:

```bash
# Email Service Configuration
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Remove spaces from app password
NODE_ENV=development
```

**Example**:
```bash
EMAIL_USER=forceapp.noreply@gmail.com
EMAIL_PASSWORD=xyzw1234abcd5678
NODE_ENV=development
```

### Step 5: Restart Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
node server.js
```

---

## 🧪 Testing the Email Service

### Test 1: Forgot Password

```bash
# Send request to forgot-password endpoint
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@force.com",
  "role": "PLAYER"
}
```

**Expected Response**:
```json
{
  "message": "Password reset OTP has been sent to your email. Please check your inbox.",
  "email": "te***@force.com"
}
```

**Check your email** - You should receive a beautiful email with a 4-digit OTP!

### Test 2: Reset Password

```bash
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "email": "test@force.com",
  "role": "PLAYER",
  "otp": "1234",
  "newPassword": "NewP@ssw0rd123!"
}
```

**Expected Response**:
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## 📧 Email Templates

### Password Reset Email

The email includes:
- ✅ **Professional Header** with Force branding
- ✅ **Large OTP Code** (4 digits, easy to read)
- ✅ **Expiry Information** (1 hour)
- ✅ **Security Warnings** (never share OTP)
- ✅ **Professional Footer**

**Preview**:
```
┌─────────────────────────────────┐
│     ⚡ FORCE                     │
│     DOMINATE THE FIELD          │
├─────────────────────────────────┤
│  Password Reset Request         │
│                                 │
│  Hello John Doe,                │
│                                 │
│  ┌───────────────────────┐     │
│  │   Your OTP            │     │
│  │   1234                │     │
│  │   Valid for 1 hour    │     │
│  └───────────────────────┘     │
│                                 │
│  ⚠️ Security Notice:            │
│  • Never share this OTP         │
│  • Expires in 1 hour            │
├─────────────────────────────────┤
│  © 2024 Force Sports            │
└─────────────────────────────────┘
```

---

## 🔒 Security Features

### 1. **OTP Expiry**
- OTPs expire after **1 hour**
- Old OTPs cannot be reused

### 2. **Email Masking**
- Response shows: `te***@force.com`
- Protects user privacy

### 3. **Fallback Mode**
- If email fails, OTP is logged to console (development only)
- Production mode won't expose OTP

### 4. **Password Validation**
- New password must meet strength requirements
- Same validation as registration

---

## 🚨 Troubleshooting

### Issue: "Email service configuration error"

**Cause**: Gmail credentials not set or incorrect

**Solution**:
1. Check `.env` file has correct `EMAIL_USER` and `EMAIL_PASSWORD`
2. Verify App Password is correct (16 characters, no spaces)
3. Ensure 2-Step Verification is enabled on Gmail account

### Issue: "Invalid credentials" (Gmail)

**Cause**: Using regular password instead of App Password

**Solution**:
1. Generate a new App Password from Google Account
2. Use the 16-character App Password, not your Gmail password

### Issue: "Less secure app access"

**Cause**: Gmail security settings

**Solution**:
- **Don't use "Less secure app access"** (deprecated)
- **Use App Passwords instead** (more secure)

### Issue: Email not received

**Check**:
1. ✅ Spam/Junk folder
2. ✅ Email address is correct
3. ✅ Server logs show "✅ Password reset email sent"
4. ✅ Gmail account has sending limits (500 emails/day for free accounts)

---

## 📊 Gmail Free Tier Limits

| Feature | Limit |
|---------|-------|
| Emails per day | 500 |
| Recipients per email | 500 |
| Attachment size | 25 MB |
| Cost | **FREE** ✅ |

**Perfect for production!** Unless you have 500+ password resets per day.

---

## 🎨 Customization

### Change Email Templates

Edit `backend/services/emailService.js`:

```javascript
// Change colors
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);

// Change logo
<h1>YOUR LOGO</h1>

// Change content
<p>Your custom message</p>
```

### Add More Email Types

```javascript
// In emailService.js
const sendVerificationEmail = async (email, token) => {
    // Your email template
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendVerificationEmail  // Export new function
};
```

---

## 🌐 Alternative Free Email Services

If you don't want to use Gmail, here are alternatives:

### 1. **SendGrid** (Free Tier: 100 emails/day)
```javascript
// Install: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### 2. **Mailgun** (Free Tier: 5,000 emails/month)
```javascript
// Install: npm install mailgun-js
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});
```

### 3. **Brevo (Sendinblue)** (Free Tier: 300 emails/day)
```javascript
// Install: npm install @sendinblue/client
const SibApiV3Sdk = require('@sendinblue/client');
```

**Recommendation**: Stick with **Gmail** for simplicity and reliability!

---

## 📱 Frontend Integration

### Forgot Password Screen

```javascript
const handleForgotPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, role: 'PLAYER' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Alert.alert('Success', data.message);
            // Navigate to OTP input screen
        } else {
            Alert.alert('Error', data.error);
        }
    } catch (error) {
        Alert.alert('Error', 'Network error. Please try again.');
    }
};
```

### Reset Password Screen

```javascript
const handleResetPassword = async (email, otp, newPassword) => {
    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                role: 'PLAYER',
                otp,
                newPassword 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            Alert.alert('Success', data.message);
            // Navigate to login screen
        } else {
            Alert.alert('Error', data.error);
        }
    } catch (error) {
        Alert.alert('Error', 'Network error. Please try again.');
    }
};
```

---

## ✅ Production Checklist

Before deploying:

- [ ] Gmail App Password configured in `.env`
- [ ] Email service tested and working
- [ ] OTP emails being received
- [ ] Password reset flow tested end-to-end
- [ ] Email templates customized with your branding
- [ ] `NODE_ENV=production` in production `.env`
- [ ] Error handling tested
- [ ] Spam folder checked (emails should go to inbox)

---

## 🎉 Success!

Your Force App now has:
- ✅ Professional email service
- ✅ Secure password reset via email
- ✅ Beautiful HTML email templates
- ✅ Free Gmail SMTP (500 emails/day)
- ✅ Fallback to console logging (development)
- ✅ Production-ready implementation

---

## 📞 Next Steps

1. **Set up Gmail App Password** (follow instructions above)
2. **Update .env file** with your credentials
3. **Restart server**
4. **Test forgot password flow**
5. **Deploy to production!**

---

## 📝 Quick Reference

### Environment Variables
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
NODE_ENV=development
```

### API Endpoints
```bash
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Files Modified
- ✅ `backend/services/emailService.js` (NEW)
- ✅ `backend/server.js` (Updated)
- ✅ `backend/.env` (Updated)
- ✅ `backend/package.json` (nodemailer added)

---

**Happy Emailing! 📧**

For questions or issues, check the troubleshooting section above.
