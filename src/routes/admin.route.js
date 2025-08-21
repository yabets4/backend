import { Router } from 'express';
import { ok, badRequest } from '../utils/apiResponse.js';


const r = Router();
r.post('/superAdmin', async (req, res) => {
  return ok(res, { token });
});

export default r;
