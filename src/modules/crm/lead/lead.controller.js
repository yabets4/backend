import LeadService from './lead.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new LeadService();

export default class LeadController {
  // GET /leads
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const leads = await service.getAllLeads(prefix, req.query);
      return ok(res, leads);
    } catch (e) {
      next(e);
    }
  }

  // GET /lead/:id
  static async getById(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const lead = await service.getLeadById(prefix, req.params.id);
      if (!lead) return notFound(res, 'Lead not found');
      return ok(res, lead);
    } catch (e) {
      next(e);
    }
  }

  // POST /lead
  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const lead = await service.createLead(prefix, req.body);
      return ok(res, lead);
    } catch (e) {
      next(e);
    }
  }

  // PUT /lead/:id
  static async update(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const lead = await service.updateLead(prefix, req.params.id, req.body);
      if (!lead) return notFound(res, 'Lead not found');
      return ok(res, lead);
    } catch (e) {
      next(e);
    }
  }

  // DELETE /lead/:id
  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const deleted = await service.deleteLead(prefix, req.params.id);
      if (!deleted) return notFound(res, 'Lead not found');
      return ok(res, { message: 'Lead deleted successfully' });
    } catch (e) {
      next(e);
    }
  }
    // POST /lead/:id/export
  static async exportToCustomer(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const customer = await service.exportLeadToCustomer(prefix, req.params.id);
      return ok(res, { message: 'Lead exported successfully', customer });
    } catch (e) {
      next(e);
    }
  }

}
