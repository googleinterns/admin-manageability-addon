/**
* Get the maximum number of executions of a cloud project
* @param {string} projectId of the cloud project
* @param {Date} fromTime is the date and time from which the executions has to be seen
* @return {Object} having key as projectId and value as number of executions
*/
function getNumberOfExecutionOfScript(projectId, fromTime) {
  var pageToken = null,resultData = null;
  var max = 0 , i ;
  var limit = false;
  var processIdsMap = {} , projectIdsMap = {};
  
  // loop to get the first page which has enteries in it
  do {  
    var header = {
      "Authorization": "Bearer "+ScriptApp.getOAuthToken()
    };
    var body = {
      "projectIds": [
        projectId
      ],
      "resourceNames": [
        "projects/"+projectId
      ],
      "pageToken":pageToken,
      "orderBy": "timestamp desc"
    };
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'headers': header,
      'payload' : JSON.stringify(body),
      'muteHttpExceptions': false
    };
    var response = UrlFetchApp.fetch('https://logging.googleapis.com/v2/entries:list', options);
    var json = response.getContentText();
    resultData = JSON.parse(json);
    pageToken = resultData.nextPageToken;
  } while(!resultData.entries);
  
  // loop to go over all the enteries and map the processId with the projectId
  while(resultData.entries) {
    for(i in resultData.entries) {
      if(resultData.entries[i].timestamp < fromTime) { 
        limit = true;
        break;
      }
      if(resultData.entries[i].labels) {
        processIdsMap[resultData.entries[i].labels["script.googleapis.com/process_id"]] = resultData.entries[i].labels["script.googleapis.com/project_key"]; 
      }
    }  
    if(limit) break;
    var header = {
      "Authorization": "Bearer "+ ScriptApp.getOAuthToken()
    };
    var body = {
      "projectIds": [
        projectId
      ],
      "resourceNames": [
        "projects/"+projectId
      ],
      "pageToken":pageToken,
      "orderBy": "timestamp desc"
    };
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'headers': header,
      'payload' : JSON.stringify(body),
      'muteHttpExceptions': false
    };
    var response = UrlFetchApp.fetch('https://logging.googleapis.com/v2/entries:list', options);
    var json = response.getContentText();
    resultData = JSON.parse(json);
    pageToken = resultData.nextPageToken;
  }
  
  // go through all the processIds and count the different projectIds
  for(i in processIdsMap) {
    if(projectIdsMap[processIdsMap[i]]) projectIdsMap[processIdsMap[i]] += 1;
    else projectIdsMap[processIdsMap[i]] = 1;
  }
  
  return projectIdsMap;
}

/**
* Get the maximum executed Script from all the cloud projects
* @param {Date} fromTime is the date and time from which executions has to be seen
* @param {string} projectType is the types of cloud projects to be checked i.e., CUSTOM_PROJECTs which are user created and SYSTEM_PROJECTs which are system generated
* @return {Object} Array of projectIds along with the number of executions of the executed scripts and the cloud project id
*/
function getMostExecutedScriptFromAllCloudProjects(fromTime , projectType) {
  
  var ALL_PROJECTs = listAllCloudProjects();
  var i,max = 0;
  var processIdWithExecutions = {}, processIdWithGCPId = {};
  var mostExecutedScript;
  
  // loop for all thr projects and get most executed scripts of each project
  for(i=0; i<ALL_PROJECTs.length; i++) {
    if(ALL_PROJECTs[i].lifecycleState != 'ACTIVE') {
      continue;
    }
    if(JSON.stringify( ALL_PROJECTs[i].projectId , null , 2).indexOf("sys") == 1.0) {
      if(projectType == "CUSTOM_PROJECT") continue;
    } else {
      if(projectType == "SYSTEM_PROJECT") continue;
    }
    var apiEnabled = enableLogginApisPvt(ALL_PROJECTs[i].projectNumber);
    if(!apiEnabled) continue;
    var result = getNumberOfExecutionOfScript(ALL_PROJECTs[i].projectId , fromTime);
    Logger.log(ALL_PROJECTs[i].name);
    Logger.log(result);
    for(var j in result) {
      if(processIdWithExecutions[j]) {
        processIdWithExecutions[j] += result[j];
      } else {
        processIdWithExecutions[j] = result[j];
      }
      processIdWithGCPId[j] = ALL_PROJECTs[i].projectId;
    }
  }
  var mostExecutedScript = convertObjectToSortedArray(processIdWithExecutions, processIdWithGCPId);
  return mostExecutedScript;
  
}
