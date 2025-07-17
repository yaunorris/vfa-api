// src/controllers/studentController.ts
import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const getStudentsByParent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parentEmail = req.query.email as string;
    if (!parentEmail) {
      return res.status(400).json({ message: 'Missing email query parameter.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         rfid_uid,
         name,
         subject,
         p_name,
         p_email,
         gender,
         enrolled,
         classday_1,
         classday_2,
         classday_3,
         current_position,
         stamp_count,
         last_stamp_update_date
       FROM students
       WHERE p_email = ?`,
      [parentEmail]
    );

    const typedRows = rows as {
      rfid_uid: string;
      name: string;
      subject: string;
      p_name: string;
      p_email: string;
      gender: string;
      enrolled: boolean;
      classday_1: number | null;
      classday_2: number | null;
      classday_3: number | null;
      current_position: string;
      stamp_count: number;
      last_stamp_update_date: Date | null;
    }[];

    res.json(typedRows);
  } catch (err) {
    console.error('❌ Error fetching students by parent:', err);
    res.status(500).json({ message: 'Internal server error.' });
    next(err);
  }
};