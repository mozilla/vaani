import BaseStore from '../lib/base-store';


class TalkieStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      mode: 'none',
      activeAnimation: 'none'
    };
  }

  /**
   * Gets the mode state
   */
  getMode () {
    return this.state.mode;
  }

  /**
   * Gets the active animation state
   */
  getActiveAnimation () {
    return this.state.activeAnimation;
  }

  /**
   * Updates the mode state and emits a change event
   */
  updateMode (mode) {
    this.state.mode = mode;

    this.emitChange();
  }

  /**
   * Updates the active animation state and emits a change event
   */
  updateActiveAnimation (animation) {
    this.state.activeAnimation = animation;

    this.emitChange();
  }
}


export default new TalkieStore();
