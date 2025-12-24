// Quick Email Service Configuration Helper
// Run this to verify your email setup

require('dotenv').config();
const { testEmailConfig, sendPasswordResetEmail } = require('./services/emailService');

const testEmailService = async () => {
    console.log('\n📧 Force App - Email Service Configuration Test\n');
    console.log('='.repeat(60));

    // Check environment variables
    console.log('\n1️⃣  Checking Environment Variables...');
    console.log('-'.repeat(60));

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || emailUser === 'your-email@gmail.com') {
        console.log('❌ EMAIL_USER not configured');
        console.log('   Please update EMAIL_USER in backend/.env');
        console.log('   Example: EMAIL_USER=forceapp@gmail.com\n');
        return;
    } else {
        console.log(`✅ EMAIL_USER: ${emailUser}`);
    }

    if (!emailPassword || emailPassword === 'your-app-password-here') {
        console.log('❌ EMAIL_PASSWORD not configured');
        console.log('   Please update EMAIL_PASSWORD in backend/.env');
        console.log('   Get App Password from: https://myaccount.google.com/apppasswords\n');
        return;
    } else {
        console.log(`✅ EMAIL_PASSWORD: ${'*'.repeat(emailPassword.length)} (hidden)`);
    }

    // Test email configuration
    console.log('\n2️⃣  Testing Email Service Connection...');
    console.log('-'.repeat(60));

    const isConfigValid = await testEmailConfig();

    if (!isConfigValid) {
        console.log('\n❌ Email service configuration failed!');
        console.log('\nCommon issues:');
        console.log('1. Make sure 2-Step Verification is enabled on your Gmail account');
        console.log('2. Use App Password, not your regular Gmail password');
        console.log('3. Remove spaces from the App Password');
        console.log('4. Check https://myaccount.google.com/apppasswords\n');
        return;
    }

    // Offer to send test email
    console.log('\n3️⃣  Send Test Email?');
    console.log('-'.repeat(60));
    console.log('Would you like to send a test password reset email?');
    console.log('This will send an email to:', emailUser);
    console.log('\nTo send test email, run:');
    console.log(`node -e "require('./services/emailService').sendPasswordResetEmail('${emailUser}', '1234', 'Test User').then(() => console.log('✅ Test email sent!')).catch(console.error)"`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Email Service Configuration Complete!');
    console.log('='.repeat(60));
    console.log('\nYour email service is ready to use.');
    console.log('Users can now reset their passwords via email.\n');

    console.log('📝 Next Steps:');
    console.log('1. Test the forgot password flow in your app');
    console.log('2. Check that emails arrive in inbox (not spam)');
    console.log('3. Verify OTP codes work correctly\n');
};

// Run the test
testEmailService().catch(error => {
    console.error('\n❌ Error:', error.message);
    console.log('\nPlease check your .env configuration and try again.\n');
});
