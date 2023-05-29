import { createLogger, format, transports } from 'winston';

export default createLogger({
  level: process.env.LOG_LEVEL ?? 'debug',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `\n${timestamp} [worker id: ${process.env.CUCUMBER_WORKER_ID ?? 0}] [${level}]:  ${message}`),
  ),
  transports: [new transports.Console()],
});
