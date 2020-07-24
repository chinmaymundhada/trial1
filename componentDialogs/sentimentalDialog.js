const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const SentimentalCard = require('../resources/adaptiveCards/SentimentalCard');
const FormCard = require('../resources/adaptiveCards/FormCard');
const CARDS = [SentimentalCard, FormCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class SentimentalDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('programDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Chossing the program for requirement
            this.secondStep.bind(this),
            this.summaryStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId2,
            endpointKey: process.env.QnAEndpointKey2,
            host: process.env.QnAEndpointHostName2
        });
        this.qnaMaker = qnaMaker;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async firstStep(step) {
        endDialog = false;
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.
        await step.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(CARDS[0])]
        });
        return await step.prompt(TEXT_PROMPT, 'On which topic would you like more information about');
    }

    async secondStep(stepContext) {
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg);
        } else {
            // If no answers were returned from QnA Maker, reply with help.
            var msg5 = 'Sorry we are unable to answer that question. You can put up your query in the form below to get a call from our team';
            await stepContext.context.sendActivity(msg5);
            await stepContext.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
        }
        return await stepContext.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);
    }

    async summaryStep(step) {
        console.log(step.result);
        if (step.result === true) {
            endDialog = true;
            return await step.endDialog();
        } else if (step.result === false) {
            await step.context.sendActivity({
                text: 'If you wish to get in touch with us ,Please fill in your contact details in the form link provided below',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
            var msg1 = 'Thankyou for connecting with us. Hope you have a great day ahead';
            await step.context.sendActivity(msg1);
            endDialog = false;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.SentimentalDialog = SentimentalDialog;