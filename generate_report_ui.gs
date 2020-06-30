/**
 * Callback for rendering the view.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomePage(e) {
  return createUI(e);
}

/**
* Creates a UI and return the card
* @return {CardService.Card} The card to show to the user
*/
function createUI(e, reportUrlVal) {
  var i;
  var card = CardService.newCardBuilder();
  
  // Add the tabs
  var tabSection = CardService.newCardSection();
  var generateReportAction = CardService.newAction().setFunctionName('createUI');
  var btn1 = CardService.newTextButton().setText('Insights').setOnClickAction(generateReportAction);
  var createRuleAction = CardService.newAction().setFunctionName('listRuleUI');
  var btn2 = CardService.newTextButton().setText('Actions').setOnClickAction(createRuleAction);
  var buttonSet = CardService.newButtonSet()
    .addButton(btn1)
    .addButton(btn2);
  tabSection.addWidget(buttonSet);
  
  var getReportAction = CardService.newAction()
      .setFunctionName('generateReport'); 
  var getReport = CardService.newImageButton()
    .setAltText("Generate Report")
    .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/check_circle_black_48dp.png")
    .setOnClickAction(getReportAction);
  
  var imageKeyValue = CardService.newKeyValue()
  .setContent("<b>Generate Report</b>")
  .setButton(getReport);
  
  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);
 
  // Add the time Filter
  var timeFilterSection = CardService.newCardSection().setCollapsible(true).setHeader("<b>TIME FILTER</b>"); 
  var timeFilter = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("timeFilter");
  
  // add the items according to input
  if(e.formInput) {
    timeFilter.addItem("Last Hour", "LAST_HOUR", e.formInput.timeFilter == "LAST_HOUR");
    timeFilter.addItem("Last 6 Hours", "LAST_6_HOUR", e.formInput.timeFilter == "LAST_6_HOUR");
    timeFilter.addItem("Last 24 Hours", "LAST_24_HOUR", e.formInput.timeFilter == "LAST_24_HOUR");
    timeFilter.addItem("Last 7 Days", "LAST_7_DAYS", e.formInput.timeFilter == "LAST_7_DAYS");
    timeFilter.addItem("Last 30 Days", "LAST_30_DAYS", e.formInput.timeFilter == "LAST_30_DAYS");
  }
  else {
    timeFilter.addItem("Last Hour", "LAST_HOUR", true);
    timeFilter.addItem("Last 6 Hours", "LAST_6_HOUR", false);
    timeFilter.addItem("Last 24 Hours", "LAST_24_HOUR", false);
    timeFilter.addItem("Last 7 Days", "LAST_7_DAYS", false);
    timeFilter.addItem("Last 30 Days", "LAST_30_DAYS", false);
  }
  timeFilterSection.addWidget(timeFilter);
  card.addSection(timeFilterSection);
  
  // Add the project Filter
  var projectFiltersection = CardService.newCardSection().setHeader("<b>PROJECT FILTER</b>").setCollapsible(true);
  var projectFilter = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("projectFilter");
  
  // add the items according to input
  if(e.formInput) {
    projectFilter.addItem("System Projects", "SYSTEM_PROJECT", e.formInput.projectFilter == "SYSTEM_PROJECT");
    projectFilter.addItem("Custom Projects", "CUSTOM_PROJECT", e.formInput.projectFilter == "CUSTOM_PROJECT");
    projectFilter.addItem("Specific Project", "SPECIFIC_PROJECT", e.formInput.projectFilter == "SPECIFIC_PROJECT");
    projectFilter.addItem("All Projects", "ALL_PROJECT", e.formInput.projectFilter == "ALL_PROJECT");
  }
  else {
    projectFilter.addItem("System Projects", "SYSTEM_PROJECT", true);
    projectFilter.addItem("Custom Projects", "CUSTOM_PROJECT", false);
    projectFilter.addItem("Specific Project", "SPECIFIC_PROJECT", false);
    projectFilter.addItem("All Projects", "ALL_PROJECT", false);
  }
  projectFilter.setOnChangeAction(CardService.newAction()
        .setFunctionName("projectFilterCallback"));
  projectFiltersection.addWidget(projectFilter);
  
  // Create a new Text field for entering projectId
  if(e.formInput && e.formInput.projectFilter == "SPECIFIC_PROJECT") {
    var projectId = CardService.newTextInput()
    .setFieldName("projectId")
    .setTitle("Enter the Cloud Project Id");
    projectFiltersection.addWidget(projectId);
  }
  card.addSection(projectFiltersection);
  
  // Add the report type Filter
  var reportTypesection = CardService.newCardSection().setHeader("<b>REPORT FILTER</b>").setCollapsible(true);
  var reportType = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("reportType");
  
  // add items in the radio button
   if(e.formInput) {
    reportType.addItem("Most Executed Script", "mostExecutedScript", e.formInput.reportType == "mostExecutedScript")
    reportType.addItem("Most Active Users", "mostActiveUsers", e.formInput.reportType == "mostActiveUsers")
    reportType.addItem("Owners of Scripts", "ownerOfScripts", e.formInput.reportType == "ownerOfScripts");
   }
  else {
    reportType.addItem("Most Executed Script", "mostExecutedScript", true)
    reportType.addItem("Most Active Users", "mostActiveUsers", false)
    reportType.addItem("Owners of Scripts", "ownerOfScripts", false);
  }
  reportType.setOnChangeAction(CardService.newAction()
        .setFunctionName("reportTypeCallback"));
  reportTypesection.addWidget(reportType);
  
  if(!e.formInput || e.formInput.reportType != "ownerOfScripts") {
  var limitResponse = CardService.newTextInput()
    .setFieldName("limitResponse")
    .setTitle("Enter the Number Of Responses ");
    reportTypesection.addWidget(limitResponse);
  }
  card.addSection(reportTypesection);
  
  var section2 = CardService.newCardSection();
  // Create text Paragraph for placing url of report
  if(reportUrlVal) {
    var reportUrl = CardService.newTextParagraph()
    .setText("<b>Report Url</b>\n <a href='"+reportUrlVal+"'>"+reportUrlVal+"</a>");
    section2.addWidget(reportUrl);
  }
    
  // Create a button for generating report
  var getReportAction = CardService.newAction()
      .setFunctionName('generateReport'); 
  var getReport = CardService.newTextButton()
      .setText('Generate Report')
      .setOnClickAction(getReportAction)
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  section2.addWidget(getReport);
  card.addSection(section2);
  
   return card.build();
}

