/**
 * Callback for rendering the view.
 * @return {CardService.Card} The card to show to the user.
 */
function onHomePage(e) {
  return createUI(e);
}

/**
 * Creates a UI and return the card.
 * @return {CardService.Card} The card to show to the user.
 */
function createUI(e, reportUrlVal) {
  var card = CardService.newCardBuilder();

  // Add the tabs.
  var tabSection = CardService.newCardSection();
  var buttonSet = buttonSetSection(e);
  tabSection.addWidget(buttonSet);

  var iconUrl =
      'https://www.gstatic.com/images/icons/material/system/1x/check_circle_black_48dp.png';
  var getReportAction =
      CardService.newAction().setFunctionName('consentScreenUI');
  var getReport = CardService.newImageButton()
                      .setAltText('Generate Report')
                      .setIconUrl(iconUrl)
                      .setOnClickAction(getReportAction);

  var imageKeyValue = CardService.newKeyValue()
                          .setContent('<b>Generate Report</b>')
                          .setButton(getReport);

  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);

  if (!e.formInput || e.formInput.reportType != 'ownerOfScripts') {
    // Add the time Filter.
    var timeFilterSection =
        CardService.newCardSection().setCollapsible(true).setHeader(
            '<b>TIME FILTER</b>');
    var timeFilter = getTimeFilter(e);
    timeFilterSection.addWidget(timeFilter);
    card.addSection(timeFilterSection);
  }

  // Add the project Filter.
  var projectFiltersection = CardService.newCardSection()
                                 .setHeader('<b>PROJECT FILTER</b>')
                                 .setCollapsible(true);
  var projectFilter = getProjectFilter(e);
  var projectFilterCallbackAction =
      CardService.newAction().setFunctionName('projectFilterCallback');
  projectFilter.setOnChangeAction(projectFilterCallbackAction);
  projectFiltersection.addWidget(projectFilter);

  if (e.formInput && e.formInput.projectFilter == 'SPECIFIC_PROJECT') {
    var projectId = CardService.newTextInput()
                        .setFieldName('projectId')
                        .setTitle('Enter the Cloud Project Id');

    if (e.formInput && e.formInput.projectId) {
      projectId.setValue(e.formInput.projectId);
    }
    projectFiltersection.addWidget(projectId);
  }
  card.addSection(projectFiltersection);

  // Add the report type Filter
  var reportTypesection = CardService.newCardSection()
                              .setHeader('<b>REPORT FILTER</b>')
                              .setCollapsible(true);
  var reportType = CardService.newSelectionInput()
                       .setType(CardService.SelectionInputType.RADIO_BUTTON)
                       .setFieldName('reportType');

  // add items in the radio button.
  if (e.formInput) {
    reportType.addItem(
        'Most Executed Script', 'mostExecutedScript',
        e.formInput.reportType == 'mostExecutedScript');
    reportType.addItem(
        'Most Active Users', 'mostActiveUsers',
        e.formInput.reportType == 'mostActiveUsers');
    reportType.addItem(
        'Owners of Scripts', 'ownerOfScripts',
        e.formInput.reportType == 'ownerOfScripts');
  } else {
    reportType.addItem('Most Executed Script', 'mostExecutedScript', true);
    reportType.addItem('Most Active Users', 'mostActiveUsers', false);
    reportType.addItem('Owners of Scripts', 'ownerOfScripts', false);
  }
  reportType.setOnChangeAction(
      CardService.newAction().setFunctionName('reportTypeCallback'));
  reportTypesection.addWidget(reportType);

  if (!e.formInput || e.formInput.reportType != 'ownerOfScripts') {
    var limitResponse = CardService.newTextInput()
                            .setFieldName('limitResponse')
                            .setTitle('Enter the Number Of Responses ');

    if (e.formInput && e.formInput.limitResponse) {
      limitResponse.setValue(e.formInput.limitResponse);
    }
    reportTypesection.addWidget(limitResponse);
  }
  card.addSection(reportTypesection);

  var section2 = CardService.newCardSection();
  // Create text Paragraph for placing url of report
  if (reportUrlVal) {
    var reportUrl = CardService.newTextParagraph().setText(
        '<b>Report Url</b>\n <a href="' + reportUrlVal + '">' + reportUrlVal +
        '</a>');
    section2.addWidget(reportUrl);
  }

  var cloudInstance = CardService.newKeyValue()
                          .setTopLabel('VM Instance')
                          .setContent('VM Instance Report')
                          .setSwitch(CardService.newSwitch()
                                         .setFieldName('cloudInstance')
                                         .setValue('cloud_instance_true'));
  section2.addWidget(cloudInstance);

  // Create a button for generating report
  var generateReport =
      CardService.newTextButton()
          .setText('Generate Report')
          .setOnClickAction(getReportAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  section2.addWidget(generateReport);
  card.addSection(section2);

  return card.build();
}

