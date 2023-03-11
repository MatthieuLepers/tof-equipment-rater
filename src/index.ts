// Invit BOT : https://discord.com/api/oauth2/authorize?client_id=1068967987903746098&permissions=274878024768&scope=bot
import path from 'path';
import dotenv from 'dotenv';
import BotClient from '@/js/classes/Client';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const client = new BotClient({
  commandPrefix: '!',
  owner: process.env.DISCORD_OWNER_ID,
  disableMentions: 'everyone',
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['divers', 'Divers'],
  ])
  .registerCommandsIn({
    dirname: path.join(__dirname, 'commands'),
    filter: /^([^.].*)\.(?:j|t)s(on)?$/,
    recursive: true,
  })
;

client.login(process.env.DISCORD_BOT_TOKEN);
