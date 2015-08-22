import GaiaComponent from 'gaia-component';
import AppStore from '../stores/app';
import StandingByStore from '../stores/standing-by';
import StandingByActions from '../actions/standing-by';


var StandingBy = GaiaComponent.register('vaani-standing-by', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.text = this.shadowRoot.querySelector('.text');

    StandingByActions.setupSpeech();
  },
  attached: function () {
    StandingByStore.addChangeListener(this.render.bind(this));
    AppStore.addChangeListener(this._updateSpeach.bind(this));

    StandingByActions.greetUser();

    this.render();
  },
  detached: function () {
    StandingByStore.removeChangeListener(this.render.bind(this));
    AppStore.removeChangeListener(this._updateSpeach.bind(this));
  },
  _updateSpeach: function () {
    StandingByActions.setupSpeech();
  },
  render: function () {
    this.els.text.textContent = StandingByStore.getText();
  },
  toggleMic: function () {
    StandingByActions.toggleMic();
  },
  template: `
    <div id="standing-by">
      <p class="text"></p>
    </div>

    <style>
      #standing-by {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 24.3rem;
      }
      #standing-by .text {
        width: 100%;
        font-size: 2.1rem;
        text-align: center;
        margin: 0 3rem;
      }
    </style>
  `
});


export default StandingBy;
