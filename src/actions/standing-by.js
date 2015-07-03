import Debug from 'debug';
import AppStore from '../stores/app';
import Vaani from '../lib/vaani';
import AppLauncher from '../lib/app-launcher';
import TalkieActions from './talkie';


let debug = Debug('StandingByActions');


class StandingByActions {
  /**
   * Initializes a Vaani instance
   */
  static setupSpeech () {
    debug('setupSpeech');

    this.vaani = new Vaani({
      grammar: `
        #JSGF v1.0;
        grammar fxosVoiceCommands;
        public <simple> =
          open phone |
          open messages |
          open email |
          open contacts |
          open browser |
          open gallery |
          open camera |
          open marketplace |
          open clock |
          open settings |
          open calendar |
          open music |
          open video |
          open calculator
        ;
      `,
      interpreter: this._interpreter.bind(this),
      onSay: this._onSay.bind(this),
      onSayDone: this._onSayDone.bind(this),
      onListen: this._onListen.bind(this),
      onListenDone: this._onListenDone.bind(this)
    });
  }

  /**
   * Greets the user and waits for a response
   */
  static greetUser () {
    debug('greetUser');

    this.vaani.say('How may I help you?', true);
  }

  /**
   * Interprets the result of speech recognition
   * @param err {Error|null} An error if speech was not understood
   * @param command {String} Text returned from the speech recognition
   */
  static _interpreter (err, command) {
    debug('_interpreter', arguments);

    TalkieActions.setActiveAnimation('none');

    if (err) {
      debug('_interpreter error', err);

      this.vaani.say('I didn\'t understand, say again.', true);

      return;
    }

    if (command.indexOf('open') > -1) {
      var appToLaunch;

      if (command.indexOf('phone') > -1) {
        appToLaunch = 'phone'; // not working, why?
      }
      else if (command.indexOf('messages') > -1) {
        appToLaunch = 'messages';
      }
      else if (command.indexOf('email') > -1) {
        appToLaunch = 'e-mail';
      }
      else if (command.indexOf('contacts') > -1) {
        appToLaunch = 'contacts'; // not working, why?
      }
      else if (command.indexOf('browser') > -1) {
        appToLaunch = 'browser';
      }
      else if (command.indexOf('gallery') > -1) {
        appToLaunch = 'gallery';
      }
      else if (command.indexOf('camera') > -1) {
        appToLaunch = 'camera';
      }
      else if (command.indexOf('marketplace') > -1) {
        appToLaunch = 'marketplace';
      }
      else if (command.indexOf('clock') > -1) {
        appToLaunch = 'clock';
      }
      else if (command.indexOf('settings') > -1) {
        appToLaunch = 'settings';
      }
      else if (command.indexOf('calendar') > -1) {
        appToLaunch = 'calendar';
      }
      else if (command.indexOf('music') > -1) {
        appToLaunch = 'music';
      }
      else if (command.indexOf('video') > -1) {
        appToLaunch = 'video';
      }
      else if (command.indexOf('calculator') > -1) {
        appToLaunch = 'calculator';
      }
      else {
        debug('Unable to interpret open command.', command);

        this.vaani.say('I could not find that app.');

        return;
      }

      AppLauncher.launch(appToLaunch, (err) => {
        if (err) {
          debug('AppLauncher error', err);

          this.vaani.say('I was not able to open ' + appToLaunch + '.');
        }
      });
    }
  }

  /**
   * A hook that's fired when Vaani's say function is called
   * @param sentence {String} The sentence to be spoken
   * @param waitForResponse {Boolean} Indicates if we will wait
   *        for a response after the sentence has been said
   */
  static _onSay (sentence, waitForResponse) {
    debug('_onSay', arguments);

    AppStore.state.standingBy.text = sentence;

    TalkieActions.setActiveAnimation('sending');
    TalkieActions.setMode('none');
  }

  /**
   * A hook that's fired when Vaani's say function is finished
   * @param sentence {String} The sentence to be spoken
   * @param waitForResponse {Boolean} Indicates if we will wait
   *        for a response after the sentence has been said
   */
  static _onSayDone (sentence, waitForResponse) {
    if (!waitForResponse) {
      TalkieActions.setActiveAnimation('none');
    }
  }

  /**
   * A hook that's fired when Vaani's listen function is called
   */
  static _onListen () {
    debug('_onListen');

    AppStore.state.standingBy.text = '';

    TalkieActions.setActiveAnimation('receiving');
  }

  /**
   * A hook that's fired when Vaani's listen function is finished
   */
  static _onListenDone () {
  }

  /**
   * The action that handles mic toggles
   */
  static toggleMic () {
    debug('toggleMic');

    if (this.vaani.isSpeaking || this.vaani.isListening) {
      this.vaani.cancel();

      AppStore.state.standingBy.text = '';

      TalkieActions.setActiveAnimation('none');
      TalkieActions.setMode('none');

      return;
    }

    this.greetUser();
  }
}


export default StandingByActions;
