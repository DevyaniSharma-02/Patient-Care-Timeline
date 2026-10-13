public with sharing class PatientJourneyController {

    @AuraEnabled(cacheable=true)
    public static Patient_Journey__c getJourney(Id journeyId) {

        if (journeyId == null) {
            return null;
        }

        return [
            SELECT
                Id,
                Name,
                Patient_Name__c,
                Admission_Date__c,
                Expected_Discharge_Date__c,
                Current_Stage__c,
                Status__c,
                Assigned_Doctor__c,
                Assigned_Doctor__r.Name,
                Risk_Level__c,
                Owner.Name
            FROM Patient_Journey__c
            WHERE Id = :journeyId
            LIMIT 1
        ];
    }


    @AuraEnabled(cacheable=true)
    public static List<Journey_Stage__c> getStages(Id journeyId) {

        if (journeyId == null) {
            return new List<Journey_Stage__c>();
        }

        return [
            SELECT
                Id,
                Name,
                Patient_Journey__c,
                Sequence__c,
                Status__c,
                Start_Date__c,
                End_Date__c,
                SLA_Hours__c,
                SLA_Due_Date__c,
                SLA_Status__c
            FROM Journey_Stage__c
            WHERE Patient_Journey__c = :journeyId
            ORDER BY Sequence__c ASC
        ];
    }


    @AuraEnabled(cacheable=true)
    public static List<Care_Task__c> getCareTasks(Id stageId) {

        if (stageId == null) {
            return new List<Care_Task__c>();
        }

        return [
            SELECT
                Id,
                Name,
                Journey_Stage__c,
                Status__c,
                Assigned_To__c,
                Assigned_To__r.Name,
                Due_Date__c,
                Priority__c
            FROM Care_Task__c
            WHERE Journey_Stage__c = :stageId
            ORDER BY Due_Date__c ASC
        ];
    }


    @AuraEnabled(cacheable=true)
    public static List<Patient_Transaction__c> getTransactions(Id journeyId) {

        if (journeyId == null) {
            return new List<Patient_Transaction__c>();
        }

        return [
            SELECT
                Id,
                Name,
                Patient_Journey__c,
                Transaction_Type__c,
                Transaction_Date__c,
                Amount__c,
                Status__c,
                Description__c
            FROM Patient_Transaction__c
            WHERE Patient_Journey__c = :journeyId
            ORDER BY Transaction_Date__c DESC
        ];
    }


    @AuraEnabled
    public static void updateCareTaskStatus(
        Id taskId,
        String newStatus
    ) {

        if (taskId == null || String.isBlank(newStatus)) {
            return;
        }

        Care_Task__c task = [
            SELECT
                Id,
                Status__c
            FROM Care_Task__c
            WHERE Id = :taskId
            LIMIT 1
        ];

        task.Status__c = newStatus;

        update task;
    }
}