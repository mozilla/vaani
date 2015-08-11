import Debug from 'debug';
import DisplayStore from '../stores/display';


let debug = Debug('DisplayActions');


class DisplayActions {
  /**
   * Changes the current view
   * @param {String} (optional) The name of the comoponent to create
   */
  static changeViews (componentName) {
    debug('changeViews', arguments);

    var newView;

    if (componentName) {
      newView = document.createElement(componentName);
    }

    DisplayStore.updateActiveView(newView);
  }
}


export default DisplayActions;
