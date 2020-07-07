/**
 * Get the token from the API for getting the result later
 * @param {Date} fromTime is the start time of the report to be generated
 * @param {String} projectType is the enum having values 
 *    {SYSTEM_PROJECT, ALL_PROJECT, SPECIFIC_PROJECT, CUSTOM_PROJECT}
 * @param {String} projectId is the cloud project id
 * @param {String} urlEnd is the end of the API call
 * @return {CardService.Card} The card to show to the user
 */
function getTokenFromAPI(fromTime, projectType, projectId, urlEnd) {
  var header = {
    'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
  };
  var body = {
    fromTime: fromTime,
    projectType: projectType,
    projectId: projectId
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': header,
    'payload': JSON.stringify(body)
  };
  var url = 'http://34.87.99.232/' + urlEnd;
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var token = JSON.parse(json);
  return token;
}
