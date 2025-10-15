import winstonLogger from './winston';

process.on('uncaughtException', (err) => {
  try {
    console.error('🔴 [ Error ] Uncaught Exception caught', err);
    winstonLogger.error(`🔴 [ Error ] Uncaught Exception caught ${err}`);
  } catch (error) {
    console.error('🔴 [ Error ] Uncaught Exception caught', error);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    console.error(
      '🔴 [ Error ] Unhandled Rejection caught',
      promise,
      'reason:',
      reason,
    );
    winstonLogger.error(
      `🔴 [ Error ] Unhandled Rejection caught ${promise} reason: ${reason}`,
    );
  } catch (error) {
    console.error('🔴 [ Error ] Unhandled Rejection caught', error);
  }
});
