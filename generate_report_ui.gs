/**
* Callback for rendering the view.
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the user.
*/
function onHomePage(e) {
  return createUI(e);
}

/**
* Creates a UI and return the card
* @param {Object} e is the Event Object which contains information about the context
* @param {string} reportUrlVal is the generated Report URL
* @return {CardService.Card} The card to show to the user
*/
function createUI(e, reportUrlVal) {
  var i;
  var card = CardService.newCardBuilder();
  
  // Add the tabs
  var tabSection = CardService.newCardSection();
  var buttonSet = buttonSetSection(e);
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
  var timeFilter = getTimeFilter(e);
  timeFilterSection.addWidget(timeFilter);
  card.addSection(timeFilterSection);
  
  // Add the project Filter
  var projectFiltersection = CardService.newCardSection().setHeader("<b>PROJECT FILTER</b>").setCollapsible(true);
  var projectFilter = getProjectFilter(e);
  projectFilter.setOnChangeAction(CardService.newAction().setFunctionName("projectFilterCallback"));
  projectFiltersection.addWidget(projectFilter);
  
  if(e.formInput && e.formInput.projectFilter == "SPECIFIC_PROJECT") {
    var projectId = CardService.newTextInput()
    .setFieldName("projectId")
    .setTitle("Enter the Cloud Project Id");
    
    if(e.formInput && e.formInput.projectId) {
      projectId.setValue(e.formInput.projectId);
    }
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
* @param {Object} e is the Event Object which contains information about the context
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
  
  var titleFromTime = getTitleandTime(input['timeFilter']); 
  var fromTime = titleFromTime['fromTime'];
  var timestampHeader = "Last" + titleFromTime['title'];  
  
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
* @param {Object} e is the Event Object which contains information about the context
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
* @param {Object} e is the Event Object which contains information about the context
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
