import BaseStore from '../lib/base-store';


class FirstTimeUseStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      launchCount: -1,
      tour: {
        inFlight: false,
        current: 1,
        total: 3
      }
    };
  }

  /**
   * Gets the launch count state
   */
  getLaunchCount () {
    return this.state.launchCount;
  }

  /**
   * Gets the tour state
   */
  getTourInfo () {
    return this.state.tour;
  }

  /**
   * Updates the launch count state and emits a change event
   */
  updateLaunchCount (count) {
    this.state.launchCount = count;

    this.emitChange();
  }

  /**
   * Updates the tour step and flight status and then emits a change event
   */
  updateTourInfo (step, isInFlight) {
    this.state.tour.current = step;
    this.state.tour.inFlight = isInFlight;

    this.emitChange();
  }
}


export default new FirstTimeUseStore();
