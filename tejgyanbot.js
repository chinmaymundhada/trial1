// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory, ActivityTypes } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');
// importing required classes for the bot

const { ShivirDialog } = require('./componentDialogs/shivirDialog');
const { VoiceOfHappyThoughts } = require('./componentDialogs/voiceOfHappyThoughts');
const { ProgramDialog } = require('./componentDialogs/programsDialog');
const { UpcomingEventsDialog } = require('./componentDialogs/upcomingEventsDialog');
const { TGFcentresDialog } = require('./componentDialogs/tgfCentresDialog');
const { ShravanDialog } = require('./componentDialogs/shravanDialog');
const { BooksDialog } = require('./componentDialogs/booksDialog');
const { DonationDialog } = require('./componentDialogs/donationDialog');
const { AboutTGFDialog } = require('./componentDialogs/aboutTgfDialog');
const { SentimentalDialog } = require('./componentDialogs/sentimentalDialog');
const { SubscriptionDialog } = require('./componentDialogs/subscriptionDialog');
const { WhatsappDialog } = require('./componentDialogs/tgfWhatsappDialog');
const { MNNDialog } = require('./componentDialogs/mnnDialog');
const { FormDialog } = require('./componentDialogs/formDialog');
// Importing of the Dialog in the flow

class TejgyanBot extends ActivityHandler {
    constructor(conversationState, userState) {
        super();
        // creation of further reference to be used in the bot
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty('dialogState');
        this.shivirDialog = new ShivirDialog(this.conversationState, this.userState);
        this.voiceofHappyThoughtsDialog = new VoiceOfHappyThoughts(this.conversationState, this.userState);
        this.upcomingEventsDialog = new UpcomingEventsDialog(this.conversationState, this.userState);
        this.programsDialog = new ProgramDialog(this.conversationState, this.userState);
        this.tgfcentresDialog = new TGFcentresDialog(this.conversationState, this.userState);
        this.shravanDialog = new ShravanDialog(this.conversationState, this.userState);
        this.booksDialog = new BooksDialog(this.conversationState, this.userState);
        this.donationDialog = new DonationDialog(this.conversationState, this.userState);
        this.aboutTgfDialog = new AboutTGFDialog(this.conversationState, this.userState);
        this.sentimentalDialog = new SentimentalDialog(this.conversationState, this.userState);
        this.subscriptionDialog = new SubscriptionDialog(this.conversationState, this.userState);
        this.mnnDialog = new MNNDialog(this.conversationState, this.userState);
        this.whatsappDialog = new WhatsappDialog(this.conversationState, this.userState);
        this.formDialog = new FormDialog(this.conversationState, this.userState);
        this.previousIntent = this.conversationState.createProperty('previousIntent');
        this.conversationData = this.conversationState.createProperty('conservationData');

        // Integrating the LUIS in the bot
        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: `https://${ process.env.LuisAPIHostName }.cognitiveservices.azure.com`
        }, {
            includeAllIntents: true
        }, true);

        // Integrating the QnA maker in the bot
        const qnaMaker = new QnAMaker({
            knowledgeBaseId: process.env.QnAKnowledgebaseId3,
            endpointKey: process.env.QnAEndpointKey3,
            host: process.env.QnAEndpointHostName3
        });
        this.qnaMaker = qnaMaker;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        // Message to be displayed every time the conversation is done with the bot in all the cases
        this.onMessage(async (context, next) => {
            await context.sendActivities([
                { type: ActivityTypes.Typing },
                { type: 'delay', value: 0 }
            ]);
            const luisResult = await dispatchRecognizer.recognize(context);
            const intent = LuisRecognizer.topIntent(luisResult); // checking the top intent in the  LUIS
            const entities = luisResult.entities; // saving all the entities values generated from the LUIS
            await this.dispatchToIntentAsync(context, intent, entities);
            await next();
        });

        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
        this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async sendWelcomeMessage(turnContext) {
        const { activity } = turnContext;

        // Iterate over all new members added to the conversation.
        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                const welcomeMessage = `Happy Thoughts ${ activity.membersAdded[idx].name }!! Welcome to Tejgyan Bot Service `;
                await turnContext.sendActivity(welcomeMessage);
                await this.sendSuggestedActions(turnContext); // Sending the suggestion after user recieves the welcome message
            }
        }
    }

    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['About TGF', 'TGF centres', 'Shravan', 'Donation', 'Voice of Happy Thoughts', 'Subscription', 'Sentimental', 'Books', 'TGF Whatsapp and Telegram', 'Programs', 'Upcoming Events', 'Shivir/Retreats', 'MNN', 'Form for Query'], 'What would you like to Know about ?');
        await turnContext.sendActivity(reply);
    }

    async dispatchToIntentAsync(context, intent, entities) {
        var currentIntent = ''; // current intent variable
        const previousIntent = await this.previousIntent.get(context, {}); // Storing the previous intent
        const conversationData = await this.conversationData.get(context, {});
        if (previousIntent.intentName && conversationData.endDialog === false) {
            currentIntent = previousIntent.intentName; // if enddialog is false same intent is continued as previous one
        } else if (previousIntent.intentName && conversationData.endDialog === true) {
            currentIntent = intent; // if enddialog is true current intent is stored for intent value
        } else if (intent === 'None' && !previousIntent.intentName) {
            var result = await this.qnaMaker.getAnswers(context); // if intent is none from LUIS then QnA maker checks for the answer
            await context.sendActivity(`${ result[0].answer }`);
        } else {
            currentIntent = intent;
            await this.previousIntent.set(context, { intentName: intent });
        }

        // Switch case for current intent value.
        switch (currentIntent) {
        // Shivir_and_Retreats Intent
        case 'Shivir_and_Retreats':
            console.log('Inside Shivir/Retreats Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.shivirDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.shivirDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;
        case 'MNN':
            console.log('Inside MNN Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.mnnDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.mnnDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Sentimental':
            console.log('Inside Sentimental Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.sentimentalDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.sentimentalDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'TGF_WhatsApp_and_Telegram':
            console.log('Inside TGF Whatsapp and Telegram Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.whatsappDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.whatsappDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Subscription':
            console.log('Inside Subscription Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.subscriptionDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.subscriptionDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'About_TGF':
            console.log('Inside About TGF case');
            await this.conversationData.set(context, { endDialog: false });
            await this.aboutTgfDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.aboutTgfDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Voice_of_Happy_Thoughts':
            console.log('Inside Voice of Happy Thoughs Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.voiceofHappyThoughtsDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.voiceofHappyThoughtsDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Programs':
            console.log('Inside Programs Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.programsDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.programsDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Upcoming_Events':
            console.log('Inside Programs Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.upcomingEventsDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.upcomingEventsDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'TGF_centres':
            console.log('Inside TGF centres Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.tgfcentresDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.tgfcentresDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Shravan':
            console.log('Inside Shravan Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.shravanDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.shravanDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Books':
            console.log('Inside Book Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.booksDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.booksDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Donation':
            console.log('Inside Donation Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.donationDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.donationDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        case 'Form_for_Query':
            console.log('Inside Form Case');
            await this.conversationData.set(context, { endDialog: false });
            await this.formDialog.run(context, this.dialogState);
            conversationData.endDialog = await this.formDialog.isDialogComplete();
            if (conversationData.endDialog) {
                await this.previousIntent.set(context, { intentName: null });
                await this.sendSuggestedActions(context);
            }
            break;

        default:
            console.log('Did not match any case');
            // var msg = 'You have entered invalid option. You are requested to select the option from below choices';
            // await context.sendActivity(msg);
            await this.sendSuggestedActions(context);
        }
    }
}

module.exports.TejgyanBot = TejgyanBot;
