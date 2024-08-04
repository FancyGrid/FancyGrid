/*
 * @mixin Fancy.store.mixin.Paging
 */
Fancy.modules['infinite'] = true;
Fancy.Mixin('Fancy.store.mixin.Infinite',{
  /*
   *
   */
  initInfinite(){
    const me = this;

    if (me.infinite === undefined) {
      return;
    }

    if(Fancy.isObject(me.infinite)){
      Fancy.apply(me, me.infinite);
    }

    Fancy.applyIf(me, {
      infiniteDisplayedRows: 50,
      infiniteScrolledToRow: 0
    });
  },
  /*
   *
   */
  getNumOfInfiniteRows(){
    const me = this;

    if(me.filteredData){
      return me.filteredData.length;
    }

    return me.data.length;
  }
});
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