/**
* Callback function on clicking the GET REPORT button and create a card with most executed script and most active users
* @return {CardService.Card} The card to show to the user
*/
function generateReport(e) {
  var timestamp_header, projTitle;
  var toTime = new Date();
  var millisInBetween;
  var input  = e.formInput;
  var projectFilter = input.projectFilter;
  var reportType = input.reportType;
  var limitResponse = input.limitResponse;
  if(!limitResponse) {
    limitResponse = 1;
  }
  if(input.timeFilter == "LAST_HOUR") { 
    timestamp_header = "Last Hour";
    millisInBetween = 60*60*1000;
  } else if(input.timeFilter == "LAST_6_HOUR") {
    timestamp_header = "Last 6 Hours";
    millisInBetween = 6*60*60*1000;
  } else if(input.timeFilter == "LAST_24_HOUR") {
    timestamp_header = "Last 24 Hours";
    millisInBetween = 24*60*60*1000;
  } else if(input.timeFilter == "LAST_7_DAYS") {
    timestamp_header = "Last 7 Days";
    millisInBetween = 7*24*60*60*1000;
  } else {
    timestamp_header = "Last 30 Days";
    millisInBetween = 30*24*60*60*1000;
  }
  
  if(projectFilter == "SPECIFIC_PROJECT") {
    projTitle = "Specific Project";
  } else if(projectFilter == "CUSTOM_PROJECT") {
    projTitle = "Custom Projects";
  } else if(projectFilter == "SYSTEM_PROJECT") {
    projTitle = "System Projects";
  } else {
    projTitle = "All Projects";
  }
  
  //to get the start time in Etc/GMT format
  var fromTime = new Date(toTime.getTime() - millisInBetween);
  var fromTimeFormatGMT = Utilities.formatDate(fromTime, 'Etc/GMT', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
  
  if(reportType == "mostExecutedScript") {
    var mostExecutedScript = getMostExecutedScriptFromAllCloudProjects(fromTimeFormatGMT , projectFilter, input.projectId);
    var reportUrl = generateReportForMostExecutedScript(mostExecutedScript, "Report for Most Executed Script of "+ projTitle + " for " + timestamp_header, limitResponse); 
  } else if(reportType == "mostActiveUsers") {
    var mostActiveUser = getMostActiveUser(fromTimeFormatGMT , projectFilter, input.projectId);
    var reportUrl = generateReportForMostActiveUsers(mostActiveUser, "Report for Most Active Users of "+ projTitle + " for " + timestamp_header, limitResponse);
  } else {
    var emailOfOwnerOfScript = getOwnersOfAllScripts(projectFilter, input.projectId);
    var reportUrl = generateReportForOwnerOfScripts(emailOfOwnerOfScript, "Report for Owners of Apps Script of "+ projTitle);
  }
  
  // update the card and return it
  var card = createUI(e, reportUrl);
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}

/**
* Callback for the project Filter
* @return {CardService.Card} The card to show to the user
*/
function projectFilterCallback(e) {
  var card = createUI(e);
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}

/**
* Callback for the report type Filter
* @return {CardService.Card} The card to show to the user
*/
function reportTypeCallback(e) {
  var card = createUI(e);
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}
