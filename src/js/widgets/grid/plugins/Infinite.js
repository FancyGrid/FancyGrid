/*
 * @class Fancy.grid.plugin.Paging
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Infinite', {
  extend: Fancy.Plugin,
  ptype: 'grid.infinite',
  inWidgetName: 'infinite',
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
  init(){
    this.Super('init', arguments);
    this.ons();
  },
  /*
   *
   */
  ons(){
    const me = this,
      w = me.widget;

    //w.on('render', me.onRenderGrid, me);
  }
});
