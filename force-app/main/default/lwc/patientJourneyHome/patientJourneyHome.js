import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class PatientJourneyHome extends NavigationMixin(LightningElement) {
    openPatientJourneys() {
        this.navigateToObject('Patient_Journey__c');
    }

    openJourneyStages() {
        this.navigateToObject('Journey_Stage__c');
    }

    openCareTasks() {
        this.navigateToObject('Care_Task__c');
    }

    openTransactions() {
        this.navigateToObject('Patient_Transaction__c');
    }

    navigateToObject(objectApiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: objectApiName,
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }
}