'use strict';
var MIDI_NOTES = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71];
var KEYBOARD_KEYS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];
var KEY_TO_INDEX = {'a':0, 'w':1, 's':2, 'e':3, 'd':4, 'f':5, 't':6, 'g':7,
                    'y':8, 'h':9, 'u':10, 'j':11};
var INCREMENT_OCTAVE = 'x';
var DECREMENT_OCTAVE = 'z';

// Global setup, common in p5.js
var keysPressed = {};
var pressedIndices = {};

var sawOsc, sqrOsc, triOsc, subOsc, nseOsc;
var sawSlider, sqrSlider, triSlider, subSlider, noiseSlider;
var sawUnisonSlider, sqrUnisonSlider, triUnisonSlider, subUnisonSlider;
var sawDetuneSlider, sqrDetuneSlider, triDetuneSlider, subDetuneSlider;
var sawEnv, sqrEnv, triEnv, subEnv, nseEnv;
var noiseTypeRadios, glitchNoiseButton;
var noiseType = 'white';
var filt;
var fft;

var lfo;
var lfoStarted = true;
var lfoShapeRadios;
var lfoToFreqButton;
var lfoToFilterButton;
var lfoAmountSlider;
var lfoFreqSlider;

var currentMidiNote;
var octaveSlider;

var filterFreqSlider;
var filterResSlider;
var filterTypeRadios;

var attackSlider;
var decaySlider;
var sustainSlider;
var releaseSlider;

var sliderHeight;
var xTranslateSliders;
var sliderSpacer;

var keyWidth, keyHeight;
var xTranslateKeys, yTranslateKeys;

// This GUI is swaggy and I love it

