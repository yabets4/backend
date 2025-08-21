import Joi from 'joi';

const typeEnum = Joi.string().valid('income','expense','transfer');

export const createTransactionSchema = Joi.object({
  body: Joi.object({
    type: typeEnum.required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    account_id: Joi.number().integer().required(),
    reference: Joi.string().max(160).allow('', null),
    occurred_at: Joi.date().required(),
    notes: Joi.string().allow('', null),
  }).required()
});

export const updateTransactionSchema = Joi.object({
  body: Joi.object({
    type: typeEnum,
    amount: Joi.number().positive(),
    currency: Joi.string().length(3).uppercase(),
    account_id: Joi.number().integer(),
    reference: Joi.string().max(160).allow('', null),
    occurred_at: Joi.date(),
    notes: Joi.string().allow('', null),
  }).min(1).required()
});
