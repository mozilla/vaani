import BaseStore from '../lib/base-store';


class CallStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      text: '',
      phoneNumber: ''
    };
  }

  /**
   * Gets the text state
   */
  getText () {
    return this.state.text;
  }

  /**
   * Updates the text state and emits a change event
   */
  updateText (text) {
    this.state.text = text;

    this.emitChange();
  }

  /**
   * Gets the phone number state
   */
  getPhoneNumber () {
    return this.state.phoneNumber;
  }

  /**
   * Updates the phone number state and emits a change event
   */
  updatePhoneNumber (phone) {
    this.state.phoneNumber = phone;

    this.emitChange();
  }
}


export default new CallStore();
