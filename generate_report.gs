/**
* Generates the report of most executed script in google sheets
* @param {Object} mostExecutedScript is the array of projectIds  
* @param {String} title is the heading for the report sheet
* @param {Number} limitResponse is the maximum number of responses in the sheet
* @return {String} URL of generated report
*/
function generateReportForMostExecutedScript(mostExecutedScript, timestamp_header, limitResponse) {  

  //Create a new date
  var timeStamp = new Date();
  var dateTimeAsString = timeStamp.toString().slice(0,15);
  var newSheet = SpreadsheetApp.create(timestamp_header + " at "+ dateTimeAsString);
  var active  = newSheet.getActiveSheet();
  active.setName("Most Executed Script");
  
  // add the most executed script report
  var rowContent = ["ProjectId", "Execution Count", "Cloud Project Id"];
  active.appendRow(rowContent);
  var lastRow = active.getLastRow();
  active.getRange(lastRow, 1, 1, 3).setFontSize(12).setFontWeight("BOLD");
  for(var i = 0; i<mostExecutedScript.length && i<limitResponse; i++) {
    Logger.log(mostExecutedScript[i]);
    rowContent = [mostExecutedScript[i]["key"], mostExecutedScript[i]["value"], mostExecutedScript[i]["GCPId"]];
    active.appendRow(rowContent);
  }
  return newSheet.getUrl();
}


/**
* Generates the report of most active users in google sheets  
* @param {Object} mostActiveUser is the array of userIds
* @param {String} title is the heading for the report sheet
* @param {Number} limitResponse is the maximum number of responses in the sheet
* @return {String} URL of generated report
*/
function generateReportForMostActiveUsers(mostActiveUser, timestamp_header, limitResponse) {  
 
  //Create a new date
  var timeStamp = new Date();
  var dateTimeAsString = timeStamp.toString().slice(0,15);
  var newSheet = SpreadsheetApp.create(timestamp_header + " at "+ dateTimeAsString);
  var active  = newSheet.getActiveSheet();
  active.setName("Most Active Users");
 
  var rowContent = ["User id","Execution Count"];
  active.appendRow(rowContent);
  var lastRow = active.getLastRow();
  active.getRange(lastRow, 1, 1, active.getLastColumn()).setFontSize(12).setFontWeight("Bold");
  for(var i = 0; i<mostActiveUser.length && i<limitResponse; i++) {
    rowContent = [mostActiveUser[i].key, mostActiveUser[i].value];
    active.appendRow(rowContent);
  }
  return newSheet.getUrl();
}


/**
* Generates the report for owners of scripts in google sheets
* @param {Object} emailOfOwnerOfScript is the array of object having name and email of owner of appscript
* @param {String} title is the heading for the report sheet
* @return {String} URL of generated report
*/
function generateReportForOwnerOfScripts(emailOfOwnerOfScript, timestamp_header) {  
  
  //Create a new date
  var timeStamp = new Date();
  var dateTimeAsString = timeStamp.toString().slice(0,15);
  var newSheet = SpreadsheetApp.create(timestamp_header + " at "+ dateTimeAsString);
  var active  = newSheet.getActiveSheet();
  active.setName("Email of Owner of Scripts");
  
  // add the projects with owners
  var rowContent = ["Project Name", "Owner Email", "GCP Project Id"];
  active.appendRow(rowContent);
  var lastRow = active.getLastRow();
  active.getRange(lastRow, 1, 1, 3).setFontSize(12).setFontWeight("Bold");
  for(var i = 0; i<emailOfOwnerOfScript.length; i++) {
    rowContent = [emailOfOwnerOfScript[i].name, emailOfOwnerOfScript[i].email, emailOfOwnerOfScript[i].projectId];
    active.appendRow(rowContent);
  }
  return newSheet.getUrl();
}

