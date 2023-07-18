const fs = require('fs');
const path = require('path')
const client = require('../index')

module.exports = () => {
    const eventsPath = path.resolve('./', 'events');
    const events = fs.readdirSync(eventsPath).filter(item => item.endsWith('.js'));

    events.forEach(item => {
        const event = require(path.join(eventsPath, item));
        if(event.once) {
            client.once(event.name, (...args) =>  event.execute(...args))
        }else {
            client.on(event.name, (...args) =>  event.execute(...args))
        }
    })
}