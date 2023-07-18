const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
            .setName('add')
            .setDescription('Adds question in the list')
            .addStringOption(option =>
                option
                    .setName('question')
                    .setDescription('Sets question')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('answer')
                    .setDescription('Sets Answer on question')
                    .setRequired(true)
            ),

    async execute(interaction){
        const question = interaction.options.getString('question')
        const answer = interaction.options.getString('answer');
     
        const { id } = await interaction.guild.members.fetch(interaction.user.id)
        const questionsPath = path.join(__dirname, '..', 'data', 'questions.json');
        const questionData = JSON.parse(await fs.readFile(questionsPath, 'utf-8'))

        questionData.cards.push({
            question,
            answer,
            userId: id,
            correctCount: 0,
            canShowAt: null
        })

        await fs.writeFile(questionsPath, JSON.stringify(questionData));

        interaction.reply('Question Successfully saved');
    }
}