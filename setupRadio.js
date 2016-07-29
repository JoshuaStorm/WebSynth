// Note: Due to a bug with how radio values are handled,
// This Radio object's values will be OFF BY ONE. This
// means that the first button will have value of 1, not 0

function setupRadios(x, y, labelsArray, verticalFlag, defaultButton) {
  var BUTTON_WIDTH = 30; // In pixels
  var labelFontSize = floor(height / 75);
  var thisRadio = createRadio();
  var longestLabelLength = 0;
  var radioWidth;

  for (var i = 0; i < labelsArray.length; i++) {
    var label = labelsArray[i];
    var labelLength = textWidth(label);

    thisRadio.option(label, i + 1);
    if (labelLength > longestLabelLength) {
      longestLabelLength = labelLength;
    }
  }
  thisRadio.position(x, y);
  if (verticalFlag) {
    radioWidth = BUTTON_WIDTH + longestLabelLength;
    thisRadio.style('width', radioWidth + 'px');
  }

  thisRadio.value(defaultButton || 1);

  thisRadio.style('font-size', labelFontSize + 'pt');
  thisRadio.class('radio');
  return thisRadio;
}
