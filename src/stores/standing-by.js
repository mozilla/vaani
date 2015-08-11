import BaseStore from '../lib/base-store';


class StandingByStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      text: ''
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
}


export default new StandingByStore();
