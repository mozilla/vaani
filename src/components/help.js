import 'fxos-dialog/fxos-dialog-alert';
import GaiaComponent from 'fxos-component';
import Localizer from '../lib/localizer';
import ToolbarActions from '../actions/toolbar';
import DisplayActions from '../actions/display';


var Help = GaiaComponent.register('vaani-help', {
  created: function () {
    this.setupShadowRoot();

    this.dialog = this.shadowRoot.querySelector('fxos-dialog-alert');
  },
  attached: function () {
    this.dialog.open();
    this.dialog.addEventListener('closed', this.onClose.bind(this));

    Localizer.addChangeListener(this.localize.bind(this));

    this.localize();
  },
  detached: function () {
    this.dialog.removeEventListener('closed', this.onClose.bind(this));

    Localizer.removeChangeListener(this.localize.bind(this));
  },
  localize: function () {
    Localizer.localize(this.shadowRoot);
  },
  onClose: function () {
    ToolbarActions.setActiveItem('none');
    DisplayActions.changeViews(null);
  },
  template: `
    <div id="help">
      <fxos-dialog-alert>
        <h3 data-l10n-id="help__whatCanIAsk"></h3>
        <p data-l10n-id="help__openApp"></p>
        <p data-l10n-id="help__dialNumber"></p>
        <p data-l10n-id="help__callContact"></p>
      </fxos-dialog-alert>
    </div>
  `
});


export default Help;
