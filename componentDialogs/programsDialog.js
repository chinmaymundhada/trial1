const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const ShivirCard = require('../resources/adaptiveCards/ShivirCard');
const FormCard = require('../resources/adaptiveCards/FormCard');
const CARDS = [ShivirCard, FormCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class ProgramDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('programDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Chossing the program for requirement
            this.programchoice.bind(this)
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
        return await step.prompt(CHOICE_PROMPT, 'Click on the respective program o get more information about it', ['Stress Free Life', 'Inner 90 & Hidden Infinity', 'Women Empowerment', 'Vichar Niyam Abhiyan', 'Inner Beauty']);
    }

    async programchoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Stress Free Life':
            await step.context.sendActivity({
                text: 'Stress Free Life',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Inner 90 & Hidden Infinity':
            await step.context.sendActivity({
                text: 'Inner 90, Hidden Infinity ',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Women Empowerment':
            await step.context.sendActivity({
                text: 'Women Empowerment',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Vichar Niyam Abhiyan':
            await step.context.sendActivity({
                text: 'Vichar Niyam Abhiyan',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Inner Beauty':
            await step.context.sendActivity({
                text: 'Inner Beauty',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports.ProgramDialog = ProgramDialog;
