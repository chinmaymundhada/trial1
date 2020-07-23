const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');

const MNNaccomodation = require('../resources/adaptiveCards/MNNaccomodation.json');
const MNNaddress = require('../resources/adaptiveCards/MNNaddress.json');
const MNNreach = require('../resources/adaptiveCards/MNNreach.json');
const MNNpickup = require('../resources/adaptiveCards/MNNpickup.json');
const FormCard = require('../resources/adaptiveCards/FormCard');

const CARDS = [MNNaccomodation, MNNaddress, MNNreach, MNNpickup, FormCard];
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class MNNDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('TGFcentresDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.pincodeValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),
            this.TGFcentrechoice.bind(this),
            this.summaryStep.bind(this)
        ]));
        this.initialDialogId = WATERFALL_DIALOG;
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
        return await step.prompt(CHOICE_PROMPT, 'What do you want to know about MNN?', ['Address', 'Accomodation', 'How to reach', 'Pick from Kirkitwadi']);
    }

    async TGFcentrechoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Accomodation':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            var msg = 'Thank You !';
            await step.context.sendActivity(msg);
            return await step.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);

        case 'Address':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
            var msg1 = 'Thank You !';
            await step.context.sendActivity(msg1);
            return await step.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);

        case 'How to reach':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[2])]
            });
            var msg2 = 'Thank You !';
            await step.context.sendActivity(msg2);
            return await step.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);

        case 'Pick from Kirkitwadi':
            await step.context.sendActivity({
                text: '',
                attachments: [CardFactory.adaptiveCard(CARDS[3])]
            });
            var msg3 = 'Thank You !';
            await step.context.sendActivity(msg3);
            return await step.prompt(CONFIRM_PROMPT, 'Do you wish to continue?', ['yes', 'no']);
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
                attachments: [CardFactory.adaptiveCard(CARDS[4])]
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
module.exports.MNNDialog = MNNDialog;
