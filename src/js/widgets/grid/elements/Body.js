/**
 * @class Fancy.grid.Body
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * Constants
   */
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CELL_WRAPPER_CLS = F.GRID_CELL_WRAPPER_CLS;
  var GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  var GRID_COLUMN_ELLIPSIS_CLS = F.GRID_COLUMN_ELLIPSIS_CLS;
  var GRID_COLUMN_ORDER_CLS = F.GRID_COLUMN_ORDER_CLS;
  var GRID_COLUMN_TEXT_CLS = F.GRID_COLUMN_TEXT_CLS;
  var GRID_COLUMN_TREE_CLS = F.GRID_COLUMN_TREE_CLS;

  var GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  var GRID_COLUMN_CHART_CIRCLE_CLS = F.GRID_COLUMN_CHART_CIRCLE_CLS;
  var GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS =  F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  var GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;
  var GRID_COLUMN_PROGRESS_CLS = F.GRID_COLUMN_PROGRESS_CLS;
  var GRID_COLUMN_H_BAR_CLS = F.GRID_COLUMN_H_BAR_CLS;
  var GRID_COLUMN_ROW_DRAG_CLS = F.GRID_COLUMN_ROW_DRAG_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.Body', {
    extend: F.Widget,
    mixins: [
      F.grid.body.mixin.Updater
    ],
    cls: GRID_BODY_CLS,
    cellTpl: [
      '<div class="' + GRID_CELL_INNER_CLS + '">{cellValue}</div>'
    ],
    cellWrapperTpl: [
      '<div class="' + GRID_CELL_WRAPPER_CLS + '">',
      '<div class="' + GRID_CELL_INNER_CLS + '">{cellValue}</div>',
      '</div>'
    ],
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
      var me = this;

      me.Super('init', arguments);
      me.addEvents('adddomcolumns');

      me.initTpl();
      me.render();
      me.ons();
    },
    /*
     *
     */
    initTpl: function () {
      var me = this;

      me.cellTpl = new F.Template(me.cellTpl);
      me.cellWrapperTpl = new F.Template(me.cellWrapperTpl);
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        id = w.id;

      w.on('afterrender', me.onAfterRender, me);

      var columnSelector = '.' + GRID_COLUMN_CLS + '[grid="' + id + '"]',
        cellSelector = columnSelector + ' div.' + GRID_CELL_CLS;

      me.el.on('click', me.onCellClick, me, cellSelector);
      me.el.on('dblclick', me.onCellDblClick, me, cellSelector);
      me.el.on('mouseenter', me.onCellMouseEnter, me, cellSelector);
      me.el.on('mouseleave', me.onCellMouseLeave, me, cellSelector);
      me.el.on('mousedown', me.onCellMouseDown, me, cellSelector);

      me.el.on('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      me.el.on('mouseleave', me.onColumnMouseLeave, me, columnSelector);

      me.el.on('contextmenu', me.onContextMenu, me, cellSelector);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        renderTo,
        el = F.get(document.createElement('div'));

      el.addCls(GRID_BODY_CLS);
      el.attr('role', 'presentation');
      renderTo = w.el.select('.fancy-grid-' + me.side).dom;
      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     *
     */
    onAfterRender: function () {
      this.update();
      this.setHeight();
    },
    /*
     * @param {Number} scrollLeft
     * @param {Boolean} animate
     */
    setColumnsPosition: function (scrollLeft, animate) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length,
        columnsWidth = 0,
        bodyDomColumns = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]'),
        scrollLeft = scrollLeft || me.scrollLeft || 0;

      columnsWidth += scrollLeft;

      for (; i < iL; i++) {
        var column = columns[i],
          columnEl = bodyDomColumns.item(i);

        if(animate && !F.nojQuery) {
          columnEl.animate({
            left: columnsWidth + 'px'
          }, F.ANIMATE_DURATION);
        }
        else{
          columnEl.css({
            left: columnsWidth + 'px'
          });
        }

        if (!column.hidden) {
          columnsWidth += column.width;
        }
      }
    },
    /*
     * @param {Number} delta
     * @return {Object}
     */
    wheelScroll: function (delta) {
      var me = this,
        w = me.widget,
        knobOffSet = w.knobOffSet,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]');

      if (columnsDom.length === 0) {
        return;
      }

      var oldScrollTop = parseInt(columnsDom.item(0).css('top')),
        i = 0,
        iL = columnsDom.length,
        bodyViewHeight = w.getBodyHeight(),
        cellsViewHeight = w.getCellsViewHeight(),
        scrollRightPath = cellsViewHeight - bodyViewHeight + knobOffSet,
        o = {
          oldScroll: parseInt(columnsDom.item(0).css('top')),
          newScroll: parseInt(columnsDom.item(0).css('top')) + 30 * delta,
          deltaScroll: 30 * delta
        };

      if(scrollRightPath < 0 ){
        scrollRightPath = 0;
      }

      for (; i < iL; i++) {
        var columnEl = columnsDom.item(i),
          topValue = parseInt(columnEl.css('top')) + 30 * delta;

        if (topValue > 0) {
          topValue = 0;
          o.newScroll = 0;
        }
        else if (Math.abs(topValue) > scrollRightPath) {
          topValue = -scrollRightPath - knobOffSet;
          o.newScroll = topValue;
        }

        if(topValue > 0){
          topValue = 0;
        }



        columnEl.css('top', topValue + 'px');
      }

      o.scrolled = oldScrollTop !== parseInt(columnsDom.item(0).css('top'));

      return o;
    },
    /*
     * @param {Number} y
     * @param {Number} x
     * @param {Boolean} [animate]
     * @return {Object}
     */
    scroll: function (y, x, animate) {
      var me = this,
        w = me.widget,
        scroller = w.scroller,
        s = w.store,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]'),
        i = 0,
        iL = columnsDom.length,
        o = {};

      if (y !== false && y !== null && y !== undefined) {
        o.scrollTop = y;
        if(w.infinite){
          if(scroller.scrollTop !== y){
            var newRowToView = Math.round(y/w.cellHeight);
            if(s.infiniteScrolledToRow !== newRowToView){
              s.infiniteScrolledToRow = newRowToView;
              if(me.infiniteTimeOut){
                var timeDelta = new Date() - me.infiniteTimeOutDate;

                if(timeDelta < 100){
                  clearInterval(me.infiniteTimeOut);
                }
              }
              else{
                me.infiniteTimeOutDate = new Date();
              }

              me.infiniteTimeOut = setTimeout(function () {
                w.leftBody.update();
                w.body.update();
                w.rightBody.update();
                clearInterval(me.infiniteTimeOut);
                delete me.infiniteTimeOut;
                delete me.infiniteTimeOutDate;
              }, 1);
            }
          }
        }
        else {
          for (; i < iL; i++) {
            var columnEl = columnsDom.item(i);
            columnEl.css('top', -y + 'px');
          }
        }
      }

      if (x !== false && x !== null && x !== undefined) {
        o.scrollLeft = x;
        if (w.header) {
          w.header.scroll(x, animate);
        }
        me.scrollLeft = x;
        w.body.setColumnsPosition(x, animate);

        if (me.side === 'center') {
          if (w.grouping) {
            w.grouping.scrollLeft(x);
          }

          if (w.summary) {
            w.summary.scrollLeft(x);
          }
        }
      }

      return o;
    },
    /*
     *
     */
    setHeight: function () {
      var height = this.widget.getBodyHeight();

      this.css('height', height + 'px');
    },
    /*
     * @param {Object} e
     */
    onCellClick: function (e) {
      var me = this,
        w = me.widget;

      w.fire('cellclick', me.getEventParams(e));
      w.fire('rowclick', me.getEventParams(e));
      w.fire('columnclick', me.getColumnEventParams(e));

      if (w.activated === false) {
        w.activated = true;
        w.fire('activate');
      }
    },
    /*
     * @param {Object} e
     */
    onCellDblClick: function (e) {
      var me = this,
        w = me.widget;

      w.fire('celldblclick', me.getEventParams(e));
      w.fire('rowdblclick', me.getEventParams(e));
      w.fire('columndblclick', me.getColumnEventParams(e));
    },
    /*
     * @param {Object} e
     * @return {false|Object}
     */
    getEventParams: function (e) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        cell = e.currentTarget,
        cellEl = F.get(e.currentTarget),
        columnEl = cellEl.parent();

      if (cellEl.parent().dom === undefined) {
        return false;
      }

      if (s.getLength() === 0) {
        return false;
      }

      if(columnEl.attr('index') === undefined){
        //Touch bug
        return false;
      }

      var infiniteScrolledToRow = s.infiniteScrolledToRow || 0;

      var columnIndex = parseInt(columnEl.attr('index')),
        rowIndex = parseInt(cellEl.attr('index')),
        column = columns[columnIndex],
        key = column.index,
        value = s.get(rowIndex + infiniteScrolledToRow, key),
        id = s.getId(rowIndex + infiniteScrolledToRow),
        data = s.get(rowIndex + infiniteScrolledToRow),
        item = s.getById(id);

      if (column.smartIndexFn) {
        value = column.smartIndexFn(data);
      }

      return {
        e: e,
        id: id,
        side: me.side,
        cell: cell,
        column: column,
        rowIndex: rowIndex,
        infiniteRowIndex: rowIndex + infiniteScrolledToRow,
        columnIndex: columnIndex,
        value: value,
        data: data,
        item: item
      };
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnEventParams: function (e) {
      var me = this,
        w = me.widget,
        s = w.store,
        cellEl = F.get(e.currentTarget),
        columnEl = cellEl.parent(),
        columnIndex = parseInt(columnEl.attr('index')),
        columns = me.getColumns(),
        column = columns[columnIndex],
        config = {
          e: e,
          side: me.side,
          columnIndex: columnIndex,
          column: column,
          columnDom: columnEl.dom,
          cell: cellEl.dom
        };

      if (w.columnClickData) {
        config.data = s.getColumnData(column.index, column.smartIndexFn);
      }

      return config;
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnHoverEventParams: function (e) {
      var me = this,
        columnEl = F.get(e.currentTarget),
        columnIndex = parseInt(columnEl.attr('index')),
        columns = me.getColumns(),
        column = columns[columnIndex];

      return {
        e: e,
        side: me.side,
        columnIndex: columnIndex,
        column: column,
        columnDom: columnEl.dom,
        cell: e.target
      };
    },
    /*
     * @return {Array}
     */
    getColumns: function () {
      return this.widget.getColumns(this.side);
    },
    /*
     * @param {Object} e
     */
    onCellMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery && prevCellOver) {
        if (me.fixZeptoBug) {
          if (params.rowIndex !== prevCellOver.rowIndex || params.columnIndex !== prevCellOver.columnIndex || params.side !== prevCellOver.side) {
            w.fire('cellleave', prevCellOver);
            if (params.rowIndex !== prevCellOver.rowIndex) {
              w.fire('rowleave', prevCellOver);
            }
          }
        }
      }

      if (!prevCellOver) {
        w.fire('rowenter', params);
      }
      else {
        if (params.rowIndex !== me.prevCellOver.rowIndex) {
          w.fire('rowenter', params);
        }
      }

      w.fire('cellenter', params);

      me.prevCellOver = params;
    },
    /*
     * @param {Object} e
     */
    onCellMouseDown: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        columnParams = {
          e: params.e,
          side: params.side,
          columnDom: F.get(params.cell).parent().dom,
          column: params.column,
          columnIndex: params.columnIndex,
          cell: params.cell
        };

      //right click
      if((e.button === 2 && e.buttons === 2) || e.which === 3){
        return;
      }

      w.fire('beforecellmousedown', params);
      w.fire('cellmousedown', params);
      w.fire('columnmousedown', columnParams);

      if (w.activated === false) {
        w.activated = true;
        w.fire('activate');
      }
    },
    /*
     * @param {Object} e
     */
    onCellMouseLeave: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery) {
        if (prevCellOver === undefined) {
          return;
        }

        me.fixZeptoBug = params;
        return;
      }

      w.fire('rowleave', prevCellOver);
      w.fire('cellleave', prevCellOver);
      delete me.prevCellOver;
    },
    /*
     * @param {Object} e
     */
    onColumnMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        params = me.getColumnHoverEventParams(e),
        prevColumnOver = me.prevColumnOver;

      if (!prevColumnOver) {
        w.fire('columnenter', params);
      }
      else if (me.prevCellOver) {
        if (params.rowIndex !== me.prevCellOver.rowIndex) {
          w.fire('rowenter', params);
        }
      }

      me.prevColumnOver = params;
    },
    /*
     * @param {Object} e
     */
    onColumnMouseLeave: function (e) {
      var me = this,
        w = me.widget;

      w.fire('columnleave', me.prevColumnOver);
      delete me.prevColumnOver;
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {Fancy.Element}
     */
    getCell: function (row, column) {
      var me = this,
        w = me.widget;

      return this.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]');
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {HTMLElement}
     */
    getDomCell: function (row, column) {
      var me = this,
        w = me.widget,
        dom = me.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]').dom;

      return dom;
    },
    /*
     * @param {Number} index
     * @return {HTMLElement}
     */
    getDomColumn: function (index) {
      var me = this,
        w = me.widget;

      return me.el.select('.' + GRID_COLUMN_CLS + '[index="' + index + '"][grid="' + w.id + '"]').dom;
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        el = me.el,
        cellSelector = 'div.' + GRID_CELL_CLS,
        columnSelector = 'div.' + GRID_COLUMN_CLS;

      el.un('click', me.onCellClick, me, cellSelector);
      el.un('dblclick', me.onCellDblClick, me, cellSelector);
      el.un('mouseenter', me.onCellMouseEnter, me, cellSelector);
      el.un('mouseleave', me.onCellMouseLeave, me, cellSelector);
      el.un('mousedown', me.onCellMouseDown, me, cellSelector);

      el.un('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      el.un('mouseleave', me.onColumnMouseLeave, me, columnSelector);
    },
    /*
     * @param {Number} orderIndex
     */
    hideColumn: function (orderIndex) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS),
        columnEl = columnEls.item(orderIndex),
        i = 0,
        iL = columns.length,
        left = 0,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      columnEl.hide();

      for (; i < iL; i++) {
        var column = columns[i],
          columnEl = columnEls.item(i),
          columnLeft = parseInt(columnEl.css('left'));

        if(column.hidden){
          continue;
        }

        if(columnLeft !== left){
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     */
    showColumn: function (orderIndex) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS),
        columnEl = columnEls.item(orderIndex),
        left = 0,
        i = 0,
        iL = columns.length,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      columnEl.show();

      for (; i < iL; i++) {
        var columnEl = columnEls.item(i),
          columnLeft = parseInt(columnEl.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if(columnLeft !== left) {
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     */
    removeColumn: function (orderIndex) {
      var me = this,
        columns = me.el.select('.' + GRID_COLUMN_CLS),
        column = columns.item(orderIndex),
        columnWidth = parseInt(column.css('width')),
        i = orderIndex + 1,
        iL = columns.length;

      column.destroy();

      for (; i < iL; i++) {
        var _column = columns.item(i),
          left = parseInt(_column.css('left')) - columnWidth;

        _column.attr('index', i - 1);
        _column.css('left', left);
      }
    },
    /*
     * @param {Number} index
     * @param {Object} column
     */
    insertColumn: function (index, column) {
      var me = this,
        w = me.widget,
        _columns = me.getColumns(),
        columns = me.el.select('.' + GRID_COLUMN_CLS),
        width = column.width,
        el = F.get(document.createElement('div')),
        i = index,
        iL = columns.length,
        left = 0,
        j = 0,
        jL = index,
        passedLeft;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      for (; j < jL; j++) {
        if(!_columns[j].hidden){
          left += _columns[j].width;
        }
      }

      passedLeft = left;

      for (; i < iL; i++) {
        if(_columns[i].hidden){
          continue;
        }

        var _column = columns.item(i);
        left = parseInt(_column.css('left')) + column.width;

        _column.css('left', left);
        _column.attr('index', i + 1);
      }

      el.attr('role', 'presentation');
      el.addCls(GRID_COLUMN_CLS);
      el.attr('grid', w.id);

      if (column.index === '$selected' || column.select) {
        el.addCls(GRID_COLUMN_SELECT_CLS);
      }
      else {
        switch (column.type) {
          case 'order':
            el.addCls(GRID_COLUMN_ORDER_CLS);
            break;
          case 'rowdrag':
            el.addCls(GRID_COLUMN_ROW_DRAG_CLS);
            break;
        }
      }

      if (column.cls) {
        el.addCls(column.cls);
      }

      if(column.type === 'tree'){
        el.addCls(GRID_COLUMN_TREE_CLS);
        if(column.folder){
          el.addCls('fancy-grid-tree-column-folder');
        }
      }

      if (column.type === 'text') {
        el.addCls(GRID_COLUMN_TEXT_CLS);
      }

      el.css({
        width: width + 'px'
      });
      el.attr('index', index);

      if (column.cellAlign) {
        el.css('text-align', column.cellAlign);
      }

      if (column.ellipsis === true) {
        switch (column.type) {
          case 'string':
          case 'text':
          case 'number':
          case 'date':
          case 'combo':
          case 'tree':
            el.addCls(GRID_COLUMN_ELLIPSIS_CLS);
            break;
        }
      }

      var scrolled = w.scroller.getScroll();
      el.css('top', -scrolled);

      if (index === 0 && columns.length) {
        el.css('left', '0px');
        me.el.dom.insertBefore(el.dom, columns.item(index).dom);
      }
      else if (index !== 0 && columns.length) {
        if(index === columns.length){
          el.css('left', left + 'px');
          me.el.dom.appendChild(el.dom);
        }
        else {
          el.css('left', passedLeft + 'px');
          me.el.dom.insertBefore(el.dom, columns.item(index).dom);
        }
      }
      else{
        el.css('left', left + 'px');
        me.el.dom.appendChild(el.dom);
      }

      me.checkDomCells();
      me.updateRows(undefined, index);
    },
    reSetIndexes: function () {
      var me = this,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS);

      columnsDom.each(function(el, i){
        el.attr('index', i);
      });
    },
    /*
     *
     */
    clearColumnsStyles: function(){
      var me = this,
        cells = me.el.select('div.' + GRID_CELL_CLS);

      cells.each(function(cell){
        cell.css('color', '');
        cell.css('background-color', '');
      });
    },
    /*
     *
     */
    updateColumnsSizes: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        left = 0;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i) {
        if(column.hidden){
          return;
        }

        var el = me.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"]');
        if(Fancy.nojQuery){
          //Bug: zepto dom module does not support for 2 animation params.
          //It is not fix
          //el.animate({'width': column.width}, ANIMATE_DURATION);
          //el.animate({'left': left}, ANIMATE_DURATION);
          el.css({
            width: column.width,
            left: left
          });
        }
        else{
          el.animate({
            width: column.width,
            left: left
          }, ANIMATE_DURATION);

          el.css('overflow', '');
        }

        left += column.width;
      });
    },
    reSetColumnsAlign: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = this.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i){
        var column = columns[i];

        columnEl.css('text-align', column.cellAlign || '');
      });
    },
    reSetColumnsCls: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i){
        var column = columns[i],
          clss = columnEl.attr('class').split(' ');

        F.each(clss, function (cls) {
          switch(cls){
            case GRID_COLUMN_CLS:
              break;
            case column.cls:
              break;
            case spark[column.type]:
              break;
            default:
              columnEl.removeCls(cls);
          }
        });

        if(column.cls){
          columnEl.addCls(column.cls);
        }

        if(column.ellipsis){
          columnEl.addCls(GRID_COLUMN_ELLIPSIS_CLS);
        }

        switch(column.type){
          case 'order':
            columnEl.addCls(GRID_COLUMN_ORDER_CLS);
            break;
          case 'select':
            columnEl.addCls(GRID_COLUMN_SELECT_CLS);
            break;
          case 'rowdrag':
            columnEl.addCls(GRID_COLUMN_ROW_DRAG_CLS);
            break;
          case 'tree':
            columnEl.addCls(GRID_COLUMN_TREE_CLS);
            if(column.folder){
              columnEl.addCls('fancy-grid-tree-column-folder');
            }
            break;
        }

        if(column.select){
          columnEl.addCls(GRID_COLUMN_SELECT_CLS);
        }

        if(column.rowdrag){
          columnEl.addCls(GRID_COLUMN_ROW_DRAG_CLS);
        }
      });
    },
    onContextMenu: function (e) {
      var me = this,
        w = me.widget;

      w.fire('contextmenu', me.getEventParams(e));
    },
    updateColumnsVisibility: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i) {
        var column = columns[i];

        if(column.hidden){
          columnEl.hide();
        }
        else if(columnEl.css('display') === 'none'){
          columnEl.show();
        }
      });
    }
  });

  var spark = {
    sparklineline: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebar: GRID_COLUMN_SPARKLINE_CLS,
    sparklinetristate: GRID_COLUMN_SPARKLINE_CLS,
    sparklinediscrete: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebullet: GRID_COLUMN_SPARKLINE_CLS,
    sparklinepie: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebox: GRID_COLUMN_SPARKLINE_CLS,
    circle: GRID_COLUMN_CHART_CIRCLE_CLS,
    progressdonut: GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS,
    grossloss: GRID_COLUMN_GROSSLOSS_CLS,
    progressbar: GRID_COLUMN_PROGRESS_CLS,
    hbar: GRID_COLUMN_H_BAR_CLS
  }

})();