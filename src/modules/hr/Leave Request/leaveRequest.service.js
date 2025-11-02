import LeaveRequestModel from './leaveRequest.model.js';

export default class LeaveRequestService {
  constructor() {
    this.model = new LeaveRequestModel();
  }

  async getAllLeaveRequests(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getLeaveRequestById(prefix, id) {
    return await this.model.findById(prefix, id);
  }

  async getLeaveRequestsByEmployee(prefix, employeeId) {
    return await this.model.findByEmployeeId(prefix, employeeId);
  }

  async createLeaveRequest(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateLeaveRequest(prefix, id, data) {
    return await this.model.update(prefix, id, data);
  }

  async deleteLeaveRequest(prefix, id) {
    return await this.model.delete(prefix, id);
  }

  async approveLeaveRequest(prefix, id, approver_comments) {
    return await this.model.approve(prefix, id, approver_comments);
  }

  async rejectLeaveRequest(prefix, id, approver_comments) {
    return await this.model.reject(prefix, id, approver_comments);
  }

}