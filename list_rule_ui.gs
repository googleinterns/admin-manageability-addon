/**
 * Creates a UI and return the card
 * @param {Object} e is the Event Object 
 *    which contains information about the context
 * @return {CardService.Card} The card to show to the user
 */
function listRuleUI(e) {
  var i;
  var card = CardService.newCardBuilder();

  // Add the tabs
  var tabSection = CardService.newCardSection();
  var buttonSet = buttonSetSection(e);
  tabSection.addWidget(buttonSet);

  var createIconUrl =
    "https://www.gstatic.com/images/icons/material/system/1x/library_add_black_48dp.png";
  var createRuleAction =
    CardService.newAction().setFunctionName('createRuleUI');
  var createRule = CardService.newImageButton()
    .setAltText("Update Rule")
    .setIconUrl(createIconUrl)
    .setOnClickAction(createRuleAction);

  var imageKeyValue = CardService.newKeyValue()
    .setContent("<b>Rules List</b>")
    .setButton(createRule);

  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);

  var files = DriveApp.getFilesByName(adminRuleFileName);
  if (files.hasNext()) {
    var file = SpreadsheetApp.open(files.next());
    var active = file.getSheetByName(adminRuleSheetName);
    var lastRow = active.getLastRow();
    var lastCol = active.getLastColumn();

    for (var i = 2; i <= lastRow; i++) {
      var ruleSection = CardService.newCardSection()
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(1);
      var ruleData = active.getRange(i, 1, 1, lastCol).getValues()[0];

      var editRuleAction = CardService.newAction()
        .setFunctionName('editRule')
        .setParameters({
          "Number": i.toString()
        });
      var editIconUrl =
        "https://www.gstatic.com/images/icons/material/system/1x/edit_black_48dp.png";
      var editRule = CardService.newImageButton()
        .setAltText("Edit Rule")
        .setIconUrl(editIconUrl)
        .setOnClickAction(editRuleAction);

      var imageKeyValueRuleHeader = CardService.newKeyValue()
        .setContent("Rule " + (i - 1))
        .setButton(editRule);
      ruleSection.addWidget(imageKeyValueRuleHeader);

      var imageKeyValueRuleData =
        CardService.newKeyValue().setTopLabel("Rule Type");
      if (ruleData[0] == "MAX_NO_OF_EXECS") {
        imageKeyValueRuleData.setContent("Maximum Number Of Executions");
      }
      ruleSection.addWidget(imageKeyValueRuleData);

      var imageKeyValueTriggerData =
        CardService.newKeyValue().setTopLabel("Trigger Frequency");
      var title = getTitleandTime(ruleData[1]);
      imageKeyValueTriggerData.setContent("Every" + title.timestampHeader);
      ruleSection.addWidget(imageKeyValueTriggerData);

      var imageKeyValueProjectData =
        CardService.newKeyValue().setTopLabel("Project Type");
      if (ruleData[2] == "SYSTEM_PROJECT") {
        imageKeyValueProjectData.setContent("System Projects");
      } else if (ruleData[2] == "CUSTOM_PROJECT") {
        imageKeyValueProjectData.setContent("Custom Projects");
      } else if (ruleData[2] == "SPECIFIC_PROJECT") {
        imageKeyValueProjectData.setContent("Specific Project " + ruleData[3]);
      } else if (ruleData[2] == "ALL_PROJECT") {
        imageKeyValueProjectData.setContent("All Projects");
      }
      ruleSection.addWidget(imageKeyValueProjectData);

      var imageKeyValueLimitData =
        CardService.newKeyValue().setTopLabel("Maximum Limit");
      imageKeyValueLimitData.setContent(ruleData[4]);
      ruleSection.addWidget(imageKeyValueLimitData);

      var imageKeyValueAdminData =
        CardService.newKeyValue().setTopLabel("Admin Email");
      imageKeyValueAdminData.setContent(ruleData[5]);
      ruleSection.addWidget(imageKeyValueAdminData);

      card.addSection(ruleSection);
    }
  }
  return card.build();
}
