// src/controllers/eventController.ts
import { Request, Response, RequestHandler } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

// GET /events
export const getAllEvents: RequestHandler = async (req, res) => {
  console.log('🚀 getAllEvents handler executing');
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, description, start_datetime, end_datetime, rsvp_required
      FROM events
    `);
    console.log('📦 Events fetched:', rows);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error fetching events:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// POST /events/:eventId/rsvp
export const rsvpToEvent: RequestHandler = async (req, res) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const { response, parent_email } = req.body;

    if (!eventId || typeof response !== 'boolean') {
      return res.status(400).json({ error: 'Missing or invalid data' });
    }

    const parentEmail =
      (req as any).user?.email || parent_email || req.query.parent_email;

    if (!parentEmail) {
      return res.status(400).json({ error: 'Missing parent email' });
    }

    await pool.query(
      `INSERT INTO rsvps (event_id, parent_email, response)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE response = VALUES(response)`,
      [eventId, parentEmail, response]
    );

    res.json({ message: 'RSVP recorded successfully' });
  } catch (err) {
    console.error('❌ RSVP error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /events/rsvp-status
export const getRsvpStatus: RequestHandler = async (req, res) => {
  try {
    const { event_id, parent_email } = req.query as {
      event_id: string;
      parent_email?: string;
    };

    if (!event_id) {
      return res.status(400).json({ error: 'Missing event_id' });
    }

    const parentEmail =
      (req as any).user?.email || parent_email || req.body.parent_email;

    if (!parentEmail) {
      return res.status(400).json({ error: 'Missing parent_email' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT response FROM rsvps WHERE event_id = ? AND parent_email = ?`,
      [event_id, parentEmail]
    );

    res.json({
      responded: rows.length > 0,
      confirmed: rows.length > 0 ? Boolean(rows[0].response) : null,
    });
  } catch (err) {
    console.error('❌ RSVP status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};