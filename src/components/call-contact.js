import GaiaComponent from 'fxos-component';
import CallContactStore from '../stores/call-contact';
import CallContactActions from '../actions/call-contact';


var CallContact = GaiaComponent.register('vaani-call-contact', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.text = this.shadowRoot.querySelector('.text');
  },
  attached: function () {
    CallContactStore.addChangeListener(this.render.bind(this));

    CallContactActions.setupSpeech(() => {
      CallContactActions.confirmContact();
    });

    this.render();
  },
  detached: function () {
    CallContactStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    this.els.text.textContent = CallContactStore.getText();
  },
  toggleMic: function () {
    CallContactActions.toggleMic();
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


export default CallContact;
