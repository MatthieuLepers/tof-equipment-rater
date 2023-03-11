import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import type Queue from 'bee-queue';

import SequelizeInstance from '@/js/db';
import type { IRateJob } from '@/js/types';
import type BotClient from '@/js/classes/Client';

class JobModel extends Model<InferAttributes<JobModel>, InferCreationAttributes<JobModel>> {
  declare id?: number;

  declare fileUrl: string;

  declare authorId: string;

  declare channelId: string;

  declare messageId: string;

  declare createdAt: Date;

  async asQueueJob(client: BotClient): Promise<boolean> {
    const jobData: IRateJob = {
      fileUrl: this.fileUrl,
      authorId: this.authorId,
      channelId: this.channelId,
      messageId: this.messageId,
      createdAt: this.createdAt,
    };

    const channel = await client.channels.fetch(this.channelId);
    if (channel && channel.isText()) {
      const msg = await channel.messages.fetch(this.messageId);
      if (msg) {
        await client.rateQueue.createRateJob(jobData, msg, false);
        return true;
      }
      client.logger.log('info', `Unable to find msg '${this.messageId}' in channel '${this.channelId}', aborting`);
      await client.rateQueue.deleteJob(jobData);
    } else {
      client.logger.log('info', `Unable to find channel '${this.channelId}', aborting`);
      await client.rateQueue.deleteJob(jobData);
    }
    return false;
  }

  static async import(job: Queue.Job<IRateJob>) {
    await JobModel.create({
      fileUrl: job.data.fileUrl,
      authorId: job.data.authorId,
      channelId: job.data.channelId,
      messageId: job.data.messageId,
      createdAt: job.data.createdAt,
    });
  }
}

JobModel.init({
  id: {
    type: DataTypes.NUMBER,
    primaryKey: true,
    autoIncrement: true,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
}, {
  sequelize: SequelizeInstance,
  modelName: 'jobs',
});

export { JobModel };
