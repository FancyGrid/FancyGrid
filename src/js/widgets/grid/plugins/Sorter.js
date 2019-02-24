/*
 * @class Fancy.grid.plugin.Sorter
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_COLUMN_SORT_ASC = F.GRID_COLUMN_SORT_ASC;
  var GRID_COLUMN_SORT_DESC = F.GRID_COLUMN_SORT_DESC;
  var GRID_COLUMN_RESIZER_CLS = F.GRID_COLUMN_RESIZER_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;
  var GRID_LEFT_CLS = F.GRID_LEFT_CLS;
  var GRID_RIGHT_CLS = F.GRID_RIGHT_CLS;

  F.define('Fancy.grid.plugin.Sorter', {
    extend: F.Plugin,
    ptype: 'grid.sorter',
    inWidgetName: 'sorter',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function () {
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
        w = me.widget;

      w.once('render', function () {
        me.onsHeaders();
      });
    },
    /*
     *
     */
    onsHeaders: function () {
      var me = this,
        w = me.widget;

      w.on('headercellclick', me.onHeaderCellClick, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onHeaderCellClick: function (grid, o) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        cellEl = F.get(o.cell),
        side = o.side,
        index = o.index,
        action,
        columns,
        column,
        key,
        e = o.e,
        target = e.target;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if (target.tagName.toLocaleLowerCase() === 'input') {
        return;
      }

      var field = cellEl.select('.' + FIELD_CLS);
      if (field.length > 0 && field.item(0).within(target) === true) {
        return;
      }

      if (cellEl.hasCls(GRID_COLUMN_RESIZER_CLS) || w.startResizing) {
        return;
      }

      columns = w.getColumns(side);

      if (cellEl.hasCls(GRID_COLUMN_SORT_ASC)) {
        action = 'desc';
      }
      else if (cellEl.hasCls(GRID_COLUMN_SORT_DESC)) {
        if(!w.multiSort){
          action = 'drop';
        }
        else {
          action = 'asc';
        }
      }
      else {
        action = 'asc';
      }

      column = columns[index];
      key = column.index;

      me.sort(action, key, side, column, cellEl);
    },
    /*
     * @param {String} dir
     * @param {String} index
     * @param {String} side
     * @param {Object} column
     * @param {Object} cell
     */
    sort: function (dir, index, side, column, cell) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = w.getColumns(side),
        i = 0,
        iL = columns.length,
        type,
        header = w.getHeader(side);

      w.sorting = true;

      if (!column || !cell) {
        for (; i < iL; i++) {
          if (columns[i].index === index) {
            column = columns[i];
            cell = header.getCell(i);
            break;
          }
        }
      }

      if (column.sortable !== true) {
        return;
      }

      if (w.multiSort) {
        me.clearHeaderMultiSortCls(dir, cell);
      }
      else {
        me.clearHeaderSortCls();
      }

      switch (dir) {
        case 'asc':
          cell.addCls(GRID_COLUMN_SORT_ASC);
          break;
        case 'desc':
          cell.addCls(GRID_COLUMN_SORT_DESC);
          break;
      }

      type = column.type;

      var format,
        mode;

      if (column.format) {
        if (F.isString(column.format)) {
          switch (column.format) {
            case 'date':
              format = w.lang.date.read;
              if (column.format.mode) {
                mode = column.format.mode;
              }
              break;
          }
        }
        else {
          switch (column.type) {
            case 'date':
              format = column.format.read;
              if (column.format.mode) {
                mode = column.format.mode;
              }
              break;
          }
        }
      }

      if (w.grouping) {
        if (s.remoteSort) {
          s.once('load', function () {
            w.grouping.reGroup();
            //Write code instead of reGroup
          });
        }
      }

      s.sort(dir, type, index, {
         smartIndexFn: column.smartIndexFn,
         format: format,
         mode: mode,
         sorter: column.sorter
      });

      delete w.sorting;
    },
    /*
     * @param {String} dir
     * @param {Fancy.Element} cellEl
     */
    clearHeaderMultiSortCls: function (dir, cellEl) {
      var me = this,
        w = me.widget,
        s = w.store,
        itemsASC,
        itemsDESC;

      switch (dir.toLocaleUpperCase()) {
        case 'ASC':
          cellEl.removeCls(GRID_COLUMN_SORT_DESC);
          break;
        case 'DESC':
          cellEl.removeCls(GRID_COLUMN_SORT_ASC);
          break;
      }

      itemsASC = w.el.select('.' + GRID_COLUMN_SORT_ASC);
      itemsDESC = w.el.select('.' + GRID_COLUMN_SORT_DESC);

      if (itemsASC.length + itemsDESC.length < s.multiSortLimit) {
        return;
      }

      //TODO: Small refactoring that decrease size
      var i = 0,
        iL = itemsASC.length,
        cellToRemoveCls;

      for (; i < iL; i++) {
        var cell = itemsASC.item(i),
          sideEl = cell.parent().parent(),
          side,
          columns,
          key,
          index = cell.attr('index');

        if (sideEl.hasCls(GRID_CENTER_CLS)) {
          side = 'center';
        }
        else if (sideEl.hasCls(GRID_LEFT_CLS)) {
          side = 'left';
        }
        else if (sideEl.hasCls(GRID_RIGHT_CLS)) {
          side = 'right';
        }

        columns = w.getColumns(side);
        key = columns[index].index;

        var firstSorter = s.sorters[0];

        if (firstSorter.key === key) {
          cellToRemoveCls = cell;
        }
      }

      var i = 0,
        iL = itemsDESC.length;

      for (; i < iL; i++) {
        var cell = itemsDESC.item(i),
          sideEl = cell.parent().parent(),
          side,
          columns,
          key,
          index = cell.attr('index');

        if (sideEl.hasCls(GRID_CENTER_CLS)) {
          side = 'center';
        }
        else if (sideEl.hasCls(GRID_LEFT_CLS)) {
          side = 'left';
        }
        else if (sideEl.hasCls(GRID_RIGHT_CLS)) {
          side = 'right';
        }

        columns = w.getColumns(side);
        key = columns[index].index;

        var firstSorter = s.sorters[0];

        if (firstSorter.key === key) {
          cellToRemoveCls = cell;
        }
      }

      cellToRemoveCls.removeCls(GRID_COLUMN_SORT_ASC);
      cellToRemoveCls.removeCls(GRID_COLUMN_SORT_DESC);
    },
    /*
     *
     */
    clearHeaderSortCls: function () {
      var el = this.widget.el;

      el.select('.' + GRID_COLUMN_SORT_ASC).removeCls(GRID_COLUMN_SORT_ASC);
      el.select('.' + GRID_COLUMN_SORT_DESC).removeCls(GRID_COLUMN_SORT_DESC);
    },
    updateSortedHeader: function () {
      var me = this,
        w = me.widget,
        header,
        s = w.store;

      me.clearHeaderSortCls();

      F.each(s.sorters, function (sorter, i) {
        var info = w.getColumnOrderByKey(sorter.key),
          cls = sorter.dir === 'ASC'? GRID_COLUMN_SORT_ASC : GRID_COLUMN_SORT_DESC;

        if(!info.side){
          return;
        }

        header = w.getHeader(info.side);
        var cell = header.getCell(info.order);

        if(cell){
          cell.addCls(cls);
        }
      });
    }
  });
})();