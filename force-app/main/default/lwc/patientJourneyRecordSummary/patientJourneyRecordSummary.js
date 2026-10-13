import { LightningElement, api, wire } from 'lwc';

import getJourney from '@salesforce/apex/PatientJourneyController.getJourney';
import getStages from '@salesforce/apex/PatientJourneyController.getStages';
import getTransactions from '@salesforce/apex/PatientJourneyController.getTransactions';

export default class PatientJourneyRecordSummary extends LightningElement {
    @api recordId;

    journey;
    stages = [];
    transactions = [];

    isLoading = true;
    errorMessage;

    @wire(getJourney, { journeyId: '$recordId' })
    wiredJourney({ data, error }) {
        if (data) {
            this.journey = data;
            this.errorMessage = undefined;
            this.isLoading = false;
        } else if (error) {
            this.journey = undefined;
            this.errorMessage = this.getErrorMessage(error);
            this.isLoading = false;
        }
    }

    @wire(getStages, { journeyId: '$recordId' })
    wiredStages({ data, error }) {
        if (data) {
            this.stages = data;
        } else if (error) {
            this.stages = [];
            this.errorMessage = this.getErrorMessage(error);
        }
    }

    @wire(getTransactions, { journeyId: '$recordId' })
    wiredTransactions({ data, error }) {
        if (data) {
            this.transactions = data;
        } else if (error) {
            this.transactions = [];
            this.errorMessage = this.getErrorMessage(error);
        }
    }

    get hasStages() {
        return this.stages && this.stages.length > 0;
    }

    get hasTransactions() {
        return this.transactions && this.transactions.length > 0;
    }

    getErrorMessage(error) {
        if (error?.body?.message) {
            return error.body.message;
        }

        if (error?.message) {
            return error.message;
        }

        return 'Unable to load patient journey information.';
    }
}