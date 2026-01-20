const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['PLAYER', 'ORGANIZER', 'OWNER'], required: true },

    // Player specific fields
    mobile: String,
    address: String,
    state: String,
    district: String,
    pincode: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    dob: String, // Date of Birth (DD/MM/YYYY or ISO)
    game: String, // e.g., Badminton
    gameType: String, // Single, Double, Team
    strength: String, // Beginner, Intermediate, Pro
    aadharNumber: String,
    aadharCard: String, // Path to file
    profileImage: String, // Path to file
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    emailVerified: { type: Boolean, default: false },
    emailVerificationOTP: String,
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    points: { type: Number, default: 0 }, // For Leaderboard
    sportProfiles: { type: Map, of: Object, default: {} }, // Persistent profiles for each sport (e.g., { 'Cricket': { role: 'Batsman', hand: 'Right' } })

    // Security fields
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        review: String,
        createdAt: { type: Date, default: Date.now }
    }],
    accessExpiryDate: { type: Date }, // For Organizers: When their access expires
    totalPaidOut: { type: Number, default: 0 },
    upiId: { type: String }, // Organizer's UPI ID for receiving payments

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
