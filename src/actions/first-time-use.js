import Debug from 'debug';
import AppStore from '../stores/app';
import TalkieActions from './talkie';
import ToolbarActions from './toolbar';


let debug = Debug('FirstTimeUseActions');


class FirstTimeUseActions {
  /**
   * Advances the tour
   */
  static advanceTour () {
    debug('advanceTour');

    var currentStep = AppStore.state.firstTimeUse.tour.current;
    var totalSteps = AppStore.state.firstTimeUse.tour.total;
    var toolbarActiveItem = 'none';

    if (currentStep === 1) {
      toolbarActiveItem = 'community';
    }
    if (currentStep === 2) {
      toolbarActiveItem = 'help';
    }

    if (currentStep === totalSteps) {
      AppStore.state.firstTimeUse.tour.current = 0;
      AppStore.state.firstTimeUse.tour.inFlight = false;

      TalkieActions.setMode('idle');
    }
    else {
      currentStep += 1;
      AppStore.state.firstTimeUse.tour.current = currentStep;
      AppStore.state.firstTimeUse.tour.inFlight = true;
    }

    ToolbarActions.setActiveItem(toolbarActiveItem);

    AppStore.emitChange();
  }
}


export default FirstTimeUseActions;
