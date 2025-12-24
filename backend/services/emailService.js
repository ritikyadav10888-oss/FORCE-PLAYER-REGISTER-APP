const nodemailer = require('nodemailer');

// Create transporter using Gmail's free SMTP service
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD // Gmail App Password
        },
        // Add timeouts to prevent hanging
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 5000
    });
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Force Sports" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Password Reset Request - Force App',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #00D9FF 0%, #0099CC 100%);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 32px;
                        letter-spacing: 2px;
                    }
                    .content {
                        padding: 40px 30px;
                        color: #333;
                    }
                    .otp-box {
                        background-color: #f8f9fa;
                        border: 2px dashed #00D9FF;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 30px 0;
                    }
                    .otp-code {
                        font-size: 36px;
                        font-weight: bold;
                        color: #00D9FF;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .footer {
                        background-color: #04060D;
                        color: #888;
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #00D9FF;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1><img src="../../assets/force_logo.png"> FORCE</h1>
                        <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">DOMINATE THE FIELD</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #00D9FF;">Password Reset Request</h2>
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>We received a request to reset your password for your Force Sports account.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your One-Time Password (OTP)</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 1 hour</p>
                        </div>
                        
                        <p>Enter this OTP in the app to reset your password.</p>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Never share this OTP with anyone</li>
                                <li>Force staff will never ask for your OTP</li>
                                <li>This OTP expires in 1 hour</li>
                            </ul>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Force Sports. All rights reserved.</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

// Send email verification OTP
const sendVerificationEmail = async (email, otp, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Force Sports" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✉️ Verify Your Email - Force App',
        html: `
            <!DOCTYPE html>
            <html>
                <!-- Reuse styles from above for consistency -->
            <head>
                <style>
                    /* Simplified styling for this example, or reuse full CSS block */
                    body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #00D9FF 0%, #0099CC 100%); padding: 30px; text-align: center; color: white; }
                    .otp-box { background-color: #f8f9fa; border: 2px dashed #00D9FF; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 36px; font-weight: bold; color: #00D9FF; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                    .content { padding: 40px 30px; color: #333; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 32px;">⚡ FORCE</h1>
                        <p>VERIFY YOUR IDENTITY</p>
                    </div>
                    <div class="content">
                        <h2 style="color: #00D9FF;">Email Verification</h2>
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Welcome to Force Sports! Please verify your email address to activate your account.</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Verification Code</p>
                            <div class="otp-code">${otp}</div>
                        </div>
                        
                        <p>This code will expire in 10 minutes.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw error;
    }
};

// Send welcome email (optional - for new registrations)
const sendWelcomeEmail = async (email, userName) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Force Sports" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Welcome to Force Sports!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #00D9FF 0%, #0099CC 100%);
                        padding: 40px;
                        text-align: center;
                        color: white;
                    }
                    .content {
                        padding: 40px 30px;
                        color: #333;
                    }
                    .footer {
                        background-color: #04060D;
                        color: #888;
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 48px; letter-spacing: 4px;">⚡ FORCE</h1>
                        <p style="margin: 15px 0 0 0; font-size: 18px;">DOMINATE THE FIELD</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #00D9FF;">Welcome to Force Sports! 🎉</h2>
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Thank you for joining Force Sports! Your account has been successfully created.</p>
                        <p>You're now part of an elite community of athletes and sports enthusiasts.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #00D9FF;">What's Next?</h3>
                            <ul style="line-height: 1.8;">
                                <li>Complete your profile</li>
                                <li>Browse upcoming tournaments</li>
                                <li>Join competitions and compete</li>
                                <li>Track your performance on the leaderboard</li>
                            </ul>
                        </div>
                        
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p style="margin-top: 30px;">Let's dominate the field together! 💪</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2024 Force Sports. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        // Don't throw error for welcome email - it's not critical
        return { success: false, error: error.message };
    }
};

// Test email configuration
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service is ready to send emails');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    testEmailConfig,
    sendVerificationEmail
};
