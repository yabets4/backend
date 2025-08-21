import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { securityConfig } from '../config/index.js';
import errorMiddleware from '../middleware/error.middleware.js';
import rateLimitMiddleware from '../middleware/rateLimit.middleware.js';

export default function expressLoader(app) {
  app.use(cors(securityConfig.cors));
  app.use(helmet(securityConfig.helmet));
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(rateLimitMiddleware);
  // routes will be plugged by routes.loader
  app.use(errorMiddleware);
}
