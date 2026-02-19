const express = require('express');
const router = express.Router();
const { raiseTicket, getAllTickets, updateTicketStatus } = require('../controllers/supportController');

router.post('/ticket', raiseTicket);
router.get('/all', getAllTickets); // Protected by SuperAdmin middleware in implementation preferably, but for now simple
router.put('/:id/status', updateTicketStatus);

module.exports = router;