/**
 * Callback function on clicking the GET REPORT button and
 * create a card with most executed script and most active users.
 * @return {CardService.Card} The card to show to the user.
 */
function generateReport(e) {
  var projTitle;
  var input = e.parameters.input;
  input = JSON.parse(input);
  var projectFilter = input['projectFilter'];
  var reportType = input['reportType'];
  var limitResponse = input['limitResponse'];
  var cloudInstance = input['cloudInstance'];
  if (!limitResponse) {
    limitResponse = 1;
  }

  var titleFromTime = getTitleandTime(input['timeFilter']);
  var fromTime = titleFromTime['fromTime'];
  var timestampHeader = 'Last' + titleFromTime['title'];
  if (projectFilter == 'SPECIFIC_PROJECT') {
    projTitle = 'Specific Project';
  } else if (projectFilter == 'CUSTOM_PROJECT') {
    projTitle = 'Custom Projects';
  } else if (projectFilter == 'SYSTEM_PROJECT') {
    projTitle = 'System Projects';
  } else {
    projTitle = 'All Projects';
  }

  var reportTitle, urlEnd;
  if (cloudInstance) {
    if (reportType == 'mostExecutedScript') {
      urlEnd = 'mostExecutedScript';
      reportTitle = 'Report for Most Executed Script of ' + projTitle +
          ' for ' + timestampHeader;
    } else if (reportType == 'mostActiveUsers') {
      urlEnd = 'mostActiveUsers';
      reportTitle = 'Report for Most Active Users of ' + projTitle + ' for ' +
          timestampHeader;
    } else {
      urlEnd = 'emailOfOwnerOfScript';
      reportTitle = 'Report for Owners of Apps Script of ' + projTitle;
    }
    var token =
        getTokenFromAPI(fromTime, projectFilter, input.projectId, urlEnd);
    var card = refreshScreenUI(e, token, limitResponse, reportTitle, urlEnd);
    var navigation = CardService.newNavigation().updateCard(card);
    var actionResponse =
        CardService.newActionResponseBuilder().setNavigation(navigation);
    return actionResponse.build();
  }
  if (reportType == 'mostExecutedScript') {
    var mostExecutedScript = getMostExecutedScriptFromAllCloudProjects(
        fromTime, projectFilter, input['projectId']);
    var reportUrl = generateReportForMostExecutedScript(
        mostExecutedScript,
        'Report for Most Executed Script of ' + projTitle + ' for ' +
            timestampHeader,
        limitResponse);
  } else if (reportType == 'mostActiveUsers') {
    var mostActiveUser =
        getMostActiveUser(fromTime, projectFilter, input.projectId);
    var reportUrl = generateReportForMostActiveUsers(
        mostActiveUser,
        'Report for Most Active Users of ' + projTitle + ' for ' +
            timestampHeader,
        limitResponse);
  } else {
    var emailOfOwnerOfScript =
        getOwnersOfAllScripts(projectFilter, input.projectId);
    var reportUrl = generateReportForOwnerOfScripts(
        emailOfOwnerOfScript,
        'Report for Owners of Apps Script of ' + projTitle);
  }

  // update the card and return it
  var card = createUI(e, reportUrl);
  var navigation = CardService.newNavigation().updateCard(card);
  var actionResponse =
      CardService.newActionResponseBuilder().setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Callback for the project Filter.
 * @return {CardService.Card} The card to show to the user.
 */
function projectFilterCallback(e) {
  var card = createUI(e);
  var navigation = CardService.newNavigation().updateCard(card);
  var actionResponse =
      CardService.newActionResponseBuilder().setNavigation(navigation);
  return actionResponse.build();
}

/**
 * Callback for the report type Filter.
 * @return {CardService.Card} The card to show to the user.
 */
function reportTypeCallback(e) {
  var card = createUI(e);
  var navigation = CardService.newNavigation().updateCard(card);
  var actionResponse =
      CardService.newActionResponseBuilder().setNavigation(navigation);
  return actionResponse.build();
}
