/**
* Get the details of the project
* @param {String projectId of the GCP project
* @return {Object} Project Details having name, Project Number, project Id and other details
*/
function getProjectNumber(projectId) {
  var url = "https://cloudresourcemanager.googleapis.com/v1/projects/"+projectId;
  var header = {
    "Authorization" : "Bearer " + ScriptApp.getOAuthToken(),
  };
  var options = {
    'method' : 'get',
    'headers': header,
    'muteHttpExceptions': false
  };
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return (json);
}
