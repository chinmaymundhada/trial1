const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');
const FormCard = require('../resources/adaptiveCards/FormCard');
const CARDS = [FormCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class SubscriptionDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('subscriptionDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Ask user for subcription he wants to know about
            this.programchoice.bind(this), // Show the list of events
            this.answerToQuery.bind(this) // answer to question

        ]));
        this.initialDialogId = WATERFALL_DIALOG;

        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId3,
            endpointKey: process.env.QnAEndpointKey3,
            host: process.env.QnAEndpointHostName3
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
        return await step.prompt(CHOICE_PROMPT, 'Which Subscription are you looking for?', ['Magazines', 'Voice Of Happy Thoughts']);
    }

    async programchoice(step) {
        switch (step.result.value) {
        case 'Magazines':
            return await step.prompt(TEXT_PROMPT, 'Enter your question');
        case 'Voice Of Happy Thoughts':
            return await step.prompt(TEXT_PROMPT, 'Enter your question');
        }
    }

    async answerToQuery(stepContext) {
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
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
        }
        endDialog = true;
        return await stepContext.endDialog();
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.SubscriptionDialog = SubscriptionDialog;
