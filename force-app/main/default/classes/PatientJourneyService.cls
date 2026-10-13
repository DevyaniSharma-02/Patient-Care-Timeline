public with sharing class PatientJourneyService {

    /*
     * Get one Patient Journey record
     */
    public static Patient_Journey__c getJourney(Id journeyId) {

        if (journeyId == null) {
            return null;
        }

        Patient_Journey__c journey = [
            SELECT Id,
                   Name,
                   Patient_Name__c,
                   Status__c,
                   Current_Stage__c,
                   Risk_Level__c,
                   Admission_Date__c,
                   Expected_Discharge_Date__c
            FROM Patient_Journey__c
            WHERE Id = :journeyId
            LIMIT 1
        ];

        return journey;
    }


    /*
     * Get all Journey Stages for a Patient Journey
     */
    public static List<Journey_Stage__c> getStages(Id journeyId) {

        if (journeyId == null) {
            return new List<Journey_Stage__c>();
        }

        return [
            SELECT Id,
                   Name,
                   Patient_Journey__c,
                   Status__c,
                   Sequence__c,
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


    /*
     * Get all Care Tasks for a Journey Stage
     */
    public static List<Care_Task__c> getCareTasks(Id stageId) {

        if (stageId == null) {
            return new List<Care_Task__c>();
        }

        return [
            SELECT Id,
                   Name,
                   Journey_Stage__c,
                   Status__c
            FROM Care_Task__c
            WHERE Journey_Stage__c = :stageId
            ORDER BY CreatedDate ASC
        ];
    }


    /*
     * Get all Care Tasks for a Patient Journey
     */
    public static List<Care_Task__c> getAllCareTasks(Id journeyId) {

        if (journeyId == null) {
            return new List<Care_Task__c>();
        }

        return [
            SELECT Id,
                   Name,
                   Journey_Stage__c,
                   Status__c
            FROM Care_Task__c
            WHERE Journey_Stage__r.Patient_Journey__c = :journeyId
            ORDER BY CreatedDate ASC
        ];
    }
}