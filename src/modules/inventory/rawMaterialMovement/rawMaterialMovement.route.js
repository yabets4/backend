// src/modules/inventory/rawMaterialMovement/rawMaterialMovement.route.js
import express from 'express';
import {
  listMovements,
  getMovementById,
  getMovementsForMaterial,
  getLookupData,
  recordMovement,
  deleteMovement
} from './rawMaterialMovement.controller.js';

const router = express.Router();

// Get all movements
router.get('/', listMovements);

// Record a new movement
router.post('/', recordMovement);

// Get lookup data (raw materials, suppliers, locations)
// Place this route before dynamic param routes to avoid being captured by :movementId
router.get('/lookups', getLookupData);

// Get a specific movement by its ID

// Get all movements for a specific raw material
router.get('/material/:rawMaterialId', getMovementsForMaterial);

// Get a specific movement by its ID
router.get('/:movementId', getMovementById);

// Delete a movement by its ID
router.delete('/:movementId', deleteMovement);

// Get all movements for a specific raw material
router.get('/material/:rawMaterialId', getMovementsForMaterial);

export default router;
