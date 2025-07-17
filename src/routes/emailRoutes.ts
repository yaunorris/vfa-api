// src/routes/emailRoutes.ts
import express from 'express';
import { sendVideoRequestEmail, sendCommentEmail } from '../utils/sendEmail';

const router = express.Router();

// ✅ Route for video request
router.post('/video-request', async (req, res) => {
  const { subject, level, page, parent_email, parent_name, timestamp } = req.body;

  if (!subject || !level || !page || !parent_email || !timestamp) {
    return res.status(400).json({ message: 'Missing required video request fields.' });
  }

  try {
    await sendVideoRequestEmail(subject, level, page, parent_email, parent_name, timestamp);
    res.json({ message: 'Video request email sent successfully.' });
  } catch (err) {
    console.error('❌ Failed to send video request email:', err);
    res.status(500).json({ message: 'Failed to send video request.' });
  }
});

// ✅ Route for comment submission
router.post('/comment', async (req, res) => {
  const { comment, parent_email, parent_name, timestamp } = req.body;

  if (!comment || !parent_email || !timestamp) {
    return res.status(400).json({ message: 'Missing comment, email, or timestamp.' });
  }

  try {
    await sendCommentEmail(comment, parent_email, parent_name, timestamp);
    res.json({ message: 'Comment email sent successfully.' });
  } catch (err) {
    console.error('❌ Failed to send comment email:', err);
    res.status(500).json({ message: 'Failed to send comment.' });
  }
});

export default router;