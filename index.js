const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection()

module.exports = client;

['commands', 'events'].forEach(element => {
    require(`./handlers/${element}`)()
});

client.login(process.env.TOKEN);