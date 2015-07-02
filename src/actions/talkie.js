import Debug from 'debug';
import AppStore from '../stores/app';
import DisplayActions from './display';


let debug = Debug('TalkieActions');


class TalkieActions {
  /**
   * Delegates to the active view's toggleMic function or
   * changes to view to vaani-standing-by
   */
  static toggleMic () {
    debug('toggleMic');

    if (AppStore.state.display.activeView &&
        AppStore.state.display.activeView.toggleMic) {

      AppStore.state.display.activeView.toggleMic();
      return;
    }

    DisplayActions.changeViews('vaani-standing-by');
  }

  /**
   * Sets the active animation
   * @param value {String} the name of the animation
   */
  static setActiveAnimation (value) {
    debug('setActiveAnimation', arguments);

    AppStore.state.talkie.activeAnimation = value;
    AppStore.emitChange();
  }

  /**
   * Sets the mode
   * @param value {String} the mode
   */
  static setMode (value) {
    debug('setMode', arguments);

    AppStore.state.talkie.mode = value;
    AppStore.emitChange();
  }
}


export default TalkieActions;
