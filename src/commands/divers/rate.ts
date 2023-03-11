import { Command, CommandoMessage } from 'discord.js-commando';
import type { Message } from 'discord.js';

import { serial } from '@/js/utils/PromiseUtils';
import type { IRateJob } from '@/js/types';
import type BotClient from '@/js/classes/Client';

export default class RateCommand extends Command {
  declare client: BotClient;

  constructor(client: BotClient) {
    super(client, {
      name: 'rate',
      group: 'divers',
      memberName: 'rate',
      description: 'Rate an equipment part using screenshots.\n!rate and post your screenshots',
      ownerOnly: process.env.DEV_MODE === 'true',
      guildOnly: false,
      throttling: {
        usages: 1,
        duration: 30,
      },
    });
  }

  async run(msg: CommandoMessage): Promise<Message | Message[]> {
    const files = [...msg.attachments.values()];

    if (!files.length) {
      return msg.reply('No screenshot found, my job ends there.');
    }

    const filteredFiles = files.filter((file) => {
      const fileExt = file.name!.replace(/^.*\.(jpe?g|png)$/, '$1');
      if (!['jpg', 'jpeg', 'png'].includes(fileExt)) {
        return false;
      }
      return true;
    });

    if (!filteredFiles.length) return msg.reply('I do not support this type of file, try with a *.png or *.jpg');

    const jobs = await serial(filteredFiles.map((file) => async () => {
      const jobData: IRateJob = {
        fileUrl: file.url,
        authorId: msg.author.id,
        channelId: msg.channel.id,
        messageId: msg.id,
        createdAt: new Date(),
      };
      const job = await this.client.rateQueue.createRateJob(jobData, msg, true);
      return job;
    }));

    // Warn user about new queue system
    return msg.reply(`Hi! I have received your rate request and have placed ${jobs.length} task${jobs.length > 1 ? 's' : ''} in the queue, I will mention you when I have the results.`);
  }

  usage(): string {
    return '`!rate` : Rate an equipment screenshot';
  }
}
