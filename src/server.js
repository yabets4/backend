import app from './app.js';
import { appConfig } from './config/index.js';
import logger from './config/logger.config.js';

const port = appConfig.port

app.listen(port, () => {
  logger.info(`API listening on :${port}`);
});
