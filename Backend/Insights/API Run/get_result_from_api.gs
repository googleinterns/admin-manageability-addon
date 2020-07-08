/**
 * Get report from API and create a card with report URL of the report
 * @param {Object} e is the Event Object 
 *     which contains information about the context
 * @return {CardService.Card} The card to show to the user
 */
function getResultFromAPIWithToken(e) {
  var result = null;
  var startTime = (new Date()).getTime();
  var token = e.parameters['token'];
  var limitResponse = e.parameters['limitResponse'];
  var reportTitle = e.parameters['reportTitle'];
  var urlEnd = e.parameters['url'];
  var url = 'http://34.87.99.232/' + urlEnd;
  var body = {
    'token': token
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(body)
  };
  while (result == null) {
    var response = UrlFetchApp.fetch(url, options);
    var json = response.getContentText();
    result = JSON.parse(json);
    if (result) {
      break;
    }
    var endTime = (new Date()).getTime();
    if (endTime - startTime > 25000) {
      var card = refreshScreenUI(e, token, limitResponse, reportTitle, urlEnd);
      var navigation = CardService.newNavigation().updateCard(card);
      var actionResponse =
        CardService.newActionResponseBuilder().setNavigation(navigation);
      return actionResponse.build();
    }
    Utilities.sleep(5000);
  }
  var reportUrl;
  if (urlEnd == 'mostExecutedScript') {
    reportUrl =
      generateReportForMostExecutedScript(result, reportTitle, limitResponse);
  } else if (urlEnd == 'mostActiveUsers') {
    reportUrl =
      generateReportForMostActiveUsers(result, reportTitle, limitResponse);
  } else {
    reportUrl = generateReportForOwnerOfScripts(result, reportTitle);
  }
  var card = createUI(e, reportUrl);
  var navigation = CardService.newNavigation().updateCard(card);
  var actionResponse =
    CardService.newActionResponseBuilder().setNavigation(navigation);
  return actionResponse.build();
}
