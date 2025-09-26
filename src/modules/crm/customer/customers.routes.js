// src/modules/systemAdmin/customers/customers.routes.js
import { Router } from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./customer.controller.js";
import { uploadCustomerPhoto } from "../../../middleware/multer.middleware.js";

const r = Router();

r.get("/", getCustomers);
r.get("/:id", getCustomer);

r.post("/", uploadCustomerPhoto.single("photo"), createCustomer);
r.put("/:id", uploadCustomerPhoto.single("photo"), updateCustomer);

r.delete("/:id", deleteCustomer);

export default r;