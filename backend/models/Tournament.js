const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gameType: { type: String, required: true },
    banner: { type: String }, // Path to banner image
    format: { type: String, enum: ['KNOCKOUT', 'ROUND_ROBIN'], default: 'KNOCKOUT' }, // Tournament Format
    date: { type: String, required: true },
    time: { type: String, required: true },
    endTime: { type: String }, // Tournament End Time
    registrationDeadline: { type: String }, // Registration Deadline (Date + Time)
    entryFee: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['PENDING', 'ONGOING', 'COMPLETED'], default: 'PENDING' },
    type: { type: String, enum: ['SINGLE', 'DOUBLE', 'TEAM'], default: 'SINGLE' },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: true }, // Venue Address

    players: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        mobile: String,
        game: String,
        strength: String,
        gameDetails: { type: Object }, // Specific details like { role: 'Wicket Keeper', batStyle: 'Right' }
        // For Teams/Doubles
        teamName: String,
        teammates: [String], // Array of names/emails of teammates

        paymentStatus: { type: String, default: 'PAID' }, // Mock payment 'PAID'
        transactionId: { type: String }, // User's payment reference
        paymentVPA: { type: String }, // Which UPI ID was paid to
        amount: { type: Number, default: 500 },
        checkInStatus: { type: Boolean, default: false }, // Added for Check-In Tracker
        joinedAt: { type: Date, default: Date.now }
    }],

    matches: [{
        player1: {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String
        },
        player2: {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String
        },
        score1: { type: Number, default: 0 },
        score2: { type: Number, default: 0 },
        status: { type: String, enum: ['UPCOMING', 'LIVE', 'FINISHED'], default: 'UPCOMING' },
        round: { type: Number, default: 1 },
        roundName: { type: String }, // e.g., "Quarter Final", "Semi Final", "Final"
        winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
