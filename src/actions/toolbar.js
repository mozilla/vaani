import Debug from 'debug';
import ToolbarStore from '../stores/toolbar';


let debug = Debug('ToolbarActions');


class ToolbarActions {
  /**
   * Sets the active item
   * @param value {String} The active item
   */
  static setActiveItem (value) {
    debug('setActiveItem', arguments);

    ToolbarStore.updateActiveItem(value);
  }
}


export default ToolbarActions;
