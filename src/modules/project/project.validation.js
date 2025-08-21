import Joi from 'joi';

const statusEnum = Joi.string().valid('planned','in_progress','on_hold','completed','cancelled');

export const createProjectSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(160).required(),
    description: Joi.string().allow('', null),
    owner_id: Joi.number().integer().required(),
    status: statusEnum.default('planned'),
    start_date: Joi.date().optional(),
    due_date: Joi.date().min(Joi.ref('start_date')).optional(),
  }).required()
});

export const updateProjectSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().max(160),
    description: Joi.string().allow('', null),
    owner_id: Joi.number().integer(),
    status: statusEnum,
    start_date: Joi.date().optional(),
    due_date: Joi.date().min(Joi.ref('start_date')).optional(),
  }).min(1).required()
});
