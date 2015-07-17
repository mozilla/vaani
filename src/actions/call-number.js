import Debug from 'debug';
import AppStore from '../stores/app';
import Vaani from '../lib/vaani';
import Dialer from '../lib/dialer';
import DisplayActions from './display';
import TalkieActions from './talkie';


let debug = Debug('CallNumberActions');


class CallNumberActions {
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
          yes | no
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
   * Asks the user to confirm the number and waits for a response
   */
  static confirmNumber () {
    debug('confirmNumber');

    var phoneNumber = AppStore.state.callNumber.phoneNumber;

    AppStore.state.callNumber.text = 'Do you want to call ' + phoneNumber + '? Yes/No';
    AppStore.emitChange();

    phoneNumber = phoneNumber.replace(/(\d)(?=\d)/g, '$1 ');

    this.vaani.say('Do you want me to call ' + phoneNumber + '?', true);
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

    if (command.indexOf('yes') > -1) {
      var phoneNumber = AppStore.state.callNumber.phoneNumber;

      debug('dialing', phoneNumber);

      Dialer.dial(phoneNumber, (err, call) => {
        if (err) {
          debug('Dialer error', err);

          this.vaani.say('I\'m sorry, I wasn\'t able to make the call.');

          return;
        }

        call.onstatechange = (event) => {
          debug('call state changed', event);

          if (call.state === 'disconnected') {
            DisplayActions.changeViews(null);
          }
        };
      });
    }
    else if (command.indexOf('no') > -1) {
      this.vaani.say('Ok');

      DisplayActions.changeViews(null);
    }
    else {
      debug('Unable to match interpretation');

      this.vaani.say('I\'m sorry, I wasn\'t able to understand.');
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

      AppStore.state.callNumber.phoneNumber = '';
      AppStore.state.callNumber.text = '';

      TalkieActions.setActiveAnimation('none');
      TalkieActions.setMode('none');

      DisplayActions.changeViews(null);

      return;
    }

    this.confirmNumber();
  }
}


export default CallNumberActions;
