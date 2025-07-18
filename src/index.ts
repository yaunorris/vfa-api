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
import mysql from 'mysql2';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ DB connection failed:', err);
  } else {
    console.log('✅ Connected to NAS MariaDB successfully!');
    connection.query('SELECT COUNT(*) AS studentCount FROM students', (err, results) => {
      if (err) {
        console.error('❌ Query failed:', err.message);
      } else {
        console.log(`✅ Found ${(results as any)[0].studentCount} students in DB.`);
      }
    });
  }
});

connection.query('SHOW TABLES', (err, results) => {
  if (err) {
    console.error('❌ SHOW TABLES failed:', err);
  } else {
    console.log('✅ Tables in DB:', results);
  }
});

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