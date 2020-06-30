/**
* Get the original name and email of App Script
* @param {string} projectId of the cloud project
* @return {Object} having two values name, email and projectId
* name is the name of the cloud project
* email is the email id of the owner of apps script
* projectId is the cloud project Id
*/
function getOriginalNameAndOwnerOfScript(projectId, projectName) {
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
    pageToken = resultData.nextPageToken;
  } while(!resultData.entries);
  return {
    "email" : resultData.entries[0].protoPayload.request.brand.supportEmail,
    "name" : projectName,
    "projectId" : projectId
  };
}

/**
* Get the owners of all the cloud projects
* @param {string} projectType is the types of cloud projects to be checked i.e., CUSTOM_PROJECTs which are user created and SYSTEM_PROJECTs which are system generate
* @param {string} specificProjectId is cloud project id of specific project otherwise null
* @return {Object} Array of objects having name, email of owner and projectId of Apps Script
*/
function getOwnersOfAllScripts(projectType, specificProjectId) {  
  if(projectType == "SPECIFIC_PROJECT") {
    var projDetails = getProjectDetails(specificProjectId);
    var apiEnabled = enableLogginApisPvt(projDetails.projectNumber);
    if(apiEnabled) {
      var owner = getOriginalNameAndOwnerOfScript(specificProjectId, projDetails.name);
      emailOfOwnerOfScripts.push(owner);
    }
  }
  else {
    var allProjects = listAllCloudProjects();
    var emailOfOwnerOfScripts = [];
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
      var owner = getOriginalNameAndOwnerOfScript(allProjects[i].projectId, allProjects[i].name);
      emailOfOwnerOfScripts.push(owner);
    } 
  }
  return emailOfOwnerOfScripts; 
}
