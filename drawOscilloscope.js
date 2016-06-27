function drawOscilloscope(samples, x, y, rectWidth, rectHeight) {
  var distanceFromTop = height / 2;
  var distanceFromLeft = width / 72;
  
  var rectWidth = width / 5;
  var rectHeight = height / 4;
  
  fill(200, 200, 200);
  rect(distanceFromLeft, distanceFromTop, rectWidth, rectHeight);
  
  stroke(0, 0, 0);
  strokeWeight(0.5);
  
  beginShape();
  for (var i = 0; i < samples.length; i++) {
    var x = map(i, 0, samples.length, 0, rectWidth);
    var y = map(samples[i], -1, 1, -rectHeight / 2, rectHeight / 2);
    vertex(x + distanceFromLeft, y + rectHeight/2 + distanceFromTop);
  }
  endShape();
}