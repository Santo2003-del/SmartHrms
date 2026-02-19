const mongoose = require('mongoose');
const dns = require('dns');
const Company = require('./models/Company');
const Inquiry = require('./models/Inquiry');
require('dotenv').config();

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

const listData = async () => {
    await connectDB();
    try {
        console.log('\n--- COMPANIES ---');
        const companies = await Company.find({}, 'name email status');
        if (companies.length === 0) console.log('No companies found.');
        else {
            companies.forEach(c => {
                console.log(`[COMPANY] ID: ${c._id} | Name: "${c.name}" | Email: ${c.email} | Status: ${c.status}`);
            });
        }

        console.log('\n--- INQUIRIES ---');
        const inquiries = await Inquiry.find({}, 'companyName email status');
        if (inquiries.length === 0) console.log('No inquiries found.');
        else {
            inquiries.forEach(i => {
                console.log(`[INQUIRY] ID: ${i._id} | Name: "${i.companyName}" | Email: ${i.email} | Status: ${i.status}`);
            });
        }
        console.log('------------------\n');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

listData();
