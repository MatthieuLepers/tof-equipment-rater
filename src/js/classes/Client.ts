import { MessageAttachment } from 'discord.js';
import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import winston from 'winston';
import Queue from 'bee-queue';
import getTextFromImage from 'node-text-from-image';
import type { ILogger } from '@/js/types';

interface IRateJob {
  file: MessageAttachment;
  author: string;
}

export default class BotClient extends CommandoClient {
  logger: ILogger;

  rateQueue: Queue;

  constructor(options: CommandoClientOptions) {
    super(options);

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'winston.log' }),
      ],
      format: winston.format.printf((log) => `[${new Date().toLocaleString()}] - [${log.level.toUpperCase()}] - ${log.message}`),
    });
    this.rateQueue = new Queue('RateQueue', {
      removeOnSuccess: true,
      removeOnFailure: true,
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: 6379,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
      },
    });
    this.rateQueue.process(async (job: Queue.Job<IRateJob>) => {
      this.logger.log('info', `Processing job n°${job.id}`);
      const text = await getTextFromImage(job.data.file.url);
      return text;
    });

    this.on('ready', () => {
      this.logger.log('info', 'Bot is ready !');
      if (process.env.DEV_MODE === 'true') {
        this.logger.log('info', 'Dev mode is enabled');
      }
      this.logger.log('info', `Running app in "${process.env.NODE_ENV}" environment`);
      this.user?.setStatus(process.env.DEV_MODE === 'true' ? 'invisible' : 'online');
    });
    this.on('debug', (m) => this.logger.log('debug', m));
    this.on('warn', (m) => this.logger.log('warn', m));
    this.on('error', (m) => this.logger.log('error', m));

    process.on('uncaughtException', (error) => this.logger.log('error', error));
  }
}
