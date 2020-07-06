/**
 * Callback function on clicking the GET REPORT button and create a card for the Consent Screen
 * @return {CardService.Card} The Consent Screen Card to show to the user 
 */
function refreshScreenUI(e, token, limitResponse, reportTitle, url) {
  var card = CardService.newCardBuilder();
  
  // Add the tabs
  var tabSection = CardService.newCardSection();
  var headerButtonSet = buttonSetSection(e);
  tabSection.addWidget(headerButtonSet);
  
  var getReportAction = 
      CardService.newAction()
          .setFunctionName('getResultFromAPIWithToken')
          .setParameters({
            'token': token,
            'limitResponse': limitResponse.toString(),
            'reportTitle': reportTitle,
            'url': url
          });
  var iconUrl =
      'https://www.gstatic.com/images/icons/material/system/1x/warning_black_48dp.png';
  var getReport = CardService.newImageButton()
                      .setAltText('Most Executed Script')
                      .setIconUrl(iconUrl)
                      .setOnClickAction(getReportAction);
  
  var imageKeyValue = CardService.newKeyValue()
                          .setContent('<b>Execution Time Execeeded</b>')
                          .setButton(getReport);
  
  tabSection.addWidget(imageKeyValue);
  card.addSection(tabSection);
  
  var section2 = CardService.newCardSection();
  
  // Add the time Filter
  var timeFilterSection = CardService.newCardSection().setHeader(
    '<b>Provide Consent</b>'
  );
  var textParagraph = CardService.newTextParagraph().setText(
    'Drive Add-on will enable the logging API of all projects in the organization'
  );
  timeFilterSection.addWidget(textParagraph);
  card.addSection(timeFilterSection);
  
  
  // Create a button for generating report 
  var getReport = CardService.newTextButton()
                      .setText('Refresh')
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
