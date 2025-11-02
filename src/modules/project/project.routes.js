import { Router } from 'express';
import auth from '../../middleware/auth.middleware.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import ProjectController from './project.controller.js';

const router = Router();
router.use(auth(true), authenticateJWT);
router.post('/', ProjectController.create);
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

export default router;
