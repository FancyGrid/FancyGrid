/*
 * @class Fancy.grid.plugin.State
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.State', {
  extend: Fancy.Plugin,
  ptype: 'grid.state',
  inWidgetName: '$state',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this,
      s = me.store;


  }
});