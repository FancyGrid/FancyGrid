/*
 * @mixin Fancy.store.mixin.Paging
 */
Fancy.modules['infinite'] = true;
Fancy.Mixin('Fancy.store.mixin.Infinite',{
  /*
   *
   */
  initInfinite: function(){
    var me = this;

    if(me.infinite === undefined){
      return;
    }

    if(Fancy.isObject(me.infinite)){
      Fancy.apply(me, me.infinite);
    }

    Fancy.applyIf(me, {
      infiniteDisplayedRows: 50,
      infiniteScrolledToRow: 0
    });
  }
});/*
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
  constructor: function() {
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
  ons: function(){
    var me = this,
      w = me.widget,
      store = w.store;

    //w.on('render', me.onRenderGrid, me);
  }
});