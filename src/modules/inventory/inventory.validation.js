import Joi from 'joi';

export const createInventorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(160).required(),
    sku: Joi.string().max(64).required(),
    qty_on_hand: Joi.number().integer().min(0).default(0),
    reorder_level: Joi.number().integer().min(0).default(0),
    location: Joi.string().max(120).allow('', null),
  }).required()
});

export const updateInventorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(160),
    sku: Joi.string().max(64),
    qty_on_hand: Joi.number().integer().min(0),
    reorder_level: Joi.number().integer().min(0),
    location: Joi.string().max(120).allow('', null),
  }).min(1).required()
});
