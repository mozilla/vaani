import GaiaComponent from 'gaia-component';
import AppStore from '../stores/app';
import CallNumberActions from '../actions/call-number';


var CallNumber = GaiaComponent.register('vaani-call-number', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.text = this.shadowRoot.querySelector('.text');

    CallNumberActions.setupSpeech();
  },
  attached: function () {
    AppStore.addChangeListener(this.render.bind(this));

    CallNumberActions.confirmNumber();

    this.render();
  },
  detached: function () {
    AppStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    this.els.text.textContent = AppStore.state.callNumber.text;
  },
  toggleMic: function () {
    CallNumberActions.toggleMic();
  },
  template: `
    <div id="call-number">
      <p class="text"></p>
    </div>

    <style>
      #call-number {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 24.3rem;
      }
      #call-number .text {
        width: 100%;
        font-size: 2.1rem;
        text-align: center;
        margin: 0 3rem;
      }
    </style>
  `
});


export default CallNumber;
