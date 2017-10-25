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
    Fancy.applyConfig(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){}
});