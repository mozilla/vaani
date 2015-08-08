import { EventEmitter2 } from 'eventemitter2';


const CHANGE_EVENT = 'change';


class BaseStore {
  /**
   * @constructor
   */
  constructor () {
    this._emitter = new EventEmitter2();
  }

  /**
   * Emits a change event
   */
  emitChange () {
    this._emitter.emit(CHANGE_EVENT);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to add
   */
  addChangeListener (func) {
    this._emitter.addListener(CHANGE_EVENT, func);
  }

  /**
   * Adds a change listener to the emitter
   * @param func {Function} The function to remove
   */
  removeChangeListener (func) {
    this._emitter.removeListener(CHANGE_EVENT, func);
  }
}


export default BaseStore;
