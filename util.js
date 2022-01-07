const {
  generateDependencyReport,
  joinVoiceChannel,
  entersState,
  createAudioResource,
  createAudioPlayer,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus
} = require('@discordjs/voice');
console.log(generateDependencyReport())

const UVB76_STREAM = createAudioResource('http://stream.fadedmax.net/buzzer', {
  inputType: StreamType.Arbitrary
});
const UVB76_PLAYER = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause
  }
});
UVB76_PLAYER.play(UVB76_STREAM);

/**
 * Joins a Discord voice channel and starts broadcasting the UVB-76 stream URL.
 * @param {import('discord.js').Guild} guild The ID of the guild that the voice channel is in
 * @param {BigInt|string} channelId The ID of the voice channel to start broadcasting to.
 */
async function joinChannel(guild, channelId) {
  if (!guild) throw new Error('Unexpected error - missing guild info');
  if (!channelId) throw new Error('You must be in a voice channel to continue');
  const connection = joinVoiceChannel({
    guildId: guild.id,
    channelId,
    selfDeaf: true,
    selfMute: false,
    adapterCreator: guild.voiceAdapterCreator
  });
  if (!connection) throw new Error('Voice connection not made - maybe I don\'t have permission to join the voice channel?');
  await entersState(connection, VoiceConnectionStatus.Ready, 10e3);
  connection.subscribe(UVB76_PLAYER);
  return;
}

module.exports = { joinChannel };