import { Command, CommandoMessage } from 'discord.js-commando';
import type { Message } from 'discord.js';

import { serial } from '@/js/utils/PromiseUtils';
import type BotClient from '@/js/classes/Client';
import * as OcrSolutions from '@/ocr';
import { UserSettingsModel } from '@/js/db/models';
import Part from '@/js/classes/Part';

export default class RateCommand extends Command {
  declare client: BotClient;

  constructor(client: BotClient) {
    super(client, {
      name: 'rate',
      group: 'divers',
      memberName: 'rate',
      description: 'Rate an equipment part using screenshots.',
      ownerOnly: process.env.DEV_MODE === 'true',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 30,
      },
    });
  }

  async run(msg: CommandoMessage): Promise<Message | Message[] | null> {
    const files = [...msg.attachments.values()];

    if (!files.length) {
      return msg.reply('No screenshot found, my job ends here.');
    }

    const filteredFiles = files.filter((file) => {
      const fileExt = file.name!.replace(/^.*\.(jpe?g|png)$/, '$1');
      if (!['jpg', 'jpeg', 'png'].includes(fileExt)) {
        return false;
      }
      return true;
    });

    if (!filteredFiles.length) return msg.reply('I do not support this type of file, try with a *.png or *.jpg');

    await serial(filteredFiles.map((file) => async () => {
      try {
        const ocrText = await OcrSolutions.tesseract.getTextFromImage(file.url);

        if (ocrText) {
          const locale = await UserSettingsModel.getLocale(msg.author.id);
          const part = Part.fromOCR(ocrText, this.client.logger, locale);

          await msg.delete();

          await UserSettingsModel.setLocale(msg.author.id, part.locale);
          await msg.channel.send({
            content: `<@${msg.author.id}>`,
            embed: part.asMessageEmbed(file.url),
          });
        }
      } catch (e) {
        this.client.logger.log('error', e);
        await msg.channel.send((e as Error).message);
      }
    }));

    return null;
  }

  usage(): string {
    return [
      '**Usage**: `!rate` : Rate an equipment screenshot',
    ].join('\n');
  }
}
