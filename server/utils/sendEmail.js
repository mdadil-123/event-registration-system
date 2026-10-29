const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// 1. Account Signup Welcome Email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[EMAIL] Credentials not found in .env, skipping welcome email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"EventRegistration" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome to EventRegistration, ${userName || 'User'}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 25px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">Account Created Successfully! 🚀</h2>
          <p style="font-size: 1rem; color: #cbd5e1;">Hi <strong>${userName || 'User'}</strong>,</p>
          <p style="color: #94a3b8; line-height: 1.6;">
            EventRegistration platform par aapka account successfully create ho chuka hai.
          </p>
          <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 0; color: #f8fafc; font-size: 0.95rem;">
              Ab aap platform par explore karke kisi bhi tech summit ya workshop ke liye free ticket reserve kar sakte hain.
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 0.75rem; text-align: center; margin: 0;">
            EventRegistration Platform • Automated System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send welcome email:', error.message);
  }
};

// 2. Ticket Pass Confirmation Email
const sendTicketEmail = async (userEmail, userName, eventTitle, venue, date) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('[EMAIL] Credentials not found in .env, skipping ticket email.');
      return;
    }

    const transporter = createTransporter();
    const formattedDate = date ? new Date(date).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short'
    }) : 'TBA';

    const mailOptions = {
      from: `"EventRegistration" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Registration Confirmed: ${eventTitle} 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 25px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h2 style="color: #38bdf8; margin-top: 0;">Booking Confirmed! 🎉</h2>
          <p style="font-size: 1rem; color: #cbd5e1;">Hi <strong>${userName || 'Attendee'}</strong>,</p>
          <p style="color: #94a3b8; line-height: 1.6;">Aapka pass successfully reserve ho gaya hai:</p>
          
          <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
            <p style="margin: 8px 0;">📌 <strong style="color: #f8fafc;">Event:</strong> ${eventTitle}</p>
            <p style="margin: 8px 0;">📍 <strong style="color: #f8fafc;">Venue:</strong> ${venue || 'TBA'}</p>
            <p style="margin: 8px 0;">🗓️ <strong style="color: #f8fafc;">Date:</strong> ${formattedDate}</p>
          </div>

          <p style="color: #94a3b8; font-size: 0.85rem;">
            Dashboard ke <strong>My Registrations</strong> section se aap apna digital QR pass download ya print kar sakte hain.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Ticket pass email sent to ${userEmail}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send ticket email:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendTicketEmail
};