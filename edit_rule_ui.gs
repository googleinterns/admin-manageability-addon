/**
* Creates edit rule UI and return the card
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the user
*/
function editRule(e){
  
  var ruleNumber = parseInt(e.parameters.Number);
  var files = DriveApp.getFilesByName("Admin Rules For Apps Scripts");
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active  = file.getSheetByName("Admin Rules"); 
    var lastCol = active.getLastColumn();
    var ruleData = active.getRange(ruleNumber, 1, 1, lastCol).getValues()[0];
    e.formInput = {
      "ruleType" : ruleData[0],
      "triggerFrequency" : ruleData[1],
      "ruleProjectFilter" : ruleData[2],
      "projectId" : ruleData[3],
      "maxLimit" : ruleData[4]
    };
    var card = editRuleUI(e);
    var navigation = CardService.newNavigation()
      .updateCard(card);
    var actionResponse = CardService.newActionResponseBuilder()
      .setNavigation(navigation);
    return actionResponse.build();
  }
}

/**
* Creates edit rule UI and return the card
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the user
*/
function editRuleUI(e){
  var ruleNumber = parseInt(e.parameters.Number);
  var card = CardService.newCardBuilder();
  var tabSection = CardService.newCardSection();
  
  var generateReportAction = CardService.newAction().setFunctionName('createUI');
  var btn1 = CardService.newTextButton()
    .setText('Insights')
    .setOnClickAction(generateReportAction);
  var createRuleAction = CardService.newAction().setFunctionName('listRuleUI');
  var btn2 = CardService.newTextButton()
    .setText('Actions')
    .setOnClickAction(createRuleAction);
  var buttonSet = CardService.newButtonSet().addButton(btn1).addButton(btn2);
  tabSection.addWidget(buttonSet);
  
  var updateRuleAction = CardService.newAction()
    .setFunctionName('updateRule')
    .setParameters({"Number" : ruleNumber.toString()}); 
  var updateRule = CardService.newImageButton()
    .setAltText("Update Rule")
    .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/save_black_48dp.png")
    .setOnClickAction(updateRuleAction);
  var imageKeyValue = CardService.newKeyValue()
    .setContent("<b>Edit Rule " + (ruleNumber-1) +"</b>")
    .setButton(updateRule);
  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);
  
  // Add Rule Type to the Card
  var ruleTypeSection = CardService.newCardSection()
     .setHeader("<b>RULE TYPE</b>")
     .setCollapsible(true);
  var ruleType = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("ruleType");
  ruleType.addItem("Maximum Number of Executions", "MAX_NO_OF_EXECS", true);
  ruleTypeSection.addWidget(ruleType);
  card.addSection(ruleTypeSection);
  
  // Add Trigger Frequency to the Card
  var triggerFrequencySection = CardService.newCardSection()
     .setHeader("<b>TRIGGER FREQUENCY</b>")
     .setCollapsible(true);
  var triggerFrequency = CardService.newSelectionInput()
     .setType(CardService.SelectionInputType.RADIO_BUTTON)
     .setFieldName("triggerFrequency");
  
  // add the items according to input
  if(e.formInput) {
    triggerFrequency.addItem("Every Hour", "EVERY_HOUR", e.formInput.triggerFrequency == "EVERY_HOUR");
    triggerFrequency.addItem("Every 6 Hours", "EVERY_6_HOUR", e.formInput.triggerFrequency == "EVERY_6_HOUR");
    triggerFrequency.addItem("Every 24 Hours", "EVERY_24_HOUR", e.formInput.triggerFrequency == "EVERY_24_HOUR");
    triggerFrequency.addItem("Every 7 Days", "EVERY_7_DAYS", e.formInput.triggerFrequency == "EVERY_7_DAYS");
    triggerFrequency.addItem("Every 30 Days", "EVERY_30_DAYS", e.formInput.triggerFrequency == "EVERY_30_DAYS");
  }
  else {
    triggerFrequency.addItem("Every Hour", "EVERY_HOUR", true);
    triggerFrequency.addItem("Every 6 Hours", "EVERY_6_HOUR", false);
    triggerFrequency.addItem("Every 24 Hours", "EVERY_24_HOUR", false);
    triggerFrequency.addItem("Every 7 Days", "EVERY_7_DAYS", false);
    triggerFrequency.addItem("Every 30 Days", "EVERY_30_DAYS", false);
  }
  triggerFrequencySection.addWidget(triggerFrequency);
  card.addSection(triggerFrequencySection);
  
  // Create a dropdown of Project Filters
  var ruleProjectFilterSection = CardService.newCardSection()
    .setHeader("<b>PROJECT FILTER</b>")
    .setCollapsible(true);
  var ruleProjectFilter = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setFieldName("ruleProjectFilter")
    .setOnChangeAction(CardService.newAction()
          .setFunctionName("editRuleProjectFilterCallback")
          .setParameters({"Number" : ruleNumber.toString()}));

  if(e.formInput) {
    ruleProjectFilter.addItem("System Projects", "SYSTEM_PROJECT", e.formInput.ruleProjectFilter == "SYSTEM_PROJECT");
    ruleProjectFilter.addItem("Custom Projects", "CUSTOM_PROJECT", e.formInput.ruleProjectFilter == "CUSTOM_PROJECT");
    ruleProjectFilter.addItem("Specific Project", "SPECIFIC_PROJECT", e.formInput.ruleProjectFilter == "SPECIFIC_PROJECT");
    ruleProjectFilter.addItem("All Projects", "ALL_PROJECT", e.formInput.ruleProjectFilter == "ALL_PROJECT");
  }
  else {
    ruleProjectFilter.addItem("System Projects", "SYSTEM_PROJECT", true);
    ruleProjectFilter.addItem("Custom Projects", "CUSTOM_PROJECT", false);
    ruleProjectFilter.addItem("Specific Project", "SPECIFIC_PROJECT", false);
    ruleProjectFilter.addItem("All Projects", "ALL_PROJECT", false);
  }
  ruleProjectFilterSection.addWidget(ruleProjectFilter);
  
  // Create a new Text field for entering projectId
  if(e.formInput && e.formInput.ruleProjectFilter == "SPECIFIC_PROJECT") {
    var projectId = CardService.newTextInput()
      .setFieldName("projectId")
      .setTitle("Enter the Cloud Project Id");
    if(e.formInput.projectId) {
      projectId.setValue(e.formInput.projectId);
    }
    ruleProjectFilterSection.addWidget(projectId);
  }
  card.addSection(ruleProjectFilterSection);
  
  var maxLimitSection = CardService.newCardSection()
    .setHeader("<b>PARAMS</b>")
    .setCollapsible(true);
  var maxLimit = CardService.newTextInput()
    .setFieldName("maxLimit")
    .setTitle("Enter the Maximum Limit ")
    .setValue(e.formInput.maxLimit);
  maxLimitSection.addWidget(maxLimit);
  card.addSection(maxLimitSection);
  
  // Create a button for generating report
  var createRuleSection = CardService.newCardSection();
  var createRule = CardService.newTextButton()
    .setText('Update Rule')
    .setOnClickAction(updateRuleAction)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  createRuleSection.addWidget(createRule);
  card.addSection(createRuleSection);    
  return card.build();

}

/**
* Callback for the project Filter
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the user
*/
function editRuleProjectFilterCallback(e){
  var card = editRuleUI(e);
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}

/**
* Callback function on clicking the update rule button
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the rules to the user
*/
function updateRule(e) {
  var input = e.formInput;
  var projectId = input.projectId;
  if(!projectId) {
    projectId = null;
  }
  var files = DriveApp.getFilesByName("Admin Rules For Apps Scripts");
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active  = file.getSheetByName("Admin Rules"); 
    var lastRow = parseInt(e.parameters.Number);
    var lastCol = active.getLastColumn();
    var rowContent = [
      [
        input.ruleType, 
        input.triggerFrequency, 
        input.ruleProjectFilter, 
        projectId, 
        input.maxLimit, 
        Session.getActiveUser().getEmail()
      ]
    ];
    active.getRange(lastRow, 1, 1, lastCol).setValues(rowContent);
  }
  var card = listRuleUI(e);
  var navigation = CardService.newNavigation()
    .updateCard(card);
  var actionResponse = CardService.newActionResponseBuilder()
    .setNavigation(navigation);
  return actionResponse.build();
}
