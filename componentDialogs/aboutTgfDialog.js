const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const OurFounder = require('../resources/adaptiveCards/OurFounder');
const OurVision = require('../resources/adaptiveCards/OurVision');
const OurMission = require('../resources/adaptiveCards/OurMission');
const FormCard = require('../resources/adaptiveCards/FormCard');
const CARDS = [OurFounder, OurVision, OurMission, FormCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class AboutTGFDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('TGFcentresDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // User can choose what he wants to know about
            this.resultCase.bind(this)
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
        return await step.prompt(CHOICE_PROMPT, 'What would you like to know about today?', ['Our Founder', 'Our Vision', 'Our Mission']);
    }

    async resultCase(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Our Founder':
            await step.context.sendActivity({
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Our Vision':
            await step.context.sendActivity({
                attachments: [CardFactory.adaptiveCard(CARDS[1])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Our Mission':
            await step.context.sendActivity({
                attachments: [CardFactory.adaptiveCard(CARDS[2])]
            });
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}
module.exports.AboutTGFDialog = AboutTGFDialog;
