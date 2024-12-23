/*
  whistle.js - whistle detector modified to take input from the first audio element on the page
*/

(function (window, document) {
  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  var actx = new AudioContext();
  var audioElement = null,
    sourceNode = null,
    analyser = null;

  function Whistle() {
    this.init = function (whistleEventName, once, precision) {
      this.whistleEventName = whistleEventName || "whistle";
      this.once = once || false;

      this.whistling = null;
      this.intensity = null;

      if (precision === "low") {
        this.precision = 150;
      } else {
        this.precision = 250;
      }

      // Get the first audio element on the page
      audioElement = document.querySelector("audio");
      if (!audioElement) {
        console.error("No audio element found on the page.");
        return;
      }

      // Connect the audio element to the analyser
      startStream();

      // Dispatch a ready event when initialized
      const whistleReadyEvent = new Event("whistleReady");
      document.dispatchEvent(whistleReadyEvent);
    };
  }

  var whistle = (window.whistle = new Whistle());

  function startStream() {
    sourceNode = actx.createMediaElementSource(audioElement);

    analyser = actx.createAnalyser();
    analyser.fftSize = 2048;

    sourceNode.connect(analyser);
    analyser.connect(actx.destination); // Optional: Connect to destination if playback is needed

    analyse();
  }

  function analyse() {
    var frequencies = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencies);

    for (var i = 29; i <= 80; ++i) {
      if (frequencies[i] > whistle.precision) {
        // Dispatch a whistle event
        const whistleEvent = new Event(whistle.whistleEventName);
        document.dispatchEvent(whistleEvent);

        whistle.whistling = true;
        whistle.intensity = (i - 29) * 2;
      } else {
        whistle.whistling = false;
      }
    }
    if (!whistle.once) {
      requestAnimationFrame(analyse);
    }
  }
})(window, document);
