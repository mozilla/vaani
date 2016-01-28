import GaiaComponent from 'fxos-component';
import CallNumberStore from '../stores/call-number';
import CallNumberActions from '../actions/call-number';


var CallNumber = GaiaComponent.register('vaani-call-number', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.text = this.shadowRoot.querySelector('.text');
  },
  attached: function () {
    CallNumberStore.addChangeListener(this.render.bind(this));

    CallNumberActions.setupSpeech(() => {
      CallNumberActions.confirmNumber();
    });

    this.render();
  },
  detached: function () {
    CallNumberStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    this.els.text.textContent = CallNumberStore.getText();
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
