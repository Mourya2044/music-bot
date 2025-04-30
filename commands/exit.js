import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';

export const exit = {
    data: new SlashCommandBuilder()
        .setName('exit')
        .setDescription('Stop playback and disconnect the bot from the voice channel'),
    
    execute: async (interaction) => {
        try {
            if (!interaction.guildId) {
                return interaction.reply('This command can only be used in a server.');
            }

            const queue = useQueue(interaction.guildId);
            
            if (!queue) {
                return interaction.reply({
                    content: '❌ There is no active music session in this server.',
                    ephemeral: true
                });
            }

            if (!queue.isPlaying()) {
                return interaction.reply({
                    content: '❌ There is no track currently playing.',
                    ephemeral: true
                });
            }

            // Destroy the entire queue and disconnect
            queue.delete();
            
            return interaction.reply({
                content: '⏹️ Stopped playback and disconnected from the voice channel.',
                ephemeral: false
            });
            
        } catch (error) {
            console.error('Error in exit command:', error);
            return interaction.reply({
                content: '❌ An error occurred while trying to stop playback.',
                ephemeral: true
            });
        }
    }
};

export default exit;