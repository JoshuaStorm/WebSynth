// The midi notes of a scale
var notes = [ 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
var keyboardKeys = ['a', 'w', 's', 'e', 'd', 'r', 'f', 't', 'g', 'y', 'h', 'u'];
var keysPressed = [];
var pressedIndices = [];

var osc;
var env;
var LPF;
var fft;

var filterFreqSlider, filterFreq;
var attackSlider, attack;
var decaySlider, decay;
var sustainSlider, sustain;
var releaseSlider, release;
var sliderHeight;
var xTranslateSliders;
var sliderSpacer;

var keyWidth, keyHeight;
var xTranslateKeys, yTranslateKeys;

var labelFontSize;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initializing some GUI element properties
  keyWidth = width / (4 * notes.length);
  keyHeight = height / 4;
  xTranslateKeys = width / 2;
  yTranslateKeys = height / 2;
  
  sliderHeight = height / 8;
  sliderSpacer = width / 30;
  xTranslateSliders = width / 72;
  
  labelFontSize = floor(height / 50);
  
  setupSliders();
  
  osc = new p5.TriOsc();
  // Disconnect osc from output, it will go through the filter
  osc.disconnect();
  
  env = new p5.Env();
  env.setADSR(0.5, 0.25, 0.5, 0.1);
  env.setRange(.5, 0.0);
  osc.amp(env);
  
  LPF = new p5.Filter();
  osc.connect(LPF);
  // Setup a FFT analyzer at 256 bitrate
  fft = new p5.FFT(0, 256);
}



function setupSlider(x, y, size, defaultValue, verticalFlag) {
  var thisSlider = createSlider(0, size, defaultValue);

  if (verticalFlag) {
    thisSlider.style('rotate', 270);
  }
  thisSlider.size(sliderHeight);
  thisSlider.position(x, y);

  return thisSlider;
}

function setupSliders() {
  filterFreqSlider = setupSlider(xTranslateSliders, sliderHeight, 10000, 440, true);
  setupSliderLabel(xTranslateSliders, sliderHeight, true, 'Filter Frequency');
  
  // NEED TO MAP VALUES. SLIDERS DON'T LIKE BEING FLOAT VALUES6
  attackSlider  = setupSlider(xTranslateSliders + (3 * sliderSpacer), sliderHeight, 5, 0, true);
  decaySlider   = setupSlider(xTranslateSliders + (4 * sliderSpacer), sliderHeight, 5, 1, true);
  // TODO: correct sustain bug
  sustainSlider = setupSlider(xTranslateSliders + (5 * sliderSpacer), sliderHeight, 100, 0, true);
  releaseSlider = setupSlider(xTranslateSliders + (6 * sliderSpacer), sliderHeight, 5, 1, true);
}

function setupSliderLabel(sliderX, sliderY, verticalFlag, labelText){
  
  textSize(labelFontSize);
  var labelWidth = textWidth(labelText);
  var labelX = sliderX;
  var labelY = sliderY;
  var label;

  if(verticalFlag) {
    
    labelX = xTranslateSliders + (sliderHeight / 2);
    labelY = labelY * 2;
  }


  // Wrap text if the ratio of text width to canvas width is too big ( >= .08)
  if((textWidth(labelText) / width) >= (2 / 25)) {
    var labelLines = labelText.split(" ");
    var modifier = 0;
    
    for(var line in labelLines) {
      var lineWidth = textWidth(labelLines[line]);
      var centeredX = labelX - floor(lineWidth / 2);
      
      label = createP(labelLines[line]);
      label.position(centeredX, labelY + modifier);
      label.style("color", "#000");
      label.style("font-size", labelFontSize + "pt");
      modifier += labelFontSize;
    }
    
  } else {
    var centeredX = labelX - floor(labelWidth / 2);
    
    label = createP(labelText);
    label.position(centeredX, labelY);
    label.style("color", "#000");
    label.style("font-size", labelFontSize + "pt");
  }
}

// A function to play a note
function playNote(note) {
  
  attack  = attackSlider.value();
  decay   = decaySlider.value();
  sustain = map(sustainSlider.value(), 0, 100, 0.0, 1.0);
  release = releaseSlider.value();
  
  osc.freq(midiToFreq(note));
  env.setADSR(attack, decay, sustain, release);
  LPF.set(filterFreq, 1);
  
  osc.start();
  env.play();
}

function draw() {
  var samples = fft.waveform();
  drawOscilloscope(samples);
  // Update filter frequency with each draw call
  filterFreq = filterFreqSlider.value();
  drawKeyboard();
}

// Determines if the mouse is over any key on the keyboard  
function mouseOverKeys() {
  if ( (mouseX > xTranslateKeys) && (mouseX < (notes.length * keyWidth) + xTranslateKeys) 
    && (mouseY < keyHeight + yTranslateKeys) && (mouseY > yTranslateKeys) ) {
  
    return true;
  } else {
    return false;
  }
}

function drawKeyboard() {
  
  for (var i = 0; i < notes.length; i++) {
    var x = i * keyWidth;
    var keyPressed = false;
    
    // If the mouse is over the key
    if ( (mouseX > x + xTranslateKeys) && (mouseX < x + keyWidth + xTranslateKeys) 
      && (mouseY < keyHeight + yTranslateKeys) && (mouseY > yTranslateKeys) ) {
      if (mouseIsPressed) {
        fill(0, 0, 0);
      } else {
        fill(127, 127, 127);
      }
    } else {
      
      for(var index = 0; index < pressedIndices.length; index++) {
        
        if(i === pressedIndices[index]) {
          fill(0, 0, 0);
          keyPressed = true;
        }
      }
      
      if(!keyPressed) { 
        fill(200, 200, 200);
      }
    }
    
    // Draw the key
    rect(x + xTranslateKeys, yTranslateKeys, keyWidth - 1, keyHeight - 1);
  }
}

// When we click
function mousePressed() {
  
  if(mouseOverKeys()) {
    var key = floor(map(mouseX, xTranslateKeys, xTranslateKeys + (notes.length * keyWidth), 0, notes.length));
    playNote(notes[key]);
  }
}

// Fade it out when we release
function mouseReleased() {
  osc.stop(release + 1);
}

//When we press down a key (Ignores action keys)
function keyTyped() {
  for(var keyIndex in keyboardKeys) {
    
    if(key === keyboardKeys[keyIndex]) {
      var keyAlreadyPressed = false;
      
      for(var pressedKey in keysPressed) {
          if(keysPressed[pressedKey] === key) {
              
              keyAlreadyPressed = true;
          }
      }
      
      if(!keyAlreadyPressed) {
        keysPressed.push(key);
        pressedIndices.push(keyboardKey);
      
        playNote(keyboardKey);
      }
    }
  }
}

// Called when the key is released
function keyReleased() {
  
  for(var pressedKey = 0; pressedKey < keysPressed.length; pressedKey++) {

    if(key.toLowerCase() === keysPressed[pressedKey]) {
      
      if(keysPressed.length === 1) {
        keysPressed = [];
        pressedIndices = [];
      } else {
        keysPressed.splice(pressedKey, 1);
        pressedIndices.splice(pressedKey, 1);
      }
      break;
    }
  }
}

// Called whenever the window dimensions change
function windowResized() {
  
  // Wipes the canvas and resets elements dynamically
  clear();
  removeElements();
  setup();
}