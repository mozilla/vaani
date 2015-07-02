import GaiaComponent from 'gaia-component';
import AppStore from '../stores/app';
import DisplayActions from '../actions/display';
import ToolbarActions from '../actions/toolbar';


var Toolbar = GaiaComponent.register('vaani-toolbar', {
  created: function () {
    this.setupShadowRoot();

    this.els = {};
    this.els.community = this.shadowRoot.querySelector('.community');
    this.els.communityImg = this.els.community.querySelector('img');
    this.els.help = this.shadowRoot.querySelector('.help');
    this.els.helpImg = this.els.help.querySelector('img');
  },
  attached: function () {
    this.els.community.addEventListener('click', this.toggleCommunity.bind(this));
    this.els.help.addEventListener('click', this.toggleHelp.bind(this));

    AppStore.addChangeListener(this.render.bind(this));

    this.render();
  },
  detached: function () {
    this.els.community.removeEventListener('click', this.toggleCommunity.bind(this));
    this.els.help.removeEventListener('click', this.toggleHelp.bind(this));

    AppStore.removeChangeListener(this.render.bind(this));
  },
  render: function () {
    if (AppStore.state.toolbar.activeItem === 'community') {
      this.els.communityImg.src = this.els.communityImg.dataset.srcActive;
      this.els.helpImg.src = this.els.helpImg.dataset.srcInactive;
    }
    else if (AppStore.state.toolbar.activeItem === 'help') {
      this.els.communityImg.src = this.els.communityImg.dataset.srcInactive;
      this.els.helpImg.src = this.els.helpImg.dataset.srcActive;
    }
    else {
      this.els.communityImg.src = this.els.communityImg.dataset.srcInactive;
      this.els.helpImg.src = this.els.helpImg.dataset.srcInactive;
    }
  },
  toggleCommunity: function () {
    if (AppStore.state.firstTimeUse.tour.inFlight) {
      return;
    }

    var isSelected = AppStore.state.toolbar.activeItem === 'community';
    ToolbarActions.setActiveItem(isSelected ? 'none': 'community');

    DisplayActions.changeViews('vaani-community');
  },
  toggleHelp: function () {
    if (AppStore.state.firstTimeUse.tour.inFlight) {
      return;
    }

    var isSelected = AppStore.state.toolbar.activeItem === 'help';
    ToolbarActions.setActiveItem(isSelected ? 'none': 'help');

    DisplayActions.changeViews('vaani-help');
  },
  template: `
    <div id="toolbar">
      <div class="community">
        <img
          alt="community"
          src="/style/images/community.png"
          data-src-active="/style/images/community_pressed.png"
          data-src-inactive="/style/images/community.png"
        />
      </div>
      <div class="help">
        <img
          alt="help"
          src="/style/images/help.png"
          data-src-active="/style/images/help_pressed.png"
          data-src-inactive="/style/images/help.png"
        />
      </div>
      <div class="clearfix"></div>
    </div>

    <style>
      #toolbar {
        padding: 1.5rem;
      }
      #toolbar .community {
        float: left;
      }
      #toolbar .help {
        float: right;
      }
      .clearfix {
        clear: both;
      }
    </style>
  `
});


export default Toolbar;
