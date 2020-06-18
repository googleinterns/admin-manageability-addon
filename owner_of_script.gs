/**
* Get the original name and email of App Script
* @param {string} projectId of the cloud project
* @return {Object} having two values name, email and projectId
* name is the name of the cloud project
* email is the email id of the owner of cloud project
* projectId is the cloud project
*/
function getOriginalNameAndOwnerOfScript(projectId) {
  var pageToken = null;
  var resultData = null;
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
      "filter": "protoPayload.methodName=CreateBrand",
      "pageToken":pageToken
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
  return {"email" : resultData.entries[0].protoPayload.request.brand.supportEmail, "name" : resultData.entries[0].protoPayload.request.brand.displayName, "projectId" : projectId};
}

/**
* Get the updated name and email of App Script
* @param {string} projectId of the cloud project
* @return {Object} having two values name and email
* name is the name of the cloud project
* email is the email id of the owner of cloud project
*/
function getUpdatedNameAndOwnerOfScript(projectId) {
  var pageToken = null;
  var resultData = null;
  var limit = false;
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
      "filter": "protoPayload.methodName=UpdateBrandWithMask",
      "orderBy": "timestamp desc",
      "pageToken":pageToken
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
    if(!resultData.entries && !resultData.nextPageToken) {
      limit = true;
      break;
    }
    pageToken = resultData.nextPageToken;
  
  } while(!resultData.entries);
  if(limit) {
    return getOriginalNameAndOwnerOfScript(projectId);
  } else {
    return {"email" : resultData.entries[0].protoPayload.response.supportEmail, "name" : resultData.entries[0].protoPayload.response.displayName, "projectId" : projectId};
  }
}

/**
* Get the owners of all the cloud projects
* @param {string} projectType is the types of cloud projects to be checked i.e., CUSTOM_PROJECTs which are user created and SYSTEM_PROJECTs which are system generate
* @return {Object} Array of objects having name, email of owner and projectId of Apps Script
*/
function getOwnersOfAllScripts(projectType) {  
  var ALL_PROJECTs = listAllCloudProjects();
  var emailOfOwnerOfScripts = [];
  var i;
  for(i=0; i<ALL_PROJECTs.length; i++) {
    if (ALL_PROJECTs[i].lifecycleState != 'ACTIVE') {
      continue;
    }
    var projectId = JSON.stringify(ALL_PROJECTs[i].projectId,null,2);
    if(projectId.indexOf("sys") == 1.0) {
      if(projectType == "CUSTOM_PROJECT") continue;
    } else {
      if(projectType == "SYSTEM_PROJECT") continue;
    }
    var owner = getUpdatedNameAndOwnerOfScript(ALL_PROJECTs[i].projectId);
    emailOfOwnerOfScripts.push(owner);
  } 
  return emailOfOwnerOfScripts; 
}
