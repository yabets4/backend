import { Router } from 'express';
import ctrl from './systemAdmin.controller.js';
import auth from '../../middleware/auth.middleware.js';
import permission from '../../middleware/permission.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  createPricingTierSchema,
  updatePricingTierSchema,
  createPricingFeatureSchema,
  updatePricingFeatureSchema
} from './systemAdmin.validation.js';
import { uploadCompanyProfile } from '../../middleware/multer.middleware.js';

const r = Router();
r.use(auth(false)); // all system admin endpoints require auth

// --- USERS ---
r.get('/users', permission('super_admin'), ctrl.listUsers);
r.get('/users/:id', permission('super_admin'), ctrl.getUser);
r.post('/users', permission('super_admin'), validate(createUserSchema), ctrl.createUser);
r.put('/users/:id', permission('super_admin'), validate(updateUserSchema), ctrl.updateUser);
r.patch('/users/:id', permission('super_admin'), validate(updateUserSchema), ctrl.updateUser);
r.delete('/users/:id', permission('super_admin'), ctrl.removeUser);

// --- PRICING TIERS ---
r.get('/pricing-tiers', ctrl.listPricingTiers);
r.get('/pricing-tiers/:id', permission('super_admin'), ctrl.getPricingTier);
r.post('/pricing-tiers', validate(createPricingTierSchema), ctrl.createPricingTier);
r.put('/pricing-tiers/:id', validate(updatePricingTierSchema), ctrl.updatePricingTier);
r.patch('/pricing-tiers/:id', permission('super_admin'), validate(updatePricingTierSchema), ctrl.updatePricingTier);
r.delete('/pricing-tiers/:id', ctrl.removePricingTier);

// --- PRICING FEATURES ---
r.get('/pricing-features', ctrl.listPricingFeatures);
r.post('/pricing-features', validate(createPricingFeatureSchema), ctrl.createPricingFeature);
r.put('/pricing-features/:id', validate(updatePricingFeatureSchema), ctrl.updatePricingFeature);
r.patch('/pricing-features/:id', validate(updatePricingFeatureSchema), ctrl.updatePricingFeature);
r.delete('/pricing-features/:id', ctrl.removePricingFeature);

// --- COMPANY PROFILES (Onboarding Wizard) ---
r.post(
  '/company-profiles',
  uploadCompanyProfile.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'tinDocument', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'tradeLicense', maxCount: 1 }
  ]),
  ctrl.createCompanyProfile
);
r.get('/company-profiles/:id', ctrl.getCompanyProfile);
r.put('/company-profiles/:id', ctrl.updateCompanyProfile);
r.patch('/company-profiles/:id', ctrl.updateCompanyProfile);
r.delete('/company-profiles/:id', ctrl.removeCompanyProfile);

// --- PAYMENTS (Onboarding Wizard) ---
r.post('/companies/:companyId/payments', ctrl.createPayment);

// --- COMPANY LOCATIONS ---
r.post('/companies/:companyId/locations', ctrl.createLocations);

// GET /api/monitoring/logs?limit=50
r.get('/logs', ctrl.getLogs);

// GET /api/monitoring/system-health
r.get('/system-health', ctrl.getSystemHealth);
r.post('/logo', ctrl.getCompanyLogoByName);


export default r;
