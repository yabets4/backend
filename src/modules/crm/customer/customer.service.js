import CustomerModel from './customer.model.js';

export default class CustomerService {
  constructor() {
    this.model = new CustomerModel();
  }

  async getAllCustomers(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getCustomerById(prefix, customerId) {
    return await this.model.findById(prefix, customerId);
  }

  async createCustomer(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateCustomer(prefix, customerId, data) {
    return await this.model.update(prefix, customerId, data);
  }

  async deleteCustomer(prefix, customerId) {
    return await this.model.delete(prefix, customerId);
  }
}
