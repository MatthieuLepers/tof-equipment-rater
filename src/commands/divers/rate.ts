import { Command, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import Part from '@/js/classes/Part';
import { serial } from '@/js/utils/PromiseUtils';
import type BotClient from '@/js/classes/Client';

export default class RateCommand extends Command {
  constructor(public client: BotClient) {
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
      // Create OCR job and enqueue it
      const { username, tag } = msg.author;
      const job = this.client.rateQueue.createJob({ file, author: `${username}#${tag}` });
      await job.save();

      // On job success
      job.on('succeeded', async (ocrText) => {
        this.client.logger.log('info', `Received result for job ${job.id}: "${ocrText}"`);

        try {
          const part = Part.fromOCR(ocrText, this.client.logger);
          msg.reply(`\`\`\`${part.rate()}\`\`\``);
          await msg.react('✅');
        } catch (e) {
          this.client.logger.log('error', e);
          msg.reply((e as Error).message);
          await msg.react('❌');
        }
      });

      // On job failed
      job.on('failed', async (err) => {
        this.client.logger.log('error', err);

        msg.reply(err.message);
        await msg.react('❌');
      });

      return job;
    }));

    // Warn user about new queue system
    return msg.reply(`Hi! I have received your rate request and have palced ${jobs.length} task${jobs.length > 1 ? 's' : ''} in the queue, I will mention you when I have the results.`);
  }

  usage(): string {
    return '`!rate` : Rate an equipment screenshot';
  }
}
