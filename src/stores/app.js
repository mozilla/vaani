import BaseStore from '../lib/base-store';


class AppStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      display: {
        activeView: undefined
      },
      toolbar: {
        activeItem: 'none'
      },
      talkie: {
        mode: 'none',
        activeAnimation: 'none'
      },
      firstTimeUse: {
        launchCount: -1,
        tour: {
          inFlight: false,
          current: 1,
          total: 3
        }
      },
      standingBy: {
        text: ''
      },
      callNumber: {
        text: '',
        phoneNumber: ''
      }
    };
  }
}


export default new AppStore();
