import GaiaComponent from 'gaia-component';
import AppStore from '../stores/app';


var Display = GaiaComponent.register('vaani-display', {
  created: function () {
    this.setupShadowRoot();
  },
  attached: function () {
  },
  detached: function () {
  },
  changeViews: function (newView) {
    var contentEl = this.shadowRoot.querySelector('.content');

    if (AppStore.state.display.activeView) {
      contentEl.removeChild(AppStore.state.display.activeView);
    }

    if (newView) {
      contentEl.appendChild(newView);
    }
  },
  template: `
    <div id="display">
      <div class="content"></div>
    </div>

    <style>
      #display {
        width: 100%;
      }
    </style>
  `
});


export default Display;
