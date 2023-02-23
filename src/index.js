// Invit BOT : https://discord.com/api/oauth2/authorize?client_id=1068967987903746098&permissions=274878024768&scope=bot
const path = require('path');
const dotenv = require('dotenv');
const CommandoClient = require('./js/classes/Client');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const client = new CommandoClient({
  commandPrefix: '!',
  owner: process.env.DISCORD_OWNER_ID,
  disableMentions: 'everyone',
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['divers', 'Divers'],
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'))
;

client.login(process.env.DISCORD_BOT_TOKEN);
