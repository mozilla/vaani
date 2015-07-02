import GaiaComponent from 'gaia-component';
import AppStore from '../stores/app';
import StandingByActions from '../actions/standing-by';


var StandingBy = GaiaComponent.register('vaani-standing-by', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.text = this.shadowRoot.querySelector('.text');

    StandingByActions.setupSpeech();
  },
  attached: function () {
    StandingByActions.greetUser();

    AppStore.addChangeListener(this.render.bind(this));

    this.render();
  },
  detached: function () {
    AppStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    this.els.text.textContent = AppStore.state.standingBy.text;
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
