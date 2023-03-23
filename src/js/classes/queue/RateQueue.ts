import BeeQueue from 'bee-queue';
import dotenv from 'dotenv';
import type { Message } from 'discord.js';

import { JobModel, UserSettingsModel } from '@/js/db/models';
import Part from '@/js/classes/Part';
import type { IRateJob } from '@/js/types';
import type BotClient from '@/js/classes/Client';
import * as OcrSolutions from '@/ocr';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default class RateQueue extends BeeQueue {
  constructor(public bot: BotClient) {
    super('RateQueue', {
      removeOnSuccess: true,
      removeOnFailure: true,
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: 6379,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
      },
    });

    this.process(async (job: BeeQueue.Job<IRateJob>) => {
      this.bot.logger.log('info', `Processing job n°${job.id}`);
      const text = await OcrSolutions.tesseract.getTextFromImage(job.data.fileUrl);
      return text;
    });
  }

  async loadJobsFromDatabase() {
    const dbJobs = await JobModel.findAll({
      order: [
        ['updatedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    const results = await Promise.all(dbJobs.map((dbJob) => dbJob.enqueueJob(this.bot)));
    const addedJobs = results.reduce((acc, val) => acc + Number(val), 0);
    this.bot.logger.log('info', `${addedJobs} job${addedJobs > 1 ? 's' : ''} added to queue from database`);
  }

  async createRateJob(jobData: IRateJob, msg: Message, save = true): Promise<BeeQueue.Job<IRateJob>> {
    // Create OCR job and enqueue it
    const job = this.createJob<IRateJob>(jobData);
    await job.save();

    // On job success
    job.on('succeeded', async (ocrText) => {
      this.bot.logger.log('info', `Received result for job ${job.id}: "${ocrText}"`);

      try {
        const locale = await UserSettingsModel.getLocale(msg.author.id);
        const part = Part.fromOCR(ocrText, this.bot.logger, locale);
        await UserSettingsModel.setLocale(msg.author.id, part.locale);
        await msg.reply(`\`\`\`${part.rate()}\`\`\``);
        await this.deleteJob(job.data);
        await msg.react('✅');
      } catch (e) {
        this.bot.logger.log('error', e);
        await msg.reply((e as Error).message);
        await this.updateJob(job.data);
        await msg.react('❌');
      }
    });

    // On job failed
    job.on('failed', async (err) => {
      this.bot.logger.log('error', err);

      await msg.reply(err.message);
      await this.updateJob(job.data);
      await msg.react('❌');
    });

    if (save) {
      await JobModel.import(job);
    }

    return job;
  }

  async deleteJob(jobData: IRateJob) {
    await JobModel.destroy({
      where: {
        authorId: jobData.authorId,
        channelId: jobData.channelId,
        messageId: jobData.messageId,
      },
    });
  }

  private async updateJob(jobData: IRateJob) {
    const job = await JobModel.findByJobData(jobData);
    if (job) {
      job.retryCount -= 1;

      if (job.retryCount < 0) {
        await job.destroy();
      } else {
        job.updatedAt = new Date();
        await job.save();
        await job.enqueueJob(this.bot);
      }
    }
  }
}
