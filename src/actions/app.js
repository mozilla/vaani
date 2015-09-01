/* global navigator */
import Debug from 'debug';
import DisplayActions from './display';
import AppStore from '../stores/app';
import FirstTimeUseStore from '../stores/first-time-use';
import Localizer from '../lib/localizer';


let debug = Debug('AppActions');


class AppActions {
  /**
   * Hides first time use component
   */
  static handleFirstTimeUseChange () {
    debug('handleFirstTimeUseChange');

    var tourInfo = FirstTimeUseStore.getTourInfo();

    if (tourInfo.inFlight) {
      if (tourInfo.current === 0) {
        DisplayActions.changeViews(null);
      }
    }
  }

  /**
   * Builds dynamic grammar
   */
  static buildDynamicGrammar () {
    debug('buildDynamicGrammar');

    this.buildAppsGrammar();
    this.buildContactsGrammar();
  }

  /**
   * Builds apps grammar
   */
  static buildAppsGrammar () {
    debug('buildAppsGrammar');

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

      var appsGrammar = appNames.join(' | ').toLocaleLowerCase();

      AppStore.updateAppsGrammar(appsGrammar);

      debug('buildAppsGrammar:appsGrammar', appsGrammar);
    };
  }

  /**
   * Builds contacts grammar
   */
  static buildContactsGrammar () {
    debug('buildContactsGrammar');

    if (!navigator.mozContacts) {
      debug('buildContactsGrammar', 'navigator.mozContacts not found');
      return;
    }

    var contactNames = [];
    var request = navigator.mozContacts.getAll();

    request.onsuccess = function () {
      if (this.result) {
        if (this.result.tel.length > 0) {
          if (this.result.name.length > 0) {
            contactNames.push(this.result.name[0]);
          }
        }

        // trigger request.onsuccess again with a new result
        this.continue();
      }
      else {
        var uniqueNames = {};

        contactNames.forEach((name) => {
          var nameParts = name.split(' ');

          nameParts.forEach((part) => {
            uniqueNames[part] = true;
          });

          uniqueNames[name] = true;
        });

        var names = Object.keys(uniqueNames);
        var contactsGrammar = names.join(' | ').toLocaleLowerCase();

        AppStore.updateContactsGrammar(contactsGrammar);

        debug('buildContactsGrammar:contactsGrammar', contactsGrammar);
      }
    };
  }
}


export default AppActions;
