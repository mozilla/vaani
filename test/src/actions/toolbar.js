import Lab from 'lab';
import Code from 'code';
import ToolbarActions from '../../../src/actions/toolbar.js';
import ToolbarStore from '../../../src/stores/toolbar';


let lab = exports.lab = Lab.script();


lab.experiment('Toolbar Actions', function () {
  lab.test('it sets the active item', function (done) {
    ToolbarActions.setActiveItem('_active_item_');

    Code.expect(ToolbarStore.getActiveItem()).to.equal('_active_item_');

    done();
  });
});
