// src/middleware/authenticate.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('🔐 Verifying JWT with secret:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };

    (req as any).user = decoded; // ✅ bypass TS type check
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};