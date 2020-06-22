/** This can enable logging apis of project of given project Number
* @param {Number} projectNumber is the project Number
* @return {Boolean} API is enbaled or not 
*/
function enableLogginApisPvt(projectNumber) {
  var name = "projects/" + projectNumber + "/services/logging.googleapis.com";
  var url = "https://serviceusage.googleapis.com/v1/" + name + ":enable";
  var header = {
    "Authorization" : "Bearer " + ScriptApp.getOAuthToken(),
  };
  var options = {
    'method' : 'post',
    'headers': header,
    'muteHttpExceptions': false,
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
  } catch (ex) {
    Logger.log(ex);
    return false;
  }
  return true;
}
