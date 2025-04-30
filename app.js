import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Client, GatewayIntentBits, Collection, Routes } from 'discord.js';
import { Player, GuildQueueEvent, StreamType } from 'discord-player';
import { YoutubeiExtractor } from 'discord-player-youtubei';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import play from './commands/play.js';
import pause from './commands/pause.js';
import skip from './commands/skip.js';
import exit from './commands/exit.js';
import loop from './commands/loop.js';
import queue from './commands/queue.js';

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_PATH = path.join(__dirname, 'commands');

// Initialize client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Command handling
const commands = [];
client.commands = new Collection();

client.commands.set(play.data.name, play);
commands.push(play.data.toJSON());

client.commands.set(pause.data.name, pause);
commands.push(pause.data.toJSON());

client.commands.set(skip.data.name, skip);
commands.push(skip.data.toJSON());

client.commands.set(exit.data.name, exit);
commands.push(exit.data.toJSON());

client.commands.set(loop.data.name, loop);
commands.push(loop.data.toJSON());

client.commands.set(queue.data.name, queue);
commands.push(queue.data.toJSON());

// Initialize player with optimized settings
const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    dlChunkSize: 0, // Disable chunking for better performance
  },
  smoothVolume: true,
  bufferingTimeout: 3000,
  connectionTimeout: 30000,
  skipFFmpeg: false, // Keep false unless you have specific needs
  useLegacyFFmpeg: false, // Use modern FFmpeg
  streamType: StreamType.Opus // Best audio quality
});

client.player = player;

// Register extractors
async function setupPlayer() {
  try {
    // Register all default extractors
    // await player.extractors.registerDefault();

    // Specific YouTube extractor configuration
    await player.extractors.register(YoutubeiExtractor, {
      quality: 'highestaudio',
      filter: 'audioonly',
      highWaterMark: 1 << 25,
      dlChunkSize: 0,
      requestOptions: {
        headers: {
          Cookie: process.env.YT_COOKIE || '' // Optional for age-restricted content
        }
      }
    });

    console.log('Player extractors initialized successfully');
  } catch (error) {
    console.error('Failed to initialize player extractors:', error);
  }
}

// Client events
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const guildIds = client.guilds.cache.map(guild => guild.id);

    await Promise.all(guildIds.map(guildId =>
      rest.put(
        Routes.applicationGuildCommands(process.env.APP_ID, guildId),
        { body: commands }
      )
    ));

    console.log('Successfully registered application commands');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    await interaction.reply({
      content: 'There was an error executing this command!',
      ephemeral: true
    });
  }
});

// Player events with error handling
player.events.on(GuildQueueEvent.PlayerStart, async (queue, track) => {
  try {
    await queue.metadata.channel.send(`🎶 Now playing: **${track.title}**`);
  } catch (error) {
    console.error('Error sending PlayerStart message:', error);
  }
});

player.events.on(GuildQueueEvent.PlayerFinish, async (queue, track) => {
  try {
    await queue.metadata.channel.send(`✅ Finished playing: **${track.title}**`);
  } catch (error) {
    console.error('Error sending PlayerFinish message:', error);
  }
});

// Error handling
player.events.on('error', (queue, error) => {
  console.error('Player error:', error);
  queue.metadata.channel.send('❌ An error occurred with the player').catch(console.error);
});

player.events.on('connectionError', (queue, error) => {
  console.error('Connection error:', error);
  queue.metadata.channel.send('❌ Connection error occurred').catch(console.error);
});

// Start bot
client.login(process.env.DISCORD_TOKEN)
  .then(setupPlayer)
  .catch(console.error);

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('Discord Music Bot is running!');
});