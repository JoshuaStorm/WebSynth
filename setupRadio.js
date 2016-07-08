function setupRadio(x, y, radioOptions, verticalFlag, defaultOption) {
  var BUTTON_WIDTH = 30;
  var labelFontSize = floor(height / 75);
  var thisRadio = createRadio();
  var longestOptionLength = 0;
  var radioWidth;

  for (var i = 0; i < radioOptions.length; i++) {
    var option = radioOptions[i];
    var optionLength = textWidth(option);

    thisRadio.option(option, i);
    if (optionLength > longestOptionLength) {
      longestOptionLength = optionLength;
    }
  }
  thisRadio.position(x, y);
  if (verticalFlag) {
    radioWidth = BUTTON_WIDTH + longestOptionLength;
    thisRadio.style('width', radioWidth + 'px');
  }

  thisRadio.value(defaultOption);
  thisRadio.style('font-size', labelFontSize + 'pt');
  return thisRadio;
}
