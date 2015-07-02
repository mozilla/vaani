import Debug from 'debug';
import AppStore from '../stores/app';


let debug = Debug('DisplayActions');


class DisplayActions {
  /**
   * Changes the current view
   * @param {String} (optional) The name of the comoponent to create
   */
  static changeViews (componentName) {
    debug('changeViews', arguments);

    var display = document.querySelector('vaani-display');
    var newView;

    if (componentName) {
      newView = document.createElement(componentName);
    }

    display.changeViews(newView);

    AppStore.state.display.activeView = newView;
    AppStore.emitChange();
  }
}


export default DisplayActions;
