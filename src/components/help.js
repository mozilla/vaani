import 'gaia-dialog/gaia-dialog-alert';
import GaiaComponent from 'gaia-component';
import ToolbarActions from '../actions/toolbar';
import DisplayActions from '../actions/display';


var Help = GaiaComponent.register('vaani-help', {
  created: function () {
    this.setupShadowRoot();

    this.dialog = this.shadowRoot.querySelector('gaia-dialog-alert');
  },
  attached: function () {
    window.dialog = this.dialog;
    this.dialog.open();
    this.dialog.addEventListener('closed', this.onClose.bind(this));
  },
  detached: function () {
    this.dialog.removeEventListener('closed', this.onClose.bind(this));
  },
  onClose: function () {
    ToolbarActions.setActiveItem('none');
    DisplayActions.changeViews(null);
  },
  template: `
    <div id="help">
      <gaia-dialog-alert>
        <h3>What can I ask Vaani?</h3>
        <p>Open &lt;App&gt;</p>
        <p>Call &lt;Number&gt;</p>
      </gaia-dialog-alert>
    </div>
  `
});


export default Help;
