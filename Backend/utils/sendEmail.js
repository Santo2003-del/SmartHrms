const dns = require('dns');
try {
    dns.setDefaultResultOrder('ipv4first');
} catch (e) { }

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('@gmail.com');
        const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
        const port = Number(process.env.SMTP_PORT) || 587;

        const transporter = nodemailer.createTransport({
            host: isGmail ? 'smtp.gmail.com' : process.env.SMTP_HOST,
            port: port,
            secure: port === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: pass,
            },
            tls: {
                rejectUnauthorized: false,
            },
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });

        const message = {
            from: `${process.env.FROM_NAME || 'SmartHRMS'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log('Email sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message || error);
        return null;
    }
};

module.exports = sendEmail;
