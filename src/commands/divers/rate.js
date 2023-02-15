const { Command } = require('discord.js-commando');
const { default: getTextFromImage } = require('node-text-from-image');
const Part = require('../../js/classes/Part');

module.exports = class RateCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rate',
      memberName: 'rate',
      group: 'divers',
      description: 'Rate an equipment part using screenshot.\n!rate and post your screenshot',
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

    try {
      await msg.react('👀');

      if (!file) {
        throw new Error('No screenshot found, my job ends there.');
      }

      const fileExt = file.name.replace(/^.*\.(jpe?g|png)$/, '$1');
      if (!['jpg', 'jpeg', 'png'].includes(fileExt)) {
        throw new Error('I do not support this type of file, try with a *.png or *.jpg');
      }

      const text = await getTextFromImage(file.url);
      const part = Part.fromOCR(text, this.client.logger);

      msg.reply(`\`\`\`${part.rate()}\`\`\``);
    } catch (e) {
      this.client.logger.log('error', e);
      await msg.react('❌');
      msg.reply(`\`\`\`${e.message}\`\`\``);
    } finally {
      await msg.reactions.resolve('👀').users.remove(this.client.user.id);
    }

    await msg.react('✅');
  }
};
