import BaseStore from '../lib/base-store';


class CallContactStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      contact: undefined,
      text: ''
    };
  }

  /**
   * Gets the contact state
   */
  getContact () {
    return this.state.contact;
  }

  /**
   * Updates the contact state and emits a change event
   */
  updateContact (contact) {
    this.state.contact = contact;

    this.emitChange();
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
}


export default new CallContactStore();
