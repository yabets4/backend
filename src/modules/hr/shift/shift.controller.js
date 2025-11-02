import ShiftService from './shift.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new ShiftService();

export default class ShiftController {
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shifts = await service.getAllShifts(prefix, req.query);
      return ok(res, shifts);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shift = await service.getShiftById(prefix, req.params.id);
      if (!shift) return notFound(res, 'Shift not found');
      return ok(res, shift);
    } catch (e) {
      next(e);
    }
  }

  static async getByEmployee(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shifts = await service.getShiftsByEmployee(prefix, req.params.employeeId);
      return ok(res, shifts);
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shift = await service.createShift(prefix, req.body);
      return ok(res, shift);
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shift = await service.updateShift(prefix, req.params.id, req.body);
      return ok(res, shift);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const shift = await service.deleteShift(prefix, req.params.id);
      return ok(res, shift);
    } catch (e) {
      next(e);
    }
  }
}
