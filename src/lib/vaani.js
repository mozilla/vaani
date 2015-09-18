/* global speechSynthesis, SpeechGrammarList, SpeechRecognition, SpeechSynthesisUtterance */
import Debug from 'debug';
import Localizer from './localizer';


let debug = Debug('Vaani');


class Vaani {
  /**
   * @constructor
   * @param options {Object}
   * @param options.grammar {String} The JSGF 1.0 grammar list to be
   *        used by the speech recognition library
   * @param options.interpreter {Function} The function to call after
   *        speech recognition is attempted
   * @param options.onSay {Function} The function to call when say executes
   * @param options.onSayDone {Function} The function to call when say finishes
   * @param options.onListen {Function} The function to call when listen executes
   * @param options.onListenDone {Function} The function to call when listen finishes
   */
  constructor (options = {}) {
    debug('constructor', arguments);

    if (!options.hasOwnProperty('grammar')) {
      throw Error('Missing required `grammar` option.');
    }

    if (!options.hasOwnProperty('interpreter')) {
      throw Error('Missing required `interpreter` option.');
    }

    this.speechGrammarList = new SpeechGrammarList();
    this.speechGrammarList.addFromString(options.grammar, 1);
    this.speechRecognition = new SpeechRecognition();
    this.speechRecognition.lang = 'en-US';
    this.speechRecognition.grammars = this.speechGrammarList;
    this.isSpeaking = false;
    this.isListening = false;
    this.alertStart = document.createElement('audio');
    this.alertStart.src = '/assets/audios/alert_start.opus';
    this.alertStop = document.createElement('audio');
    this.alertStop.src = '/assets/audios/alert_end.opus';
    this._synthesisWasCanceled = false;
    this._interpreter = options.interpreter;
    this._onSay = options.onSay;
    this._onSayDone = options.onSayDone;
    this._onListen = options.onListen;
    this._onListenDone = options.onListenDone;
    this._interpretingCommand = false;
    this._audioEl = undefined;
  }

  /**
   * Says a sentence and optionally wait for a response
   * @param sentence {String} The sentence to be spoken
   * @param waitForResponse {Boolean} Indicates we will wait for a
   *        response after the sentence has been said
   */
  say (sentence, waitForResponse) {
    debug('say', arguments);

    if (this._onSay) {
      this._onSay(sentence, waitForResponse);
    }

    if (waitForResponse) {
      this._interpretingCommand = true;
    }

    this.isSpeaking = true;
    this._synthesisWasCanceled = false;

    var lang = Localizer.getPriorityLang();
    var sayItProud;

    // Reza: This is a temporary solution to help dev in the browser
    if (navigator.userAgent.indexOf('Mobile') === -1) {
      sayItProud = () => {
        this._audioEl = document.createElement('audio');

        var url = 'http://speechan.cloudapp.net/weblayer/synth.ashx';
        url += '?lng=' + lang;
        url += '&msg=' + sentence;

        this._audioEl.src = url;
        this._audioEl.setAttribute('autoplay', 'true');
        this._audioEl.addEventListener('ended', () => {
          this.isSpeaking = false;

          if (this._onSayDone) {
            this._onSayDone(sentence, waitForResponse);
          }

          if (waitForResponse) {
            this.listen();
          }
        });
      };
    }
    else {
      sayItProud = () => {
        var utterance = new SpeechSynthesisUtterance(sentence);

        utterance.lang = lang;
        utterance.addEventListener('end', () => {
          this.isSpeaking = false;

          if (this._onSayDone) {
            this._onSayDone(sentence, waitForResponse);
          }

          if (waitForResponse && !this._synthesisWasCanceled) {
            this.listen();
          }
        });

        speechSynthesis.speak(utterance);
      };
    }

    // Aus: Wait an extra 100ms for the audio output to stabilize off
    setTimeout(sayItProud, 100);
  }

  /**
   * Listen for a response from the user
   */
  listen () {
    debug('listen');

    if (this._onListen) {
      this._onListen();
    }

    this.alertStart.play();

    setTimeout(() => {
      this.isListening = true;
      this.speechRecognition.start();
    }, 100);

    this.speechRecognition.onresult = (event) => {
      this.isListening = false;
      this._interpretingCommand = false;
      this.alertStop.play();

      if (this._onListenDone) {
        this._onListenDone();
      }

      var transcript = '';
      var partialTranscript = '';
      // var confidence = 0;
      // var isFinal = false;

      // Assemble the transcript from the array of results
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // isFinal = true;
          transcript += event.results[i][0].transcript;
          // Aus: This is useless right now but the idea is we wouldn't
          // always complete the action or command requested if the
          // confidence level is too low
          // confidence = event.results[i][0].confidence;
        }
        else {
          partialTranscript += event.results[i][0].transcript;
          // Aus: In theory, partial transcripts shouldn't be used
          // as their confidence will always be lower than a final
          // transcript. We should ask the user to repeat what they
          // want when all we have is a partial transcript with 'low'
          // confidence.
          // confidence = event.results[i][0].confidence;
        }
      }

      // Aus: We'll fall back to the partial transcript if there
      // isn't a final one for now. It actually looks like we never
      // get a final transcript currently.
      var usableTranscript = transcript || partialTranscript;

      // Aus: Ugh. This is really crappy error handling
      if (usableTranscript === 'ERROR') {
        var getOffMyLawn = new Error('Unrecognized speech.');
        this._interpreter(getOffMyLawn);
      }
      else if (usableTranscript.length) {
        this._interpreter(null, usableTranscript);
      }
    };
  }

  /**
   * Cancels speech synthesis and/or recognition
   */
  cancel () {
    debug('cancel');

    this.alertStop.play();

    if (this.isListening) {
      this.speechRecognition.abort();
    }

    if (this.isSpeaking) {
      if (this._audioEl) {
        this._audioEl.pause();
      }
      else {
        this._synthesisWasCanceled = true;
        speechSynthesis.cancel();
      }
    }

    this.isSpeaking = false;
    this.isListening = false;
  }
}


export default Vaani;
