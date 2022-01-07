require('dotenv').config();

const { version } = require('./package.json');
console.log(`UVBot-76 version ${version} initializing`);

const { Client, Intents } = require('discord.js');
const { joinChannel } = require('./util');

const bot = new Client({
  partials: [
    // basically everything except MESSAGE
    'CHANNEL',
    'GUILD_MEMBER',
    'GUILD_SCHEDULED_EVENT',
    'REACTION',
    'USER'
  ],
  intents: [
    Intents.FLAGS.GUILDS, // discord.js is broken
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES
  ],
  presence: {
    activities: [
      {
        type: 'LISTENING',
        name: 'UVB-76'
      }
    ]
  },
  userAgentSuffix: [ `uvbot76/${version}` ],
  allowedMentions: {
    repliedUser: false,
    parse: []
  }
});

const BOT_INVITE_OPTIONS = {
  scopes: [ 'bot', 'applications.commands' ],
  permissions: [
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'CONNECT',
    'SPEAK'
  ]
};

bot.on('ready', () => {
  console.log('Bot entered READY state');
});

bot.on('messageCreate', async msg => {
  if (msg.author.bot) return;
  const [prefix, command, ...args] = msg.content.split(/ +/g);
  if (!new RegExp(`<@!?${bot.user.id}>`).test(prefix)) return;
  // I'm sure if this bot was any more complex there would be a proper command handler,
  // but I don't really care enough to do all that.
  switch (command) {
    case 'join':
      if (!msg.guild) return msg.reply('You must run this command in a server to continue');
      const result = joinChannel(msg.guild, msg.member.voice.channelId).then(() => {
        msg.reply('Joined!');
      }).catch(e => {
        console.error(e);
        msg.reply('Error: ' + e.message);
      });
      break;
    case 'leave':
      msg.guild.me.voice.disconnect();
      break;
    case 'invite':
      return msg.reply(bot.generateInvite(BOT_INVITE_OPTIONS));
      break;
  }
});

bot.on('interactionCreate', async interaction => {
  if (!interaction.isApplicationCommand()) return;
  switch (interaction.commandName) {
    case 'join':
      if (!interaction.inGuild()) return interaction.reply({ content: 'You must run this command in a server to continue' });
      await joinChannel(interaction.guild, interaction.guild.members.resolve(interaction.user.id).voice.channelId).then(() => {
        interaction.reply({ content: 'Joined!' });
      }).catch(e => {
        console.error(e);
        interaction.reply({ content: 'Error: ' + e.message });
      });
      break;
    case 'leave':
      interaction.guild.me.voice.disconnect();
      interaction.reply({ content: 'Ok', ephemeral: true });
      break;
    case 'invite':
      interaction.reply({ content: bot.generateInvite(BOT_INVITE_OPTIONS) });
      break;
    default:
      interaction.reply({ content: 'Unexpected command', ephemeral: true });
  }
})

bot.login(process.env.TOKEN);