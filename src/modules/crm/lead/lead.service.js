import { LeadsModel } from "./lead.model.js";

export const LeadsService = {
  // List all leads with attachments
  async list(companyId) {
    console.log("[Service] Listing leads for company:", companyId);
    return await LeadsModel.findAll(companyId);
  },

  // Get a single lead with attachments
  async get(companyId, leadId) {
    console.log("[Service] Fetching lead:", leadId, "for company:", companyId);
    return await LeadsModel.findById(companyId, leadId);
  },

  // Create a lead + optional attachments
  async create(companyId, data, attachments = []) {
    console.log("[Service] Creating lead for company:", companyId);
    console.log("[Service] Input data:", data);

    // Required fields
    const requiredFields = ["lead_type", "name", "primary_phone", "lead_source", "service_requested"];
    const missingFields = requiredFields.filter(f => !data[f]);
    if (missingFields.length) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    try {
      const newLead = await LeadsModel.insert(companyId, data, attachments);
      console.log("[Service] Lead created successfully:", newLead.lead_id);
      return newLead;
    } catch (err) {
      console.error("[Service] Error creating lead:", err);
      throw err;
    }
  },

  // Update a lead + add new attachments
  async update(companyId, leadId, data, newAttachments = [], existingAttachments = []) {
  console.log("[Service] Updating lead:", leadId, "for company:", companyId);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  try {
    const updatedLead = await LeadsModel.update(companyId, leadId, data, newAttachments, existingAttachments);
    console.log("[Service] Lead updated successfully:", leadId);
    return updatedLead;
  } catch (err) {
    console.error("[Service] Error updating lead:", err);
    throw err;
  }
},


  // Delete lead (attachments cascade automatically)
  async delete(companyId, leadId) {
    console.log("[Service] Deleting lead:", leadId, "for company:", companyId);

    try {
      const deleted = await LeadsModel.remove(companyId, leadId);
      console.log("[Service] Lead deleted successfully:", leadId);
      return deleted;
    } catch (err) {
      console.error("[Service] Error deleting lead:", err);
      throw err;
    }
  }
};
