/*
 * @class Fancy.grid.plugin.RowHeight
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.grid.plugin.RowHeight', {
    extend: F.Plugin,
    ptype: 'grid.rowheight',
    inWidgetName: 'rowheight',
    cellTip: '{value}',
    stopped: true,
    /*
     * @param {Object} config
     */
    constructor: function () {
      this.Super('const', arguments);

      this.rows = {};
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
        w = me.widget;

      w.on('init', me.onInit, me);
      w.on('update', me.onUpdate, me);
      w.on('columnresize', me.onColumnResize, me);
    },
    onInit: function () {
      var me = this,
        w = me.widget;

      setTimeout(function () {
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    onUpdate: function () {
      var me = this,
        w = me.widget,
        viewData = w.getDataView(),
        totalHeight = 0;

      F.each(viewData, function (item) {
        var id = item.id,
          height = me.rows[id],
          rowIndex = w.getRowById(id),
          cells = w.getDomRow(rowIndex);

        F.each(cells, function (cellDom) {
          var cell = F.get(cellDom);

          cell.css('height', height);
        });

        totalHeight += height;
      });

      me.totalHeight = totalHeight;

      if(w.grouping){
        me.totalHeight += w.grouping.getGroupRowsHeight();
      }

      setTimeout(function () {
        w.setSidesHeight(me.totalHeight);
        w.scroller.update(me.totalHeight);
      }, 50);
    },
    /*
     *
     */
    add: function (id, height) {
      this.rows[id] = height;
    },
    /*
     *
     */
    getRowsHeight: function (items) {
      var me = this,
        height = 0;

      F.each(items, function (item) {
        var id = item.get('id');

        height += me.rows[id];
      });

      return height;
    },
    /*
     *
     */
    onColumnResize: function (grid, o) {
      var me = this;
      if(o.column.type === 'text' && o.column.autoHeight){

        setTimeout(function () {
          me.widget.update();
          me.onUpdate();
        }, 400);
      }
    }
  });

})();