'use strict';

function drawOscilloscope(samples) {
  var yTranslateScope = height / 2;
  var xTranslateScope = width / 72;

  var scopeWidth = width / 5;
  var scopeHeight = height / 4;

  fill(177, 177, 177);
  // Comment this rect line to make the fun bug
  rect(xTranslateScope, yTranslateScope, scopeWidth, scopeHeight);

  stroke(0, 0, 0);
  strokeWeight(0.5);

  beginShape();
  for (var sampleIndex in samples) {
    var x = map(sampleIndex, 0, samples.length, 0, scopeWidth);
    var y = map(samples[sampleIndex], -1, 1, -scopeHeight / 2, scopeHeight / 2);
    vertex(x + xTranslateScope, y + scopeHeight/2 + yTranslateScope);
  }
  endShape();
}
