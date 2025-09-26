import { Router } from "express";
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
} from "./lead.controller.js";
import { uploadLeadAttachment } from "../../../middleware/multer.middleware.js";

const r = Router();

r.get("/", getLeads);
r.get("/:id", getLead);
r.post("/", uploadLeadAttachment.array("attachments"), createLead);
r.put("/:id", uploadLeadAttachment.array("attachments"), updateLead);
r.delete("/:id", deleteLead);

export default r;
