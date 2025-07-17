// src/routes/studentRoutes.ts
import { Router } from 'express';
import { getStudentsByParent } from '../controllers/studentController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// GET /students?email=...
router.get('/', authenticate, getStudentsByParent);

export default router;
