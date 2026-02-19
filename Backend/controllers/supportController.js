const sendEmail = require('../utils/sendEmail');
const Ticket = require('../models/Ticket');

exports.raiseTicket = async (req, res) => {
    try {
        const { companyName, contactPerson, email, issueType, description } = req.body;

        // Generate Ticket ID
        const ticketId = `#TK-${Math.floor(1000 + Math.random() * 9000)}`;

        // Save to DB
        const ticket = await Ticket.create({
            ticketId,
            companyName,
            contactPerson,
            email,
            issueType,
            description,
            status: 'Open'
        });

        // Prepare Email Content
        const message = `
      New Support Ticket Raised
      -------------------------
      Ticket ID: ${ticketId}
      
      Organization: ${companyName}
      Contact Person: ${contactPerson}
      Registered Email: ${email}
      
      Issue Category: ${issueType}
      
      Description:
      ${description}
      
      -------------------------
      Please resolve this within 24-48 hours.
    `;

        // Send Email to Support Team
        try {
            await sendEmail({
                email: 'reportsinsider@gmail.com',
                subject: `[Support] New Ticket ${ticketId} - ${issueType}`,
                message
            });
        } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Continue, as ticket is saved
        }

        res.status(200).json({
            success: true,
            message: 'Ticket raised successfully',
            ticketId
        });

    } catch (error) {
        console.error("Support Ticket Error:", error);
        res.status(500).json({ success: false, message: 'Server Error. Please try again later.' });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Get Tickets Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.status(200).json({ success: true, message: "Status updated", ticket });
    } catch (error) {
        console.error("Update Ticket Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
