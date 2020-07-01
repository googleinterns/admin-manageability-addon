/**
* Get the users with their number of executions in a cloud project
* @param {string} cloudProjectId of the cloud project
* @param {Date} fromTime is the date and time from which the executions has to be seen
* @return {Object} having key as user_key mapped to number of executions
*/
function getUsersWithProcessId(cloudProjectId, fromTime) { 
  var pageToken = null, resultData = null;
  var limit = false;
  var processIdsMap = {}, userExecutions={};
  
  // loop to get the first page which has enteries in it
  do {
    var header = {
      "Authorization": "Bearer "+ScriptApp.getOAuthToken()
    };
    var body = {
      "projectIds": [
        cloudProjectId
      ],
      "resourceNames": [
        "projects/"+cloudProjectId
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
  
  // loop to go over all the enteries and map the processId with the userId
  while(resultData.entries) {
    for(var i in resultData.entries) {
      if(resultData.entries[i].timestamp < fromTime) {
        limit = true;
        break;
      }
      if(resultData.entries[i].labels) {
        processIdsMap[resultData.entries[i].labels["script.googleapis.com/process_id"]]=resultData.entries[i].labels["script.googleapis.com/user_key"]; 
      }
    }
    if(limit) break;
    var header = {
      "Authorization": "Bearer "+ScriptApp.getOAuthToken()
    };
    var body = {
      "projectIds": [
        cloudProjectId
      ],
      "resourceNames": [
        "projects/"+cloudProjectId
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
  
  // go through all the processIds and count the user executions
  for(var i in processIdsMap) {
    if(processIdsMap[i] != null) { 
      if(userExecutions[processIdsMap[i]]) userExecutions[processIdsMap[i]] += 1;
      else userExecutions[processIdsMap[i]] = 1;
    }
  }
  return userExecutions;
}

/**
* Get the most active users i.e., who runs maximum executions from all the cloud projects
* @param {Date} fromTime is the date and time from which executions has to be seen
* @param {string} projectType is the types of cloud projects to be checked i.e., CUSTOM_PROJECTs which are user created and SYSTEM_PROJECTs which are system generate
* @param {string} cloudProjectId is cloud project id of specific project otherwise null
* @return {Object} Array of user_keys mapped to number of executions of all the users
*/
function getMostActiveUser(fromTime, projectType, cloudProjectId) {  
  var userIdWithExecutions={};
  if(projectType == "SPECIFIC_PROJECT") {
    var projDetails = getProjectDetails(cloudProjectId);
    if(projDetails != null) {
      var apiEnabled = enableLogginApisPvt(projDetails.projectNumber);
      if(apiEnabled) {
        var userExecutions = getUsersWithProcessId(cloudProjectId , fromTime);
        for(var j in userExecutions) {
          if(userIdWithExecutions[j]) {
            userIdWithExecutions[j] += userExecutions[j];
          } else {
            userIdWithExecutions[j] = userExecutions[j];
          }
        }
      }
    }
  } else {
    var allProjects = listAllCloudProjects();
    var i;
    for(i=0; i<allProjects.length; i++) {
      if (allProjects[i].lifecycleState != 'ACTIVE') {
        continue;
      }
      var projectId = JSON.stringify(allProjects[i].projectId,null,2);
      if(projectId.indexOf("sys") == 1.0) {
        if(projectType == "CUSTOM_PROJECT") continue;
      } else {
        if(projectType == "SYSTEM_PROJECT") continue;
      }
      var apiEnabled = enableLogginApisPvt(allProjects[i].projectNumber);
      if(!apiEnabled) continue;
      var userExecutions = getUsersWithProcessId(allProjects[i].projectId , fromTime);
      for(var j in userExecutions) {
        if(userIdWithExecutions[j]) {
          userIdWithExecutions[j] += userExecutions[j];
        } else {
          userIdWithExecutions[j] = userExecutions[j];
        }
      }
    }
  }
  var mostActiveUsers = convertObjectToSortedArrayForMostActiveUsers(userIdWithExecutions);
  return mostActiveUsers;
}


