/* global document */
import Debug from 'debug';
import AppStore from './stores/app';
import DisplayActions from './actions/display';
import './components/community';
import './components/display';
import './components/first-time-use';
import './components/help';
import './components/talkie';
import './components/toolbar';
import './components/standing-by';
import './components/call-number';


window.myDebug = Debug;


/*
 * first time use stuff
 */

var launchCount = localStorage.getItem('launchCount') || 0;
launchCount = parseInt(launchCount, 10);
launchCount += 1;
localStorage.setItem('launchCount', launchCount);
AppStore.state.firstTimeUse.launchCount = launchCount;

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
  AppStore.state.firstTimeUse.tour.inFlight = true;
  DisplayActions.changeViews('vaani-first-time-use');
}

/*
 * global state change handler
 */

var handleStateChange = function () {
  if (AppStore.state.firstTimeUse.tour.inFlight) {
    if (AppStore.state.firstTimeUse.tour.current === 0) {
      DisplayActions.changeViews(null);
    }
  }
};

AppStore.addChangeListener(handleStateChange);
