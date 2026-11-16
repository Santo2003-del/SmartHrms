const mongoose = require('mongoose');

const OfficeTimingSchema = new mongoose.Schema(
  {
    startTime: { type: String, default: "09:30" },
    endTime: { type: String, default: "18:30" },
    workingHours: { type: Number, default: 9 },
    timeZone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  { _id: false }
);

const InquirySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true },
    address: { type: String, required: false },
    password: { type: String, required: false },

    // New Fields
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    industryType: { type: String, default: '' },
    employeeCount: { type: String, default: '' },
    website: { type: String, default: '' },
    gstin: { type: String, default: '' },

    lat: { type: Number, required: false },
    lng: { type: Number, required: false },

    // Subscriptions
    plan: { type: String, required: false },
    message: { type: String, required: false },
    referenceId: { type: String, required: false, sparse: true },
    paymentRef: { type: String, required: false },
    paymentAmount: { type: Number, required: false },
    paymentDate: { type: Date, required: false },
    notes: { type: String, required: false },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },

    status: { type: String, enum: ['Pending Review', 'Pending', 'Approved', 'Payment Requested', 'Payment Under Verification', 'Active', 'Rejected', 'Renewal Requested', 'Expired', 'Suspended'], default: 'Pending Review', index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', InquirySchema);
