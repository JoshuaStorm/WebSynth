'use strict';

function setupSlider(x, y, size, defaultValue, options) {
  if (typeof x !== 'number') {
    throw new Error('x position must be a number.');
  }
  if (typeof y !== 'number') {
    throw new Error('x position must be a number.');
  }
  if (typeof options === 'undefined') {
    options = {};
  }

  size = size || 127;
  defaultValue = defaultValue || 0;
  var verticalFlag = options.vertical || false;
  var steppedFlag = options.stepped || false;

  var thisSlider = createSlider(0, size, defaultValue);

  if (verticalFlag) {
    thisSlider.style('rotate', 270);
  }

  thisSlider.size(sliderHeight);
  thisSlider.position(x, y);

  if (steppedFlag) {
    thisSlider.class('steppedSliders');
  } else {
    thisSlider.class('sliders');
  }

  return thisSlider;
}
