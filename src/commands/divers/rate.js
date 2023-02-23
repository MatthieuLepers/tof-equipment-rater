const { Command } = require('discord.js-commando');
const Part = require('../../js/classes/Part');
const { serial } = require('../../js/utils/PromiseUtils');

module.exports = class RateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rate',
      memberName: 'rate',
      group: 'divers',
      description: 'Rate an equipment part using screenshots.\n!rate and post your screenshots',
      ownerOnly: process.env.DEV_MODE === 'true',
      guildOnly: false,
      throttling: {
        usages: 1,
        duration: 30,
      },
    });
  }

  async run(msg) {
    const [attachment] = msg.attachments;
    const [, ...files] = attachment;

    if (!files.length) {
      msg.reply('No screenshot found, my job ends there.');
      return;
    }

    const filteredFiles = files.filter((file) => {
      const fileExt = file.name.replace(/^.*\.(jpe?g|png)$/, '$1');
      if (!['jpg', 'jpeg', 'png'].includes(fileExt)) {
        msg.reply('I do not support this type of file, try with a *.png or *.jpg');
        return false;
      }
      return true;
    });

    const jobs = await serial(filteredFiles.map((file) => async () => {
      // Send to user see notification
      await msg.react('👀');

      // Create OCR job and enqueue it
      const { username, tag } = msg.author;
      const job = this.client.rateQueue.createJob({ file, author: `${username}#${tag}` });
      await job.save();

      // On job success
      job.on('succeeded', async (ocrText) => {
        this.client.logger.log(`Received result for job ${job.id}: "${ocrText}"`);

        try {
          const part = Part.fromOCR(ocrText, this.client.logger);
          msg.reply(`\`\`\`${part.rate()}\`\`\``);
          await msg.react('✅');
        } catch (e) {
          this.client.logger.log('error', e);
          msg.reply(e.message);
          await msg.react('❌');
        } finally {
          await msg.reactions.resolve('👀').users.remove(this.client.user.id);
        }
      });

      // On job failed
      job.on('failed', async (err) => {
        this.client.logger.log('error', err);

        msg.reply(err.message);
        await msg.reactions.resolve('👀').users.remove(this.client.user.id);
        await msg.react('❌');
      });

      return job;
    }));

    // Warn user about new queue system
    msg.reply(`Hi! I have received your rate request and have palced ${jobs.length} task${jobs.length > 1 ? 's' : ''} in the queue, I will mention you when I have the results.`);
  }
};
