/**
* Trigger for the rule for the number of executions for the script
*/
function mostExecutedTrigger() {
  var files = DriveApp.getFilesByName(adminRuleFileName);
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active  = file.getSheetByName(adminRuleSheetName); 
    var lastRow = active.getLastRow();
    var lastCol = active.getLastColumn();
    var values = active.getRange(lastRow, 1, 1, lastCol).getValues()[0];
    
    var titleFromTime = getTitleandTime(values[1]); 
   
    if(values[2] != "SPECIFIC_PROJECT") {
      var mostExecutedScript = getMostExecutedScriptFromAllCloudProjects(
        titleFromTime.fromTime, values[2]);
      for(var i = 0; i<mostExecutedScript.length; i++) {
        if(mostExecutedScript[i].value > values[4]) {
          var body = 
              "Your apps script was allowed " + values[4] + " executions.\n" + 
              "Your script has exceeded the allowed limit of executions per " +
              titleFromTime.title + ". This will be reported to the admin.\n" + 
              "Thanks and Regards";
          var owner = 
              getOriginalNameAndOwnerOfScript(mostExecutedScript[i].GCPId);  
          GmailApp.sendEmail(
            owner.email, 
            'Apps Script Execution Limit Exceeded', 
            body, {
              name: 'Admin of Organization ',
              cc: values[5]
            }
          ); 
        }
      }
    }
    else {
      var processes = getNumberOfExecutionOfScript(
        values[3], titleFromTime.fromTime);
      var mostExecutedScript = convertObjectToSortedArrayForSpecificProject(
        processes, values[3]);
      for(var i = 0; i<mostExecutedScript.length; i++) {
        if(mostExecutedScript[i].value > values[4]) {
          var body = 
              "Your apps script was allowed " + values[4] + " executions.\n" + 
              "Your script has exceeded the allowed limit of executions per " + 
              titleFromTime.title + ". This will be reported to the admin.\n" +
              "Thanks and Regards";
          var owner = 
              getOriginalNameAndOwnerOfScript(mostExecutedScript[i].GCPId);  
          GmailApp.sendEmail(
            owner.email, 
            'Apps Script Execution Limit Exceeded', 
            body, {
              name: 'Admin of Organization ',
              cc: values[5]
            }
          ); 
        }
      }
    }
  }   
}
