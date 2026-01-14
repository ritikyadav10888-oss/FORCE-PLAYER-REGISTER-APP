const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'force_super_secret_key';
const BCRYPT_SALT_ROUNDS = 12; // Increased from 10 for better security

const { verifyToken } = require('./middleware/auth');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const { sendPasswordResetEmail, sendWelcomeEmail, testEmailConfig, sendVerificationEmail } = require('./services/emailService');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
console.log('✅ Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...' : 'NOT FOUND');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Adds security headers with cross-origin support
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
// app.use(mongoSanitize()); // Prevents NoSQL injection - Temporarily disabled due to conflict
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Rate Limiter for Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Password Strength Validator
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
    }

    return { valid: true };
};

// --- File Upload Config ---
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/force-app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('Register Body:', req.body); // Keep debug
        const userData = req.body;

        // Validate password strength
        const passwordCheck = validatePassword(userData.password);
        if (!passwordCheck.valid) {
            return res.status(400).json({ error: passwordCheck.message });
        }

        // Handle Base64 Upload
        if (userData.aadharCardBase64) {
            const matches = userData.aadharCardBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            let buffer;

            if (matches && matches.length === 3) {
                // It has the data URI prefix
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                // Raw base64
                buffer = Buffer.from(userData.aadharCardBase64, 'base64');
            }

            const filename = 'aadhar-' + Date.now() + '.jpg';
            const filepath = 'uploads/' + filename;

            fs.writeFileSync(filepath, buffer);
            userData.aadharCard = filepath;
            delete userData.aadharCardBase64; // Don't save base64 to DB
        }

        if (userData.email) userData.email = userData.email.toLowerCase();

        // Check if email exists
        const existing = await User.findOne({ email: userData.email });
        if (existing) return res.status(400).json({ error: 'User already exists with this email' });

        // Calculate Access Expiry for Organizers
        if (userData.role === 'ORGANIZER' && userData.accessDurationDays) {
            const days = parseInt(userData.accessDurationDays);
            if (!isNaN(days) && days > 0) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + days);
                userData.accessExpiryDate = expiryDate;
            }
        }
        delete userData.accessDurationDays; // Clean up

        // Hash password with stronger salt rounds
        userData.password = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);

        // Auto-verify email set to FALSE now to test verification flow
        userData.emailVerified = false;
        userData.emailVerificationOTP = undefined;

        const user = new User(userData);
        await user.save();

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        const userObj = user.toObject();
        delete userObj.password;

        // Send Welcome Email
        try {
            await sendWelcomeEmail(user.email, user.name);
            console.log(`✅ Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        res.status(201).json({ ...userObj, token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.emailVerified) return res.status(400).json({ error: "Email already verified. Please login." });

        if (user.emailVerificationOTP !== otp) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        // Verify Success
        user.emailVerified = true;
        user.emailVerificationOTP = undefined;
        await user.save();

        // Send Welcome Email NOW (after verification)
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (e) {
            console.error("Welcome email failed", e);
        }

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ ...userObj, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.emailVerified) return res.status(400).json({ error: "Email already verified" });

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.emailVerificationOTP = otp;
        await user.save();

        await sendVerificationEmail(user.email, otp, user.name);
        res.json({ message: "Verification code sent" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
        let { email, password } = req.body;
        if (email) email = email.toLowerCase();

        const user = await User.findOne({ email });

        // Prevent timing attacks - always hash even if user doesn't exist
        const passwordToCompare = user ? user.password : await bcrypt.hash('dummy_password', BCRYPT_SALT_ROUNDS);
        const isMatch = await bcrypt.compare(password, passwordToCompare);

        if (!user || !isMatch) {
            // ... (existing lockout logic)
            if (user) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                if (user.loginAttempts >= 5) {
                    user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
                    await user.save();
                    return res.status(423).json({ error: 'Account locked due to multiple failed login attempts.' });
                }
                await user.save();
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ... (rest of logic)

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
            return res.status(423).json({
                error: `Account is locked. Please try again in ${minutesLeft} minute(s).`
            });
        }

        // Check if account is blocked by admin
        if (user.isBlocked) {
            return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
        }

        // Successful login - reset attempts and unlock
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.loginAttempts;
        delete userObj.lockUntil;
        res.json({ ...userObj, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login. Please try again.' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        let { email } = req.body;
        if (email) email = email.toLowerCase();

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'No account found with this email address' });

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send OTP via email
        try {
            await sendPasswordResetEmail(email, otp, user.name);
            console.log(`✅ Password reset email sent to ${email}`);
            res.json({
                message: 'Password reset OTP has been sent to your email. Please check your inbox.',
                email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Partially hide email for security
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Fallback: Show OTP in console for development
            console.log(`[OTP FALLBACK] Reset OTP for ${email}: ${otp}`);
            res.json({
                message: 'Email service temporarily unavailable. OTP has been logged to server console.',
                otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only show in development
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An error occurred. Please try again later.' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        if (email) email = email.toLowerCase();

        // Validate new password strength
        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.valid) {
            return res.status(400).json({ error: passwordCheck.message });
        }

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Invalid or expired OTP' });

        // Hash with stronger salt rounds
        user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        // Reset login attempts on password reset
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Payout Route ---
app.post('/api/users/:id/payout', async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.totalPaidOut = (user.totalPaidOut || 0) + Number(amount);
        await user.save();

        const transaction = new Transaction({
            userId: user._id,
            type: 'CREDIT', // or PAYOUT, but CREDIT to organizer means they got money. Or simpler 'PAYOUT' string if valid enum? 
            // Transaction model not fully visible but based on usage 'CREDIT' is fine or text. Let's send text description clearly.
            amount: Number(amount),
            description: 'Platform Payout',
            status: 'SUCCESS'
        });
        await transaction.save();

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Moderation Routes (Owner Only) ---
app.put('/api/users/:id/verify', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/users/:id/block', async (req, res) => {
    try {
        const { blocked } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: blocked }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/users/:id/update-access', async (req, res) => {
    try {
        const { durationDays } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (durationDays) {
            const days = parseInt(durationDays);
            if (!isNaN(days) && days > 0) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + days);
                user.accessExpiryDate = expiryDate;
            } else {
                // specific handling if passed something invalid but not empty? 
                // For now, if invalid, treat as no change or error? 
                // The frontend passes '' for unlimited.
            }
        } else {
            user.accessExpiryDate = null; // Remove limit
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- User Routes ---
app.get('/api/organizers', async (req, res) => {
    try {
        const organizers = await User.find({ role: 'ORGANIZER' }).sort({ createdAt: -1 });
        res.json(organizers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/players', async (req, res) => {
    try {
        const players = await User.find({ role: 'PLAYER' }).sort({ createdAt: -1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
    try {
        // IDOR Protection: Only allow user to update their own profile (or Owner)
        if (req.user.id !== req.params.id && req.user.role !== 'OWNER') {
             return res.status(403).json({ error: 'Access denied. You can only update your own account.' });
        }

        const userData = req.body;

        // Handle Base64 Profile Image
        if (userData.profileImageBase64) {
            const matches = userData.profileImageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            let buffer;

            if (matches && matches.length === 3) {
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                buffer = Buffer.from(userData.profileImageBase64, 'base64');
            }

            const filename = 'profile-' + req.params.id + '-' + Date.now() + '.jpg';
            const filepath = 'uploads/' + filename;

            fs.writeFileSync(filepath, buffer);
            userData.profileImage = filepath;
            delete userData.profileImageBase64;
        }

        const user = await User.findByIdAndUpdate(req.params.id, userData, { new: true });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- Config Route ---
app.get('/api/config', (req, res) => {
    res.json({
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
    });
});

// --- Tournament Routes ---
app.get('/api/tournaments', async (req, res) => {
    try {
        const { role } = req.query; // Check if requester is OWNER
        let tournaments = await Tournament.find()
            .populate('organizerId', 'name email accessExpiryDate upiId mobile')
            .populate('players.user')
            .sort({ createdAt: -1 });

        // If not OWNER or ORGANIZER, hide tournaments from expired organizers and old completed ones
        // Organizers need to see their history
        if (role !== 'OWNER' && role !== 'ORGANIZER') {
            tournaments = tournaments.filter(t => {
                const org = t.organizerId;
                if (!org) return true; // Keep if no org (legacy)
                if (org.accessExpiryDate && new Date() > new Date(org.accessExpiryDate)) {
                    return false; // Expired Organizer
                }

                // Filter out CLOSED/COMPLETED tournaments older than 1 day
                if (t.status === 'COMPLETED') {
                    const tDate = new Date(t.date);
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                    // If start date was more than 1 day ago AND it is completed, hide it.
                    // This assumes 'date' is effectively the event date.
                    if (!isNaN(tDate) && tDate < oneDayAgo) {
                        return false;
                    }
                }

                return true;
            });
        }

        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tournaments', verifyToken, async (req, res) => {
    try {
        // Role Protection: Only Organizers or Owners can create tournaments
        if (req.user.role !== 'ORGANIZER' && req.user.role !== 'OWNER') {
            return res.status(403).json({ error: 'Access denied. Only Organizers can create tournaments.' });
        }

        console.log("Create Tournament Body:", JSON.stringify(req.body, (k, v) => k === 'bannerBase64' ? '...binary...' : v)); // Log body safely
        const { organizerId } = req.body;
        const organizer = await User.findById(organizerId);

        if (organizer && organizer.role === 'ORGANIZER' && organizer.accessExpiryDate) {
            if (new Date() > new Date(organizer.accessExpiryDate)) {
                return res.status(403).json({ error: "Your access has expired. Contact support to renew." });
            }
        }

        // Handle Base64 Banner
        if (req.body.bannerBase64) {
            const matches = req.body.bannerBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            let buffer;
            if (matches && matches.length === 3) {
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                buffer = Buffer.from(req.body.bannerBase64, 'base64');
            }
            const filename = 'banner-' + Date.now() + '.jpg';
            const filepath = 'uploads/' + filename;
            fs.writeFileSync(filepath, buffer);
            req.body.banner = filepath;
            delete req.body.bannerBase64;
        }

        const tournament = new Tournament(req.body);
        await tournament.save();
        res.status(201).json(tournament);
    } catch (error) {
        console.error("Create Tournament Error:", error); // Log Error
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/tournaments/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) return res.status(404).json({ error: "Tournament not found" });

        // Authorization: Only the creator (organizer) or Owner can update
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'OWNER') {
            return res.status(403).json({ error: 'Access denied. You are not the organizer of this tournament.' });
        }

        // Generate matches logic when status moves to ONGOING
        if (status === 'ONGOING' && tournament.status === 'PENDING' && (!tournament.matches || tournament.matches.length === 0)) {
            // Filter only Check-In Players
            const playersList = tournament.players.filter(p => p.checkInStatus);

            if (playersList.length < 2) {
                return res.status(400).json({ error: "At least 2 CHECKED-IN players are required to start the tournament." });
            }

            // Use the match generator utility
            const { generateMatches } = require('./utils/matchGenerator');
            try {
                const matches = generateMatches(playersList, tournament.format || 'KNOCKOUT');
                req.body.matches = matches;
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
        }

        const updatedTournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTournament);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/tournaments/:id', verifyToken, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ error: "Tournament not found" });

        // Authorization: Only the creator (organizer) or Owner can delete
        if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'OWNER') {
            return res.status(403).json({ error: 'Access denied. You are not the organizer of this tournament.' });
        }

        if (tournament.players.length > 0) {
            return res.status(400).json({ error: "Cannot delete tournament with enrolled players. Please cancel or remove players first." });
        }

        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tournaments/:id/matches/:matchIndex', async (req, res) => {
    try {
        const { score1, score2, status, winner } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament.matches[req.params.matchIndex]) {
            return res.status(404).json({ error: "Match not found" });
        }

        const match = tournament.matches[req.params.matchIndex];
        const oldWinner = match.winner;

        if (score1 !== undefined) match.score1 = score1;
        if (score2 !== undefined) match.score2 = score2;
        if (status) match.status = status;
        if (winner) match.winner = winner;

        // Reward points (10pts per match win)
        if (winner && winner !== oldWinner?.toString()) {
            await User.findByIdAndUpdate(winner, { $inc: { points: 10 } });
        }

        await tournament.save();
        res.json(tournament);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/tournaments/:id/join', async (req, res) => {
    try {
        const { userId, transactionId, ...playerDetails } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        const user = await User.findById(userId);

        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check Registration Deadline
        if (tournament.registrationDeadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(tournament.registrationDeadline);
            if (deadlineDate < today) {
                return res.status(400).json({ error: "Registration deadline has passed" });
            }
        }

        const alreadyJoined = tournament.players.some(p => p.user.toString() === userId);
        if (alreadyJoined) return res.status(400).json({ error: 'Already joined' });



        const entryFee = tournament.entryFee || 0;

        tournament.players.push({
            user: userId,
            ...playerDetails,
            amount: entryFee,
            paymentStatus: transactionId ? 'PAID' : 'PENDING',
            transactionId,
            paymentVPA: 'UPI'
        });
        await tournament.save();

        res.json({ tournament });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/tournaments/:id/leave', async (req, res) => {
    try {
        const { userId } = req.body;
        const tournament = await Tournament.findById(req.params.id);
        const user = await User.findById(userId);

        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
        if (tournament.status !== 'PENDING') return res.status(400).json({ error: 'Cannot leave ongoing/completed tournament' });

        const playerIndex = tournament.players.findIndex(p => p.user.toString() === userId);
        if (playerIndex === -1) return res.status(400).json({ error: 'Not joined to this tournament' });

        // Remove player
        tournament.players.splice(playerIndex, 1);
        await tournament.save();

        res.json({ tournament });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/organizers/:id/earnings', async (req, res) => {
    try {
        const tournaments = await Tournament.find({ organizerId: req.params.id });
        let totalEarnings = 0;
        const history = tournaments.map(t => {
            const revenue = t.players.reduce((sum, p) => sum + (p.amount || 0), 0);
            totalEarnings += revenue;
            return {
                tournamentName: t.name,
                revenue,
                playersCount: t.players.length,
                date: t.createdAt
            };
        });
        res.json({ totalEarnings, history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Leaderboard ---
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topPlayers = await User.find({ role: 'PLAYER' })
            .select('name points profileImage game')
            .sort({ points: -1 })
            .limit(10);
        res.json(topPlayers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Ratings ---
app.post('/api/users/:id/rate', async (req, res) => {
    try {
        const { rating, review, userId } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.ratings.push({ user: userId, rating, review });
        await user.save();
        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




// --- New Business Features ---

// Check-In
app.post('/api/tournaments/:id/checkin', async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Use findOneAndUpdate to avoid triggering full validation on legacy docs (missing address etc)
        const tournament = await Tournament.findOneAndUpdate(
            { "_id": req.params.id, "players.user": userId },
            {
                "$set": { "players.$.checkInStatus": status }
            },
            { new: true } // Return updated doc
        )
            .populate('organizerId', 'name email mobile')
            .populate('players.user');

        if (!tournament) {
            return res.status(404).json({ error: "Tournament or player not found" });
        }

        res.json(tournament);
    } catch (e) {
        console.error("Check-in Error:", e);
        res.status(400).json({ error: e.message });
    }
});

// Broadcast
// Broadcast



app.post('/api/tournaments/:id/announce', async (req, res) => {
    try {
        const { message } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        const notifications = tournament.players.map(p => ({
            userId: p.user,
            message: `[${tournament.name}] ${message}`,
            type: 'INFO'
        }));

        await Notification.insertMany(notifications);
        res.json({ success: true, count: notifications.length });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get Notifications
app.get('/api/users/:id/notifications', async (req, res) => {
    try {
        const notes = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// --- Payment Routes ---

app.post('/api/payments/create-tournament-order', async (req, res) => {
    try {
        const { tournamentId, userId } = req.body;
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) return res.status(404).json({ error: "Tournament not found" });

        // Check Registration Deadline
        if (tournament.registrationDeadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(tournament.registrationDeadline);
            if (deadlineDate < today) {
                return res.status(400).json({ error: "Registration deadline has passed" });
            }
        }

        // Check if user already joined
        const existingPlayer = tournament.players.find(p => p.user.toString() === userId);
        if (existingPlayer) {
            return res.status(400).json({ error: "User already registered for this tournament" });
        }

        const options = {
            amount: (tournament.entryFee || 0) * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                tournamentId: tournamentId,
                userId: userId
            }
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Payment Order Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments/verify-and-join', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            tournamentId,
            userId,
            playerDetails
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {

            // 1. Add to Tournament (Atomic using findOneAndUpdate)
            // Ensure we don't double add if network retries
            const tournament = await Tournament.findOneAndUpdate(
                { _id: tournamentId, "players.user": { $ne: userId } },
                {
                    $addToSet: {
                        players: {
                            user: userId,
                            ...playerDetails,
                            paymentStatus: 'PAID',
                            transactionId: razorpay_payment_id,
                            paymentVPA: 'Razorpay',
                            amount: playerDetails.amount || 0,
                            checkInStatus: false,
                            joinedAt: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!tournament) {
                // If tournament is null, either it doesn't exist OR user is already in it
                // We should check to be polite, but for now assuming it's a "Duplicate or Not Found"
                const check = await Tournament.findById(tournamentId);
                if (check && check.players.some(p => p.user.toString() === userId)) {
                    return res.json({ success: true, message: "Use already joined (idempotent success)", tournament: check });
                }
                return res.status(404).json({ error: "Tournament not found or join failed" });
            }

            // 2. Persist Game Details to User Profile for future use
            if (playerDetails.gameDetails && tournament.gameType) {
                const sportKey = tournament.gameType; // e.g., "Cricket"
                const updateKey = `sportProfiles.${sportKey}`;
                await User.findByIdAndUpdate(userId, {
                    $set: { [updateKey]: playerDetails.gameDetails }
                });
            }

            res.json({ success: true, message: "Payment verified and joined successfully", tournament });

        } else {
            res.status(400).json({ error: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.1.173:${PORT}`);
});
