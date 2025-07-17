// src/routes/pushRoutes.ts
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// ✅ Save the push token to a local file
router.post('/save-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Missing push token.' });
  }

  console.log('📥 Received push token:', token);

  const tokenPath = path.join(__dirname, '../../latestPushToken.txt');
  fs.writeFileSync(tokenPath, token, 'utf-8');

  res.json({ message: 'Push token saved.' });
});

// ✅ Send a test push notification using saved token
router.post('/send', async (req, res) => {
  const { title, body } = req.body;

  const tokenPath = path.join(__dirname, '../../latestPushToken.txt');
  if (!fs.existsSync(tokenPath)) {
    return res.status(400).json({ message: 'No push token saved yet.' });
  }

  const token = fs.readFileSync(tokenPath, 'utf-8');

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      sound: 'default',
      title,
      body,
    });

    console.log('✅ Push notification sent:', response.data);
    res.json({ message: 'Notification sent.', data: response.data });
  } catch (error: any) {
    console.error('❌ Push send failed:', error.message);
    res.status(500).json({ message: 'Failed to send push notification.' });
  }
});

export default router;