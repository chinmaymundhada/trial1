const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');
const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const Shivircard = require('../resources/adaptiveCards/ShivirCard');
const CARDS = [Shivircard];
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class ShivirDialog extends ComponentDialog {
    constructor(conservsationState, userState) {
        super('shivirDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Ask user for selection of region
            this.shivirchoice.bind(this), // choice of Shivir
            this.shivirDetails.bind(this), // First detail stage of Shivir
            this.shivirWiseDetail.bind(this), // Second detail stage of Shivir
            this.MahaAsmaniInDetail.bind(this), // Mahaasmani Shivir in detail
            this.MahaAsmaniInDetail2.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
            this.CityWise.bind(this)
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
        return await step.prompt(CHOICE_PROMPT, 'In which region Shivir are you looking for?', ['India', 'International']);
    }

    async shivirchoice(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'India':
            return await step.prompt(CHOICE_PROMPT, 'Which Shivir are you looking for?', ['Maha Ashmani Param Gyan Shivir', 'Mini Maha Asmani', 'Sampoorna Swasth Shivir', 'Dhyan Mandir', 'Family Shivir', 'Open Day/Anekant Shivir', 'Online Retreats', 'Parenting Shivir', 'Husband Wife Shivir']);
        case 'International':
            return await step.prompt(CHOICE_PROMPT, 'Which Shivir are you looking for?', ['Maha Ashmani Shivir', 'Mini Maha Asmani Shivir', 'International Dhyan Mandir', 'International Family Shivir']);
        }
    }

    async shivirDetails(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Maha Ashmani Param Gyan Shivir':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Regular Process', 'At Manan Ashram']);

        case 'Mini Maha Asmani':
            await step.context.sendActivity({
                text: 'Mini MahaAsmani Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Sampoorna Swasth Shivir':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Basic Swastha Shivir', 'Advanced Swastha Shivir']);

        case 'Dhyan Mandir':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Basic Dhyan Mandir', 'Advanced Dhyan Mandir']);

        case 'Family Shivir':
            await step.context.sendActivity({
                text: 'Family Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Open Day/Anekant Shivir':
            await step.context.sendActivity({
                text: 'Open Day/Anekant Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Online Retreats':
            return await step.prompt(CHOICE_PROMPT, 'Which option would you prefer?', ['Foundation Truth', 'Bright Responsibility Shivir', 'Maha Asmani Shivir']);

        case 'Parenting Shivir':
            await step.context.sendActivity({
                text: 'Parenting Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Husband Wife Shivir':
            await step.context.sendActivity({
                text: 'Husband Wife Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Maha Ashmani Shivir':
            await step.context.sendActivity({
                text: 'Maha Ashmani Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'Mini Maha Asmani Shivir':
            await step.context.sendActivity({
                text: 'Mni Maha Asmani Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'International Dhyan Mandir':
            await step.context.sendActivity({
                text: 'Dhyan Mandir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();

        case 'International Family Shivir':
            await step.context.sendActivity({
                text: 'Family Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        }
    }

    async shivirWiseDetail(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Regular Process':
            return await step.prompt(CHOICE_PROMPT, 'Which Shivir are you looking for?', ['Sampoorna Laksha Shivir(SLS)', 'Foundation Truth(FT)', 'Bright Responsibility Shivir(BRB)', 'Maha Asmani Shivir']);
        case 'At Manan Ashram':
            await step.context.sendActivity({
                text: 'Maha Ashmani Shivir At Manan Ashram',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Basic Swastha Shivir':
            await step.context.sendActivity({
                text: 'Basic Swastha Shvir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Advanced Swastha Shivir':
            await step.context.sendActivity({
                text: 'Advanced Swastha Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Basic Dhyan Mandir':
            await step.context.sendActivity({
                text: 'Basic Dhyan Mandir Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Advanced Dhyan Mandir':
            await step.context.sendActivity({
                text: 'Advanced Dhyan Mandir Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Foundation Truth':
            await step.context.sendActivity({
                text: 'Foundation Truth',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Bright Responsibility Shivir':
            await step.context.sendActivity({
                text: 'Bright Responsibility Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Maha Asmani Shivir':
            await step.context.sendActivity({
                text: 'Maha Asmani Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        }
    }

    async MahaAsmaniInDetail(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Sampoorna Laksha Shivir(SLS)':
            await step.context.sendActivity({
                text: 'Sampoorna Laksha Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Foundation Truth(FT)':
            await step.context.sendActivity({
                text: 'Foundation Truth',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Bright Responsibility Shivir(BRB)':
            await step.context.sendActivity({
                text: 'Bright Responsibility Shivir',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Maha Asmani Shivir':
            return await step.prompt(CHOICE_PROMPT, 'Where do you want to attend the Shivir?', ['At MaNaN Ashram', 'Any other cities']);
        }
    }

    async MahaAsmaniInDetail2(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'At MaNaN Ashram':
            await step.context.sendActivity({
                text: 'At Manan Ashram',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Any other cities':
            return await step.prompt(CHOICE_PROMPT, 'We provide services at following cities.You can attend at any one of the following. Select the city to know more about the services provided at particular city.', ['Delhi', 'Nagpur', 'Sangli', 'Bhopal', 'Other']);
        }
    }

    async CityWise(step) {
        console.log(step.result.value);
        switch (step.result.value) {
        case 'Delhi':
            await step.context.sendActivity({
                text: 'MahaAsmani Shivir in Delhi',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Nagpur':
            await step.context.sendActivity({
                text: 'MahaAsmani Shivir in Nagpur',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Sangli':
            await step.context.sendActivity({
                text: 'MahaAsmani Shivir in Sangli',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Bhopal':
            await step.context.sendActivity({
                text: 'MahaAsmani Shivir in Bhopal',
                attachments: [CardFactory.adaptiveCard(CARDS[0])]
            });
            endDialog = true;
            return await step.endDialog();
        case 'Other':
            await step.context.sendActivity({
                text: 'MahaAsmani Shivir in Other Cities',
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

module.exports.ShivirDialog = ShivirDialog;
