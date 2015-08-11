import BaseStore from '../lib/base-store';


class DisplayStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      activeView: undefined
    };
  }

  /**
   * Gets the active view state
   */
  getActiveView () {
    return this.state.activeView;
  }

  /**
   * Updates the text state and emits a change event
   */
  updateActiveView (view) {
    this.state.activeView = view;

    this.emitChange();
  }
}


export default new DisplayStore();
