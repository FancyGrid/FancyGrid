/*
 * @class Fancy.grid.plugin.CellTip
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.CellTip', {
  extend: Fancy.Plugin,
  ptype: 'grid.celltip',
  inWidgetName: 'celltip',
  cellTip: '{value}',
  stopped: true,
  /*
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
      docEl = Fancy.get(document);

    w.on('cellenter', me.onCellEnter, me);
    w.on('cellleave', me.onCellLeave, me);
    docEl.on('touchend', me.onTouchEnd, me);
    docEl.on('mousemove', me.onDocMove, me);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellEnter: function(grid, o){
    var me = this,
      column = o.column,
      cellTip = me.cellTip,
      e = o.e;

    if(column.cellTip){
      if(Fancy.isString(column.cellTip)){
        cellTip = column.cellTip;
      }
      else if(Fancy.isFunction(column.cellTip)){
        cellTip = column.cellTip(o);
        if(cellTip === false){
          return;
        }
      }

      var tpl = new Fancy.Template(cellTip),
        data = {
          title: column.title,
          value: o.value,
          columnIndex: 0,
          rowIndex:0
        };

      me.stopped = false;
      Fancy.apply(data, o.data);

      Fancy.tip.update(tpl.getHTML(data));
      Fancy.tip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellLeave: function(grid, o){
    this.stopped = true;
    Fancy.tip.hide(1000);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onTouchEnd: function(grid, o){
    this.stopped = true;
    Fancy.tip.hide(1000);
  },
  /*
   * @param {Object} e
   */
  onDocMove: function(e){
    if(this.stopped === true){
      return;
    }

    Fancy.tip.show(e.pageX + 15, e.pageY - 25);
  }
});