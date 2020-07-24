const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { QnAMaker } = require('botbuilder-ai');
const { CardFactory } = require('botbuilder');
const FormCard = require('../resources/adaptiveCards/FormCard.json');
const Maps = require('../resources/adaptiveCards/Maps.json');

const CARDS = [FormCard, Maps];
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class TGFcentresDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('TGFcentresDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.pincodeValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Ask for region
            this.TGFcentrechoice.bind(this), // Get choice for region
            this.TGFcentreDetails.bind(this),
            this.TGFcentreDetails1.bind(this), // Show the region
            this.summaryStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId1,
            endpointKey: process.env.QnAEndpointKey1,
            host: process.env.QnAEndpointHostName1
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
        return await step.prompt(CHOICE_PROMPT, 'Which country are you from?', ['India', 'Canada', 'Australia', 'USA']);
    }

    async TGFcentrechoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'India':
            return await step.prompt(CHOICE_PROMPT, 'Choose one mode to get the location of shivir/retreat?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'Australia':
            return await step.prompt(CHOICE_PROMPT, 'Choose one mode to get the location of shivir/retreat?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'USA':
            return await step.prompt(CHOICE_PROMPT, 'Choose one mode to get the location of shivir/retreat?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'Canada':
            return await step.prompt(CHOICE_PROMPT, 'Choose one mode to get the location of shivir/retreat?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        }
    }

    async TGFcentreDetails(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Centres near me':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Centres by pin code':
            return await step.prompt(NUMBER_PROMPT, 'Enter the pincode of your city(Pincode is 6-digit unique identification number of your city)');
        case 'Centres by city name':
            return await step.prompt(TEXT_PROMPT, 'Enter the district to know about the Tejasthan located in the respective district');
        }
    }

    async TGFcentreDetails1(stepContext) {
        console.log(stepContext.result.value);
        stepContext.values.indiaValues = stepContext.result;
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg4 = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg4);
            return await stepContext.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);
        } else {
            // If answer is not returned by QnA but  pincode is entered
            if (typeof (stepContext.result) === 'number') {
                var msg3 = 'No Tejasthan is located in city with this pincode or your pincode is invalid';
                await stepContext.context.sendActivity(msg3);
                return await stepContext.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);
            } else {
                var msg5 = 'No Tejasthan is located in the specified city';
                await stepContext.context.sendActivity(msg5);
                return await stepContext.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);
            }
        }
    }

    async summaryStep(step) {
        console.log(step.result);
        if (step.result === true) {
            endDialog = true;
            return await step.endDialog();
        } else if (step.result === false) {
            await step.context.sendActivity({
                text: 'If you wish to get in touch with us ,Please fill in your contact details in the form link provided below',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            var msg1 = 'Thankyou for connecting with us. Hope you have a great day ahead';
            await step.context.sendActivity(msg1);

            endDialog = false;
            return await step.endDialog();
        }
    }

    async pincodeValidator(promptContext) {
        console.log(promptContext.recognized.value);
        // This condition is our validation rule. You can also change the value at this point.
        return promptContext.recognized.succeeded && promptContext.recognized.value > 100000 && promptContext.recognized.value < 999999;
    }

    async isDialogComplete() {
        return endDialog;
    }
}
module.exports.TGFcentresDialog = TGFcentresDialog;
