import FinishedProductService from './finishedProduct.service.js';
import { ok, notFound } from '../../../utils/apiResponse.js';

const service = new FinishedProductService();

export default class FinishedProductController {
  static async getAll(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const products = await service.getAllProducts(prefix, req.query);
      return ok(res, products);
    } catch (e) {
      next(e);
    }
  }

  static async getByCode(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const product = await service.getProductByCode(prefix, req.params.code);
      if (!product) return notFound(res, 'Product not found');
      return ok(res, product);
    } catch (e) {
      next(e);
    }
  }

  static async create(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const product = await service.createProduct(prefix, req.body);
      return ok(res, product);
    } catch (e) {
      next(e);
    }
  }

  static async update(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const product = await service.updateProduct(prefix, req.params.code, req.body);
      return ok(res, product);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req, res, next) {
    try {
      const prefix = req.tenantPrefix;
      const product = await service.deleteProduct(prefix, req.params.code);
      return ok(res, product);
    } catch (e) {
      next(e);
    }
  }
}
