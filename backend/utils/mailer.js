import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (options) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"FixMate" <${process.env.SMTP_USER}>`,
    ...options,
  };
  return transporter.sendMail(mailOptions);
};

export default { sendMail, transporter };
