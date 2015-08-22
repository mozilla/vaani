import Debug from 'debug';
import AppStore from '../stores/app';
import CallNumberStore from '../stores/call-number';
import StandingByStore from '../stores/standing-by';
import Localizer from '../lib/localizer';
import Vaani from '../lib/vaani';
import AppLauncher from '../lib/app-launcher';
import Dialer from '../lib/dialer';
import DisplayActions from './display';
import TalkieActions from './talkie';
import 'string.prototype.startswith';
import 'string.prototype.endswith';
import 'string.prototype.includes';


let debug = Debug('StandingByActions');


class StandingByActions {
  /**
   * Initializes a Vaani instance
   */
  static setupSpeech () {
    debug('setupSpeech');

    var args = {
      appsGrammar: AppStore.getAppsGrammar()
    };

    Localizer.resolve('standingBy__grammar', args).then((grammarEntity) => {
      debug('setupSpeech:grammar', grammarEntity.value);

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
   * Greets the user and waits for a response
   */
  static greetUser () {
    debug('greetUser');

    Localizer.resolve('standingBy__howMayIHelpYou').then((entity) => {
      StandingByStore.updateText(entity.value);

      this.vaani.listen();
    });
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
      debug('_interpreter:error', err);

      Localizer.resolve('general__iDidntUnderstandSayAgain').then((entity) => {
        this.vaani.say(entity.attrs.spoken, true);

        StandingByStore.updateText(entity.value);
      });

      return;
    }

    Localizer.resolve([
      'standingBy__openCommand',
      'standingBy__openCommandCue',
      'standingBy__callCommand',
      'standingBy__callCommandCue',
      'standingBy__specialAppPhone',
      'standingBy__specialAppContacts'
    ]).then((entities) => {
      var openCommand = entities[0].value;
      var openCommandCue = entities[1].value;
      var callCommand = entities[2].value;
      var callCommandCue = entities[3].value;
      var specialAppPhone = entities[4].value;
      var specialAppContacts = entities[5].value;

      if (command[callCommandCue](callCommand)) {
        var phoneNumber = Dialer.wordsToDigits(command);

        CallNumberStore.updatePhoneNumber(phoneNumber);

        DisplayActions.changeViews('vaani-call-number');
      }
      else if (command[openCommandCue](openCommand)) {
        var appRequested, appToLaunch, entryPoint;

        if (openCommandCue === 'startsWith') {
          appRequested = command.substring(openCommand.length + 1);
        }
        else {
          appRequested = command.substring(0, command.length - (openCommand.length + 1));
        }

        appToLaunch = appRequested;

        if (command.includes(specialAppPhone)) {
          appRequested = 'phone';
          appToLaunch = 'communications';
          entryPoint = 'dialer';
        }
        else if (command.includes(specialAppContacts)) {
          appRequested = 'contacts';
          appToLaunch = 'communications';
          entryPoint = 'contacts';
        }

        AppLauncher.launch(appToLaunch, entryPoint, (err) => {
          if (err) {
            debug('AppLauncher error', err);

            var args = {app: appRequested};

            Localizer.resolve('standingBy__iCantFindThatApp', args).then((entity) => {
              this.vaani.say(entity.attrs.spoken);

              StandingByStore.updateText(entity.value);
            });

            return;
          }

          StandingByStore.updateText('');
        });
      }
      else {
        debug('Unable to match interpretation');

        Localizer.resolve('general__iWasntAbleToUnderstand').then((entity) => {
          this.vaani.say(entity.attrs.spoken);

          StandingByStore.updateText(entity.value);
        });
      }
    });
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
    debug('_onSayDone');

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

      StandingByStore.updateText('');

      TalkieActions.setActiveAnimation('none');
      TalkieActions.setMode('none');

      return;
    }

    this.greetUser();
  }
}


export default StandingByActions;
