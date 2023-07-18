const { REST, Routes } = require('discord.js');
require('dotenv').config()
const fs = require('fs');
const path = require('path');

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandPaths = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPaths).filter(item => item.endsWith('.js'));

for(const file of commandFiles){
    const filePath = path.join(commandPaths, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();