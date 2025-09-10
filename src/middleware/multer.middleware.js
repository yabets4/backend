// multer.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// COMPANY PROFILES (existing, unchanged)
const companyProfilesDir = path.join(__dirname, '../uploads/companyProfiles');
const companyStorage = multer.diskStorage({
  destination: companyProfilesDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
export const uploadCompanyProfile = multer({ storage: companyStorage });

// ------------------------
// CUSTOMER PHOTOS (NEW: per tenant -> /uploads/{prefix}/customers)
const customerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantPrefix = req.tenantPrefix || 'default'; // fallback if missing
    const uploadDir = path.join(__dirname, `../uploads/${tenantPrefix}/customers`);

    // make sure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const uploadCustomerPhoto = multer({ storage: customerStorage });
