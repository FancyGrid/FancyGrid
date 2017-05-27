/*
 * @class Fancy.grid.plugin.GroupHeader
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.GroupHeader', {
  extend: Fancy.Plugin,
  ptype: 'grid.groupheader',
  inWidgetName: 'groupheader',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store;
    
    w.once('render', function(){
      
    });
  }
});