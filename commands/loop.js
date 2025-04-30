import { SlashCommandBuilder } from 'discord.js';
import { QueueRepeatMode, useQueue } from 'discord-player';

const loop = {
  data: new SlashCommandBuilder()
    .setName('loop') // Command name
    .setDescription('Loop the queue in different modes') // Command description
    .addNumberOption((option) =>
      option
        .setName('mode') // Option name
        .setDescription('The loop mode') // Option description
        .setRequired(true) // Option is required
        .addChoices(
          {
            name: 'Off',
            value: QueueRepeatMode.OFF,
          },
          {
            name: 'Track',
            value: QueueRepeatMode.TRACK,
          },
          {
            name: 'Queue',
            value: QueueRepeatMode.QUEUE,
          },
          {
            name: 'Autoplay',
            value: QueueRepeatMode.AUTOPLAY,
          },
        ),
    ),

  execute: (interaction) => {
    // Get the current queue
    const queue = useQueue();

    if (!queue) {
      return interaction.reply(
        'This server does not have an active player session.',
      );
    }

    // Get the loop mode
    const loopMode = interaction.options.getNumber('mode');

    // Set the loop mode
    queue.setRepeatMode(loopMode);

    // Send a confirmation message
    return interaction.reply(`Loop mode set to ${QueueRepeatMode[loopMode]}`);
  }
}

export default loop;