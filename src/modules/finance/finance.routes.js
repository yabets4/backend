import { Router } from 'express';
import auth from '../../middleware/auth.middleware.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requestCounter } from '../../middleware/requestCounter.middleware.js';
import {CheckCompanyStatus} from '../../middleware/checkTierLimit.middleware.js';
import FixedaAsset from './fixedAsset/assets.routes.js';

const r = Router(); r.use(auth(true), authenticateJWT, CheckCompanyStatus, requestCounter );

r.use('/assets', FixedaAsset);

export default r;
