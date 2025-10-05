import { Router } from 'express';
import { getFullReport } from './report.controller.js';

const router = Router();

router.get('/', getFullReport);

export default router;
