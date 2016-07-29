'use strict';

function setupSlider(x, y, size, defaultValue, verticalFlag) {
  var thisSlider = createSlider(0, size, defaultValue);
  if (verticalFlag) {
    thisSlider.style('rotate', 270);
  }
  thisSlider.size(sliderHeight);
  thisSlider.position(x, y);
  thisSlider.class('sliders');
  return thisSlider;
}
