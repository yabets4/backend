// src/modules/inventory/rawMaterials/rawMaterials.routes.js
import { Router } from "express";
import {
  getRawMaterials,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getLocation
} from "./rawMaterial.controller.js";
import { uploadRawMaterialImage } from "../../../middleware/multer.middleware.js";

const r = Router();

r.get("/", getRawMaterials);
r.get("/location/", getLocation);
r.get("/:id", getRawMaterial);

r.post("/", uploadRawMaterialImage.single("image"), createRawMaterial);
r.put("/:id", uploadRawMaterialImage.single("image"), updateRawMaterial);
r.delete("/:id", deleteRawMaterial);

export default r;
