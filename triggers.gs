/**
* Trigger for thr rule for the number of executions for the script
*/
function mostExecutedTrigger() {
  var files = DriveApp.getFilesByName("Admin Rules For Apps Scripts");
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active  = file.getSheetByName("Admin Rules"); 
    var lastRow = active.getLastRow();
    var lastCol = active.getLastColumn();
    var values = active.getRange(lastRow, 1, 1, lastCol).getValues()[0];
    var toTime = new Date();
    var fromTime;
    var millisInBetween;
    var title;
    if(values[1] == "EVERY_HOUR") { 
      millisInBetween = 60*60*1000;
      title = "Every hour";
    } else if(values[1] == "EVERY_6_HOUR") {
      millisInBetween = 6*60*60*1000;
      title = "Every 6 hourw";
    } else if(values[1] == "EVERY_24_HOUR") {
      millisInBetween = 24*60*60*1000;
      title = "Every 24 hours";
    } else if(values[1] == "EVERY_7_DAYS") {
      millisInBetween = 7*24*60*60*1000;
      title = "Every 7 days";
    } else {
      millisInBetween = 30*24*60*60*1000;
      title = "Every 30 days";
    }
    
    var fromTime = new Date(toTime.getTime() - millisInBetween);
    fromTime = Utilities.formatDate(fromTime, 'Etc/GMT', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
   
    if(values[2] != "SPECIFIC_PROJECT") {
      var mostExecutedScript = getMostExecutedScriptFromAllCloudProjects(fromTime, values[2]);
      for(var i = 0; i<mostExecutedScript.length; i++) {
        if(mostExecutedScript[i].value > values[4]) {
          Logger.log(values[5]);
          var body = "Your apps script was allowed " + values[4] + " executions.\n";
          body += "Your execution count has increased too much.\n"
          body += "\n"
          body += "Make sure number of executions are less than " + values[4] + " in " + title + "\n";
          body += "Thanks and Regards"
          var owner = getOriginalNameAndOwnerOfScript(mostExecutedScript[i].GCPId);  
          GmailApp.sendEmail(owner.email, 'Apps Script Execution Limit Exceeded', body, {
            name: 'Admin of Organization ',
            cc: values[5]
          }); 

        }
      }
    }
    else
    {
      var processes = getNumberOfExecutionOfScript(values[3], fromTime);
      var mostExecutedScript = convertObjectToSortedArrayForSpecificProject(processes, values[3]);
      for(var i = 0; i<mostExecutedScript.length; i++) {
        if(mostExecutedScript[i].value > values[4]) {
          Logger.log(values[5]);
          var body = "Your apps script was allowed " + values[4] + " executions.\n";
          body += "Your execution count has increased too much.\n"
          body += "\n"
          body += "Make sure number of executions are less than " + values[4] + " in " + title + "\n";
          body += "Thanks and Regards"
          var owner = getOriginalNameAndOwnerOfScript(mostExecutedScript[i].GCPId);  
          GmailApp.sendEmail(owner.email, 'Apps Script Execution Limit Exceeded', body, {
            name: 'Admin of Organization ',
            cc: values[5]
          }); 

        }
      }
    }
  }   
}
