function setupRadio(x, y, radioOptions, verticalFlag) {
  var BUTTON_WIDTH = 30;
  var labelFontSize = floor(height / 75);
  var thisRadio = createRadio();
  var longestOptionLength = 0;
  var radioWidth;

  for (var optionIndex in radioOptions) {
    var option = radioOptions[optionIndex];
    var optionLength = textWidth(option);

    thisRadio.option(option, optionIndex)
    if (optionLength > longestOptionLength) {
      longestOptionLength = optionLength;
    }
  }
  thisRadio.position(x, y);
  if (verticalFlag) {
    text(longestOptionLength, 400, 400);
    radioWidth = BUTTON_WIDTH + longestOptionLength;
    thisRadio.style('width', radioWidth + 'px');
  }

  thisRadio.style('font-size', labelFontSize + 'pt');
  return thisRadio;
}
