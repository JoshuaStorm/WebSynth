'use strict';

function setupSliderLabel(sliderX, sliderY, verticalFlag, labelText) {
  var labelFontSize = floor(height / 75);
  textSize(labelFontSize);
  var labelWidth = textWidth(labelText);
  var SLIDER_HEIGHT_MODIFIER = height * 123 / 1000;
  var labelX = sliderX;
  var labelY = sliderY;
  var label;

  if (verticalFlag) {
    labelX = labelX + (sliderHeight / 2);
    labelY = labelY + floor(SLIDER_HEIGHT_MODIFIER / 2);
  } else {

    labelX = labelX + floor(height * 123 / 2000);
    labelY = labelY + 10;
  }

  // Wrap text if the ratio of text width to canvas width is too big ( >= .08)
  if ( (textWidth(labelText) / width) >= (1 / 25) ) {
    var labelLines = labelText.split(' ');
    var modifier = 0;

    for (var lineIndex in labelLines) {
      var lineWidth = textWidth(labelLines[lineIndex]);
      var centeredX = labelX - floor(lineWidth / 2);

      label = createP(labelLines[lineIndex]);
      label.position(centeredX, labelY + modifier);
      label.style('color', '#000');
      label.style('font-size', labelFontSize + 'pt');
      modifier += labelFontSize;
    }
  } else {
    var centeredX = labelX - floor(labelWidth / 2);

    label = createP(labelText);
    label.position(centeredX, labelY);
    label.style('color', '#000');
    label.style('font-size', labelFontSize + 'pt');
  }
}
