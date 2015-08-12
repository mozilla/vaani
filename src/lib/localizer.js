/* global window, document */
import Debug from 'debug';
import { EventEmitter2 } from 'eventemitter2';
import { Env, fetch as Fetch } from 'l20n';


let debug = Debug('Localizer');
let emitter = new EventEmitter2();
let CHANGE_EVENT = 'change';
let defaultLang = 'en-US';
let supportedLocales = ['en-US', 'es-ES', 'fr'];
let env = new Env(defaultLang, Fetch.bind(null, null));
let ctx = env.createContext(['locales/{locale}.l20n']);
let prioritizedLangs = [];


class Localizer {
  /**
   * Starts the localization logic by doing the initial l20n fetching and
   * listening for relevant events on the window when language options change
   * @param callback {Function} The function to callback after we've fetched
   *        langs and built our localized entities
   */
  static start (callback) {
    debug('start', arguments);

    this._prioritizeLocales();
    ctx.fetch(prioritizedLangs).then(callback);

    window.addEventListener('languagechange', this._onLangChange.bind(this));
    document.addEventListener('additionallanguageschange', this._onLangChange.bind(this));
  }

  /**
   * Prioritizes the `supportedLocales` array based on `navigator.languages`.
   * Specifically we find the language of highest priority in the
   * `navigator.languages' matched against our `supportedLocales` (in priority
   * order) and moves the first match to the front of the array. This function
   * also produces the value for the `prioritizedLangs` array.
   * @private
   */
  static _prioritizeLocales () {
    debug('_prioritizeLocales');

    for (let i = 0; i < navigator.languages.length; i++) {
      let idx = supportedLocales.indexOf(navigator.languages[i]);
      if (idx !== -1) {
        let supportedLocale = supportedLocales.splice(idx, 1);
        supportedLocales.unshift(supportedLocale.pop());
        break;
      }
    }

    prioritizedLangs = supportedLocales.map((lang) => {
      return {code: lang, src: 'app'};
    });
  }

  /**
   * Language change handler
   * @private
   */
  static _onLangChange () {
    debug('_onLangChange', navigator.languages);

    this._prioritizeLocales();
    ctx.fetch(prioritizedLangs).then(this.emitChange);
  }

  /**
   * A shortcut for resolving entities.
   * TODO Reza: extend functionality for entity arguments when passing an Array
   * @param entity {String|Array<String>} Either a String representing the
   *        entity to resolve or an Array of strings.
   * @param args {Object} Optional. When the `entity` argument is a String, the
   *        objecet of arguments passed to resolve.
   * @return {Promise}
   */
  static resolve (entity, args = {}) {
    debug('resolve', arguments);

    if (Object.prototype.toString.call(entity) === '[object Array]') {
      return Promise.all(entity.map(ctx.resolve.bind(ctx, prioritizedLangs)));
    }
    else {
      return ctx.resolve(prioritizedLangs, entity, args);
    }
  }

  /**
   * Localizes a document or shadow root
   * @param doc {document|shadowRoot} An object with a querySelectorAll interface
   */
  static localize (doc) {
    debug('localize', arguments);

    let l10nEls = doc.querySelectorAll('[data-l10n-id]');

    for (let i = 0; i < l10nEls.length; i++) {
      let el = l10nEls[i];
      let key = el.getAttribute('data-l10n-id');

      this.resolve(key).then((entity) => {
        el.innerHTML = entity.value;

        // TODO Reza: The attribute names here need logic from l20n that
        //            translate camelCase into attribute-case
        if (entity.attrs) {
          for (let attr in entity.attrs) {
            el.setAttribute(attr, entity.attrs[attr]);
          }
        }
      });
    }
  }

  /**
   * Emits a change event
   */
  static emitChange () {
    debug('emitChange');

    emitter.emit(CHANGE_EVENT);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to add
   */
  static addChangeListener (func) {
    debug('addChangeListener', arguments);

    emitter.addListener(CHANGE_EVENT, func);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to remove
   */
  static removeChangeListener (func) {
    debug('removeChangeListener', arguments);

    emitter.removeListener(CHANGE_EVENT, func);
  }
}


export default Localizer;
