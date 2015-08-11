import Debug from 'debug';
import FirstTimeUseStore from '../stores/first-time-use';
import TalkieActions from './talkie';
import ToolbarActions from './toolbar';


let debug = Debug('FirstTimeUseActions');


class FirstTimeUseActions {
  /**
   * Updates the launch count
   */
  static startTour () {
    FirstTimeUseStore.updateTourInfo(1, true);
  }

  /**
   * Updates the launch count
   */
  static updateLaunchCount (count) {
    FirstTimeUseStore.updateLaunchCount(count);
  }

  /**
   * Advances the tour
   */
  static advanceTour () {
    debug('advanceTour');

    var tourInfo = FirstTimeUseStore.getTourInfo();
    var currentStep = tourInfo.current;
    var totalSteps = tourInfo.total;
    var toolbarActiveItem = 'none';

    if (currentStep === 1) {
      toolbarActiveItem = 'community';
    }
    if (currentStep === 2) {
      toolbarActiveItem = 'help';
    }

    if (currentStep === totalSteps) {
      FirstTimeUseStore.updateTourInfo(0, false);

      TalkieActions.setMode('idle');
    }
    else {
      currentStep += 1;
      FirstTimeUseStore.updateTourInfo(currentStep, true);
    }

    ToolbarActions.setActiveItem(toolbarActiveItem);
  }
}


export default FirstTimeUseActions;
