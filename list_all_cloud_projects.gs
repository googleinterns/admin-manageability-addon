/**
* List all cloud projects
* @return {json} Cloud projects with details like 
* projectId, projectNumber, state, parent's projectId etc.
*/
function listAllCloudProjects() {
  var url = "https://cloudresourcemanager.googleapis.com/v1/projects";
  var header = {
    "Authorization" : "Bearer " + ScriptApp.getOAuthToken(),
  };
  var options = {
    'method' : 'get',
    'contentType': 'application/json',
    'headers': header,
    'muteHttpExceptions': false
  };
  var response = UrlFetchApp.fetch(url, options);
  var contentText = response.getContentText();
  var cloudProjects = JSON.parse(contentText).projects;
  return cloudProjects;
}