// This is a mess of GUI setup, don't mind it too much (I am not a UI/UX designer)
function setupSliders() {
  // Octave slider
  octaveSlider = setupSlider(xTranslateSliders + (19 * sliderSpacer), 3.5 * sliderHeight, 4, 2, false);
  setupSliderLabel(xTranslateSliders + (19 * sliderSpacer), 3.5 * sliderHeight, false, 'Octave');
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
  setupSliderLabel(xTranslateSliders + (3 * sliderSpacer), 2.5 * sliderHeight, true, 'R');
  // Oscillator+noise sliders
  noiseSlider = setupSlider(xTranslateSliders + (13 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (13 * sliderSpacer), sliderHeight, true, 'NOISE');
  sawSlider  = setupSlider(xTranslateSliders + (15 * sliderSpacer), sliderHeight, 256, 100, true);
  setupSliderLabel(xTranslateSliders + (15 * sliderSpacer), sliderHeight, true, 'SAW');
  sqrSlider  = setupSlider(xTranslateSliders + (17 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (17 * sliderSpacer), sliderHeight, true, 'SQR');
  triSlider  = setupSlider(xTranslateSliders + (19 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (19* sliderSpacer), sliderHeight, true, 'TRI');
  subSlider  = setupSlider(xTranslateSliders + (21 * sliderSpacer), sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (21 * sliderSpacer), sliderHeight, true, 'SUB');
  // Unison and detune sliders
  sawUnisonSlider = setupSlider(xTranslateSliders + (15 * sliderSpacer), 2.5 * sliderHeight, 8, 0, true);
  setupSliderLabel(xTranslateSliders + (15 * sliderSpacer), 2.5 * sliderHeight, true, 'U');
  sawDetuneSlider = setupSlider(xTranslateSliders + (16 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (16 * sliderSpacer), 2.5 * sliderHeight, true, 'D');
  sqrUnisonSlider = setupSlider(xTranslateSliders + (17 * sliderSpacer), 2.5 * sliderHeight, 8, 0, true);
  setupSliderLabel(xTranslateSliders + (17 * sliderSpacer), 2.5 * sliderHeight, true, 'U');
  sqrDetuneSlider = setupSlider(xTranslateSliders + (18 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (18 * sliderSpacer), 2.5 * sliderHeight, true, 'D');
  triUnisonSlider = setupSlider(xTranslateSliders + (19 * sliderSpacer), 2.5 * sliderHeight, 8, 0, true);
  setupSliderLabel(xTranslateSliders + (19 * sliderSpacer), 2.5 * sliderHeight, true, 'U');
  triDetuneSlider = setupSlider(xTranslateSliders + (20 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (20 * sliderSpacer), 2.5 * sliderHeight, true, 'D');
  subUnisonSlider = setupSlider(xTranslateSliders + (21 * sliderSpacer), 2.5 * sliderHeight, 8, 0, true);
  setupSliderLabel(xTranslateSliders + (21 * sliderSpacer), 2.5 * sliderHeight, true, 'U');
  subDetuneSlider = setupSlider(xTranslateSliders + (22 * sliderSpacer), 2.5 * sliderHeight, 256, 0, true);
  setupSliderLabel(xTranslateSliders + (22 * sliderSpacer), 2.5 * sliderHeight, true, 'D');
  // LFO sliders
  lfoAmountSlider  = setupSlider(xTranslateSliders + (7 * sliderSpacer), 2.5 * sliderHeight, 1024, 0, true);
  setupSliderLabel(xTranslateSliders + (7 * sliderSpacer), 2.5 * sliderHeight, true, 'Amt');
  lfoFreqSlider    = setupSlider(xTranslateSliders + (8 * sliderSpacer), 2.5 * sliderHeight, 256, 10, true);
  setupSliderLabel(xTranslateSliders + (8 * sliderSpacer), 2.5 * sliderHeight, true, '?/c');
}


function setupButtons() {
  var x = xTranslateSliders + (4 * sliderSpacer);
  var y = 0.75 * sliderHeight;
  var labels = ['LPF', 'BPF', 'HPF'];
  filterTypeRadios = setupRadios(x, y, labels, true, 1);

  x = x + (6 * sliderSpacer);
  y = 2.25 * sliderHeight;
  labels = ['SAW', 'SQR', 'TRI', 'SIN'];
  lfoShapeRadios = setupRadios(x, y, labels, true, 4);
  lfoToFreqButton = createCheckbox('Frequency');
  lfoToFilterButton = createCheckbox('Filter');
  x = x + 2 * sliderSpacer;
  lfoToFreqButton.position(x, y);
  lfoToFilterButton.position(x, y + 0.175 * sliderHeight);

  x = xTranslateSliders + (14.25 * sliderSpacer);
  y = 0.75 * sliderHeight;
  labels = ['White', 'Brown', 'Pink'];
  noiseTypeRadios = setupRadios(x, y, labels, true, 1);
  glitchNoiseButton = createCheckbox('???');
  glitchNoiseButton.position(x, y + 0.5 * sliderHeight);
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
  setupButtons();
}

// Set up all of our oscillators
// TODO: Optimize to only setup oscillators in use to avoid unnecessary computation
function loadOscillators(filter) {
  sawEnv = new p5.Env();
  sqrEnv = new p5.Env();
  triEnv = new p5.Env();
  subEnv = new p5.Env();
  nseEnv = new p5.Env();

  sawOsc = new UnisonOscillator('sawtooth', sawEnv, filt);
  sqrOsc = new UnisonOscillator('square', sqrEnv, filt);
  triOsc = new UnisonOscillator('triangle', triEnv, filt);
  subOsc = new UnisonOscillator('sine', subEnv, filt);
  nseOsc = new p5.Noise();
  nseOsc.disconnect();
  nseOsc.start();
  nseOsc.amp(nseEnv);
  nseOsc.connect(filt);

  lfo = new p5.Oscillator('sine');
  lfo.disconnect();
  lfo.stop();

  sawOsc.freq(lfo);
  sqrOsc.freq(lfo);
  triOsc.freq(lfo);
  subOsc.freq(lfo);
}

// Called upon loading, setup audio elements
function setup() {
  loadVisualElements();
  filt = new p5.Filter();
  loadOscillators(filt);
  // Setup a FFT analyzer at 256 bitrate
  fft = new p5.FFT(0, 256);
}

function playNote(midiNote) {
  var sawAmp = map(sawSlider.value(), 0, 256, 0.0, 1.0);
  var sqrAmp = map(sqrSlider.value(), 0, 256, 0.0, 1.0);
  var triAmp = map(triSlider.value(), 0, 256, 0.0, 1.0);
  var subAmp = map(subSlider.value(), 0, 256, 0.0, 1.0);
  var nseAmp = map(noiseSlider.value(), 0, 256, 0.0, 1.0);
  currentMidiNote = midiNote;

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
  if (nseAmp > 0) {
    nseEnv.triggerAttack();
  }
}

function endNote() {
  if (!mouseIsPressed && !keyIsPressed) {
    sawEnv.triggerRelease();
    sqrEnv.triggerRelease();
    triEnv.triggerRelease();
    subEnv.triggerRelease();
    nseEnv.triggerRelease();
  }
}

// To be called in draw, changes filter parameters
// TODO: Filter modulation with LFO
function updateFilter() {
  // Update filter parameters with each draw call, this may be changed in the future
  var filterFreq = map(filterFreqSlider.value(), 0, 1024, -1, 15000);
  var filterRes  = map(filterResSlider.value(), 0, 64, 0, 50);

  var radioValue = filterTypeRadios.value();
  var filterType;
  // TODO: Make setupRadio radios return numbers not strings?
  switch (radioValue) {
    case '1':
      filterType = 'lowpass';
      break;
    case '2':
      filterType = 'bandpass';
      break;
    case '3':
      filterType = 'highpass';
      break;
    default:
      filterType = 'lowpass';
  }

  filt.set(filterFreq, filterRes);
  filt.setType(filterType);
}

function updateOscillators(midiNote) {
  var attack  = map(attackSlider.value(), 0, 256, 0.0, 5.0);
  var decay   = map(decaySlider.value(), 0, 256, 0.0, 8.0);
  var sustain = map(sustainSlider.value(), 0, 256, 0.0, 1.0);
  var release = map(releaseSlider.value(), 0, 256, 0.0, 4.0);
  var sawAmp  = map(sawSlider.value(), 0, 256, 0.0, 1.0);
  var sqrAmp  = map(sqrSlider.value(), 0, 256, 0.0, 1.0);
  var triAmp  = map(triSlider.value(), 0, 256, 0.0, 1.0);
  var subAmp  = map(subSlider.value(), 0, 256, 0.0, 1.0);
  var nseAmp  = map(noiseSlider.value(), 0, 256, 0.0, 1.0);

  var sawUnison = sawUnisonSlider.value() + 1;
  var sqrUnison = sqrUnisonSlider.value() + 1;
  var triUnison = triUnisonSlider.value() + 1;
  var subUnison = subUnisonSlider.value() + 1;

  var sawDetune = map(sawDetuneSlider.value(), 0, 256, 0.0, 20.0);
  var sqrDetune = map(sqrDetuneSlider.value(), 0, 256, 0.0, 20.0);
  var triDetune = map(triDetuneSlider.value(), 0, 256, 0.0, 20.0);
  var subDetune = map(subDetuneSlider.value(), 0, 256, 0.0, 20.0);

  var unisonChanged = false;
  unisonChanged = unisonChanged || sawOsc.set(sawUnison, sawDetune);
  unisonChanged = unisonChanged || sqrOsc.set(sqrUnison, sqrDetune);
  unisonChanged = unisonChanged || triOsc.set(triUnison, triDetune);
  unisonChanged = unisonChanged || subOsc.set(subUnison, subDetune);

  // Modulate frequency based on LFO if lfoToFreqButton is checked
  if (lfoToFreqButton.checked()) {
    // Need to ensure we don't overlay different LFOs (somehow possible in p5?)
    if (!lfoStarted || unisonChanged) {
      lfo.stop();
      lfo.disconnect();
      lfo.start();
      sawOsc.freq(lfo);
      sqrOsc.freq(lfo);
      triOsc.freq(lfo);
      subOsc.freq(lfo);
      lfoStarted = true;
    }
  } else {
    lfo.stop();
    lfo.disconnect();
    lfoStarted = false;
  }

  var octaveModifier = map(octaveSlider.value(), 0, 4, -2, 2);
  midiNote = midiNote + 12 * octaveModifier;
  var frequency = midiToFreq(midiNote);
  var subFrequency = midiToFreq(midiNote - 12);

  sawOsc.freq(frequency);
  sqrOsc.freq(frequency);
  triOsc.freq(frequency);
  subOsc.freq(subFrequency); // -12 to drop it an octave, SUB-oscillator

  sawEnv.setADSR(attack, decay, sustain, release);
  sawEnv.setRange(sawAmp, 0.0); // 0.0 is the release value
  sqrEnv.setADSR(attack, decay, sustain, release);
  sqrEnv.setRange(sqrAmp, 0.0); // 0.0 is the release value
  triEnv.setADSR(attack, decay, sustain, release);
  triEnv.setRange(triAmp, 0.0); // 0.0 is the release value
  subEnv.setADSR(attack, decay, sustain, release);
  subEnv.setRange(subAmp, 0.0); // 0.0 is the release value
  nseEnv.setADSR(attack, decay, sustain, release);
  nseEnv.setRange(nseAmp, 0.0); // 0.0 is the release value
}

function updateLfo() {
  var frequency = map(lfoFreqSlider.value(), 0, 256, 1.0, 20.0);
  var amplitude = map(lfoAmountSlider.value(), 0, 1024, 0.0, 400.0);
  lfo.freq(frequency);
  lfo.amp(amplitude);

  var radioValue = lfoShapeRadios.value();
  switch (radioValue) {
    case '1':
      lfo.setType('sawtooth');
      break;
    case '2':
      lfo.setType('square');
      break;
    case '3':
      lfo.setType('triangle');
      break;
    case '4':
      lfo.setType('sine');
      break;
    default:
      lfo.setType('sine');
  }
}

function updateNoise() {
  var radioValue = noiseTypeRadios.value();
  var glitchOn = glitchNoiseButton.checked()
  switch (radioValue) {
    case '1':
      if (noiseType !== 'white' || glitchOn) {
        nseOsc.setType('white');
        noiseType = 'white';
      }
      break;
    case '2':
      if (noiseType !== 'brown' || glitchOn) {
        nseOsc.setType('brown');
        noiseType = 'brown';
      }
      break;
    case '3':
      if (noiseType !== 'pink' || glitchOn) {
        nseOsc.setType('pink');
        noiseType = 'pink';
      }
      break;
    default:
      nseOsc.setType('white');
      noiseType = 'white';
  }
}

// Called every frame
function draw() {
  updateFilter();
  updateNoise();

  updateOscillators(currentMidiNote);
  updateLfo();

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
        fill(60, 60, 60);
      }
    } else {
      if (pressedIndices[noteIndex] !== undefined) {
        fill(0, 0, 0);
      }
      else {
        fill(177, 177, 177);
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
  var lowercaseKey = key.toLowerCase();

  // Only play the note if hasn't already played. Avoids retrigger bug
  if (keysPressed[lowercaseKey] !== true) {
    for (var keyIndex in KEYBOARD_KEYS) {
      if (lowercaseKey === KEYBOARD_KEYS[keyIndex]) {
        keysPressed[lowercaseKey] = true;
        pressedIndices[keyIndex] = true;
        playNote(MIDI_NOTES[keyIndex]);
      }
    }
  }
  
  // Increments / Decrements Octave slider if 'Z' or 'X' are pressed
  modifyOctave(lowercaseKey);
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

// Increments or Decrements octave based on key
function modifyOctave(keyPressed) {
    var valToAdd = 0;
    
    if(keyPressed === INCREMENT_OCTAVE) {
        valToAdd = 1;
    } else if (keyPressed === DECREMENT_OCTAVE) {
        valToAdd = -1;
    } 
   
    var modVal = octaveSlider.value() + valToAdd;
    
    if (modVal < 0) {
        modVal = 0;
    } else if (modVal > 4) {
        modVal = 4;
    }
    
    octaveSlider.value(modVal);
}
