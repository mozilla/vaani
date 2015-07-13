var AppStore = {
  _changeEvent: new CustomEvent('change'),
  _emitter: document.createElement('div'),
  emitChange: function () {
    this._emitter.dispatchEvent(this._changeEvent);
  },
  addChangeListener: function (func) {
    this._emitter.addEventListener('change', func);
  },
  removeChangeListener: function (func) {
    this._emitter.removeEventListener('change', func);
  },
  state: {
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
  }
};


export default AppStore;
