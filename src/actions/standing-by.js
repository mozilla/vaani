/* global navigator */
import Debug from 'debug';
import AppStore from '../stores/app';
import CallNumberStore from '../stores/call-number';
import CallContactStore from '../stores/call-contact';
import StandingByStore from '../stores/standing-by';
import Localizer from '../lib/localizer';
import Vaani from '../lib/vaani';
import AppLauncher from '../lib/app-launcher';
import DisplayActions from './display';
import TalkieActions from './talkie';
import 'string.prototype.startswith';
import 'string.prototype.endswith';
import 'string.prototype.includes';


let debug = Debug('StandingByActions');


class StandingByActions {
  /**
   * Initializes a Vaani instance
   * @param callback {Function} The function to call back when speech has
   *        been setup.
   */
  static setupSpeech (callback) {
    debug('setupSpeech');

    Localizer.resolve([
      'standingBy__openCommand',
      'standingBy__callCommand',
      'standingBy__dialCommand',
      'standingBy__specialAppPhone',
      'standingBy__specialAppContacts'
    ]).then((entities) => {
      debug('entities', entities);

      var openCommand = entities[0].value;
      var callCommand = entities[1].value;
      var dialCommand = entities[2].value;
      var specialAppPhone = entities[3].value;
      var specialAppContacts = entities[4].value;
      var appsGrammar = AppStore.getAppsGrammar() || 'unavailable';
      var contactsGrammar = AppStore.getContactsGrammar() || 'unknown';
      var grammar = `
          #JSGF v1.0;
          grammar fxosVoiceCommands;
          <app> =
            ${ specialAppPhone } |
            ${ specialAppContacts } |
            ${ appsGrammar }
          ;
          <contact> = ${ contactsGrammar };
          <digit> = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
          public <simple> =
            ${ openCommand } <app> |
            ${ dialCommand } <digit>+ |
            ${ callCommand } <contact>
          ;
      `;

      debug('setupSpeech:grammar', grammar);

      this.vaani = new Vaani({
        grammar: grammar,
        interpreter: this._interpreter.bind(this),
        onSay: this._onSay.bind(this),
        onSayDone: this._onSayDone.bind(this),
        onListen: this._onListen.bind(this),
        onListenDone: this._onListenDone.bind(this)
      });

      callback();
    });
  }

  /**
   * Greets the user and waits for a response
   */
  static greetUser () {
    debug('greetUser');

    Localizer.resolve('standingBy__howMayIHelpYou').then((entities) => {
      if (entities.length === 0) {
        return;
      }

      var entity = entities[0];

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

      Localizer.resolve('general__iDidntUnderstandSayAgain').then((entities) => {
        if (entities.length === 0) {
          return;
        }

        var entity = entities[0];

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
      'standingBy__dialCommand',
      'standingBy__dialCommandCue',
      'standingBy__specialAppPhone',
      'standingBy__specialAppContacts'
    ]).then((entities) => {
      var openCommand = entities[0].value;
      var openCommandCue = entities[1].value === 'start' ? 'startsWith' : 'endsWith';
      var callCommand = entities[2].value;
      var callCommandCue = entities[3].value === 'start' ? 'startsWith' : 'endsWith';
      var dialCommand = entities[4].value;
      var dialCommandCue = entities[5].value === 'start' ? 'startsWith' : 'endsWith';
      var specialAppPhone = entities[6].value;
      var specialAppContacts = entities[7].value;

      if (command[callCommandCue](callCommand)) {
        debug('_interpreter:callCommand', command);

        if (!navigator.mozContacts) {
          debug('_interpreter', 'navigator.mozContacts not found');
          return;
        }

        var contactRequested;

        if (callCommandCue === 'startsWith') {
          contactRequested = command.substring(callCommand.length + 1);
        }
        else {
          contactRequested = command.substring(0, command.length - (callCommand.length + 1));
        }

        debug('_interpreter:contactRequested', contactRequested);

        var contacts = AppStore.getContacts();
        var contactMatch;

        for (let i = 0; i < contacts.length; i++) {
          if (contacts[i].name[0].toLocaleLowerCase().includes(contactRequested)) {
            contactMatch = contacts[i];
            break;
          }
        }

        debug('_interpreter:callCommand:contactMatch', contactMatch);

        CallContactStore.updateContact(contactMatch);

        DisplayActions.changeViews('vaani-call-contact');
      }
      else if (command[dialCommandCue](dialCommand)) {
        debug('_interpreter:dialCommand', command);

        var phoneNumber;

        if (dialCommandCue === 'startsWith') {
          phoneNumber = command.substring(dialCommand.length + 1);
        }
        else {
          phoneNumber = command.substring(0, command.length - (dialCommand.length + 1));
        }

        CallNumberStore.updatePhoneNumber(phoneNumber);

        DisplayActions.changeViews('vaani-call-number');
      }
      else if (command[openCommandCue](openCommand)) {
        debug('_interpreter:openCommand', command);

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

            Localizer.resolve('standingBy__iCantFindThatApp', args).then((entities) => {
              if (entities.length === 0) {
                return;
              }

              var entity = entities[0];

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

        Localizer.resolve('general__iWasntAbleToUnderstand').then((entities) => {
          if (entities.length === 0) {
            return;
          }

          var entity = entities[0];

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
