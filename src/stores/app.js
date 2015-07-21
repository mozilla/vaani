import { EventEmitter2 } from 'eventemitter2';


const CHANGE_EVENT = 'change';


class AppStore {
  /**
   * @constructor
   */
  constructor () {
    this._emitter = new EventEmitter2();
    this.state = {
      display: {
        activeView: undefined
      },
      toolbar: {
        activeItem: 'none'
      },
      talkie: {
        mode: 'none',
        activeAnimation: 'none'
      },
      firstTimeUse: {
        launchCount: -1,
        tour: {
          inFlight: false,
          current: 1,
          total: 3
        }
      },
      standingBy: {
        text: ''
      },
      callNumber: {
        text: '',
        phoneNumber: ''
      }
    };
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


export default new AppStore();
