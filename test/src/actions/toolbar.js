import Lab from 'lab';
import Code from 'code';
import ToolbarActions from '../../../src/actions/toolbar.js';
import AppStore from '../../../src/stores/app';


let lab = exports.lab = Lab.script();


lab.experiment('Toolbar Actions', function () {
  lab.test('it sets the active item', function (done) {
    ToolbarActions.setActiveItem('_active_item_');

    Code.expect(AppStore.state.toolbar.activeItem).to.equal('_active_item_');

    done();
  });
});
