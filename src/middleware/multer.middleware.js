// multer.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// import your DB service to fetch company name
import { getCompanyNameById } from './services/company.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------
// COMPANY PROFILES (unchanged)
const companyProfilesDir = path.join(__dirname, '../uploads/companyProfiles');
const companyStorage = multer.diskStorage({
  destination: companyProfilesDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Helper to resolve company folder dynamically
async function resolveCompanyFolder(req, subDir) {
  try {
    const { companyID } = req.auth;
    // fetch company name (make sure this returns e.g. 'AcmeInc' not 'Acme Inc.')
    let companyName = await getCompanyNameById(companyID);
    console.log("Resolved company name:", companyName);
    
    if (!companyName) companyName = 'default';

    // sanitize companyName for folder usage (replace spaces & special chars)
    const safeName = companyName.replace(/[^a-zA-Z0-9-_]/g, '_');

    const uploadDir = path.join(__dirname, `../uploads/${safeName}/${subDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    return uploadDir;
  } catch (err) {
    // fallback to default folder
    const fallback = path.join(__dirname, `../uploads/default/${subDir}`);
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

// ------------------------
// CUSTOMER PHOTOS
const customerStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = await resolveCompanyFolder(req, 'customers');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ------------------------
// LEAD ATTACHMENTS
const leadStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = await resolveCompanyFolder(req, 'leads');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ------------------------
// EMPLOYEE PHOTOS
const employeeStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = await resolveCompanyFolder(req, 'employees');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const rawMaterialStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = await resolveCompanyFolder(req, 'rawMaterials');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// ------------------------
// Export uploaders
export const uploadEmployeePhoto = multer({ storage: employeeStorage });
export const uploadCompanyProfile = multer({ storage: companyStorage });
export const uploadCustomerPhoto = multer({ storage: customerStorage });
export const uploadLeadAttachment = multer({ storage: leadStorage });
export const uploadRawMaterialImage = multer({ storage: rawMaterialStorage });
