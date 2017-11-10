/*
 * @class Fancy.grid.plugin.CellTip
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.grid.plugin.CellTip', {
    extend: F.Plugin,
    ptype: 'grid.celltip',
    inWidgetName: 'celltip',
    cellTip: '{value}',
    stopped: true,
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      w.on('cellenter', me.onCellEnter, me);
      w.on('cellleave', me.onCellLeave, me);
      docEl.on('touchend', me.onTouchEnd, me);
      docEl.on('mousemove', me.onDocMove, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellEnter: function (grid, o) {
      var me = this,
        column = o.column,
        cellTip = me.cellTip,
        e = o.e;

      if (column.cellTip) {
        if (F.isString(column.cellTip)) {
          cellTip = column.cellTip;
        }
        else if (F.isFunction(column.cellTip)) {
          cellTip = column.cellTip(o);
          if (cellTip === false) {
            return;
          }
        }

        var tpl = new F.Template(cellTip),
          data = {
            title: column.title,
            value: o.value,
            columnIndex: 0,
            rowIndex: 0
          };

        me.stopped = false;
        F.apply(data, o.data);

        F.tip.update(tpl.getHTML(data));
        F.tip.show(e.pageX + 15, e.pageY - 25);
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellLeave: function (grid, o) {
      this.stopped = true;
      F.tip.hide(1000);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onTouchEnd: function (grid, o) {
      this.stopped = true;
      F.tip.hide(1000);
    },
    /*
     * @param {Object} e
     */
    onDocMove: function (e) {
      if (this.stopped === true) {
        return;
      }

      var me = this,
        w = me.widget;

      if(w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none')){
        me.stopped = true;
        F.tip.hide(1000);
      }

      F.tip.show(e.pageX + 15, e.pageY - 25);
    }
  });

})();