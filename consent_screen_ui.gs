/**
 * Create a card for the Consent Screen
 * @param {Object} e is the Event Object which contains information about the context
 * @return {CardService.Card} The Consent Screen Card to show to the user 
 */
function consentScreenUI(e) {
  var formInput = e.formInput;
  var card = CardService.newCardBuilder();

  // Add the tabs
  var tabSection = CardService.newCardSection();
  var headerButtonSet = buttonSetSection(e);
  tabSection.addWidget(headerButtonSet);

  var proceedAction = CardService.newAction()
                          .setFunctionName('generateReport')
                          .setParameters({
                            'input': JSON.stringify(formInput)
                          });
  var iconUrl =
    'https://www.gstatic.com/images/icons/material/system/1x/warning_black_48dp.png';
  var proceedImageButton = 
      CardService.newImageButton()
          .setAltText('Proceed')
          .setIconUrl(iconUrl)
          .setOnClickAction(proceedAction);

  var headerKeyValue = CardService.newKeyValue()
                           .setContent('<b>Consent Screen</b>')
                           .setButton(proceedImageButton);

  tabSection.addWidget(headerKeyValue);
  card.addSection(tabSection);
  var section2 = CardService.newCardSection();

  // Add the time Filter
  var contentSection = CardService.newCardSection().setHeader(
    '<b>Provide Consent</b>'
  );
  var content = 'Drive Add-on will enable the logging API ' +  
      'of all projects in the organization';
  var textParagraph = CardService.newTextParagraph().setText(content);
  contentSection.addWidget(textParagraph);
  card.addSection(contentSection);

  var proceedButton = 
      CardService.newTextButton()
          .setText('Proceed')
          .setOnClickAction(proceedAction)
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

  var cancelAction = CardService.newAction()
                         .setFunctionName('createUI');
  var cancel = CardService.newTextButton()
                   .setText('Cancel')
                   .setOnClickAction(cancelAction)
                   .setTextButtonStyle(CardService.TextButtonStyle.FILLED);

  var buttonSet = CardService.newButtonSet()
                      .addButton(proceedButton)
                      .addButton(cancel);

  section2.addWidget(buttonSet);
  card.addSection(section2);
  return card.build();
}
