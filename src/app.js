import express from 'express';
import initLoaders from './loaders/index.js';

const app = express();

// ✅ Trust the first proxy (important for Render/Heroku/etc.)
app.set('trust proxy', 1);

await initLoaders(app);

export default app;
