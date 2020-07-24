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
            this.secondStep.bind(this)
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
        return await step.prompt(TEXT_PROMPT, 'Which sentiment would you like explore today?');
    }

    async secondStep(stepContext) {
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg);
        } else {
            // If no answers were returned from QnA Maker, reply with help.
            var msg5 = 'Sorry we are unable to answer this question. You can put up your query in the form below and our team will get in touch with you soon!';
            await stepContext.context.sendActivity(msg5);
            await stepContext.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
        }
        endDialog = true;
        return await stepContext.endDialog();
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.SentimentalDialog = SentimentalDialog;
