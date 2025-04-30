import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

const skip = {
    data: new SlashCommandBuilder()
        .setName('skip') // Command name
        .setDescription('Skip the currently playing song'), // Command description

    execute: (interaction) => {
        // Get the current queue
        const queue = useQueue();

        if (!queue) {
            return interaction.reply(
                'This server does not have an active player session.',
            );
        }

        if (!queue.isPlaying()) {
            return interaction.reply('There is no track playing.');
        }

        // Skip the current track
        queue.node.skip();

        // Send a confirmation message
        return interaction.reply('The current song has been skipped.');
    }
}

export default skip;