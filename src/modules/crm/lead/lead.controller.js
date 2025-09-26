import { LeadsService } from "./lead.service.js";
import { ok, badRequest, notFound } from "../../../utils/apiResponse.js";

// GET all leads
export async function getLeads(req, res) {
  try {
    const { companyID } = req.auth;
    const leads = await LeadsService.list(companyID);
    return ok(res, leads);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// GET single lead by lead_id (LEAD-XX)
export async function getLead(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: leadId } = req.params;
    const lead = await LeadsService.get(companyID, leadId);
    if (!lead) return notFound(res, "Lead not found");
    return ok(res, lead);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// CREATE new lead
export async function createLead(req, res) {
  try {
    const { companyID } = req.auth;
    const leadData = { ...req.body };

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      leadData.attachments = req.files.map(f => ({
        file_url: `/uploads/${req.tenantPrefix || "default"}/leads/${f.filename}`,
        description: f.originalname
      }));
    }

    const newLead = await LeadsService.create(companyID, leadData, leadData.attachments);
    return ok(res, newLead);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// UPDATE lead by lead_id
export async function updateLead(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: leadId } = req.params;

    // Lead fields from body
    const leadData = { ...req.body };

    // Parse existing attachments JSON
    let existingAttachments = [];
    if (leadData.existing_attachments) {
      if (typeof leadData.existing_attachments === "string") {
        // single attachment sent as string
        existingAttachments = [JSON.parse(leadData.existing_attachments)];
      } else {
        existingAttachments = leadData.existing_attachments.map(att => JSON.parse(att));
      }
    }

    // New uploaded files
    const newAttachments = (req.files || []).map(f => ({
      file_url: `/uploads/${req.tenantPrefix || "default"}/leads/${f.filename}`,
      description: f.originalname,
    }));

    // Pass both to the service
    const updated = await LeadsService.update(companyID, leadId, leadData, newAttachments, existingAttachments);

    if (!updated) return notFound(res, "Lead not found");
    return ok(res, updated);
  } catch (err) {
    return badRequest(res, err.message);
  }
}


// DELETE lead by lead_id
export async function deleteLead(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: leadId } = req.params;
    const deleted = await LeadsService.delete(companyID, leadId);
    if (!deleted) return notFound(res, "Lead not found");
    return ok(res, { message: "Lead deleted" });
  } catch (err) {
    return badRequest(res, err.message);
  }
}
