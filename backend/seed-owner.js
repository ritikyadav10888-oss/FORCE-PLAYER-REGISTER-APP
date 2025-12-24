const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedOwner = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/force-app');
        console.log('Connected to MongoDB');

        const hashedPassword = await bcrypt.hash("admin1", 10);
        const owner = new User({
            name: "Anand",
            email: "anand123@gmail.com",
            password: hashedPassword,
            role: "OWNER"
        });
        
        // Check if exists first to avoid duplicate key error
        const exists = await User.findOne({ email: "anand123@gmail.com", role: "OWNER" });
        if (exists) {
            exists.password = hashedPassword;
            await exists.save();
            console.log('Owner password updated.');
        } else {
            await owner.save();
            console.log('Owner user created successfully: anand123@gmail.com');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating owner:', error);
        process.exit(1);
    }
};

seedOwner();
