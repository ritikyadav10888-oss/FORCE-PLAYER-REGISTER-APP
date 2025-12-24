const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },

    // Payment Method Details
    paymentMethod: { type: String, enum: ['UPI', 'BANK', 'CARD', 'WALLET', 'CASH'], default: 'WALLET' },
    transactionId: { type: String }, // External payment gateway transaction ID
    paymentDetails: {
        upiId: String,
        accountNumber: String,
        ifscCode: String,
        accountHolder: String,
        cardLast4: String,
        cardHolder: String,
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
