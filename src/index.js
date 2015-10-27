/* global window, document */
import Debug from 'debug';
import AppActions from './actions/app';
import DisplayActions from './actions/display';
import FirstTimeUseActions from './actions/first-time-use';
import AppStore from './stores/app';
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
import './components/call-contact';


var debug = Debug('App');
window.myDebug = Debug;


class App {
  /**
   * Initializes the application (where the magic happens)
   */
  static init () {
    debug('init');

    // first time use counts
    var launchCount = localStorage.getItem('launchCount') || 0;
    launchCount = parseInt(launchCount, 10);
    launchCount += 1;
    localStorage.setItem('launchCount', launchCount);
    FirstTimeUseActions.updateLaunchCount(launchCount);

    // build dynamic grammar
    AppActions.buildDynamicGrammar();

    // instantiate top level components
    var display = document.createElement('vaani-display');
    var talkie = document.createElement('vaani-talkie');
    var toolbar = document.createElement('vaani-toolbar');

    // kick things off
    document.body.appendChild(toolbar);
    document.body.appendChild(talkie);
    document.body.appendChild(display);

    // show first time use if appropriate
    if (launchCount <= 2) {
      FirstTimeUseActions.startTour();
      DisplayActions.changeViews('vaani-first-time-use');
    }

    // state change listeners
    FirstTimeUseStore.addChangeListener(AppActions.handleFirstTimeUseChange);
    Localizer.addChangeListener(AppActions.buildDynamicGrammar.bind(AppActions));

    // app install/uninstall events
    if (navigator.mozApps && navigator.mozApps.mgmt) {
      navigator.mozApps.mgmt.oninstall = AppActions.buildAppsGrammar.bind(AppActions);
      navigator.mozApps.mgmt.onuninstall = AppActions.buildAppsGrammar.bind(AppActions);
    }

    // contact change event
    if (navigator.mozContacts) {
      navigator.mozContacts.oncontactchange = AppActions.buildContactsGrammar.bind(AppActions);
    }
  }
}


Localizer.start(App.init);
