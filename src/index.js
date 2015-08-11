/* global window, document */
import Debug from 'debug';
import DisplayActions from './actions/display';
import FirstTimeUseActions from './actions/first-time-use';
import FirstTimeUseStore from './stores/first-time-use';
import Localizer from './lib/localizer';
import './components/community';
import './components/display';
import './components/first-time-use';
import './components/help';
import './components/talkie';
import './components/toolbar';
import './components/standing-by';
import './components/call-number';


window.myDebug = Debug;


class App {
  static init () {
    /*
    * first time use stuff
    */

    var launchCount = localStorage.getItem('launchCount') || 0;
    launchCount = parseInt(launchCount, 10);
    launchCount += 1;
    localStorage.setItem('launchCount', launchCount);
    FirstTimeUseActions.updateLaunchCount(launchCount);

    /*
    * instantiate top level components
    */

    var display = document.createElement('vaani-display');
    var talkie = document.createElement('vaani-talkie');
    var toolbar = document.createElement('vaani-toolbar');

    /*
    * kick things off
    */

    document.body.appendChild(toolbar);
    document.body.appendChild(talkie);
    document.body.appendChild(display);

    if (launchCount <= 2) {
      FirstTimeUseActions.startTour();
      DisplayActions.changeViews('vaani-first-time-use');
    }

    /*
    * global state change handler
    */

    var handleStateChange = function () {
      var tourInfo = FirstTimeUseStore.getTourInfo();
      if (tourInfo.inFlight) {
        if (tourInfo.current === 0) {
          DisplayActions.changeViews(null);
        }
      }
    };

    FirstTimeUseStore.addChangeListener(handleStateChange);
  }
}


Localizer.start(App.init);
