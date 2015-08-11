import Debug from 'debug';
import DisplayStore from '../stores/display';
import TalkieStore from '../stores/talkie';
import DisplayActions from './display';


let debug = Debug('TalkieActions');


class TalkieActions {
  /**
   * Delegates to the active view's toggleMic function or
   * changes to view to vaani-standing-by
   */
  static toggleMic () {
    debug('toggleMic');

    var activeView = DisplayStore.getActiveView();

    if (activeView && activeView.toggleMic) {
      activeView.toggleMic();

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

    TalkieStore.updateActiveAnimation(value);
  }

  /**
   * Sets the mode
   * @param value {String} the mode
   */
  static setMode (value) {
    debug('setMode', arguments);

    TalkieStore.updateMode(value);
  }
}


export default TalkieActions;
