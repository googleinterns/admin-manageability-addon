/**
* Get the details of the project
* @param {String} cloudProjectId of the GCP project
* @return {Object} Project Details having name, Project Number, project Id and other details
*/
function getProjectDetails(cloudProjectId) {
  var url = "https://cloudresourcemanager.googleapis.com/v1/projects/" + cloudProjectId;
  var header = {
    "Authorization" : "Bearer " + ScriptApp.getOAuthToken(),
  };
  var options = {
    'method' : 'get',
    'headers': header,
    'muteHttpExceptions': false
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var projectDetails = JSON.parse(response.getContentText());
    return projectDetails;
  } catch (ex) {
    return null;
  }
