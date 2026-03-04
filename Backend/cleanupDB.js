/**
 * cleanupDB.js — Wipe all operational data before redeployment.
 *
 * Usage:  node cleanupDB.js
 *
 * CAUTION: This permanently deletes ALL data except the SuperAdmin user.
 */

const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Use Google DNS (same as config/db.js)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

// Import all models
const Company = require("./models/Company");
const User = require("./models/User");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");
const Task = require("./models/Task");
const Ticket = require("./models/Ticket");
const Holiday = require("./models/Holiday");
const Expense = require("./models/Expense");
const Inquiry = require("./models/Inquiry");
const Job = require("./models/Job");
const Application = require("./models/Application");
const Interview = require("./models/Interview");
const RecruitmentJob = require("./models/RecruitmentJob");
const OnboardingTemplate = require("./models/OnboardingTemplate");
const OnboardingAssignment = require("./models/OnboardingAssignment");
const SystemSettings = require("./models/SystemSettings");

// Collections to wipe completely (all documents)
const WIPE_ALL = [
    { name: "Company", model: Company },
    { name: "Attendance", model: Attendance },
    { name: "Leave", model: Leave },
    { name: "Task", model: Task },
    { name: "Ticket", model: Ticket },
    { name: "Holiday", model: Holiday },
    { name: "Expense", model: Expense },
    { name: "Inquiry", model: Inquiry },
    { name: "Job", model: Job },
    { name: "Application", model: Application },
    { name: "Interview", model: Interview },
    { name: "RecruitmentJob", model: RecruitmentJob },
    { name: "OnboardingTemplate", model: OnboardingTemplate },
    { name: "OnboardingAssignment", model: OnboardingAssignment },
    { name: "SystemSettings", model: SystemSettings },
];

async function cleanup() {
    console.log("═══════════════════════════════════════════════");
    console.log("  GMVSmartHrms — Database Cleanup");
    console.log("═══════════════════════════════════════════════\n");

    // Connect
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log("✅ Connected to MongoDB\n");

    // 1. Wipe all operational collections
    for (const { name, model } of WIPE_ALL) {
        const result = await model.deleteMany({});
        console.log(`🗑️  ${name}: deleted ${result.deletedCount} documents`);
    }

    // 2. Delete all users EXCEPT SuperAdmin
    const userResult = await User.deleteMany({ role: { $ne: "SuperAdmin" } });
    console.log(`🗑️  User (non-SuperAdmin): deleted ${userResult.deletedCount} documents`);

    // 3. Verify SuperAdmin is still there
    const superAdmin = await User.findOne({ role: "SuperAdmin" });
    if (superAdmin) {
        console.log(`\n✅ SuperAdmin preserved: ${superAdmin.email}`);
    } else {
        console.log("\n⚠️  WARNING: No SuperAdmin found in the database!");
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("  Cleanup complete. Database is ready for fresh data.");
    console.log("═══════════════════════════════════════════════");

    await mongoose.disconnect();
    process.exit(0);
}

cleanup().catch((err) => {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
});
