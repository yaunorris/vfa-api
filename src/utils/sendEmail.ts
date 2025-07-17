import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  EMAIL_TO, // Optional fallback recipient
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
  throw new Error('Missing SMTP configuration in .env file');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT, 10),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendResetEmail = async (to: string, resetLink: string) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'VFA Kumon - Password Reset',
    html: `
      <p>Hello,</p>
      <p>You requested a password reset. Tap the link below on your mobile device to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
      <br />
      <p>– VFA Kumon Team</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ✅ Video request email
export const sendVideoRequestEmail = async (
  subject: string,
  level: string,
  page: number,
  parent_email: string,
  parent_name: string,
  timestamp: string
) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO || EMAIL_FROM,
    cc: parent_email,
    subject: `VFA Kumon - Video Request (${subject} ${level} Page ${page})`,
    html: `
      <p>You have a new video request:</p>
      <ul>
        <li><strong>Subject:</strong> ${subject}</li>
        <li><strong>Level:</strong> ${level}</li>
        <li><strong>Page:</strong> ${page}</li>
        <li><strong>Requested by:</strong> ${parent_name} (${parent_email})</li>
        <li><strong>Timestamp:</strong> ${timestamp}</li>
      </ul>
      <br />
      <p>– VFA Kumon System</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendCommentEmail = async (
  comment: string,
  parent_email: string,
  parent_name: string,
  timestamp: string
) => {
  const mailOptions = {
    from: EMAIL_FROM,
    to: EMAIL_TO || EMAIL_FROM,
    cc: parent_email,
    subject: `VFA Kumon - Parent Comment from ${parent_name}`,
    html: `
      <p><strong>Parent Name:</strong> ${parent_name}</p>
      <p><strong>Email:</strong> ${parent_email}</p>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Comment:</strong></p>
      <p>${comment}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};