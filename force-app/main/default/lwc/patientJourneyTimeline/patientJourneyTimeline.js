import { LightningElement, api, wire } from 'lwc';

import getJourney from '@salesforce/apex/PatientJourneyController.getJourney';
import getStages from '@salesforce/apex/PatientJourneyController.getStages';
import getCareTasks from '@salesforce/apex/PatientJourneyController.getCareTasks';
import updateCareTaskStatus from '@salesforce/apex/PatientJourneyController.updateCareTaskStatus';

import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PatientJourneyTimeline extends LightningElement {

    @api recordId;

    journey;
    stages = [];
    error;

    wiredStagesResult;

    isLoading = false;


    @wire(getJourney, { journeyId: '$recordId' })
    wiredJourney({ data, error }) {

        if (data) {
            this.journey = data;
            this.error = undefined;
        } else if (error) {
            this.journey = undefined;
            this.error = error;
        }
    }


    @wire(getStages, { journeyId: '$recordId' })
    async wiredStages(result) {

        this.wiredStagesResult = result;

        const { data, error } = result;

        if (data) {

            try {

                this.isLoading = true;

                const stagesWithTasks = await Promise.all(

                    data.map(async stage => {

                        const tasks = await getCareTasks({
                            stageId: stage.Id
                        });

                        const formattedTasks = tasks.map(task => {

                            return {
                                ...task,

                                assignedToName:
                                    task.Assigned_To__r &&
                                    task.Assigned_To__r.Name
                                        ? task.Assigned_To__r.Name
                                        : 'Not Assigned',

                                priorityLabel:
                                    task.Priority__c
                                        ? task.Priority__c
                                        : 'Not Set',

                                dueDateLabel:
                                    task.Due_Date__c
                                        ? task.Due_Date__c
                                        : 'No Due Date'
                            };
                        });

                        return {
                            ...stage,
                            tasks: formattedTasks,
                            taskCount: formattedTasks.length
                        };
                    })
                );

                this.stages = stagesWithTasks;
                this.error = undefined;

            } catch (taskError) {

                this.error = taskError;
                this.stages = [];

                console.error(
                    'Error loading Care Tasks:',
                    taskError
                );

            } finally {

                this.isLoading = false;
            }

        } else if (error) {

            this.error = error;
            this.stages = [];

            console.error(
                'Error loading Journey Stages:',
                error
            );
        }
    }


    get statusOptions() {

        return [
            {
                label: 'Not Started',
                value: 'Not Started'
            },
            {
                label: 'In Progress',
                value: 'In Progress'
            },
            {
                label: 'Completed',
                value: 'Completed'
            },
            {
                label: 'Blocked',
                value: 'Blocked'
            },
            {
                label: 'Cancelled',
                value: 'Cancelled'
            }
        ];
    }


    async handleTaskStatusChange(event) {

        const taskId = event.target.dataset.taskId;
        const newStatus = event.detail.value;

        if (!taskId || !newStatus) {
            return;
        }

        try {

            this.isLoading = true;

            await updateCareTaskStatus({
                taskId: taskId,
                newStatus: newStatus
            });

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Care Task status updated successfully.',
                    variant: 'success'
                })
            );

            await refreshApex(this.wiredStagesResult);

        } catch (error) {

            this.error = error;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Unable to update Care Task status.',
                    variant: 'error'
                })
            );

            console.error(
                'Error updating Care Task status:',
                error
            );

        } finally {

            this.isLoading = false;
        }
    }
}