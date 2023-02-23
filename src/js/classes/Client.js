const { CommandoClient } = require('discord.js-commando');
const winston = require('winston');
const Queue = require('bee-queue');
const { default: getTextFromImage } = require('node-text-from-image');

module.exports = class BotClient extends CommandoClient {
  constructor(options) {
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
    this.rateQueue.process(async (job) => {
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
      this.user.setStatus(process.env.DEV_MODE === 'true' ? 'invisible' : 'online');
    });
    this.on('debug', (m) => this.logger.log('debug', m));
    this.on('warn', (m) => this.logger.log('warn', m));
    this.on('error', (m) => this.logger.log('error', m));

    process.on('uncaughtException', (error) => this.logger.log('error', error));
  }
};
