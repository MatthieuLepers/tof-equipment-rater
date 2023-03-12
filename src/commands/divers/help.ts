import { Command, CommandoMessage } from 'discord.js-commando';

import type BotClient from '@/js/classes/Client';
import { Message } from 'discord.js';

export default class HelpCommand extends Command {
  declare client: BotClient;

  constructor(client: BotClient) {
    super(client, {
      name: 'help',
      group: 'divers',
      memberName: 'help',
      description: 'Get help about my commands',
      guildOnly: false,
    });
  }

  async run(msg: CommandoMessage): Promise<Message | Message[]> {
    const result = [
      'Available commands:',
      '',
    ];

    [...this.client.registry.commands.keys()].forEach((key) => {
      const cmd = this.client.registry.commands.get(key);
      if (cmd) {
        result.push(`- \`${this.client.commandPrefix}${cmd.name}\` : ${cmd.description}`);
        result.push(cmd.usage());
        result.push('');
      }
    });

    return msg.say(result.join('\n'));
  }
}
