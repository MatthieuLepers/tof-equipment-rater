import { CommandoClient, CommandoClientOptions } from 'discord.js-commando';
import Sequelize from 'sequelize/types/sequelize';

import SequelizeInstance from '@/js/db';
import { JobModel, UserSettingsModel } from '@/js/db/models';
import RateQueue from '@/js/classes/queue/RateQueue';
import WinstonInstance from '@/js/utils/WinstonInstance';
import type { ILogger } from '@/js/types';

export default class BotClient extends CommandoClient {
  logger: ILogger;

  rateQueue: RateQueue;

  database: Sequelize;

  constructor(options: CommandoClientOptions) {
    super(options);

    this.logger = WinstonInstance;
    this.rateQueue = new RateQueue(this);
    this.database = SequelizeInstance;

    this.on('ready', async () => {
      await this.database.authenticate()
        .then(() => { this.logger.log('info', 'Database connexion success'); })
        .catch((e) => { this.logger.log('error', `Database connexion failed ${e}`); })
      ;
      await JobModel.sync();
      await UserSettingsModel.sync();
      await this.rateQueue.loadJobsFromDatabase();

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

    if (process.env.DEV_MODE !== 'true') {
      process.on('uncaughtException', (error) => this.logger.log('error', error));
    }
  }
}
