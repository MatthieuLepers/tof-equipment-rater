const { Command } = require('discord.js-commando');
const Usage = require('../Usage');

module.exports = class HelloCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'usage',
      memberName: 'usage',
      group: 'divers',
      description: 'Get some help for my commands\n!usage <commandName>.',
      guildOnly: false,
      throttling: {
        usages: 2,
        duration: 10,
      },
      args: [
        {
          key: 'commandName',
          prompt: 'For which order do you need information?',
          type: 'string',
          validate: (val) => Object.keys(Usage).includes(val),
        },
      ],
    });
  }

  async run(msg, { commandName }) {
    if (Usage[commandName]) {
      const { usage, text, example } = Usage[commandName];
      msg.say(`Usage: ${usage}\n${text}\nExample: ${example}`);
    } else {
      msg.say(`No command named "${commandName}"`);
    }
  }
};
