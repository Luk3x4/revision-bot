const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

module.exports = { 
    cooldown: 5,
    data: new SlashCommandBuilder()
            .setName('revise')
            .setDescription('Selects random question from the list'),
    async execute(interaction) {
        await interaction.deferReply({ ephmeral: true });

        const questionsPath = path.join(__dirname, '..', 'data', 'questions.json');
        const AllQuestionData = JSON.parse(await fs.readFile(questionsPath, 'utf-8'))
        const questionData = AllQuestionData.cards.filter(item => item.userId === interaction.user.id)

        const getRandom = (array) => {
            return array[Math.floor(Math.random() * array.length)]
        }

        const createEmbed = question => new EmbedBuilder().setColor(0x0099FF).setTitle('Session').addFields({
            name: 'Question', value: question.question, inline: true
        })

        const createButton = (name, style) => new ButtonBuilder()
                            .setCustomId(name.split('').join('').toLowerCase())
                            .setLabel(name)
                            .setStyle(style);

        const showableCards = questionData.filter(item => {
            if(item.canShowAt === null) return true
            return new Date(item.canShowAt) < new Date();
        })

        if(!showableCards.length) return interaction.followUp('No more questions left');

        const prioritisedCards = questionData.filter(item => {
            if(item.canShowAt === null) return false
            return new Date(item.canShowAt) < new Date();
        })

        const showAnswer = createButton('Show Answer', ButtonStyle.Primary)
        
        const showAnswerRow = new ActionRowBuilder()
            .addComponents(showAnswer)
        
        const currentQuestion = !prioritisedCards.length ? getRandom(showableCards): getRandom(prioritisedCards);
        const sessionEmbed = createEmbed(currentQuestion)
        const response = await interaction.editReply({ content: currentQuestion.question, embeds: [sessionEmbed], components: [showAnswerRow]})
        const collectionFilter = i => i.user.id === interaction.user.id
    
        try{
            const button = await response.awaitMessageComponent({ filter: collectionFilter, time: 60_000 });
            
            const Incorrect = createButton('Incorrect', ButtonStyle.Danger)
            const Correct = createButton('Correct', ButtonStyle.Success)
                
            const correctOrNot = new ActionRowBuilder()
                                .addComponents(Correct, Incorrect);
            
            const confirmationEmbed = createEmbed(currentQuestion).addFields({
                name: 'Answer', value: currentQuestion.answer,
            })

            const res = await button.update({ content: `Answer: ${currentQuestion.answer}`, embeds: [confirmationEmbed], components: [correctOrNot] });
            const questionStatus = await res.awaitMessageComponent({ filter: collectionFilter, time: 60000 });


            switch(questionStatus.customId){
                case 'correct':
                    currentQuestion.correctCount++

                    const showAtDate = new Date()
                    switch(currentQuestion.correctCount){
                        case 1:
                            currentQuestion.canShowAt = showAtDate.setDate(showAtDate.getDate() + 1)
                            break;
                        case 2:
                            currentQuestion.canShowAt = showAtDate.setDate(showAtDate.getDate() + 7)
                            break;
                        case 3:
                            currentQuestion.canShowAt = showAtDate.setMonth(showAtDate().getMonth() + 1);
                            break;
                        case 4:
                            currentQuestion.canShowAt = showAtDate.setMonth(showAtDate().getMonth() + 2);
                            break;
                        default:
                            currentQuestion.canShowAt = showAtDate.setFullYear(showAtDate.getFullYear() + 1)
                    }

                    break;
                case 'incorrect': 
                        currentQuestion.correctCount = 0;
                        const questionDate = new Date(new Date().getTime() + 60000).getTime()
                        currentQuestion.canShowAt = questionDate;
                    break;
                }
                await interaction.editReply({ content: 'Session ended', components: [], embeds: [] })
                await fs.writeFile(questionsPath, JSON.stringify(AllQuestionData));
        }catch{
            await interaction.editReply({ content: 'Interaction hasn\'t been received during 1 minute', components: [], embeds: []})
        }
    }
}