'use strict';

var MIDI_NOTES = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
var KEYBOARD_KEYS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
var KEY_TO_INDEX = {'a':0, 'w':1, 's':2, 'e':3, 'd':4, 'f':5, 't':6, 'g':7,
                    'y':8, 'h':9, 'u':10, 'j':11};

// Global setup, common in p5.js
var keysPressed = {};
var pressedIndices = {};

var sawOsc, sqrOsc, triOsc, subOsc;
var sawSlider, sawAmp, sqrSlider, sqrAmp, triSlider, triAmp, subSlider, subAmp;
var sawEnv, sqrEnv, triEnv, subEnv;
var lpf;
var fft;

var octaveSlider;
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

// This is a mess of GUI setup, don't mind it too much (I am not a UI/UX designer)
function setupSliders() {
  // Octave slider
  octaveSlider = setupSlider(xTranslateSliders + (19 * sliderSpacer), 3.5 * sliderHeight, 4, 2, false);
  setupSliderLabel(xTranslateSliders + (19 * sliderSpacer), 3.5 * sliderHeight, false, 'Octave');
  //setupSliderLabel(xTranslateSliders + (20.5 * sliderSpacer), 3.5 * sliderHeight, false, 'Octave');
  // Filter sliders
  filterFreqSlider = setupSlider(xTranslateSliders + (0 * sliderSpacer), sliderHeight, 1024, 1024, true);
  setupSliderLabel(xTranslateSliders + (0 * sliderSpacer), sliderHeight, true, 'Filter Frequency');
  filterResSlider  = setupSlider(xTranslateSliders + (2 * sliderSpacer), sliderHeight, 64, 0, true);
  setupSliderLabel(xTranslateSliders + (2 * sliderSpacer), sliderHeight, true, 'Filter Resonance');
  // ADSR sliders
  attackSlider  = setupSlider(xTranslateSliders + (0 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (0 * sliderSpacer), 2.5 * sliderHeight, true, 'A');
  decaySlider   = setupSlider(xTranslateSliders + (1 * sliderSpacer), 2.5 * sliderHeight, 256, 25, true);
  setupSliderLabel(xTranslateSliders + (1 * sliderSpacer), 2.5 * sliderHeight, true, 'D');
  sustainSlider = setupSlider(xTranslateSliders + (2 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (2 * sliderSpacer), 2.5 * sliderHeight, true, 'S');
  releaseSlider = setupSlider(xTranslateSliders + (3 * sliderSpacer), 2.5 * sliderHeight, 256, 25, true);
  setupSliderLabel(xTranslateSliders + (3 * sliderSpacer), 2 * sliderHeight, true, 'R');
  // Oscillator sliders
  sawSlider = setupSlider(xTranslateSliders + (15 * sliderSpacer), sliderHeight, 256, 100, true);
  setupSliderLabel(xTranslateSliders + (15 * sliderSpacer), sliderHeight, true, 'SAW');
  sqrSlider = setupSlider(xTranslateSliders + (16 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (16 * sliderSpacer), sliderHeight, true, 'SQR');
  triSlider = setupSlider(xTranslateSliders + (17 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (17 * sliderSpacer), sliderHeight, true, 'TRI');
  subSlider = setupSlider(xTranslateSliders + (18 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (18 * sliderSpacer), sliderHeight, true, 'SUB');
}

function loadVisualElements() {
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

// Set up all of our oscillators
// TODO: Optimize to only setup oscillators in use to avoid unnecessary computation
function loadOscillators(filter) {
  sawOsc = new p5.SawOsc();
  sqrOsc = new p5.SqrOsc();
  triOsc = new p5.TriOsc();
  subOsc = new p5.SinOsc();
  var oscs = [sawOsc, sqrOsc, triOsc, subOsc];
  sawEnv = new p5.Env();
  sqrEnv = new p5.Env();
  triEnv = new p5.Env();
  subEnv = new p5.Env();
  var envs = [sawEnv, sqrEnv, triEnv, subEnv];

  for (var oscIndex in oscs) {
    var oscillator = oscs[oscIndex];
    var envelope = envs[oscIndex];
    // Disconnect osc from output, it will go through the filter
    oscillator.disconnect();
    oscillator.start();
    oscillator.amp(envelope);
    oscillator.connect(filter);
    envelope.setExp();
  }
}

// Called upon loading, setup audio elements
function setup() {
  loadVisualElements();
  lpf = new p5.Filter();
  loadOscillators(lpf);
  // Setup a FFT analyzer at 256 bitrate
  fft = new p5.FFT(0, 256);
}

function playNote(note) {
  attack  = map(attackSlider.value(), 0, 256, 0.0, 5.0);
  decay   = map(decaySlider.value(), 0, 256, 0.0, 8.0);
  sustain = map(sustainSlider.value(), 0, 256, 0.0, 1.0);
  release = map(releaseSlider.value(), 0, 256, 0.0, 4.0);
  sawAmp  = map(sawSlider.value(), 0, 256, 0.0, 1.0);
  sqrAmp  = map(sqrSlider.value(), 0, 256, 0.0, 1.0);
  triAmp  = map(triSlider.value(), 0, 256, 0.0, 1.0);
  subAmp  = map(subSlider.value(), 0, 256, 0.0, 1.0);

  var octaveModifier = map(octaveSlider.value(), 0, 4, -2, 2);
  note = note + 12 * octaveModifier;

  sawOsc.freq(midiToFreq(note));
  sqrOsc.freq(midiToFreq(note));
  triOsc.freq(midiToFreq(note));
  subOsc.freq(midiToFreq(note - 12)); // -12 to drop it an octave, SUB-oscillator

  sawEnv.setADSR(attack, decay, sustain, release);
  sawEnv.setRange(sawAmp, 0.0); // 0.0 is the release value
  sqrEnv.setADSR(attack, decay, sustain, release);
  sqrEnv.setRange(sqrAmp, 0.0); // 0.0 is the release value
  triEnv.setADSR(attack, decay, sustain, release);
  triEnv.setRange(triAmp, 0.0); // 0.0 is the release value
  subEnv.setADSR(attack, decay, sustain, release);
  subEnv.setRange(subAmp, 0.0); // 0.0 is the release value

  if (sawAmp > 0) {
    sawEnv.triggerAttack();
  }
  if (sqrAmp > 0) {
    sqrEnv.triggerAttack();
  }
  if (triAmp > 0) {
    triEnv.triggerAttack();
  }
  if (subAmp > 0) {
    subEnv.triggerAttack();
  }
}

function endNote() {
  if (!mouseIsPressed && !keyIsPressed) {
    sawEnv.triggerRelease();
    sqrEnv.triggerRelease();
    triEnv.triggerRelease();
    subEnv.triggerRelease();
  }
}

// Called every frame
function draw() {
  // Update filter parameters with each draw call, this may be changed in the future
  filterFreq = map(filterFreqSlider.value(), 0, 1024, -1, 15000);
  filterRes  = map(filterResSlider.value(), 0, 64, 0, 50);
  lpf.set(filterFreq, filterRes);

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
      xTranslateKeys + (MIDI_NOTES.length * keyWidth),
      0, MIDI_NOTES.length));

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
  loadVisualElements();
}
