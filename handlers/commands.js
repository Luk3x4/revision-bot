const client = require('../index');
const fs = require('fs');
const path = require('path')

module.exports = () => {
    const commandsPath = path.resolve('./', 'commands');
    const fileArr = fs.readdirSync(commandsPath);
    
    for(const file of fileArr){
        const command = require(path.resolve('commands', file));
    
        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        }
    }
}