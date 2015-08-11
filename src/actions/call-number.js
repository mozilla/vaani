import Debug from 'debug';
import CallNumberStore from '../stores/call-number';
import Localizer from '../lib/localizer';
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

    Localizer.resolve('callNumber__grammar').then((grammarEntity) => {
      this.vaani = new Vaani({
        grammar: grammarEntity.value,
        interpreter: this._interpreter.bind(this),
        onSay: this._onSay.bind(this),
        onSayDone: this._onSayDone.bind(this),
        onListen: this._onListen.bind(this),
        onListenDone: this._onListenDone.bind(this)
      });
    });
  }

  /**
   * Asks the user to confirm the number and waits for a response
   */
  static confirmNumber () {
    debug('confirmNumber');

    var phoneNumber = CallNumberStore.getPhoneNumber();
    var args = {
      number: phoneNumber,
      numberSpaced: phoneNumber.replace(/(\d)(?=\d)/g, '$1 ')
    };

    Localizer.resolve('callNumber__doYouWantMeToCall', args).then((entity) => {
      CallNumberStore.updateText(entity.value);

      this.vaani.say(entity.attrs.spoken, true);
    });
  }

  /**
   * Interprets the result of speech recognition
   * @param err {Error|null} An error if speech was not understood
   * @param command {String} Text returned from the speech recognition
   * @private
   */
  static _interpreter (err, command) {
    debug('_interpreter', arguments);

    TalkieActions.setActiveAnimation('none');

    if (err) {
      debug('_interpreter error', err);

      Localizer.resolve('general__iDidntUnderstandSayAgain').then((entity) => {
        CallNumberStore.updateText(entity.value);

        this.vaani.say(entity.value.spoken, true);
      });

      return;
    }

    if (command.indexOf('yes') > -1) {
      var phoneNumber = CallNumberStore.getPhoneNumber();

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
   * @private
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
   * @private
   */
  static _onSayDone (sentence, waitForResponse) {
    if (!waitForResponse) {
      TalkieActions.setActiveAnimation('none');
    }
  }

  /**
   * A hook that's fired when Vaani's listen function is called
   * @private
   */
  static _onListen () {
    debug('_onListen');

    TalkieActions.setActiveAnimation('receiving');
  }

  /**
   * A hook that's fired when Vaani's listen function is finished
   * @private
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

      CallNumberStore.updatePhoneNumber('');
      CallNumberStore.updateText('');

      TalkieActions.setActiveAnimation('none');
      TalkieActions.setMode('none');

      DisplayActions.changeViews(null);

      return;
    }

    this.confirmNumber();
  }
}


export default CallNumberActions;
