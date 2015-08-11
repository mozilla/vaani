import BaseStore from '../lib/base-store';


class ToolbarStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      activeItem: ''
    };
  }

  /**
   * Gets the active item state
   */
  getActiveItem () {
    return this.state.activeItem;
  }

  /**
   * Updates the active item state and emits a change event
   */
  updateActiveItem (item) {
    this.state.activeItem = item;

    this.emitChange();
  }
}


export default new ToolbarStore();
