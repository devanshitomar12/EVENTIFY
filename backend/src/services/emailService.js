const { sendEmail } = require('../config/mailer');

/**
 * Modern HTML email wrapper with Eventify branding
 */
const emailWrapper = (content, previewText = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eventify</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px; }
    .content { padding: 32px 24px; color: #cbd5e1; line-height: 1.6; }
    .card { background: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #334155; }
    .ticket-badge { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
    .info-label { color: #94a3b8; }
    .info-value { color: #f8fafc; font-weight: 600; }
    .btn { display: inline-block; background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; text-align: center; }
    .footer { padding: 24px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #334155; background: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Eventify</h1>
      <p>Discover Experiences Worth Remembering</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Eventify Platform Inc. All rights reserved.<br>
      This is an automated operational notification.
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Booking Confirmation Email
 */
const sendBookingConfirmationEmail = async ({ user, event, booking }) => {
  const eventDateFormatted = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const ticketsHtml = booking.tickets
    .map(
      (t) => `
      <div class="info-row">
        <span class="info-label">${t.ticketType} (${t.quantity}x @ $${t.price})</span>
        <span class="info-value">$${(t.quantity * t.price).toFixed(2)}</span>
      </div>`
    )
    .join('');

  const html = emailWrapper(`
    <h2 style="color: #f8fafc; margin-top: 0;">🎉 You're Going to ${event.title}!</h2>
    <p>Hi ${user.name || booking.attendeeDetails.name},</p>
    <p>Your booking has been confirmed! Keep this email handy or present your digital ticket with QR code at the venue entrance.</p>
    
    <div class="card">
      <span class="ticket-badge">Booking ID: ${booking.bookingId}</span>
      <h3 style="color: #f8fafc; margin: 0 0 16px 0;">${event.title}</h3>
      
      <div class="info-row">
        <span class="info-label">📅 Date & Time</span>
        <span class="info-value">${eventDateFormatted} at ${event.startTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">📍 Venue</span>
        <span class="info-value">${event.venue}, ${event.city}</span>
      </div>
      <div class="info-row">
        <span class="info-label">🗺️ Address</span>
        <span class="info-value">${event.address}</span>
      </div>
      
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #334155;">
        <h4 style="color: #cbd5e1; margin: 0 0 8px 0; font-size: 14px;">Ticket Breakdown:</h4>
        ${ticketsHtml}
        <div class="info-row" style="border-bottom: none; font-size: 16px; margin-top: 8px;">
          <span class="info-label" style="color: #f8fafc;">Total Paid</span>
          <span class="info-value" style="color: #34d399; font-size: 18px;">$${booking.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      Please arrive 15 minutes before showtime. Check the Eventify app to download your high-resolution digital ticket and barcode anytime.
    </p>
  `);

  return await sendEmail({
    to: booking.attendeeDetails.email || user.email,
    subject: `Booking Confirmed: ${event.title} (${booking.bookingId})`,
    html
  });
};

/**
 * Send Booking Cancellation Email
 */
const sendCancellationEmail = async ({ user, event, booking }) => {
  const html = emailWrapper(`
    <h2 style="color: #f8fafc; margin-top: 0;">Booking Cancelled</h2>
    <p>Hi ${user.name || booking.attendeeDetails.name},</p>
    <p>We've processed the cancellation for your booking for <strong>${event.title}</strong>.</p>
    
    <div class="card" style="border-left: 4px solid #ef4444;">
      <div class="info-row">
        <span class="info-label">Booking ID</span>
        <span class="info-value">${booking.bookingId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Event</span>
        <span class="info-value">${event.title}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Cancelled Amount</span>
        <span class="info-value">$${booking.totalAmount.toFixed(2)}</span>
      </div>
      <div class="info-row" style="border-bottom: none;">
        <span class="info-label">Status</span>
        <span class="info-value" style="color: #ef4444;">Cancelled</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      The released tickets have been returned to the event inventory. If you did not request this cancellation, please contact our support team.
    </p>
  `);

  return await sendEmail({
    to: booking.attendeeDetails.email || user.email,
    subject: `Booking Cancelled: ${event.title} (${booking.bookingId})`,
    html
  });
};

/**
 * Send Password Reset Token Email
 */
const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  const html = emailWrapper(`
    <h2 style="color: #f8fafc; margin-top: 0;">Reset Your Password</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset for your Eventify account. Click the button below to set a new password. This link is valid for 10 minutes.</p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" class="btn" style="background: #6366f1;">Reset Password</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
    <p style="font-size: 11px; color: #64748b; word-break: break-all;">
      Or copy and paste this URL into your browser: <br>${resetUrl}
    </p>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Eventify Password Reset Request',
    html
  });
};

module.exports = {
  sendBookingConfirmationEmail,
  sendCancellationEmail,
  sendPasswordResetEmail
};
