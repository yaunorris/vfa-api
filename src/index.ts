// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { authenticate } from './middleware/authenticate';
import emailRoutes from './routes/emailRoutes';

import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import eventRoutes from './routes/eventRoutes'; // ✅ Important

import pushRoutes from './routes/pushRoutes'; // 👈 add this at top

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/email', emailRoutes); // now handles POST /email/video-request
console.log('✅ index.ts loaded');

// ✅ PUBLIC ROUTES
app.use('/auth', authRoutes);

// ✅ TEST ROUTE
app.get('/test-route', (req, res) => {
  console.log('🧪 /test-route hit');
  res.send('✅ test route working');
});

// ✅ PROTECTED ROUTES
console.log('📍 Mounting /students...');
app.use('/students', authenticate, studentRoutes);

console.log('📍 Mounting /events...');
app.use('/events', authenticate, eventRoutes); // ✅ This must be reached!
app.use('/push', pushRoutes); // ✅ Mount push route here

// DEBUG ROUTE
app.get('/events-debug', (req, res) => {
  console.log('🔥 /events-debug reached');
  res.send('✅ /events-debug is alive');
});

// ✅ HEALTH
app.get('/health', (req, res) => {
  res.send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});