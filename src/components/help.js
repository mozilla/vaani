import 'gaia-dialog/gaia-dialog-alert';
import GaiaComponent from 'gaia-component';
import ToolbarActions from '../actions/toolbar';


var Help = GaiaComponent.register('vaani-help', {
  created: function () {
    this.setupShadowRoot();

    this.dialog = this.shadowRoot.querySelector('gaia-dialog-alert');
  },
  attached: function () {
    this.dialog.open();
    this.dialog.addEventListener('closed', this.onClose.bind(this));
  },
  detached: function () {
    this.dialog.removeEventListener('closed', this.onClose.bind(this));
  },
  onClose: function () {
    ToolbarActions.setActiveItem('none');
  },
  template: `
    <div id="help">
      <gaia-dialog-alert>
        <h3>What can I ask Vaani?</h3>
        <p>Who are you?</p>
        <p>Open &lt;App&gt;</p>
        <p>Play Music</p>
      </gaia-dialog-alert>
    </div>
  `
});


export default Help;
