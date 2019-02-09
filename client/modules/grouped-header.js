/*
 * @class Fancy.grid.plugin.GroupHeader
 * @extends Fancy.Plugin
 */
Fancy.modules['grouped-header'] = true;
Fancy.define('Fancy.grid.plugin.GroupHeader', {
  extend: Fancy.Plugin,
  ptype: 'grid.groupheader',
  inWidgetName: 'groupheader',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);

    this.ons();
  },
  /*
   *
   */
  ons: function(){}
});