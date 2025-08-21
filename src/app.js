import express from 'express';
import initLoaders from './loaders/index.js';

const app = express();
await initLoaders(app);
export default app;
