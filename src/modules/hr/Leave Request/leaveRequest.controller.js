import LeaveRequestService from './leaveRequest.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new LeaveRequestService();

export default class LeaveRequestController {
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const requests = await service.getAllLeaveRequests(prefix, req.query);
      return ok(res, requests);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const request = await service.getLeaveRequestById(prefix, req.params.id);
      if (!request) return notFound(res, 'Leave request not found');
      return ok(res, request);
    } catch (e) {
      next(e);
    }
  }

  static async getByEmployee(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const requests = await service.getLeaveRequestsByEmployee(prefix, req.params.employeeId);
      return ok(res, requests);
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const request = await service.createLeaveRequest(prefix, req.body);
      return ok(res, request);
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const request = await service.updateLeaveRequest(prefix, req.params.id, req.body);
      return ok(res, request);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const request = await service.deleteLeaveRequest(prefix, req.params.id);
      return ok(res, request);
    } catch (e) {
      next(e);
    }
  }
  static async approve(req, res, next) {
  try {
    const prefix = req.tenantPrefix;
    const request = await service.approveLeaveRequest(prefix, req.params.id, req.body.approver_comments);
    if (!request) return notFound(res, 'Leave request not found');
    return ok(res, request);
  } catch (e) {
    next(e);
  }
}

    static async reject(req, res, next) {
    try {
        const prefix = req.tenantPrefix;
        const request = await service.rejectLeaveRequest(prefix, req.params.id, req.body.approver_comments);
        if (!request) return notFound(res, 'Leave request not found');
        return ok(res, request);
    } catch (e) {
        next(e);
    }
    }

}
