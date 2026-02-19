const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    issueType: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
