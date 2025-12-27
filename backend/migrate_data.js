const mongoose = require('mongoose');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
require('dotenv').config();

// Configuration
const LOCAL_URI = 'mongodb://localhost:27017/force-app';
const REMOTE_URI = process.env.REMOTE_MONGO_URI || process.env.MONGO_URI || 'YOUR_PRODUCTION_CONNECTION_STRING_HERE';

async function migrateData() {
    console.log('🚀 Starting Data Migration...');
    console.log('1. Connecting to LOCAL Database...');

    // 1. Fetch from Local
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local DB');

    const LocalUser = localConn.model('User', require('./models/User').schema);
    const LocalTournament = localConn.model('Tournament', require('./models/Tournament').schema);
    const LocalTransaction = localConn.model('Transaction', require('./models/Transaction').schema);
    const LocalNotification = localConn.model('Notification', require('./models/Notification').schema);

    const users = await LocalUser.find({});
    const tournaments = await LocalTournament.find({});
    const transactions = await LocalTransaction.find({});
    const notifications = await LocalNotification.find({});

    console.log(`📊 Found: ${users.length} Users, ${tournaments.length} Tournaments, ${transactions.length} Transactions`);

    await localConn.close();

    // 2. Connect to Remote
    if (REMOTE_URI === 'YOUR_PRODUCTION_CONNECTION_STRING_HERE') {
        console.error('❌ ERROR: You must update the REMOTE_URI in migrate_data.js or set REMOTE_MONGO_URI in .env');
        process.exit(1);
    }

    console.log('2. Connecting to REMOTE Database...');
    const remoteConn = await mongoose.createConnection(REMOTE_URI).asPromise();
    console.log('✅ Connected to Remote DB');

    const RemoteUser = remoteConn.model('User', require('./models/User').schema);
    const RemoteTournament = remoteConn.model('Tournament', require('./models/Tournament').schema);
    const RemoteTransaction = remoteConn.model('Transaction', require('./models/Transaction').schema);
    const RemoteNotification = remoteConn.model('Notification', require('./models/Notification').schema);

    // 3. Upsert Data (Insert if new, Update if exists)
    console.log('3. Migrating Users...');
    for (const doc of users) {
        await RemoteUser.findByIdAndUpdate(doc._id, doc.toObject(), { upsert: true, new: true });
    }

    console.log('4. Migrating Tournaments...');
    for (const doc of tournaments) {
        await RemoteTournament.findByIdAndUpdate(doc._id, doc.toObject(), { upsert: true, new: true });
    }

    console.log('5. Migrating Transactions...');
    for (const doc of transactions) {
        await RemoteTransaction.findByIdAndUpdate(doc._id, doc.toObject(), { upsert: true, new: true });
    }

    console.log('6. Migrating Notifications...');
    for (const doc of notifications) {
        await RemoteNotification.findByIdAndUpdate(doc._id, doc.toObject(), { upsert: true, new: true });
    }

    console.log('✅ Migration COMPLETE!');
    await remoteConn.close();
    process.exit(0);
}

migrateData().catch(err => {
    console.error('Migration Failed:', err);
    process.exit(1);
});
