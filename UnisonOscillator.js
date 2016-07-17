'use strict';
// Constructor
// Creates unison oscillator object that's amplitude follows the envelope and is connected to the filter
// @param {string} wavetype - The waveform type for this unison oscillator
// @param {p5.Env} envelope - The envelope the oscillator's amplitude will be mapped to
// @param {p5.Filter} filter - The filter the source will go through
function UnisonOscillator(wavetype, envelope, filter) {
  if (typeof wavetype !== 'string') {
    throw new Error('Wavetype must be a string.');
  }
  if (wavetype !== 'sine' && wavetype !== 'triangle' && wavetype !== 'sawtooth' && wavetype !== 'square') {
    throw new Error('Wavetype must be either sine, triangle, sawtooth, or square.');
  }
  if (typeof envelope === 'undefined') {
    throw new Error('Envelope is undefined');
  }

  // Initialize instance variables
  this.wavetype = wavetype;
  this.unison = 1;
  this.detune = 0;
  // Create the default oscillator
  var osc = new p5.Oscillator();
  osc.setType(wavetype);
  osc.amp(envelope);
  osc.disconnect();
  osc.connect(filter);
  osc.start();
  // Private instance variables
  this._oscs = [osc];
  this._detunes = [0];
  this._envelope = envelope;
  this._filter = filter;
}

// @private
UnisonOscillator.prototype._changeUnison = function() {
  var unison = this.unison;
  var detune = this.detune;
  var wavetype = this.wavetype;
  var envelope = this._envelope;
  var filter = this._filter;
  var detunePerOsc = detune / unison;

  // Destroy the old oscillators
  var oscs = this._oscs;
  for (var i = 0; i < oscs.length; i++) {
    oscs[i].disconnect();
    oscs[i].amp(0);
  }

  // Reinitialize oscillators and corresponding detune values
  oscs = new Array(unison);
  var detunes = new Array(unison);
  var currentDetune = -detune;
  for (i = 0; i < unison; i++) {
    var osc = new p5.Oscillator();
    osc.setType(wavetype);
    osc.amp(envelope);
    osc.disconnect();
    osc.connect(filter);
    osc.start();

    oscs[i] = osc;
    detunes[i] = currentDetune;
    currentDetune = currentDetune - detunePerOsc;
  }
  this._oscs = oscs;
  this._detunes = detunes;

  return true;
}

// @param {number} unsion : number of oscillators in unison
// @param {number} detune : the frequency of detune for the most detuned oscillator in unison
// @return {boolean} Return whether or not the unison/detune was changed
UnisonOscillator.prototype.set = function(unison, detune) {
  if (typeof unison !== 'number' || typeof detune !== 'number') {
    throw new Error('Unison and detune must be numbers.');
  }
  if (unison < 0) {
    throw new Error('Unison must be a positive value.')
  }
  if (detune < 0) {
    detune = Math.abs(detune);
  }
  // If there is no change in unison/detune, don't do anything
  if (this.unison === unison && this.detune === detune) {
    return false;
  }

  this.unison = unison;
  this.detune = detune;

  return this._changeUnison();
}

// @param {p5.Filter} filter - The filter the sound source will go through
UnisonOscillator.prototype.changeFilter = function(filter) {
  var unison = this.unison;
  var oscs = this._oscs;

  for (var i = 0; i < unison; i++) {
    oscs[i].disconnect();
    oscs[i].connect(filter);
  }

  this._filter = filter;
  this._oscs = oscs;
}

// @param {p5.Env} envelope - The envelope the sound source's amplitude will follow
UnisonOscillator.prototype.changeEnvelope = function(envelope) {
  var unison = this.unison;
  var oscs = this._oscs;

  for (var i = 0; i < unison; i++) {
    oscs[i].amp(envelope);
  }

  this._envelope = envelope;
  this._oscs = oscs;
}

// @param {number} note - The frequency (NOT MIDI) the oscillator will play
UnisonOscillator.prototype.freq = function(note) {
  // If this is a oscillator passed in (LFO), extra handling is needed
  if (typeof note === 'object') {
    this._frequencyModulate(note);
    return;
  };
  var unison = this.unison;
  var oscs = this._oscs;
  var detunes = this._detunes;
  // Set each oscillator to its detuned frequency
  for (var i = 0; i < unison; i++) {
    var thisFrequency = note + detunes[i];
    oscs[i].freq(thisFrequency);
  }
}

// @private
UnisonOscillator.prototype._frequencyModulate = function(modulator) {
  var unison = this.unison;
  var oscs = this._oscs;
  var detunes = this._detunes;
  for (var i = 0; i < unison; i++) {
    oscs[i].freq(modulator);
  }
}
