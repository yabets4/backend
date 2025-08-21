import productModel from './product.model.js';

export default {
  list: (prefix, opts) => productModel.findAll(prefix, opts),
  get: (prefix, id) => productModel.findById(prefix, id),
  create: (prefix, dto) => productModel.create(prefix, dto),
  update: (prefix, id, dto) => productModel.update(prefix, id, dto),
  remove: (prefix, id) => productModel.remove(prefix, id),
};
