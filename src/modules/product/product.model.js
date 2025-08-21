import { BaseModel } from '../../models/systemAdmin.model.js'; // re-use BaseModel export
class ProductModel extends BaseModel {
  constructor() { super('products'); }
}
export default new ProductModel();
