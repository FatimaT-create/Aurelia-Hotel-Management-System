const nodemailer = require("nodemailer");

// Mirrors client/src/utils/currency.js so emails match the site's formatting.
function formatMoney(amount, currency = "PKR") {
  const n = Number(amount || 0).toLocaleString("en-PK");
  return currency === "PKR" ? `Rs ${n}` : `${currency} ${n}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Lazily built so a missing .env doesn't crash the app on boot —
// it just falls back to "dev mode" logging until credentials are set.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log("\n[email:dev-mode] EMAIL_HOST/EMAIL_USER/EMAIL_PASS not set in server/.env — email not actually sent.");
    console.log(`[email:dev-mode] To: ${to}`);
    console.log(`[email:dev-mode] Subject: ${subject}\n`);
    return { sent: false, reason: "Email is not configured on the server (.env)" };
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `"Aurelia Grand Hotel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed:", err.message);
    return { sent: false, reason: err.message };
  }
}

const wrapper = (title, bodyHtml) => `
  <div style="font-family:Georgia,serif;background:#0f0f10;padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#17161a;border:1px solid #2a2820;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(90deg,#caa653,#f0d78c);padding:20px 28px;">
        <span style="font-size:20px;letter-spacing:3px;color:#17161a;font-weight:bold;">AURELIA</span>
      </div>
      <div style="padding:28px;color:#e8e6df;">
        <h2 style="margin-top:0;color:#f0d78c;font-weight:normal;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #2a2820;color:#8a877d;font-size:12px;">
        Aurelia Grand Hotel — this is an automated message, please do not reply.
      </div>
    </div>
  </div>
`;

async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: "Welcome to Aurelia Grand Hotel",
    html: wrapper(
      `Welcome, ${user.name}!`,
      `<p>Your Aurelia account has been created. Your loyalty ID is <strong>${user.loyaltyId}</strong> —
       you're starting in the <strong>${user.loyaltyTier}</strong> tier.</p>
       <p>Browse our rooms and make your first reservation any time.</p>`
    ),
  });
}

async function sendBookingConfirmation(user, booking) {
  return sendMail({
    to: user.email,
    subject: `Booking Confirmed — ${booking.bookingCode}`,
    html: wrapper(
      "Booking Confirmed",
      `<p>Hi ${user.name}, your reservation is confirmed.</p>
       <table style="width:100%;border-collapse:collapse;margin-top:12px;">
         <tr><td style="padding:6px 0;color:#8a877d;">Confirmation #</td><td style="text-align:right;">${booking.bookingCode}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Room</td><td style="text-align:right;">${booking.room?.name} (#${booking.room?.roomNumber})</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Check-in</td><td style="text-align:right;">${formatDate(booking.checkIn)}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Check-out</td><td style="text-align:right;">${formatDate(booking.checkOut)}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Nights</td><td style="text-align:right;">${booking.nights}</td></tr>
         <tr><td style="padding:10px 0 0;color:#f0d78c;font-weight:bold;">Total</td><td style="text-align:right;padding-top:10px;color:#f0d78c;font-weight:bold;">${formatMoney(booking.totalAmount)}</td></tr>
       </table>`
    ),
  });
}

async function sendCancellationEmail(user, booking) {
  return sendMail({
    to: user.email,
    subject: `Booking Cancelled — ${booking.bookingCode}`,
    html: wrapper(
      "Booking Cancelled",
      `<p>Hi ${user.name}, your reservation <strong>${booking.bookingCode}</strong> has been cancelled as requested.</p>
       <p>We hope to welcome you at Aurelia another time.</p>`
    ),
  });
}

async function sendInvoiceEmail(user, booking, taxRatePercent = 0) {
  const tax = Math.round((booking.totalAmount * taxRatePercent) / 100);
  const grandTotal = booking.totalAmount + tax;
  return sendMail({
    to: user.email,
    subject: `Invoice — ${booking.bookingCode}`,
    html: wrapper(
      "Invoice",
      `<table style="width:100%;border-collapse:collapse;">
         <tr><td style="padding:6px 0;color:#8a877d;">Room</td><td style="text-align:right;">${booking.room?.name}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Rate / night</td><td style="text-align:right;">${formatMoney(booking.pricePerNight)}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Nights</td><td style="text-align:right;">${booking.nights}</td></tr>
         <tr><td style="padding:6px 0;color:#8a877d;">Subtotal</td><td style="text-align:right;">${formatMoney(booking.totalAmount)}</td></tr>
         ${taxRatePercent ? `<tr><td style="padding:6px 0;color:#8a877d;">Tax (${taxRatePercent}%)</td><td style="text-align:right;">${formatMoney(tax)}</td></tr>` : ""}
         <tr><td style="padding:10px 0 0;color:#f0d78c;font-weight:bold;">Total</td><td style="text-align:right;padding-top:10px;color:#f0d78c;font-weight:bold;">${formatMoney(grandTotal)}</td></tr>
       </table>`
    ),
  });
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendCancellationEmail,
  sendInvoiceEmail,
};
