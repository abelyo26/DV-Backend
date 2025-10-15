import { sendErrorNotification } from './nodemailer';
import winstonLogger from './winston';

process.on('uncaughtException', async (err) => {
  try {
    console.error('🔴 [ Error ] Uncaught Exception caught', err);
    winstonLogger.error(`🔴 [ Error ] Uncaught Exception caught ${err}`);

    // Send email notification
    await sendErrorNotification(err, 'Uncaught Exception');
  } catch (error) {
    console.error('🔴 [ Error ] Uncaught Exception caught', error);
  }
});

process.on('unhandledRejection', async (reason, promise) => {
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

    // Send email notification
    await sendErrorNotification(reason, 'Unhandled Rejection');
  } catch (error) {
    console.error('🔴 [ Error ] Unhandled Rejection caught', error);
  }
});
