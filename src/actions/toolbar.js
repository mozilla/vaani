import Debug from 'debug';
import AppStore from '../stores/app';


let debug = Debug('ToolbarActions');


class ToolbarActions {
  /**
   * Sets the active item
   * @param value {String} The active item
   */
  static setActiveItem (value) {
    debug('setAtiveItem', arguments);

    AppStore.state.toolbar.activeItem = value;
    AppStore.emitChange();
  }
}


export default ToolbarActions;
