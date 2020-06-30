/**
* Creates a UI and return the card
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The card to show to the user
*/
function listRuleUI(e) {
  var i;
  var card = CardService.newCardBuilder();
  
  // Add the tabs
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
  
  var createRuleAction = CardService.newAction()
     .setFunctionName('createRuleUI'); 
  var createRule = CardService.newImageButton()
    .setAltText("Update Rule")
    .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/library_add_black_48dp.png")
    .setOnClickAction(createRuleAction);
  
  var imageKeyValue = CardService.newKeyValue()
    .setContent("<b>Rules List</b>")
    .setButton(createRule);
  
  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);
 
  var files = DriveApp.getFilesByName("Admin Rules For Apps Scripts");
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active  = file.getSheetByName("Admin Rules"); 
    var lastRow = active.getLastRow();
    var lastCol = active.getLastColumn();
    
    for(var i = 2; i<=lastRow; i++) {
      var ruleSection = CardService.newCardSection().setCollapsible(true).setNumUncollapsibleWidgets(1);
      var ruleData = active.getRange(i, 1, 1, lastCol).getValues()[0];
     
      var editRuleAction = CardService.newAction()
        .setFunctionName('editRule')
        .setParameters({"Number" : i.toString()});
      
      var editRule = CardService.newImageButton()
        .setAltText("Edit Rule")
        .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/edit_black_48dp.png")
        .setOnClickAction(editRuleAction);
      
      var imageKeyValueRuleHeader = CardService.newKeyValue()
        .setContent("Rule " + (i-1))
        .setButton(editRule);
      ruleSection.addWidget(imageKeyValueRuleHeader);
      
      var imageKeyValueRuleData = CardService.newKeyValue()
        .setTopLabel("Rule Type");
      if(ruleData[0] == "MAX_NO_OF_EXECS") {
        imageKeyValueRuleData.setContent("Maximum Number Of Executions");
      }
      ruleSection.addWidget(imageKeyValueRuleData);
      
      var imageKeyValueTriggerData = CardService.newKeyValue()
        .setTopLabel("Trigger Frequency");
      if(ruleData[1] == "EVERY_HOUR") {
        imageKeyValueTriggerData.setContent("Every Hour");
      } else if(ruleData[1] == "EVERY_6_HOUR") {
        imageKeyValueTriggerData.setContent("Every 6 Hours");
      } else if(ruleData[1] == "EVERY_24_HOUR") {
        imageKeyValueTriggerData.setContent("Every 24 Hours");
      } else if(ruleData[1] == "EVERY_7_DAYS") {
        imageKeyValueTriggerData.setContent("Every 7 Days");
      } else if(ruleData[1] == "EVERY_30_DAYS") {
        imageKeyValueTriggerData.setContent("Every 30 Days");
      }
      ruleSection.addWidget(imageKeyValueTriggerData);
      
      var imageKeyValueProjectData = CardService.newKeyValue()
        .setTopLabel("Project Type");
      if(ruleData[2] == "SYSTEM_PROJECT") {
        imageKeyValueProjectData.setContent("System Projects");
      } else if(ruleData[2] == "CUSTOM_PROJECT") {
        imageKeyValueProjectData.setContent("Custom Projects");
      } else if(ruleData[2] == "SPECIFIC_PROJECT") {
        imageKeyValueProjectData.setContent("Specific Project " + ruleData[3]);
      } else if(ruleData[2] == "ALL_PROJECT") {
        imageKeyValueProjectData.setContent("All Projects");
      }
      ruleSection.addWidget(imageKeyValueProjectData);
      
      var imageKeyValueLimitData = CardService.newKeyValue()
        .setTopLabel("Maximum Limit");
      imageKeyValueLimitData.setContent(ruleData[4]);
      ruleSection.addWidget(imageKeyValueLimitData);
      
      var imageKeyValueAdminData = CardService.newKeyValue()
        .setTopLabel("Admin Email");
      imageKeyValueAdminData.setContent(ruleData[5]);
      ruleSection.addWidget(imageKeyValueAdminData);
      
      card.addSection(ruleSection);
    }
  }
  return card.build();
}
