import GaiaComponent from 'gaia-component';
import GetUserMedia from 'getusermedia';
import AttachMediaStream from 'attachmediastream';
import Hark from 'hark';
import AppStore from '../stores/app';
import TalkieActions from '../actions/talkie';


var Talkie = GaiaComponent.register('vaani-talkie', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.video = this.shadowRoot.querySelector('video');
    this.els.video.muted = true;
    this.els.mic = this.shadowRoot.querySelector('.mic');
    this.els.sending = this.shadowRoot.querySelector('.sending');
    this.els.receiving = this.shadowRoot.querySelector('.receiving');
    this.els.idlePopup = this.shadowRoot.querySelector('.idle-popup');

    // setup our receiving dots
    var rings = 5, dots = 24;
    for (var i = 1; i <= rings ; i++) {
      for (var j = 1; j <= dots ; j++) {
        var dot = document.createElement('div');
        dot.className = 'dot ring-' + i + ' dot-' + j;

        this.els.receiving.appendChild(dot);
      }
    }

    this.els.ring1Dots = this.shadowRoot.querySelectorAll('.ring-1');
    this.els.ring2Dots = this.shadowRoot.querySelectorAll('.ring-2');
    this.els.ring3Dots = this.shadowRoot.querySelectorAll('.ring-3');
    this.els.ring4Dots = this.shadowRoot.querySelectorAll('.ring-4');
    this.els.ring5Dots = this.shadowRoot.querySelectorAll('.ring-5');
  },
  attached: function () {
    this.els.mic.addEventListener('touchend', this.tapMic.bind(this));
    this.els.mic.addEventListener('click', this.toggleMic.bind(this));

    AppStore.addChangeListener(this.render.bind(this));

    GetUserMedia({ audio: true, video: false }, (err, stream) => {
      if (err) {
        throw err;
      }

      // Reza: if we don't attach the media stream to something,
      // the volume_change event will stop working after some time
      // and just emit `-100 -50`.
      AttachMediaStream(stream, this.els.video);

      this.speechEvents = Hark(stream);
      this.speechEvents.on('volume_change', this._onVolumeChange.bind(this));
    });

    this.render();
  },
  detached: function () {
    this.els.mic.removeEventListener('touchend', this.tapMic.bind(this));
    this.els.mic.removeEventListener('click', this.toggleMic.bind(this));

    AppStore.removeChangeListener(this.render.bind(this));

    this.speechEvents.off('volume_change', this._onVolumeChange.bind(this));
  },
  _onVolumeChange: function (volume, threshold) {
    if (AppStore.state.talkie.activeAnimation !== 'receiving') {
      return;
    }

    volume *= -1;

    console.log(volume, threshold);

    if (volume < 30) {
      this._showHideRing(this.els.ring5Dots, true);
      this._showHideRing(this.els.ring4Dots, true);
      this._showHideRing(this.els.ring3Dots, true);
      this._showHideRing(this.els.ring2Dots, true);
      this._showHideRing(this.els.ring1Dots, true);
    }
    else if (volume > 30 && volume < 40) {
      this._showHideRing(this.els.ring5Dots, false);
      this._showHideRing(this.els.ring4Dots, true);
      this._showHideRing(this.els.ring3Dots, true);
      this._showHideRing(this.els.ring2Dots, true);
      this._showHideRing(this.els.ring1Dots, true);
    }
    else if (volume > 40 && volume < 50) {
      this._showHideRing(this.els.ring5Dots, false);
      this._showHideRing(this.els.ring4Dots, false);
      this._showHideRing(this.els.ring3Dots, false);
      this._showHideRing(this.els.ring2Dots, true);
      this._showHideRing(this.els.ring1Dots, true);
    }
    else if (volume > 50 && volume < 60) {
      this._showHideRing(this.els.ring5Dots, false);
      this._showHideRing(this.els.ring4Dots, false);
      this._showHideRing(this.els.ring3Dots, false);
      this._showHideRing(this.els.ring2Dots, false);
      this._showHideRing(this.els.ring1Dots, true);
    }
    else {
      this._showHideRing(this.els.ring5Dots, false);
      this._showHideRing(this.els.ring4Dots, false);
      this._showHideRing(this.els.ring3Dots, false);
      this._showHideRing(this.els.ring2Dots, false);
      this._showHideRing(this.els.ring1Dots, false);
    }
  },
  _showHideRing: function (ring, show) {
    for (let i = 0; i < ring.length; i++) {
      if (show) {
        ring[i].style.display = 'block';
      }
      else {
        ring[i].style.display = 'none';
      }
    }
  },
  render: function () {
    if (AppStore.state.talkie.mode === 'idle') {
      this.els.idlePopup.style.display = 'block';
    }
    else {
      this.els.idlePopup.style.display = 'none';
    }

    if (AppStore.state.talkie.activeAnimation === 'receiving') {
      this.els.sending.style.display = 'none';
      this.els.receiving.style.display = 'block';
    }
    else if (AppStore.state.talkie.activeAnimation === 'sending') {
      this.els.sending.style.display = 'block';
      this.els.receiving.style.display = 'none';
    }
    else {
      this.els.sending.style.display = 'none';
      this.els.receiving.style.display = 'none';
    }
  },
  tapMic: function (e) {
    e.preventDefault();
    e.target.click();
  },
  toggleMic: function () {
    if (AppStore.state.firstTimeUse.tour.inFlight) {
      return;
    }

    TalkieActions.toggleMic();
  },
  template: `
    <div id="talkie">
      <div class="content">
        <div class="idle-popup">
          <div class="idle-popup-container">
            <p class="message">Tap or say "Yo Vaani" to get started.</p>
          </div>
          <div class="arrow-down"></div>
        </div>

        <div class="receiving">
          <!--dots go here, see create method above-->
        </div>

        <div class="sending">
          <div class="bubble bubble-1"></div>
          <div class="bubble bubble-2"></div>
          <div class="bubble bubble-3"></div>
        </div>

        <div class="mic">
          <img alt="tap to talk" src="/assets/images/mic.png" />
        </div>
      </div>
      <video width="0" height="0"></video>
    </div>

    <style>
      #talkie {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 23.8rem;
      }
      #talkie .content {
        position: relative;
        width: 100%;
        height: 100%;
      }
      #talkie .mic {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 6.8rem;
        width: 6.8rem;
      }
      #talkie .idle-popup {
        display: none;
        position: absolute;
        margin: 0 auto;
        width: 100%;
      }
      #talkie .idle-popup .idle-popup-container {
        text-align: center;
        margin: 0 1.5rem;
        border-radius: 2px;
        background-color: #c9e4fd;
        background-color: rgba(201, 228, 253, 0.75);
      }
      #talkie .idle-popup .message {
        color: #4d4d4d;
        font-size: 1.5rem;
        line-height: 1.9rem;
        padding: 1.5rem;
      }
      #talkie .idle-popup .arrow-down {
        width: 0;
        height: 0;
        margin: -1.5rem auto auto auto;
        border-left: 1.2rem solid transparent;
        border-right: 1.2rem solid transparent;
        border-top: 1.2rem solid rgba(201, 228, 253, 0.75);
      }
      #talkie .sending {
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 6.8rem;
        width: 6.8rem;
      }
      #talkie .sending .bubble {
        position: absolute;
        height: 6.8rem;
        width: 6.8rem;
        margin-right: auto;
        margin-left: auto;
        background-color: #6c3fff;
        border-radius: 30rem;
        opacity: 0.3;

        animation-name: sending;
        animation-iteration-count: infinite;
        animation-duration: 1s;
        animation-timing-function: ease-out;
      }
      #talkie .sending .bubble-1 {
        animation-delay: 0ms;
      }
      #talkie .sending .bubble-2 {
        animation-delay: 500ms;
      }
      #talkie .sending .bubble-3 {
        animation-delay: 1500ms;
      }
      #talkie .receiving {
        /* display: none; */
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 6.8rem;
        width: 6.8rem;
      }
      #talkie .receiving .dot {
        position: absolute;
        top: 50%;
        left: 50%;
        height: 0.7rem;
        width: 0.7rem;
        border-radius: 1rem;
        margin: -0.35rem;
      }
      #talkie .receiving .ring-1 {
        background-color: #4d3fff;
        opacity: 0.4;
      }
      #talkie .receiving .ring-2 {
        background-color: #6c3fff;
        opacity: 0.4;
      }
      #talkie .receiving .ring-3 {
        background-color: #8c3fff;
        opacity: 0.4;
      }
      #talkie .receiving .ring-4 {
        background-color: #a33fff;
        opacity: 0.4;
      }
      #talkie .receiving .ring-5 {
        background-color: #c23fff;
        opacity: 0.4;
      }
      #talkie .receiving .ring-1.dot-1  { transform: rotate(0deg)   translate(4.75rem); }
      #talkie .receiving .ring-1.dot-2  { transform: rotate(15deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-3  { transform: rotate(30deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-4  { transform: rotate(45deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-5  { transform: rotate(60deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-6  { transform: rotate(75deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-7  { transform: rotate(90deg)  translate(4.75rem); }
      #talkie .receiving .ring-1.dot-8  { transform: rotate(105deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-9  { transform: rotate(120deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-10 { transform: rotate(135deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-11 { transform: rotate(150deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-12 { transform: rotate(165deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-13 { transform: rotate(180deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-14 { transform: rotate(195deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-15 { transform: rotate(210deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-16 { transform: rotate(225deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-17 { transform: rotate(240deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-18 { transform: rotate(255deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-19 { transform: rotate(270deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-20 { transform: rotate(285deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-21 { transform: rotate(300deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-22 { transform: rotate(315deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-23 { transform: rotate(330deg) translate(4.75rem); }
      #talkie .receiving .ring-1.dot-24 { transform: rotate(345deg) translate(4.75rem); }

      #talkie .receiving .ring-2.dot-1  { transform: rotate(0deg)   translate(6.25rem); }
      #talkie .receiving .ring-2.dot-2  { transform: rotate(15deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-3  { transform: rotate(30deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-4  { transform: rotate(45deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-5  { transform: rotate(60deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-6  { transform: rotate(75deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-7  { transform: rotate(90deg)  translate(6.25rem); }
      #talkie .receiving .ring-2.dot-8  { transform: rotate(105deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-9  { transform: rotate(120deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-10 { transform: rotate(135deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-11 { transform: rotate(150deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-12 { transform: rotate(165deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-13 { transform: rotate(180deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-14 { transform: rotate(195deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-15 { transform: rotate(210deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-16 { transform: rotate(225deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-17 { transform: rotate(240deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-18 { transform: rotate(255deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-19 { transform: rotate(270deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-20 { transform: rotate(285deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-21 { transform: rotate(300deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-22 { transform: rotate(315deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-23 { transform: rotate(330deg) translate(6.25rem); }
      #talkie .receiving .ring-2.dot-24 { transform: rotate(345deg) translate(6.25rem); }

      #talkie .receiving .ring-3.dot-1  { transform: rotate(0deg)   translate(7.75rem); }
      #talkie .receiving .ring-3.dot-2  { transform: rotate(15deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-3  { transform: rotate(30deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-4  { transform: rotate(45deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-5  { transform: rotate(60deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-6  { transform: rotate(75deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-7  { transform: rotate(90deg)  translate(7.75rem); }
      #talkie .receiving .ring-3.dot-8  { transform: rotate(105deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-9  { transform: rotate(120deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-10 { transform: rotate(135deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-11 { transform: rotate(150deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-12 { transform: rotate(165deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-13 { transform: rotate(180deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-14 { transform: rotate(195deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-15 { transform: rotate(210deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-16 { transform: rotate(225deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-17 { transform: rotate(240deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-18 { transform: rotate(255deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-19 { transform: rotate(270deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-20 { transform: rotate(285deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-21 { transform: rotate(300deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-22 { transform: rotate(315deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-23 { transform: rotate(330deg) translate(7.75rem); }
      #talkie .receiving .ring-3.dot-24 { transform: rotate(345deg) translate(7.75rem); }

      #talkie .receiving .ring-4.dot-1  { transform: rotate(0deg)   translate(9.25rem); }
      #talkie .receiving .ring-4.dot-2  { transform: rotate(15deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-3  { transform: rotate(30deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-4  { transform: rotate(45deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-5  { transform: rotate(60deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-6  { transform: rotate(75deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-7  { transform: rotate(90deg)  translate(9.25rem); }
      #talkie .receiving .ring-4.dot-8  { transform: rotate(105deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-9  { transform: rotate(120deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-10 { transform: rotate(135deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-11 { transform: rotate(150deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-12 { transform: rotate(165deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-13 { transform: rotate(180deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-14 { transform: rotate(195deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-15 { transform: rotate(210deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-16 { transform: rotate(225deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-17 { transform: rotate(240deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-18 { transform: rotate(255deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-19 { transform: rotate(270deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-20 { transform: rotate(285deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-21 { transform: rotate(300deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-22 { transform: rotate(315deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-23 { transform: rotate(330deg) translate(9.25rem); }
      #talkie .receiving .ring-4.dot-24 { transform: rotate(345deg) translate(9.25rem); }

      #talkie .receiving .ring-5.dot-1  { transform: rotate(0deg)   translate(10.75rem); }
      #talkie .receiving .ring-5.dot-2  { transform: rotate(15deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-3  { transform: rotate(30deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-4  { transform: rotate(45deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-5  { transform: rotate(60deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-6  { transform: rotate(75deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-7  { transform: rotate(90deg)  translate(10.75rem); }
      #talkie .receiving .ring-5.dot-8  { transform: rotate(105deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-9  { transform: rotate(120deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-10 { transform: rotate(135deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-11 { transform: rotate(150deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-12 { transform: rotate(165deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-13 { transform: rotate(180deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-14 { transform: rotate(195deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-15 { transform: rotate(210deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-16 { transform: rotate(225deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-17 { transform: rotate(240deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-18 { transform: rotate(255deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-19 { transform: rotate(270deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-20 { transform: rotate(285deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-21 { transform: rotate(300deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-22 { transform: rotate(315deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-23 { transform: rotate(330deg) translate(10.75rem); }
      #talkie .receiving .ring-5.dot-24 { transform: rotate(345deg) translate(10.75rem); }
    </style>
  `,
  globalCss: `
    @keyframes sending {
      0% {
        margin-top: 0;
        margin-left: 0;
        background-color: #6c3fff;
      }
      100% {
        margin-top: -13rem;
        margin-left: -13rem;
        width: 32rem;
        height: 32rem;
        opacity: 0;
        background-color: #a33fff;
      }
    }
  `
});


export default Talkie;
