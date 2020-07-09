/**
 * Get the title and timestamp header for the reports
 * @param {string} timeFilter is the ENUM value 
 *    {LAST_HOUR, LAST_6_HOUR, LAST_24_HOUR, LAST_7_DAYS, LAST_30_DAYS}
 * @return {Object} having two values fromTime and timestampHeader
 *    fromTime is the start time for the reports
 *    timestampHeader is the title part of time
 */
function getTitleandTime(timeFilter) {
  var toTime = new Date();
  var millisInBetween;
  var timestampHeader;
  if (timeFilter == "LAST_HOUR") {
    millisInBetween = 60 * 60 * 1000;
    timestampHeader = "hour";
  } else if (timeFilter == "LAST_6_HOUR") {
    millisInBetween = 6 * 60 * 60 * 1000;
    timestampHeader = "6 hours";
  } else if (timeFilter == "LAST_24_HOUR") {
    millisInBetween = 24 * 60 * 60 * 1000;
    timestampHeader = "24 hours";
  } else if (timeFilter == "LAST_7_DAYS") {
    millisInBetween = 7 * 24 * 60 * 60 * 1000;
    timestampHeader = "7 days";
  } else {
    millisInBetween = 30 * 24 * 60 * 60 * 1000;
    timestampHeader = "30 days";
  }
  var fromTime = new Date(toTime.getTime() - millisInBetween);
  fromTime = Utilities.formatDate(
    fromTime, 'Etc/GMT',
    'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''
  );
  return {
    "fromTime": fromTime,
    "timestampHeader": title
  };
}

/**
 * Get the time Filter Card Section
 * @param {Object} e is the Event Object 
 *    which contains information about the context
 * @return {CardService.SelectionInput} time filter card widget
 */
function getTimeFilter(e) {
  var timeFilter =
    CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("timeFilter");

  // add the items according to input
  if (e.formInput) {
    timeFilter.addItem("Last Hour", "LAST_HOUR",
      e.formInput.timeFilter == "LAST_HOUR");
    timeFilter.addItem("Last 6 Hours", "LAST_6_HOUR",
      e.formInput.timeFilter == "LAST_6_HOUR");
    timeFilter.addItem("Last 24 Hours", "LAST_24_HOUR",
      e.formInput.timeFilter == "LAST_24_HOUR");
    timeFilter.addItem("Last 7 Days", "LAST_7_DAYS",
      e.formInput.timeFilter == "LAST_7_DAYS");
    timeFilter.addItem("Last 30 Days", "LAST_30_DAYS",
      e.formInput.timeFilter == "LAST_30_DAYS");
  } else {
    timeFilter.addItem("Last Hour", "LAST_HOUR", true);
    timeFilter.addItem("Last 6 Hours", "LAST_6_HOUR", false);
    timeFilter.addItem("Last 24 Hours", "LAST_24_HOUR", false);
    timeFilter.addItem("Last 7 Days", "LAST_7_DAYS", false);
    timeFilter.addItem("Last 30 Days", "LAST_30_DAYS", false);
  }

  return timeFilter;
}


/**
 * Get the project Filter Card Section
 * @param {Object} e is the Event Object 
 *    which contains information about the context
 * @return {CardService.SelectionInput} project filter card widget
 */
function getProjectFilter(e) {
  var projectFilter =
    CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("projectFilter");

  // add the items according to input
  if (e.formInput) {
    projectFilter.addItem("System Projects", "SYSTEM_PROJECT",
      e.formInput.projectFilter == "SYSTEM_PROJECT");
    projectFilter.addItem("Custom Projects", "CUSTOM_PROJECT",
      e.formInput.projectFilter == "CUSTOM_PROJECT");
    projectFilter.addItem("Specific Project", "SPECIFIC_PROJECT",
      e.formInput.projectFilter == "SPECIFIC_PROJECT");
    projectFilter.addItem("All Projects", "ALL_PROJECT",
      e.formInput.projectFilter == "ALL_PROJECT");
  } else {
    projectFilter.addItem("System Projects", "SYSTEM_PROJECT", true);
    projectFilter.addItem("Custom Projects", "CUSTOM_PROJECT", false);
    projectFilter.addItem("Specific Project", "SPECIFIC_PROJECT", false);
    projectFilter.addItem("All Projects", "ALL_PROJECT", false);
  }
  return projectFilter;
}


/**
 * get the header Section Card Buttons
 * @param {Object} e is the Event Object 
 *    which contains information about the context
 * @return {CardService.ButtomSet} Button Set of the header section of each Card
 */
function buttonSetSection(e) {
  var generateReportAction =
    CardService.newAction().setFunctionName('createUI');
  var btn1 =
    CardService.newTextButton().setText('Insights')
    .setOnClickAction(generateReportAction);
  var createRuleAction =
    CardService.newAction().setFunctionName('listRuleUI');
  var btn2 =
    CardService.newTextButton().setText('Actions')
    .setOnClickAction(createRuleAction);
  var headerButtonSet = CardService.newButtonSet()
    .addButton(btn1)
    .addButton(btn2);
  return headerButtonSet;
}
/**
 * Get the first page of stcakdriver logs which has enteries in it
 * @param {string} cloudProjectId of the cloud project
 * @param {string} filter for the owner of script
 * @return {Object} having two values nextPageToken, resultData
 *    nextPageToken is the pageToken for the next page
 *    resultData have the enteries for the current page
 */
function getFirstPageOfLogs(cloudProjectId, filter) {
  var pageToken = null;
  var resultData = null;
  var header = {
    'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
  };
  var body = {
    'projectIds': [
      cloudProjectId
    ],
    'resourceNames': [
      'projects/' + cloudProjectId
    ],
    'pageToken': pageToken,
    'orderBy': 'timestamp desc',
    'filter': filter
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': header,
    'payload': JSON.stringify(body),
    'muteHttpExceptions': false
  };
  var url = 'https://logging.googleapis.com/v2/entries:list';
  do {

    body['pageToken'] = pageToken;
    options['payload'] = JSON.stringify(body);
    try {
      var response = UrlFetchApp.fetch(url, options);
      var json = response.getContentText();
      resultData = JSON.parse(json);
      pageToken = resultData.nextPageToken;
    } catch (ex) {
      Logger.log(ex);
      break;
    }
  } while (!resultData.entries);
  return {
    'nextPageToken': pageToken,
    'resultData': resultData
  };
}

/**
 * Get the folder Id where system projects are stored;
 */
function getSystemProjectsFolderId() {
  var url = "https://cloudresourcemanager.googleapis.com/v2/folders:search";
  var header = {
    "Authorization": "Bearer " + ScriptApp.getOAuthToken()
  };
  var body = {
    "query": "displayName=apps-script"
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': header,
    'payload': JSON.stringify(body),
    'muteHttpExceptions': false
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var folderDetails = JSON.parse(response.getContentText());
    folderDetails = folderDetails['folders'][0];
    var folderName = (folderDetails['name']);
    var folderId = folderName.substring(8);
    return folderId;
  } catch (ex) {
    return null;
  }
}
