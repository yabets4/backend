import { SuppliersModel } from './suppliers.model.js';

export const SuppliersService = {
  async list(companyId) {
    return await SuppliersModel.findAll(companyId);
  },

  async get(companyId, supplierId) {
    return await SuppliersModel.findById(companyId, supplierId);
  },

  async create(companyId, data) {
    if (!data || !data.name) throw new Error('Missing required field: name');
    return await SuppliersModel.insert(companyId, data);
  },

  async update(companyId, supplierId, data) {
    const updated = await SuppliersModel.update(companyId, supplierId, data);
    if (!updated) throw new Error('Supplier not found');
    return updated;
  },

  async delete(companyId, supplierId) {
    const ok = await SuppliersModel.delete(companyId, supplierId);
    if (!ok) throw new Error('Supplier not found');
    return true;
  }
};

export default SuppliersService;
