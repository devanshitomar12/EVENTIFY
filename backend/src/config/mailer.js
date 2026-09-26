const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const initMailer = async () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    logger.info(`Nodemailer configured for SMTP: ${process.env.SMTP_HOST}`);
  } else {
    // Generate Ethereal test account for dev
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      logger.info(`Nodemailer using Ethereal development mailbox: ${testAccount.user}`);
    } catch (err) {
      logger.warn('Could not initialize Ethereal mail account, email sending will simulate output.');
      transporter = {
        sendMail: async (mailOptions) => {
          logger.info(`[Email Simulation] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
          return { messageId: 'simulated-id' };
        }
      };
    }
  }
};

const sendEmail = async (options) => {
  if (!transporter) {
    await initMailer();
  }

  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Eventify Team" <no-reply@eventify.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}. MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email preview available at: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${options.to}:`, error.message);
    // Don't throw so user flows like bookings don't fail if SMTP server is down
    return null;
  }
};

module.exports = {
  initMailer,
  sendEmail
};
