// config/db.js
const mongoose = require('mongoose');
const dns = require('dns');

// Use Google DNS to resolve Atlas SRV records (fixes ECONNREFUSED on some networks)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined in environment');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 (avoids IPv6 issues)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
