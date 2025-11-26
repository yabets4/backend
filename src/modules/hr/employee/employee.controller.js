import EmployeeService from './employee.service.js';
import { ok, notFound, created } from '../../../utils/apiResponse.js';

const service = new EmployeeService();

export default class EmployeeController {
  // GET /employees
  static async getAll(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      console.log('Files:', req.files);
console.log('Body:', req.body);

      const employees = await service.getAllEmployees(companyId);
      return ok(res, employees);
    } catch (e) {
      console.error('Error creating employee', e);
      throw e;

      next(e);
    }
  }

  // GET /employees/:id
  static async getById(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const employee = await service.getEmployeeById(companyId, req.params.id);
      if (!employee) return notFound(res, 'Employee not found');
      return ok(res, employee);
    } catch (e) {
      next(e);
    }
  }

  // GET /employees/:id/leave-balances
  static async getLeaveBalances(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const balances = await service.getLeaveBalances(companyId, req.params.id);
      return ok(res, balances);
    } catch (e) {
      next(e);
    }
  }

  // PATCH /employees/:id/status
  static async setStatus(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const employeeId = req.params.id;
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, message: 'Status is required' });
      const updated = await service.setEmployeeStatus(companyId, employeeId, status);
      if (!updated) return notFound(res, 'Employee not found');
      return ok(res, updated);
    } catch (e) {
      next(e);
    }
  }

  // POST /employees/:id/leave-balances
  static async setLeaveBalances(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      let data = req.body;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { data = []; }
      }
      const balances = Array.isArray(data) ? data : (data.balances || []);
      await service.setLeaveBalances(companyId, req.params.id, balances);
      return ok(res, { success: true });
    } catch (e) {
      next(e);
    }
  }

  // POST /employees
  static async create(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const data = { ...req.body };

      // handle file uploads (multer fields)
      if (req.files) {
        if (req.files.profile_photo_attachment?.[0]) {
          data.profile_photo_attachment = req.files.profile_photo_attachment[0].path;
        }
        if (req.files.national_id_attachment?.[0]) {
          data.national_id_attachment = req.files.national_id_attachment[0].path;
        }
      }

      // parse JSON fields safely
      if (typeof data.emergency_contacts === 'string') data.emergency_contacts = JSON.parse(data.emergency_contacts);
      if (typeof data.certifications === 'string') data.certifications = JSON.parse(data.certifications);
      if (typeof data.skills === 'string') data.skills = JSON.parse(data.skills);
      if (typeof data.payroll === 'string') data.payroll = JSON.parse(data.payroll);
      if (typeof data.part_time_schedule === 'string') data.part_time_schedule = JSON.parse(data.part_time_schedule);

      const newEmployee = await service.createEmployee(companyId, data);
      return created(res, newEmployee);
    } catch (e) {
      next(e);
    }
  }

  // PUT /employees/:id
  static async update(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const data = { ...req.body };

      // handle file uploads (multer fields)
      if (req.files) {
        if (req.files.profile_photo_attachment?.[0]) {
          data.profile_photo_attachment = req.files.profile_photo_attachment[0].path;
        }
        if (req.files.national_id_attachment?.[0]) {
          data.national_id_attachment = req.files.national_id_attachment[0].path;
        }
      }

      // parse JSON fields safely
      if (typeof data.emergency_contacts === 'string') data.emergency_contacts = JSON.parse(data.emergency_contacts);
      if (typeof data.certifications === 'string') data.certifications = JSON.parse(data.certifications);
      if (typeof data.skills === 'string') data.skills = JSON.parse(data.skills);
      if (typeof data.payroll === 'string') data.payroll = JSON.parse(data.payroll);
      if (typeof data.part_time_schedule === 'string') data.part_time_schedule = JSON.parse(data.part_time_schedule);

      const employee = await service.updateEmployee(companyId, req.params.id, data);
      if (!employee) return notFound(res, 'Employee not found');
      return ok(res, employee);
    } catch (e) {
      next(e);
    }
  }

  // DELETE /employees/:id
  static async delete(req, res, next) {
    try {
      const companyId = req.auth.companyID;
      const success = await service.deleteEmployee(companyId, req.params.id);
      if (!success) return notFound(res, 'Employee not found');
      return ok(res, { deleted: true });
    } catch (e) {
      next(e);
    }
  }
}
