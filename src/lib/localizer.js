/* global window, document */
import Debug from 'debug';
import { EventEmitter2 } from 'eventemitter2';
import { Env, fetch as Fetch } from 'l20n';


let debug = Debug('Localizer');
let CHANGE_EVENT = 'change';


class Localizer {
  /**
   * @constructor
   */
  constructor () {
    this.defaultLang = 'en-US';
    this.supportedLocales = ['en-US', 'es-ES', 'fr'];
    this.prioritizedLangs = [];

    this._env = new Env(this.defaultLang, Fetch.bind(null, null));
    this._ctx = this._env.createContext(['localization/{locale}.l20n']);

    this._emitter = new EventEmitter2();
  }

  /**
   * Starts the localization logic by doing the initial l20n fetching and
   * listening for relevant events on the window when language options change
   * @param callback {Function} The function to callback after we've fetched
   *        langs and built our localized entities
   */
  start (callback) {
    debug('start', arguments);

    this._prioritizeLocales();
    this._ctx.fetch(this.prioritizedLangs).then(callback);

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
  _prioritizeLocales () {
    debug('_prioritizeLocales');

    for (let i = 0; i < navigator.languages.length; i++) {
      let idx = this.supportedLocales.indexOf(navigator.languages[i]);
      if (idx !== -1) {
        let supportedLocale = this.supportedLocales.splice(idx, 1);
        this.supportedLocales.unshift(supportedLocale.pop());
        break;
      }
    }

    this.prioritizedLangs = this.supportedLocales.map((lang) => {
      return {code: lang, src: 'app'};
    });
  }

  /**
   * Language change handler
   * @private
   */
  _onLangChange () {
    debug('_onLangChange', navigator.languages);

    this._prioritizeLocales();
    this._ctx.fetch(this.prioritizedLangs).then(this.emitChange.bind(this));
  }

  /**
   * A shortcut for resolving entities.
   * @param entity {String|Array<String>} Either a String representing the
   *        entity to resolve or an Array of strings. If `entity` is an array
   *        it's items may be simple strings or a two item array representing
   *        an entity and an arguments object.
   * @param args {Object} Optional. When the `entity` argument is a String, the
   *        objecet of arguments passed to resolve.
   * @return {Promise}
   */
  resolve (entity, args = {}) {
    debug('resolve', arguments);

    if (Object.prototype.toString.call(entity) === '[object Array]') {
      return Promise.all(entity.map((ent) => {
        if (Object.prototype.toString.call(ent) === '[object Array]') {
          return this._ctx.resolveEntity(this.prioritizedLangs, ent[0], ent[1]);
        }
        else {
          return this._ctx.resolveEntity(this.prioritizedLangs, ent, {});
        }
      }));
    }
    else {
      return this._ctx.resolveEntity(this.prioritizedLangs, entity, args);
    }
  }

  /**
   * Localizes a document or shadow root
   * @param doc {document|shadowRoot} An object with a querySelectorAll interface
   */
  localize (doc) {
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
   * Gets the highest priority locale
   */
  getPriorityLocale () {
    debug('getPriorityLocale');

    return this.supportedLocales[0];
  }

  /**
   * Gets the highest priority lang from the highest priority locale
   */
  getPriorityLang () {
    debug('getPriorityLocale');

    return this.supportedLocales[0].split('-')[0];
  }

  /**
   * Emits a change event
   */
  emitChange () {
    debug('emitChange');

    this._emitter.emit(CHANGE_EVENT);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to add
   */
  addChangeListener (func) {
    debug('addChangeListener', arguments);

    this._emitter.addListener(CHANGE_EVENT, func);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to remove
   */
  removeChangeListener (func) {
    debug('removeChangeListener', arguments);

    this._emitter.removeListener(CHANGE_EVENT, func);
  }
}


export default new Localizer();
