import { Router } from 'express';
import ctrl from './project.controller.js';
import auth from '../../middleware/auth.middleware.js';
import tenant from '../../middleware/tenant.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from './project.validation.js';

const r = Router(); r.use(auth(true), tenant);
r.get('/', permission('project_read'), ctrl.list);
r.get('/:id', permission('project_read'), ctrl.get);
r.post('/', permission('project_write'), validate(createProjectSchema), ctrl.create);
r.put('/:id', permission('project_write'), validate(updateProjectSchema), ctrl.update);
r.patch('/:id', permission('project_write'), validate(updateProjectSchema), ctrl.update);
r.delete('/:id', permission('project_delete'), ctrl.remove);
export default r;
