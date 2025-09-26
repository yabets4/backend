// src/modules/systemAdmin/customers/customers.service.js
import { CustomersModel } from "./customer.model.js";

export const CustomersService = {
  // List all customers for a company
  async list(companyId) {
    console.log("[Service] Listing customers for company:", companyId);
    return await CustomersModel.findAll(companyId);
  },

  // Get single customer by customer_id
  async get(companyId, customerId) {
    console.log("[Service] Fetching customer:", customerId, "for company:", companyId);
    return await CustomersModel.findById(companyId, customerId);
  },

  // Create new customer (customer_id generated inside model)
  async create(companyId, data) {
    console.log("[Service] Creating customer for company:", companyId);
    console.log("[Service] Input data:", data);

    const isCompany = data.customer_type === "Company";

    // Always required: name and billing_address
    const requiredFields = ["name", "billing_address"];
    // If company, contact_name & contact_phone are required
    if (isCompany) requiredFields.push("contact_name", "contact_phone");

    const missingFields = requiredFields.filter(f => !data[f]);
    if (missingFields.length) {
      console.error("[Service] Missing required fields:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    try {
      const newCustomer = await CustomersModel.insert(companyId, data);
      console.log("[Service] Customer created successfully:", newCustomer.customer_id);
      return newCustomer;
    } catch (err) {
      console.error("[Service] Error creating customer:", err);
      throw err;
    }
  },

  // Update customer by customer_id
  async update(companyId, customerId, data) {
  console.log("[Service] Updating customer:", customerId, "for company:", companyId);
  console.log("[Service] Raw update data:", data);

  if (!data || Object.keys(data).length === 0) {
    console.warn("[Service] No data provided to update for customer:", customerId);
    return null; // nothing to update
  }

  // Flatten payload and ensure NOT NULL fields are set
  const payloadForModel = {
    name: data.name || "Unnamed",
    email: data.email || null,
    phone: data.phone || null,
    tin_number: data.tin_number || null,
    billing_address: data.billing_address || "No billing address provided", // NOT NULL fallback
    shipping_address: data.shipping_address || "", // can be empty
    gender: data.gender || null,
    birthday: data.birthday || null,
    contact_name: data.contact_name || null,
    contact_phone: data.contact_phone || null,
    job_title: data.job_title || null,
    photo_url: data.photo_url || null,
    customer_type: data.customer_type || "Individual",
  };

  console.log("[Service] Flattened payload for model:", payloadForModel);

  try {
    const updatedCustomer = await CustomersModel.update(companyId, customerId, payloadForModel);
    console.log("[Service] Customer updated successfully:", updatedCustomer?.customer_id);
    return updatedCustomer;
  } catch (err) {
    console.error("[Service] Error updating customer:", err);
    throw err;
  }
},


  // Delete customer by customer_id
  async delete(companyId, customerId) {
    console.log("[Service] Deleting customer:", customerId, "for company:", companyId);

    try {
      const deletedCustomer = await CustomersModel.remove(companyId, customerId);
      if (!deletedCustomer) {
        console.warn("[Service] Customer not found for deletion:", customerId);
        return null;
      }
      console.log("[Service] Customer deleted successfully:", customerId);
      return deletedCustomer;
    } catch (err) {
      console.error("[Service] Error deleting customer:", err);
      throw err;
    }
  },
};
