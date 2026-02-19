const mongoose = require('mongoose');
const dns = require('dns');
const Company = require('./models/Company');
require('dotenv').config();

// Fix DNS for Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) throw new Error("No MONGO_URI");
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err.message);
        process.exit(1);
    }
};

const listCompanies = async () => {
    await connectDB();
    try {
        const companies = await Company.find({}, 'name email status');
        console.log('\n--- COMPANIES ---');
        if (companies.length === 0) {
            console.log('No companies found.');
        } else {
            companies.forEach(c => {
                console.log(`ID: ${c._id} | Name: "${c.name}" | Email: ${c.email} | Status: ${c.status}`);
            });
        }
        console.log('------------------\n');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

listCompanies();
