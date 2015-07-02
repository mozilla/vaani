import 'gaia-dialog/gaia-dialog-alert';
import GaiaComponent from 'gaia-component';
import ToolbarActions from '../actions/toolbar';


var Community = GaiaComponent.register('vaani-community', {
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
        <h3>Help the Community</h3>
        <p>You can help us improve Vaani's speech recognition by reading sentences.</p>
        <p>Record yourself reading a sentence. The recording will then be submitted over wifi.</p>
        <p>That's it! We appreciate the help!</p>
        <p>(coming soon)</p>
      </gaia-dialog-alert>
    </div>
  `
});


export default Community;
