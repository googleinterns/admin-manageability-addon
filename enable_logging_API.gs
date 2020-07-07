/**
 * Enable the logging API for cloud project
 * @param {int} projectNumber of the GCP project
 * @return {Boolean} API is enabled or not
 */
function enableLogginApisPvt(projectNumber) {
  var name = 'projects/' + projectNumber + '/services/logging.googleapis.com';
  var url = 'https://serviceusage.googleapis.com/v1/' + name + ':enable';
  var header = {
    'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
  };
  var options = {
    'method': 'post',
    'headers': header,
    'muteHttpExceptions': false,
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    var apiEnabled = json.response.service;
    if (apiEnabled.state == "ENABLED") {
      return true;
    } else {
      return false;
    }
  } catch (ex) {
    return false;
  }
}
