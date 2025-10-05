import FinishedProductModel from './finishedProduct.model.js';

export default class FinishedProductService {
  constructor() {
    this.model = new FinishedProductModel();
  }

  async getAllProducts(prefix, options) {
    return await this.model.findAll(prefix, options);
  }

  async getProductByCode(prefix, productCode) {
    return await this.model.findById(prefix, productCode);
  }

  async createProduct(prefix, data) {
    return await this.model.create(prefix, data);
  }

  async updateProduct(prefix, productCode, data) {
    return await this.model.update(prefix, productCode, data);
  }

  async deleteProduct(prefix, productCode) {
    return await this.model.delete(prefix, productCode);
  }
}
