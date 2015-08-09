import 'gaia-dialog/gaia-dialog-alert';
import GaiaComponent from 'gaia-component';
import Localizer from '../lib/localizer';
import ToolbarActions from '../actions/toolbar';
import DisplayActions from '../actions/display';


var Help = GaiaComponent.register('vaani-help', {
  created: function () {
    this.setupShadowRoot();

    this.dialog = this.shadowRoot.querySelector('gaia-dialog-alert');

    Localizer.localize(this.shadowRoot);
  },
  attached: function () {
    this.dialog.open();
    this.dialog.addEventListener('closed', this.onClose.bind(this));

    Localizer.addChangeListener(this.render.bind(this));
  },
  detached: function () {
    this.dialog.removeEventListener('closed', this.onClose.bind(this));

    Localizer.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    Localizer.localize(this.shadowRoot);
  },
  onClose: function () {
    ToolbarActions.setActiveItem('none');
    DisplayActions.changeViews(null);
  },
  template: `
    <div id="help">
      <gaia-dialog-alert>
        <h3 data-l10n-id="help__whatCanIAsk"></h3>
        <p data-l10n-id="help__openApp"></p>
        <p data-l10n-id="help__callNumber"></p>
      </gaia-dialog-alert>
    </div>
  `
});


export default Help;
