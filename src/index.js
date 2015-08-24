/* global window, document */
import Debug from 'debug';
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
    App._buildDynamicGrammar();

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
    FirstTimeUseStore.addChangeListener(App._handleFirstTimeUseChange);
    Localizer.addChangeListener(App._buildDynamicGrammar);

    // app install/uninstall events
    if (navigator.mozApps && navigator.mozApps.mgmt) {
      navigator.mozApps.mgmt.oninstall = App._buildAppsGrammar;
      navigator.mozApps.mgmt.onuninstall = App._buildAppsGrammar;
    }
  }

  /**
   * Hides first time use component
   * @private
   */
  static _handleFirstTimeUseChange () {
    debug('_handleFirstTimeUseChange');

    var tourInfo = FirstTimeUseStore.getTourInfo();

    if (tourInfo.inFlight) {
      if (tourInfo.current === 0) {
        DisplayActions.changeViews(null);
      }
    }
  }

  /**
   * Builds dynamic grammar
   * @private
   */
  static _buildDynamicGrammar () {
    debug('_buildDynamicGrammar');

    App._buildAppsGrammar();
    App._buildContactsGrammar();
  }

  /**
   * Builds apps grammar
   * @private
   */
  static _buildAppsGrammar () {
    debug('_buildAppsGrammar');

    if (!navigator.mozApps || !navigator.mozApps.mgmt) {
      debug('buildAppsGrammar', 'navigator.mozApps not found');
      return;
    }

    var allApps = navigator.mozApps.mgmt.getAll();

    allApps.onsuccess = () => {
      var priorityLocale = Localizer.getPriorityLocale();
      var priorityLang = Localizer.getPriorityLang();

      var appNames = allApps.result.filter((app) => {
        if (!app.manifest ||
            app.manifest.hasOwnProperty('role') ||
            app.manifest.name === 'Communications' ||
            app.manifest.name === 'Vaani') {
          return false;
        }

        return true;
      }).map((app) => {
        var appName = app.manifest.name;

        if (app.manifest.locales) {
          if (app.manifest.locales.hasOwnProperty(priorityLocale) &&
              app.manifest.locales[priorityLocale].hasOwnProperty('name')) {
            appName = app.manifest.locales[priorityLocale].name;
          }
          else if (app.manifest.locales.hasOwnProperty(priorityLang) &&
              app.manifest.locales[priorityLang].hasOwnProperty('name')) {
            appName = app.manifest.locales[priorityLang].name;
          }
        }

        return appName;
      });

      var appsGrammar = appNames.join(' | ').toLowerCase();

      AppStore.updateAppsGrammar(appsGrammar);

      debug('_buildAppsGrammar:appsGrammar', appsGrammar);
    };
  }

  /**
   * Builds contacts grammar
   * @private
   */
  static _buildContactsGrammar () {
    debug('buildContactsGrammar');
  }
}


Localizer.start(App.init);
