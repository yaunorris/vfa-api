// src/controllers/authController.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';
import { sendResetEmail } from '../utils/sendEmail';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const RESET_EXPIRY_MINUTES = 15;

// LOGIN
export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT p_email AS email, p_name AS name, password_hash FROM students WHERE p_email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const parent = rows[0] as { email: string; name: string; password_hash: string };
    const match = await bcrypt.compare(password, parent.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { id: parent.email, email: parent.email, name: parent.name };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
    next(err);
  }
};

// REQUEST RESET
export const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const [rows] = await pool.query('SELECT 1 FROM students WHERE p_email = ?', [email]);
  if ((rows as any[]).length === 0) {
    return res.status(404).json({ error: 'Email not found.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`,
    [email, token, expiresAt]
  );

  const resetLink = `vfa://reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  await sendResetEmail(email, resetLink); // ✅ fixed

  console.log('🔗 Password reset deep link (sent by email):', resetLink);
  res.json({ message: 'Password reset link sent to your email.' });
};

// RESET PASSWORD
export const resetPassword: RequestHandler = async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Missing fields.' });
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM password_resets WHERE email = ? AND token = ?`,
    [email, token]
  );

  const record = rows[0];
  if (!record) {
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }

  if (new Date(record.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Token has expired.' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query(`UPDATE students SET password_hash = ? WHERE p_email = ?`, [hashed, email]);
  await pool.query(`DELETE FROM password_resets WHERE email = ?`, [email]);

  res.json({ message: 'Password has been reset successfully.' });
};