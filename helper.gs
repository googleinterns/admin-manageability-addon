// get the title and from Time from the timeFilter value
function getTitleandTime(timeFilter) {
  var toTime = new Date();
  var millisInBetween;
  var timestampHeader;
  if(timeFilter == "LAST_HOUR") { 
    millisInBetween = 60*60*1000;
    timestampHeader = "hour";
  } else if(timeFilter == "LAST_6_HOUR") {
    millisInBetween = 6*60*60*1000;
    timestampHeader = "6 hours";
  } else if(timeFilter == "LAST_24_HOUR") {
    millisInBetween = 24*60*60*1000;
    timestampHeader = "24 hours";
  } else if(timeFilter == "LAST_7_DAYS") {
    millisInBetween = 7*24*60*60*1000;
    timestampHeader = "7 days";
  } else {
    millisInBetween = 30*24*60*60*1000;
    timestampHeader = "30 days";
  }
  var fromTime = new Date(toTime.getTime() - millisInBetween);
  fromTime = Utilities.formatDate(fromTime, 'Etc/GMT', 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');  
  return {"FromTime" : fromTime, "timestampHeader" : title};
}

// get the time Filter Card Section
function getTimeFilter(e) {
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
  
  return timeFilter;
}

// get the Project Filter Card Section
function getProjectFilter(e) {
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
  return projectFilter;
}


// get the header Section Card Buttons
function buttonSetSection(e) {
  var generateReportAction = CardService.newAction().setFunctionName('createUI');
  var btn1 = CardService.newTextButton().setText('Insights').setOnClickAction(generateReportAction);
  var createRuleAction = CardService.newAction().setFunctionName('listRuleUI');
  var btn2 = CardService.newTextButton().setText('Actions').setOnClickAction(createRuleAction);
  var buttonSet = CardService.newButtonSet()
    .addButton(btn1)
    .addButton(btn2);
  return buttonSet;
}
