import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import type Queue from 'bee-queue';
import type { TextChannel } from 'discord.js';

import SequelizeInstance from '@/js/db';
import type { IRateJob } from '@/js/types';
import type BotClient from '@/js/classes/Client';

class JobModel extends Model<InferAttributes<JobModel>, InferCreationAttributes<JobModel>> {
  declare id?: number;

  declare fileUrl: string;

  declare authorId: string;

  declare channelId: string;

  declare messageId: string;

  declare retryCount: number;

  declare createdAt: Date;

  declare updatedAt: Date;

  static async findByJobData(jobData: IRateJob): Promise<JobModel | null> {
    return JobModel.findOne({
      where: {
        channelId: jobData.channelId,
        messageId: jobData.messageId,
        authorId: jobData.authorId,
      },
    });
  }

  async enqueueJob(client: BotClient): Promise<boolean> {
    const jobData: IRateJob = {
      fileUrl: this.fileUrl,
      authorId: this.authorId,
      channelId: this.channelId,
      messageId: this.messageId,
      retryCount: this.retryCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    try {
      const channel = await client.channels.fetch(this.channelId);
      if (channel && channel.isText()) {
        await client.rateQueue.createRateJob(jobData, channel as TextChannel, false);
        return true;
      }
      client.logger.log('info', `Unable to find channel '${this.channelId}', aborting`);
      await client.rateQueue.deleteJob(jobData);
      return false;
    } catch (e) {
      return false;
    }
  }

  static async import(job: Queue.Job<IRateJob>) {
    await JobModel.create({
      fileUrl: job.data.fileUrl,
      authorId: job.data.authorId,
      channelId: job.data.channelId,
      messageId: job.data.messageId,
      retryCount: 1,
      createdAt: job.data.createdAt,
      updatedAt: job.data.updatedAt,
    });
  }
}

JobModel.init({
  id: {
    type: DataTypes.INTEGER,
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
  retryCount: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  messageId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize: SequelizeInstance,
  modelName: 'jobs',
});

export { JobModel };
