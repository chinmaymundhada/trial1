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
            this.TGFcentreDetails2.bind(this)
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
        return await step.prompt(CHOICE_PROMPT, 'Location of the required shivir/retreat ?', ['India', 'International']);
    }

    async TGFcentrechoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'India':
            return await step.prompt(CHOICE_PROMPT, 'Choose one mode to get the location of shivir/retreat?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'International':
            return await step.prompt(CHOICE_PROMPT, 'Which country are you from?', ['Canada', 'Australia', 'USA']);
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
            return await step.prompt(TEXT_PROMPT, 'Enter the your district to know Tejasthan around you');
        case 'Canada':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'Australia':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        case 'USA':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Centres near me', 'Centres by pin code', 'Centres by city name']);
        }
    }

    async TGFcentreDetails1(stepContext) {
        console.log(stepContext.result.value);
        switch (stepContext.result.value) {
        case 'Centres near me':
            await stepContext.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
            endDialog = true;
            return await stepContext.endDialog();
        case 'Centres by pin code':
            return await stepContext.prompt(NUMBER_PROMPT, 'Enter the pincode of your city(Pincode is 6-digit unique identification number of your city)');
        case 'Centres by city name':
            return await stepContext.prompt(TEXT_PROMPT, 'Enter the your district to know Tejasthan around you');
        }
        stepContext.values.indiaValues = stepContext.result;
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg4 = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg4);
            endDialog = true;
            return await stepContext.endDialog();
        } else {
            // If answer is not returned by QnA but  pincode is entered
            if (typeof (stepContext.result) === 'number') {
                var msg3 = 'No Tejasthan is located in city with this pincode or your pincode is invalid';
                await stepContext.context.sendActivity(msg3);
                endDialog = true;
                return await stepContext.endDialog();
            } else {
                var msg5 = 'No Tejasthan is located in the city';
                await stepContext.context.sendActivity(msg5);
                endDialog = true;
                return await stepContext.endDialog();
            }
        }
    }

    async TGFcentreDetails2(stepContext) {
        console.log(stepContext.result.value);
        stepContext.values.internationalValues = stepContext.result;
        var result = await this.qnaMaker.getAnswers(stepContext.context);
        if (result[0]) {
            var msg4 = `${ result[0].answer } `;
            await stepContext.context.sendActivity(msg4);
            endDialog = true;
            return await stepContext.endDialog();
        } else {
            // If no answers were returned from QnA Maker, reply with help.
            if (typeof (stepContext.result) === 'number') {
                var msg3 = 'No Tejsthan is located in city with this pincode or your pincode is invalid';
                await stepContext.context.sendActivity(msg3);
                endDialog = true;
                return await stepContext.endDialog();
            } else {
                var msg5 = 'No Tejsthan is located in the city';
                await stepContext.context.sendActivity(msg5);
                endDialog = true;
                return await stepContext.endDialog();
            }
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
