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
let entities = [
  'help__whatCanIAsk', 'help__openApp', 'help__callNumber'
];
let translations = {};


class Localizer {
  /**
   * Starts the localization logic by doing the initial l20n fetching and
   * listening for relevant events on the window when language options change
   * @param callback {Function} The function to callback after we've fetched
   *        langs and built our localized strings
   */
  static start (callback) {
    debug('start', arguments);

    this._prioritizeLocales();
    this._fetch(prioritizedLangs).then(callback);

    window.addEventListener('languagechange', this._onLangChange.bind(this));
    document.addEventListener('additionallanguageschange', this._onLangChange.bind(this));
  }

  /**
   * Fetches resources files and resolves entities
   * @private
   * @return {Promise}
   */
  static _fetch () {
    debug('_fetch');

    return ctx.fetch(prioritizedLangs).then(() => {
      return this.resolve(entities).then((values) => {
        entities.forEach((entity, index) => {
          translations[entity] = values[index];
        });
      });
    });
  }

  /**
   * Prioritizes supported langs based on navigator.locales;
   * specifically finds the first language of the navigator matching supported
   * locales and moves the match to the front of the array and produces the
   * final prioritized languages object array
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
    this._fetch(prioritizedLangs).then(this.emitChange);
  }

  /**
   * A shortcut for resolving entities
   * @param entity {String|Array<String>} The entity to resolve
   * @return {Promise}
   */
  static resolve (entity) {
    debug('resolve', arguments);

    if (Object.prototype.toString.call(entity) === '[object Array]') {
      return Promise.all(entity.map(ctx.resolve.bind(ctx, prioritizedLangs)));
    }
    else {
      return ctx.resolve(prioritizedLangs, entity);
    }
  }

  /**
   * A getter for translations
   * @param key {String} The property to get
   * @return {Object} The value from translations or `key` if not found
   */
  static get (key) {
    debug('get', arguments);

    return translations.hasOwnProperty(key) ? translations[key] : key;
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
      let translation = this.get(key);

      if (!translation) {
        return;
      }

      el.innerHTML = translation.value;

      // Reza: we need to double check this attrs logic
      if (translation.attrs) {
        for (let attr in translation.attrs) {
          el.setAttribute(attr, translation.attrs[attr]);
        }
      }
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
