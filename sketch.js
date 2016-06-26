// The midi notes of a scale
var notes = [ 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];

var osc;
var env;
var LPF;
var filterFreqSlider, filterFreq;
var attackSlider, attack;
var decaySlider, decay;
var sustainSlider, sustain;
var releaseSlider, release;

function setup() {
  createCanvas(1440, 800);

  setupSliders();
  
  osc = new p5.TriOsc();
  osc.disconnect();
  
  env = new p5.Env();
  env.setADSR(0.5, 0.25, 0.5, 0.1);
  env.setRange(.5, 0.0);
  osc.amp(env);
  
  LPF = new p5.Filter();
  osc.connect(LPF);
  
  
  // Start silent
  osc.start();
}

function setupSlider(x, y, size, defaultValue, verticalFlag) {
  var thisSlider = createSlider(0, size, defaultValue);
  thisSlider.position(x, y);
  if (verticalFlag) {
    thisSlider.style('rotate', 270);
  }
  thisSlider.size(150);
  return thisSlider;
}

function setupSliders() {
  filterFreqSlider = setupSlider(20, 100, 10000, 440, true);
  text('Filter Frequency', 40, 200);
  // NEED TO MAP VALUES. SLIDERS DON'T LIKE BEING FLOAT VALUES6
  attackSlider  = setupSlider(100, 100, 5, 0, true);
  decaySlider   = setupSlider(120, 100, 5, 1, true);
  // TODO: correct sustain bug
  sustainSlider = setupSlider(140, 100, 100, 0, true);
  releaseSlider = setupSlider(160, 100, 5, 1, true);
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
  // Update filter frequency with each draw call
  filterFreq = filterFreqSlider.value();
  drawKeyboard();
}


function drawKeyboard() {
  var keyWidth = width / (4 * notes.length);
  var keyHeight = height / 4;
  
  var xTranslate = 800;
  var yTranslate = height / 2;
  
  for (var i = 0; i < notes.length; i++) {
    var x = i * keyWidth;
    
    // If the mouse is over the key
    if ( (mouseX > x + xTranslate) && (mouseX < x + keyWidth + xTranslate) 
    && (mouseY < keyHeight + yTranslate) && (mouseY > keyHeight - yTranslate) ) {
      if (mouseIsPressed) {
        fill(0, 0, 0);
      } else {
        fill(127, 127, 127);
      }
    } else {
      fill(200, 200, 200);
    }
    
    // Draw the key
    rect(x + xTranslate, yTranslate, keyWidth - 1, keyHeight - 1);
  }
}

// When we click
function mousePressed() {
  // Map mouse to the key index
  var key = floor(map(mouseX, 0, width, 0, notes.length));
  playNote(notes[key]);
}

// Fade it out when we release
function mouseReleased() {
  osc.stop(release + 1);
}