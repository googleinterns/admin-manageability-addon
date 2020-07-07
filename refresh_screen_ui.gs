/**
* Create a card for refresh screen
* @param {Object} e is the Event Object which contains information about the context
* @param {string} token is the token generated be API to gey result
* @param {int} limitResponse is the maximum number of responses
* @param {string} reportTitle is the title of the report
* @param {string} url is the ending of the API call
* @return {CardService.Card} The card to show to the user
*/
function refreshScreenUI(e, token, limitResponse, reportTitle, url) {
  var card = CardService.newCardBuilder();
  
  // Add the tabs
  var tabSection = CardService.newCardSection();
  var headerButtonSet = buttonSetSection(e);
  tabSection.addWidget(headerButtonSet);
  
  var getRefreshAction = 
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
  var refreshImageButton = CardService.newImageButton()
                               .setAltText('Execution Time Limit Execeeded')
                               .setIconUrl(iconUrl)
                               .setOnClickAction(getRefreshAction);
  
  var headerSection = CardService.newKeyValue()
                          .setContent('<b>Execution Time Time Execeeded</b>')
                          .setButton(refreshImageButton);
  
  tabSection.addWidget(headerSection);
  card.addSection(tabSection);
  
  var section2 = CardService.newCardSection();
  
  // Add the time Filter
  var contentSection = CardService.newCardSection().setHeader(
    '<b>Execution Time Limit Exceeded</b>'
  );
  var textParagraph = CardService.newTextParagraph().setText(
    'Drive Add-on has crossed the maximum execution time limit'
  );
  contentSection.addWidget(textParagraph);
  card.addSection(contentSection);
  
  
  // Create a button to try again to generate report 
  var refreshButton = 
      CardService.newTextButton().setText('Refresh')
          .setOnClickAction(getRefreshAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  var cancelAction = CardService.newAction()
                         .setFunctionName('createUI');
  var cancel =
      CardService.newTextButton().setText('Cancel')
          .setOnClickAction(cancelAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED);
  
  var buttonSet = CardService.newButtonSet()
                      .addButton(refreshButton)
                      .addButton(cancel);
  
  section2.addWidget(buttonSet);
  card.addSection(section2);
  
  return card.build();
}
