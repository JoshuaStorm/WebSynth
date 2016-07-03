var MIDI_NOTES = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
var KEYBOARD_KEYS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
var KEY_TO_INDEX = {'a':0, 'w':1, 's':2, 'e':3, 'd':4, 'f':5, 't':6, 'g':7,
                    'y':8, 'h':9, 'u':10, 'j':11};

// Global setup, common in p5.js
var keysPressed = {};
var pressedIndices = {};

var osc;
var ampSlider, amp;
var env;
var lpf;
var fft;

var filterFreqSlider, filterFreq;
var filterResSlider, filterRes;
var attackSlider, attack;
var decaySlider, decay;
var sustainSlider, sustain;
var releaseSlider, release;
var sliderHeight;
var xTranslateSliders;
var sliderSpacer;

var keyWidth, keyHeight;
var xTranslateKeys, yTranslateKeys;

// Called before setup, setup visual elements
function preload() {
  createCanvas(windowWidth, windowHeight);
  // Initializing some GUI element properties
  keyWidth = width / (4 * MIDI_NOTES.length);
  keyHeight = height / 4;
  xTranslateKeys = width / 2;
  yTranslateKeys = height / 2;
  sliderHeight = height / 8;
  sliderSpacer = width / 30;
  xTranslateSliders = width / 72;

  setupSliders();
}

// Called upon loading, setup audio elements
function setup() {
  osc = new p5.SawOsc();
  // Disconnect osc from output, it will go through the filter
  osc.disconnect();
  osc.start();

  env = new p5.Env();
  env.setADSR(0.5, 0.25, 0.5, 0.1);
  env.setRange(.5, 0.0);
  osc.amp(env);

  lpf = new p5.Filter();
  osc.connect(lpf);
  // Setup a FFT analyzer at 256 bitrate
  fft = new p5.FFT(0, 256);
}

// This is a mess of GUI setup, don't mind it too much
function setupSliders() {
  filterFreqSlider = setupSlider(xTranslateSliders + (0 * sliderSpacer), sliderHeight, 10000, 10000, true);
  setupSliderLabel(xTranslateSliders + (0 * sliderSpacer), sliderHeight, true, 'Filter Frequency');
  filterResSlider  = setupSlider(xTranslateSliders + (2 * sliderSpacer), sliderHeight, 50, 0, true);
  setupSliderLabel(xTranslateSliders + (2 * sliderSpacer), sliderHeight, true, 'Filter Resonance');

  attackSlider  = setupSlider(xTranslateSliders + (0 * sliderSpacer), 2.5 * sliderHeight,   5, 0, true);
  setupSliderLabel(xTranslateSliders + (0 * sliderSpacer), 2 * sliderHeight, true, 'A');
  decaySlider   = setupSlider(xTranslateSliders + (1 * sliderSpacer), 2.5 * sliderHeight,   5, 1, true);
  setupSliderLabel(xTranslateSliders + (1 * sliderSpacer), 2 * sliderHeight, true, 'D');
  sustainSlider = setupSlider(xTranslateSliders + (2 * sliderSpacer), 2.5 * sliderHeight, 100, 0, true);
  setupSliderLabel(xTranslateSliders + (2 * sliderSpacer), 2 * sliderHeight, true, 'S');
  releaseSlider = setupSlider(xTranslateSliders + (3 * sliderSpacer), 2.5 * sliderHeight,   5, 1, true);
  setupSliderLabel(xTranslateSliders + (3 * sliderSpacer), 2 * sliderHeight, true, 'R');

  ampSlider = setupSlider(xTranslateSliders + (18 * sliderSpacer), sliderHeight, 100, 25, true);
  setupSliderLabel(xTranslateSliders + (18 * sliderSpacer), sliderHeight, true, 'Amp');
}

function playNote(note) {
  attack  = attackSlider.value();
  decay   = decaySlider.value();
  sustain = map(sustainSlider.value(), 0, 100, 0.0, 1.0);
  release = releaseSlider.value();
  amp = map(ampSlider.value(), 0, 100, 0.0, 1.0);

  osc.freq(midiToFreq(note));
  env.setADSR(attack, decay, sustain, release);
  env.setRange(amp, 0.0); // 0.0 is the release value)
  env.setExp(); // Set the envelope to be an exponential curve
  lpf.set(filterFreq, filterRes);

  env.triggerAttack();
}

function endNote() {
  if (!mouseIsPressed && !keyIsPressed) {
    env.triggerRelease();
  }
}

// Called every frame
function draw() {
  // Update filter parameters with each draw call, this may be changed in the future
  filterFreq = filterFreqSlider.value();
  filterRes  = filterResSlider.value();
  var samples = fft.waveform();
  drawOscilloscope(samples);
  drawKeyboard();
}

// Determines if the mouse is over any key on the keyboard
function mouseOverKeys() {
  if ( (mouseX > xTranslateKeys) && (mouseX < (MIDI_NOTES.length * keyWidth) + xTranslateKeys)
    && (mouseY < keyHeight + yTranslateKeys) && (mouseY > yTranslateKeys) ) {
    return true;
  } else {
    return false;
  }
}

function drawKeyboard() {
  for (var noteIndex in MIDI_NOTES) {
    var x = noteIndex * keyWidth;
    // If the mouse is over the key
    if ( (mouseX > x + xTranslateKeys) && (mouseX < x + keyWidth + xTranslateKeys)
      && (mouseY < keyHeight + yTranslateKeys) && (mouseY > yTranslateKeys) ) {
      if (mouseIsPressed) {
        fill(0, 0, 0);
      } else {
        fill(127, 127, 127);
      }
    } else {
      if (pressedIndices[noteIndex] !== undefined) {
        fill(0, 0, 0);
      }
      else {
        fill(200, 200, 200);
      }
    }
    // Draw the key
    rect(x + xTranslateKeys, yTranslateKeys, keyWidth - 1, keyHeight - 1);
  }
}

// Call whenever mouse is clicked
function mousePressed() {
  if (mouseOverKeys()) {
    var key = floor(map(mouseX, xTranslateKeys,
      xTranslateKeys + (MIDI_NOTES.length * keyWidth), 0, MIDI_NOTES.length));
    playNote(MIDI_NOTES[key]);
  }
}

// Called whenever mouse click is release
function mouseReleased() {
  endNote();
}

// Called whenever key is pressed (Ignores action keys)
function keyTyped() {
  // Only play the note if hasn't already played. Avoids retrigger bug
  if (keysPressed[key] !== true) {
    for (var keyIndex in KEYBOARD_KEYS) {
      if (key === KEYBOARD_KEYS[keyIndex]) {
        keysPressed[key] = true;
        pressedIndices[keyIndex] = true;
        playNote(MIDI_NOTES[keyIndex]);
      }
    }
  }
}

// Called whenever key is released
function keyReleased() {
  var lowercaseKey = key.toLowerCase();
  var index = KEY_TO_INDEX[lowercaseKey];
  delete keysPressed[lowercaseKey];
  delete pressedIndices[index];
  endNote();
}

// Called whenever the window dimensions change
function windowResized() {
  // Wipes the canvas and resets elements dynamically
  clear();
  removeElements();
  preload();
}
