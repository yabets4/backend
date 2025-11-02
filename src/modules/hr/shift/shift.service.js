import ShiftModel from './shift.model.js';

export default class ShiftService {
  constructor() {
    this.model = new ShiftModel();
  }

  async getAllShifts(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getShiftById(prefix, id) {
    return await this.model.findById(prefix, id);
  }

  async getShiftsByEmployee(prefix, employeeId) {
    return await this.model.findByEmployeeId(prefix, employeeId);
  }

  async createShift(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateShift(prefix, id, data) {
    return await this.model.update(prefix, id, data);
  }

  async deleteShift(prefix, id) {
    return await this.model.delete(prefix, id);
  }
}
