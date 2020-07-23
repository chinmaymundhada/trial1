const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { QnAMaker } = require('botbuilder-ai');
const { CardFactory } = require('botbuilder');

const PaymentLink = require('../resources/adaptiveCards/PaymentLink.json');
const Form = require('../resources/adaptiveCards/FormCard.json');
const CARDS = [PaymentLink, Form];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class DonationDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('TGFcentresDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.PaymentChoice.bind(this),
            this.Details.bind(this),
            this.Answers.bind(this)
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
        return await step.prompt(CHOICE_PROMPT, 'Where do you want to make donation ?', ['Mobile Application', 'TGF Website']);
    }

    async PaymentChoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Mobile Application':
            return await step.prompt(CHOICE_PROMPT, 'You can choose any of this', ['Payment Link', 'FAQs']);
        case 'TGF Website':
            return await step.prompt(CHOICE_PROMPT, 'You can choose any of this', ['Payment Link', 'FAQs']);
        }
    }

    async Details(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Payment Link':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'FAQs':
            return await step.prompt(TEXT_PROMPT, 'Enter any query you have');
        }
    }

    async Answers(stepContext) {
        console.log(stepContext.result.value);
        stepContext.values.Question = stepContext.result;
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg4 = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg4);
            endDialog = true;
            return await stepContext.endDialog();
        } else {
            var msg5 = 'Sorry we are unable to answer that question. You can put up your query in the form below to get a call from our team';
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
module.exports.DonationDialog = DonationDialog;
