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
    this.els.receiving = this.shadowRoot.querySelector('#receiving');
    this.els.idlePopup = this.shadowRoot.querySelector('.idle-popup');
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

    if (volume < 30) {
      this.els.receiving.className = '';
      this.els.receiving.classList.add('show-5');
    }
    else if (volume > 30 && volume < 40) {
      this.els.receiving.className = '';
      this.els.receiving.classList.add('show-4');
    }
    else if (volume > 40 && volume < 50) {
      this.els.receiving.className = '';
      this.els.receiving.classList.add('show-3');
    }
    else if (volume > 50 && volume < 60) {
      this.els.receiving.className = '';
      this.els.receiving.classList.add('show-2');
    }
    else {
      this.els.receiving.className = '';
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

        <div id="receiving">
          <!--dots go here, see create method above-->
          <svg class="dots">
            <use xlink:href="/assets/images/sprite.svg#dots"></use>
          </svg>
        </div>

        <div class="sending"></div>

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
        height: 6.8rem;
        width: 6.8rem;
        transform: translate(-50%, -50%);
      }
      #talkie .sending:before,
      #talkie .sending:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6.8rem;
        height: 6.8rem;
        margin: -3.5rem 0 0 -3.4rem;
        border-radius: 50%;
        background-color: #6c3fff;
        animation-name: sending;
        animation-duration: 1s;
        animation-iteration-count: 100;
        animation-timing-function: linear;
        pointer-events: none;
      }
      #talkie .sending:after {
        animation-delay: 0.5s;
      }
      #receiving {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 6.8rem;
        width: 6.8rem;
      }
      #receiving.show-1 {
        background-color: red;
        display: block;
      }
      #receiving.show-1 .ring-1,
      #receiving.show-2 .ring-1,
      #receiving.show-2 .ring-2,
      #receiving.show-3 .ring-1,
      #receiving.show-3 .ring-2,
      #receiving.show-3 .ring-3,
      #receiving.show-4 .ring-1,
      #receiving.show-4 .ring-2,
      #receiving.show-4 .ring-3,
      #receiving.show-4 .ring-4,
      #receiving.show-5 .ring-1,
      #receiving.show-5 .ring-2,
      #receiving.show-5 .ring-3,
      #receiving.show-5 .ring-4,
      #receiving.show-5 .ring-5 {
        display: block;
      }
      #receiving .dots {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 22.4rem;
        height: 22.4rem;
        margin: -11.2rem 0 0 -11.2rem;
        pointer-events: none;
      }
      #receiving .ring-1,
      #receiving .ring-2,
      #receiving .ring-3,
      #receiving .ring-4,
      #receiving .ring-5 {
        display: none;
      }
      #receiving .ring-1 {
        fill: rgba(77,63,255, 0.4);
      }
      #receiving .ring-2 {
        fill: rgba(108,63,255, 0.4);
      }
      #receiving .ring-3 {
        fill: rgba(140,63,255, 0.4);
      }
      #receiving .ring-4 {
        fill: rgba(163,63,255, 0.4);
      }
      #receiving .ring-5 {
        fill: rgba(194,63,255, 0.4);
      }
    </style>
  `,
  globalCss: `
    @keyframes sending {
      0% {
        background-color: rgba(108,63,255, 0.3);
        transform: scale3d(1, 1, 1);
      }
      33% {
        background-color: #8c3fff;
      }
      66% {
        background-color: #a33fff;
      }
      100% {
        opacity: 0;
        background-color: rgba(194,63,255, 0);
        transform: scale3d(5, 5, 1);
      }
    }
  `
});


export default Talkie;
