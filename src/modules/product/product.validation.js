import Joi from 'joi';

export const createProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(120).required(),
    sku: Joi.string().max(64).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
  }).required()
});

export const updateProductSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(120),
    sku: Joi.string().max(64),
    price: Joi.number().min(0),
    stock: Joi.number().integer().min(0),
  }).min(1).required()
});
