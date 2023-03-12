import { Command, CommandoMessage } from 'discord.js-commando';
import type { Message } from 'discord.js';

import type BotClient from '@/js/classes/Client';
import { UserSettingsModel } from '@/js/db/models';

const AVAILABLE_LANG: { [key: string]: string } = {
  fr: 'fr-FR',
  en: 'en-EN',
};

export default class SetLangCommand extends Command {
  declare client: BotClient;

  constructor(client: BotClient) {
    super(client, {
      name: 'setlang',
      group: 'divers',
      memberName: 'setlang',
      description: 'Select an available process language',
      ownerOnly: process.env.DEV_MODE === 'true',
      guildOnly: false,
      args: [
        {
          key: 'lang',
          prompt: `What processing language do you want to use?\nAvailable: ${Object.keys(AVAILABLE_LANG).map((l) => `\`${l}\``).join(', ')}`,
          type: 'string',
        },
      ],
    });
  }

  async run(msg: CommandoMessage, { lang }: { lang: string }): Promise<Message | Message[]> {
    if (!Object.keys(AVAILABLE_LANG).includes(lang.toLowerCase())) {
      return msg.reply(this.usage());
    }

    await UserSettingsModel.setLocale(msg.author.id, AVAILABLE_LANG[lang]);

    return msg.reply(`Processing language set to \`${lang}\``);
  }

  usage(): string {
    return [
      `**Usage**: \`!setlang <lang>\` : lang parameter should be in available languages ${Object.keys(AVAILABLE_LANG).map((l) => `\`${l}\``).join(', ')}`,
      '**Example**:',
      '`!setlang fr` : Use french as process language',
      '`!setlang en` : Use english as process language',
    ].join('\n');
  }
}
