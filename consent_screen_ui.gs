/**
* Create a card for the Consent Screen
* @param {Object} e is the Event Object which contains information about the context
* @return {CardService.Card} The Consent Screen Card to show to the user 
*/
function consentScreenUI(e) {
  var formInput = e.formInput;
  var i;
  var card = CardService.newCardBuilder();
  
  // Add the tabs
  var tabSection = CardService.newCardSection();
  var buttonSet = buttonSetSection(e);
  tabSection.addWidget(buttonSet);
  
  var getReportAction = CardService.newAction()
    .setFunctionName('generateReport')
    .setParameters({'input' : JSON.stringify(formInput)}); 
  var getReport = CardService.newImageButton()
    .setAltText("Generate Report")
    .setIconUrl("https://www.gstatic.com/images/icons/material/system/1x/warning_black_48dp.png")
    .setOnClickAction(getReportAction);
  
  var imageKeyValue = CardService.newKeyValue()
    .setContent("<b>Consent Screen</b>")
    .setButton(getReport);
  
  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);
  var section2 = CardService.newCardSection();
  
  // Add the time Filter
  var timeFilterSection = CardService.newCardSection().setHeader("<b>Provide Consent</b>"); 
  var textParagraph = CardService.newTextParagraph()
    .setText("Drive Add-on will enable the logging API of all projects in the organization");
  timeFilterSection.addWidget(textParagraph);
  card.addSection(timeFilterSection);
  
  var getReportAction = CardService.newAction()
    .setFunctionName('generateReport')
    .setParameters({'input' : JSON.stringify(formInput)}); 
  var getReport = CardService.newTextButton()
    .setText('Proceed')
    .setOnClickAction(getReportAction)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  var cancelAction = CardService.newAction()
    .setFunctionName('createUI'); 
  var cancel = CardService.newTextButton()
    .setText('Cancel')
    .setOnClickAction(cancelAction)
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  var buttonSet = CardService.newButtonSet()
    .addButton(getReport)
    .addButton(cancel);
  
  section2.addWidget(buttonSet);
  card.addSection(section2);
  return card.build();
}
