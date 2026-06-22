import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  PORT: Joi.number().integer().default(3001),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
});
