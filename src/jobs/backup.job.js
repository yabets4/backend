// src/jobs/backup.job.js
import cron from 'node-cron';
import logger from '../config/logger.config.js';

// Run every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Running database backup job...');
    // TODO: Add actual backup logic here
    console.log('Backup job executed');
  } catch (error) {
    logger.error('Backup job failed:', error);
  }
});
