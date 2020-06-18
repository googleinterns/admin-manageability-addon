/**
* List all cloud projects
* @return {json} Cloud projects with details like projectId,projectNumber,state etc.
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
  var json = response.getContentText();
  return (JSON.parse(json).projects);
}
