import { CustomersService } from "./customer.service.js";
import { ok, badRequest, notFound } from "../../../utils/apiResponse.js";

// GET all customers
export async function getCustomers(req, res) {
  try {
    const { companyID } = req.auth;
    const customers = await CustomersService.list(companyID);
    return ok(res, customers);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// GET single customer by customer_id (CUS-XX)
export async function getCustomer(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: customerId } = req.params; // rename for clarity
    const customer = await CustomersService.get(companyID, customerId);
    if (!customer) return notFound(res, "Customer not found");
    return ok(res, customer);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// CREATE new customer
export async function createCustomer(req, res) {
  try {
    const { companyID } = req.auth;

    let customerData = { ...req.body };

    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/");
      customerData.photo_url = `/uploads/${companyID}/customers/${req.file.filename}`;
    }

    const newCustomer = await CustomersService.create(companyID, customerData);
    return ok(res, newCustomer);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// UPDATE customer by customer_id
export async function updateCustomer(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: customerId } = req.params;

    let customerData = { ...req.body };

    if (req.file) {
      customerData.photo_url = `/uploads/${companyID}/customers/${req.file.filename}`;
    }

    const updated = await CustomersService.update(companyID, customerId, customerData);
    if (!updated) return notFound(res, "Customer not found");
    return ok(res, updated);
  } catch (err) {
    return badRequest(res, err.message);
  }
}

// DELETE customer by customer_id
export async function deleteCustomer(req, res) {
  try {
    const { companyID } = req.auth;
    const { id: customerId } = req.params;
    const deleted = await CustomersService.delete(companyID, customerId);
    if (!deleted) return notFound(res, "Customer not found");
    return ok(res, { message: "Customer deleted" });
  } catch (err) {
    return badRequest(res, err.message);
  }
}
