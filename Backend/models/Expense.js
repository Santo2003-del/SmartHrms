const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true
        },
        title: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        date: { type: Date, default: Date.now },
        category: { type: String, default: 'General' },
        description: { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
