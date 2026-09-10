import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

// -----------------------------------------------------
// EMAIL SENDING
// -----------------------------------------------------
// Render's free tier blocks outbound SMTP (ports 25/465/587),
// so when EMAIL_API_KEY is set we send via an HTTPS email API
// (Resend or Brevo) which is not blocked. Without an API key
// we fall back to Gmail SMTP (works for local development).
// -----------------------------------------------------

const SMTP_FROM =
  process.env.SMTP_FROM || `"FixMate" <${process.env.SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

const apiConfig = {
  resend: {
    endpoint: "https://api.resend.com/emails",
    buildHeaders: () => ({
      Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      "Content-Type": "application/json",
    }),
    buildBody: (options, from) => ({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || options.text || "",
    }),
  },
  brevo: {
    endpoint: "https://api.brevo.com/v3/smtp/email",
    buildHeaders: () => ({
      "api-key": process.env.EMAIL_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    }),
    buildBody: (options, from) => ({
      sender: parseFrom(from),
      to: (Array.isArray(options.to) ? options.to : [options.to]).map((t) => ({
        email: t,
      })),
      subject: options.subject,
      htmlContent: options.html || options.text || "",
    }),
  },
};

function parseFrom(from) {
  const m = String(from).match(/^(.*?)\s*<([^>]+)>$/);
  if (m) {
    return {
      name: m[1].trim().replace(/^"|"$/g, ""),
      email: m[2].trim(),
    };
  }
  return { email: String(from).trim() };
}

const isApiMode = () => Boolean(process.env.EMAIL_API_KEY);

const from = () =>
  process.env.EMAIL_API_FROM || process.env.SMTP_FROM || SMTP_FROM;

// Verify the configured provider works (called once at startup)
// In API mode we skip the network check: Resend "sending-only" keys
// (the recommended type) are intentionally restricted from listing
// keys via GET, but still send fine. sendMail() failures are logged.
const verify = async () => {
  if (isApiMode()) {
    return true;
  }
  return transporter.verify();
};

const sendMail = async (options) => {
  if (isApiMode()) {
    const cfg = apiConfig[provider];
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: cfg.buildHeaders(),
      body: JSON.stringify(cfg.buildBody(options, from())),
    });
    if (res.status < 200 || res.status >= 300) {
      let detail = "";
      try {
        detail = await res.text();
      } catch (_) {}
      throw new Error(`Email API error ${res.status}: ${detail}`);
    }
    return {
      messageId: null,
      accepted: Array.isArray(options.to) ? options.to : [options.to],
    };
  }

  const mailOptions = { from: from(), ...options };
  return transporter.sendMail(mailOptions);
};

export default { sendMail, verify, transporter };
