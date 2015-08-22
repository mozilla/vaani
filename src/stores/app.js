import BaseStore from '../lib/base-store';


class AppStore extends BaseStore {
  /**
   * @constructor
   */
  constructor () {
    super();

    this.state = {
      appsGrammar: undefined,
      contactsGrammar: undefined
    };
  }

  /**
   * Gets the apps grammar state
   */
  getAppsGrammar () {
    return this.state.appsGrammar;
  }

  /**
   * Updates the apps grammar state and emits a change event
   */
  updateAppsGrammar (grammar) {
    this.state.appsGrammar = grammar;

    this.emitChange();
  }

  /**
   * Gets the contacts grammar state
   */
  getContactsGrammar () {
    return this.state.contactsGrammar;
  }

  /**
   * Updates the contacts grammar state and emits a change event
   */
  updateContactsGrammar (grammar) {
    this.state.contactsGrammar = grammar;

    this.emitChange();
  }
}


export default new AppStore();
