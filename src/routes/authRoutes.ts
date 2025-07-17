// src/routes/authRoutes.ts
import { Router } from 'express';
import {
  login,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController';

const router = Router();

// POST /auth/login
router.post('/login', login);

// POST /auth/request-reset
router.post('/request-reset', requestPasswordReset);

// POST /auth/reset-password
router.post('/reset-password', resetPassword);

export default router;