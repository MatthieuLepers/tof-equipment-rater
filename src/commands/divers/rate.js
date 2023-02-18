const { Command } = require('discord.js-commando');
const Part = require('../../js/classes/Part');

module.exports = class RateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rate',
      memberName: 'rate',
      group: 'divers',
      description: 'Rate an equipment part using screenshot.\n!rate and post your screenshot',
      ownerOnly: process.env.DEV_MODE,
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
    });
  }

  async run(msg) {
    const [attachment] = msg.attachments;
    const [, file] = attachment;

    if (!file) {
      msg.reply('No screenshot found, my job ends there.');
      return;
    }

    const fileExt = file.name.replace(/^.*\.(jpe?g|png)$/, '$1');
    if (!['jpg', 'jpeg', 'png'].includes(fileExt)) {
      msg.reply('I do not support this type of file, try with a *.png or *.jpg');
    }

    // Send to user see notification
    await msg.react('👀');

    // Create OCR job and enqueue it
    const job = this.client.rateQueue.createJob({ file });
    await job.save();

    // Warn user about new queue system
    msg.reply('Hi! I have received your rate request and have placed it in the queue, I will mention you when I have the results.');

    // On job success
    job.on('succeeded', async (ocrText) => {
      console.log(`Received result for job ${job.id}: ${ocrText}`);

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
      msg.reply(err.message);
      await msg.reactions.resolve('👀').users.remove(this.client.user.id);
      await msg.react('❌');
    });
  }
};
