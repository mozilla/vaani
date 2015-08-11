import GaiaComponent from 'gaia-component';
import DisplayStore from '../stores/display';


var Display = GaiaComponent.register('vaani-display', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.content = this.shadowRoot.querySelector('.content');
  },
  attached: function () {
    DisplayStore.addChangeListener(this.render.bind(this));
  },
  detached: function () {
    DisplayStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    var children = this.els.content.childNodes;

    for (let i = 0; i < children.length; i++) {
      this.els.content.removeChild(children[i]);
    }

    if (DisplayStore.getActiveView()) {
      this.els.content.appendChild(DisplayStore.getActiveView());
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
