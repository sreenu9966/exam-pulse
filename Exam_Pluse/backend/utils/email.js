const nodemailer = require('nodemailer');

// 📧 Simple Email Utility for BITmCQ
// Administrators: To make this functional, update the .env with your SMTP credentials!
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"BITmCQ Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    // Even if it fails, we log it so admin knows it wasn't sent
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
