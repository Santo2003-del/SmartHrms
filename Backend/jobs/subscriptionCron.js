const cron = require('node-cron');
const Company = require('../models/Company');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const startSubscriptionCron = () => {
  // Run every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running subscription expiration check job...');
    try {
      const today = new Date();
      
      const checkAndNotify = async (daysAhead) => {
        const targetDateStart = new Date(today);
        targetDateStart.setDate(targetDateStart.getDate() + daysAhead);
        targetDateStart.setHours(0, 0, 0, 0);
        
        const targetDateEnd = new Date(targetDateStart);
        targetDateEnd.setHours(23, 59, 59, 999);

        const expiringCompanies = await Company.find({
          subscriptionStatus: 'Active',
          subscriptionExpiry: {
            $gte: targetDateStart,
            $lte: targetDateEnd
          }
        });

        for (const company of expiringCompanies) {
          const owner = await User.findOne({ companyId: company._id, role: 'CompanyAdmin' });
          if (owner) {
            const msg = `
Dear ${owner.name},

This is a reminder that your GMV Smart HRMS subscription for ${company.name} will expire in ${daysAhead} day(s) on ${company.subscriptionExpiry.toDateString()}.

Please renew your subscription to ensure uninterrupted access to the platform. 
You can renew your subscription directly from your Company Dashboard.

Regards,
GMV Smart HRMS Team
            `;
            await sendEmail({
              email: owner.email,
              subject: `Action Required: Subscription Expiring in ${daysAhead} Days`,
              message: msg
            });
            console.log(`Sent ${daysAhead}-day expiry reminder to ${owner.email} (${company.name})`);
          }
        }
      };

      // Check for 7 days, 3 days, and 1 day
      await checkAndNotify(7);
      await checkAndNotify(3);
      await checkAndNotify(1);

    } catch (err) {
      console.error('Subscription cron job error:', err);
    }
  });
  console.log('Subscription expiration cron job scheduled.');
};

module.exports = startSubscriptionCron;
