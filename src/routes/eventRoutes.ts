// src/routes/eventRoutes.ts
import express, { Router } from 'express';
import {
  getAllEvents,
  rsvpToEvent,
  getRsvpStatus,
} from '../controllers/eventController';
import { authenticate } from '../middleware/authenticate';

const router: Router = express.Router();

// ✅ Route to fetch all events
router.get('/', authenticate, getAllEvents);

// ✅ Route to RSVP to an event
router.post('/:eventId/rsvp', authenticate, rsvpToEvent);

// ✅ Route to check RSVP status
router.get('/rsvp-status', authenticate, getRsvpStatus);

// ✅ Export type interfaces used in controller
export interface RsvpRequestParams {
  eventId: string;
}

export interface RsvpRequestBody {
  response: boolean;
  parent_email?: string;
}

export interface RsvpStatusQuery {
  event_id: string;
  parent_email?: string;
}

export default router;