const mongoose = require('mongoose');

const AttendancePolicySchema = new mongoose.Schema(
  {
    requireGps: { type: Boolean, default: true },
    requireFace: { type: Boolean, default: true },

    allowedMethods: {
      type: [String],
      default: ['FACE_ONLY', 'MANUAL_HR'],
      enum: ['GPS_FACE', 'FACE_ONLY', 'MANUAL_PUNCH', 'QR_FACE', 'WIFI_FACE', 'IP_FACE', 'MANUAL_HR']
    },

    // optional future
    qrSecret: { type: String, default: '' },
    allowedWifiSSIDs: { type: [String], default: [] },
    allowedIpRanges: { type: [String], default: [] },
    requireDeviceBinding: { type: Boolean, default: false },

    // new attendance settings
    expectedWorkHours: { type: Number, default: 8 },
    minimumHalfDayHours: { type: Number, default: 4 },
    minimumFullDayHours: { type: Number, default: 8 }
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    logo: { type: String, default: "" },

    location: {
      address: { type: String, default: '' }
    },

    // office timing + timezone
    officeTiming: {
      startTime: { type: String, default: "09:30" },
      endTime: { type: String, default: "18:30" },
      workingHours: { type: Number, default: 9 },
      timeZone: { type: String, default: 'Asia/Kolkata' } // IANA
    },

    attendancePolicy: { type: AttendancePolicySchema, default: () => ({}) },

    maxHrAdmins: { type: Number, default: 1 },
    hrLimitRequest: { type: String, enum: ['None', 'Pending', 'Approved'], default: 'None' },

    status: { type: String, enum: ['Active', 'Inactive', 'Suspended', 'Expired'], default: 'Active', index: true },

    // Subscriptions
    subscriptionPlan: { type: String, default: 'Free Trial' }, // Free Trial, Quarterly Plan, Annual Plan
    subscriptionStatus: { type: String, enum: ['Active', 'Expired', 'Suspended'], default: 'Active' },
    subscriptionStart: { type: Date, default: Date.now },
    subscriptionExpiry: { type: Date },
    enabledFeatures: { type: [String], default: [] },
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'None'], default: 'None' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
