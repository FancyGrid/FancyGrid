/**
 * @class Fancy.grid.Body
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  /*
   * Constants
   */
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  const GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  const GRID_BODY_CLS = F.GRID_BODY_CLS;
  const GRID_CELL_WRAPPER_CLS = F.GRID_CELL_WRAPPER_CLS;
  const GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  const GRID_COLUMN_ELLIPSIS_CLS = F.GRID_COLUMN_ELLIPSIS_CLS;
  const GRID_COLUMN_ORDER_CLS = F.GRID_COLUMN_ORDER_CLS;
  const GRID_COLUMN_TEXT_CLS = F.GRID_COLUMN_TEXT_CLS;
  const GRID_COLUMN_TREE_CLS = F.GRID_COLUMN_TREE_CLS;

  const GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  const GRID_COLUMN_CHART_CIRCLE_CLS = F.GRID_COLUMN_CHART_CIRCLE_CLS;
  const GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS = F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  const GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;
  const GRID_COLUMN_PROGRESS_CLS = F.GRID_COLUMN_PROGRESS_CLS;
  const GRID_COLUMN_H_BAR_CLS = F.GRID_COLUMN_H_BAR_CLS;
  const GRID_COLUMN_ROW_DRAG_CLS = F.GRID_COLUMN_ROW_DRAG_CLS;

  const GRID_ROW_EXPAND_CLS = F.GRID_ROW_EXPAND_CLS;

  const ANIMATE_DURATION = F.ANIMATE_DURATION;

  const spark = {
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
  };

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
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

      me.Super('init', arguments);
      me.addEvents('adddomcolumns');

      me.initTpl();
      me.render();
      me.ons();
    },
    /*
     *
     */
    initTpl(){
      const me = this;

      me.cellTpl = new F.Template(me.cellTpl);
      me.cellWrapperTpl = new F.Template(me.cellWrapperTpl);
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget,
        id = w.id;

      w.on('afterrender', me.onAfterRender, me);

      const columnSelector = `.${GRID_COLUMN_CLS}[grid="${id}"]`,
        cellSelector = `${columnSelector} div.${GRID_CELL_CLS}`;

      me.el.on('click', me.onCellClick, me, cellSelector);
      if(!Fancy.isTouch){
        me.el.on('dblclick', me.onCellDblClick, me, cellSelector);
      }
      me.el.on('mouseenter', me.onCellMouseEnter, me, cellSelector);
      me.el.on('mouseleave', me.onCellMouseLeave, me, cellSelector);
      if(F.isTouch){
        me.el.on('touchend', me.onCellMouseDown, me, cellSelector);
      }
      else {
        me.el.on('mousedown', me.onCellMouseDown, me, cellSelector);
      }

      me.el.on('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      me.el.on('mouseleave', me.onColumnMouseLeave, me, columnSelector);

      if(F.isTouch){
        me.initTouchContextMenu(cellSelector);
      }
      else{
        me.el.on('contextmenu', me.onContextMenu, me, cellSelector);
      }

      me.el.on('mouseleave', me.onBodyLeave, me);
    },
    /*
     *
     */
    render(){
      let me = this,
        w = me.widget,
        renderTo,
        el = F.get(document.createElement('div'));

      el.addCls(GRID_BODY_CLS);
      el.attr('role', 'presentation');
      renderTo = w.el.select(`.fancy-grid-${me.side}`).dom;
      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     *
     */
    onAfterRender(){
      const me = this,
        w = me.widget,
        s = w.store;

      if (me.side === 'left' && !w.leftColumns.length) {
        return;
      }

      if(me.side === 'right' && !w.rightColumns.length){
        return;
      }

      if(!w.grouping || (w.grouping && !w.grouping.by)){
        if(w.state && w.state.startState && (w.state.startState.sorters || w.state.startState.filters || w.state.startState.page !== undefined)){
          me.update('waitstate');
        }
        else{
          me.update();
        }
      }
      else if(w.grouping && s.proxyType === 'server'){
        me.update();
      }

      me.setHeight();
    },
    /*
     * @param {Number} scrollLeft
     * @param {Boolean} animate
     */
    setColumnsPosition(scrollLeft, animate){
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length,
        columnsWidth = 0,
        bodyDomColumns = me.el.select(`.${GRID_COLUMN_CLS}[grid="${w.id}"]`);

      scrollLeft = scrollLeft || me.scrollLeft || 0;

      columnsWidth += scrollLeft;

      for (; i < iL; i++) {
        const column = columns[i],
          columnEl = bodyDomColumns.item(i);

        if(animate && !F.nojQuery){
          columnEl.animate({
            left: columnsWidth + 'px'
          }, F.ANIMATE_DURATION);
        }
        else{
          columnEl.css({
            left: columnsWidth + 'px'
          });
        }

        if (!column.hidden){
          columnsWidth += column.width;
        }
      }
    },
    /*
     * @param {Number} delta
     * @return {Object}
     */
    wheelScroll(delta){
      const me = this,
        w = me.widget,
        s = w.store,
        knobOffSet = w.knobOffSet,
        columnsDom = me.el.select(`.${GRID_COLUMN_CLS}[grid="${w.id}"]`);

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

      if (scrollRightPath < 0 ) {
        scrollRightPath = 0;
      }

      for (; i < iL; i++) {
        let columnEl = columnsDom.item(i),
          topValue = parseInt(columnEl.css('top')) + 30 * delta;

        if (topValue > 0) {
          topValue = 0;
          o.newScroll = 0;
        }
        else if (Math.abs(topValue) > scrollRightPath){
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
    scroll(y, x, animate){
      var me = this,
        w = me.widget,
        scroller = w.scroller,
        s = w.store,
        columnsDom = me.el.select(`.${GRID_COLUMN_CLS}[grid="${w.id}"]`),
        i = 0,
        iL = columnsDom.length,
        o = {};

      if (y !== false && y !== null && y !== undefined){
        o.scrollTop = y;
        if(w.infinite){
          if(scroller.scrollTop !== y){
            const newRowToView = Math.round(y / w.cellHeight);
            if(s.infiniteScrolledToRow !== newRowToView){
              s.infiniteScrolledToRow = newRowToView;
              if(me.infiniteTimeOut){
                const timeDelta = new Date() - me.infiniteTimeOutDate;

                if(timeDelta < 100){
                  clearInterval(me.infiniteTimeOut);
                }
              }
              else{
                me.infiniteTimeOutDate = new Date();
              }

              me.infiniteTimeOut = setTimeout(function(){
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
            const columnEl = columnsDom.item(i);
            columnEl.css('top', -y + 'px');
          }
        }
      }

      if (x !== false && x !== null && x !== undefined){
        o.scrollLeft = x;
        if (w.header){
          w.header.scroll(x, animate);
        }
        me.scrollLeft = x;
        w.body.setColumnsPosition(x, animate);

        if (me.side === 'center'){
          if(w.grouping && w.grouping.by){
            w.grouping.scrollLeft(x);
          }

          if (w.summary){
            w.summary.scrollLeft(x);
          }

          if(w.subHeaderFilter){
            w.filter.scrollLeft(x);
          }
        }
      }

      return o;
    },
    /*
     *
     */
    setHeight(){
      const me = this,
        height = me.widget.getBodyHeight();

      me.css('height', `${height}px`);
    },
    /*
     * @param {Object} e
     */
    onCellClick(e){
      const me = this,
        w = me.widget;

      if (F.isTouch) {
        if (me.waitForDblClickInt) {
          const now = new Date();

          if(now - me.waitForDblClickDate < 500){
            w.fire('celldblclick', me.getEventParams(e));
            w.fire('rowdblclick', me.getEventParams(e));
            w.fire('columndblclick', me.getColumnEventParams(e));

            return;
          }
          else{
            delete me.waitForDblClickInt;
            delete me.waitForDblClickDate;
          }
        }
        else{
          me.waitForDblClickDate = new Date();
          me.waitForDblClickInt = setTimeout(function(){
            delete me.waitForDblClickInt;
            delete me.waitForDblClickDate;
          }, 500);
        }
      }

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
    onCellDblClick(e){
      const me = this,
        w = me.widget;

      w.fire('celldblclick', me.getEventParams(e));
      w.fire('rowdblclick', me.getEventParams(e));
      w.fire('columndblclick', me.getColumnEventParams(e));
    },
    /*
     * @param {Object} e
     * @return {false|Object}
     */
    getEventParams(e){
      const me = this,
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

      if (columnEl.attr('index') === undefined) {
        //Touch bug
        return false;
      }

      const infiniteScrolledToRow = s.infiniteScrolledToRow || 0;

      let columnIndex = parseInt(columnEl.attr('index')),
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
        e,
        id,
        side: me.side,
        cell,
        column,
        rowIndex,
        infiniteRowIndex: rowIndex + infiniteScrolledToRow,
        columnIndex,
        value,
        data,
        item
      };
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnEventParams(e){
      const me = this,
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

      if (w.columnClickData){
        config.data = s.getColumnData(column.index, column.smartIndexFn);
      }

      return config;
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnHoverEventParams(e){
      let me = this,
        columnEl = F.get(e.currentTarget),
        columnIndex = parseInt(columnEl.attr('index')),
        columns = me.getColumns(),
        column = columns[columnIndex],
        cell = e.target;

      if(!F.get(cell).hasCls(GRID_CELL_CLS)){
        cell = F.get(cell).parent('.' + GRID_CELL_CLS).dom;
      }

      return {
        e,
        side: me.side,
        columnIndex,
        column,
        columnDom: columnEl.dom,
        cell
      };
    },
    /*
     * @return {Array}
     */
    getColumns(){
      return this.widget.getColumns(this.side);
    },
    /*
     * @param {Object} e
     */
    onCellMouseEnter(e){
      const me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery && prevCellOver){
        if (me.fixZeptoBug){
          if (params.rowIndex !== prevCellOver.rowIndex || params.columnIndex !== prevCellOver.columnIndex || params.side !== prevCellOver.side){
            w.fire('cellleave', prevCellOver);
            if (params.rowIndex !== prevCellOver.rowIndex){
              w.fire('rowleave', prevCellOver);
            }
          }
        }
      }

      if (!prevCellOver){
        w.fire('rowenter', params);
      }
      else {
        if (params.rowIndex !== me.prevCellOver.rowIndex){
          w.fire('rowenter', params);
        }
      }

      w.fire('cellenter', params);

      me.prevCellOver = params;
    },
    /*
     * @param {Object} e
     */
    onCellMouseDown(e){
      const me = this,
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

      if (w.activated === false){
        w.activated = true;
        w.fire('activate');
      }
    },
    /*
     * @param {Object} e
     */
    onCellMouseLeave(e){
      const me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery){
        if(params.rowIndex + 1 === w.getDataView().length){
          const cellParams = params.cell.getBoundingClientRect();

          if(e.clientY > cellParams.top + cellParams.height - 2){
            w.fire('rowleave', prevCellOver);
            w.fire('cellleave', prevCellOver);
            delete me.prevCellOver;

            return;
          }
        }

        if (prevCellOver === undefined){
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
    onColumnMouseEnter(e){
      const me = this,
        w = me.widget,
        params = me.getColumnHoverEventParams(e),
        prevColumnOver = me.prevColumnOver;

      if (!prevColumnOver){
        w.fire('columnenter', params);
      }
      else if (me.prevCellOver){
        if (params.rowIndex !== me.prevCellOver.rowIndex){
          w.fire('rowenter', params);
        }
      }

      me.prevColumnOver = params;
    },
    /*
     * @param {Object} e
     */
    onColumnMouseLeave(){
      const me = this,
        w = me.widget;

      w.fire('columnleave', me.prevColumnOver);
      delete me.prevColumnOver;
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {Fancy.Element}
     */
    getCell(row, column){
      const me = this,
        w = me.widget;

      return this.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]');
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {HTMLElement}
     */
    getDomCell(row, column){
      const me = this,
        w = me.widget,
        dom = me.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]').dom;

      return dom;
    },
    /*
     * @param {Number} index
     * @return {HTMLElement}
     */
    getDomColumn(index){
      const me = this,
        w = me.widget;

      return me.el.select('.' + GRID_COLUMN_CLS + '[index="' + index + '"][grid="' + w.id + '"]').dom;
    },
    /*
     *
     */
    destroy(){
      const me = this,
        el = me.el,
        cellSelector = 'div.' + GRID_CELL_CLS,
        columnSelector = 'div.' + GRID_COLUMN_CLS;

      el.un('click', me.onCellClick, me, cellSelector);
      if(!Fancy.isTouch){
        el.un('dblclick', me.onCellDblClick, me, cellSelector);
      }
      el.un('mouseenter', me.onCellMouseEnter, me, cellSelector);
      el.un('mouseleave', me.onCellMouseLeave, me, cellSelector);
      if(F.isTouch){
        el.un('touchend', me.onCellMouseDown, me, cellSelector);
      }
      else {
        el.un('mousedown', me.onCellMouseDown, me, cellSelector);
      }

      el.un('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      el.un('mouseleave', me.onColumnMouseLeave, me, columnSelector);
    },
    /*
     * @param {Number} orderIndex
     */
    hideColumn(orderIndex){
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

      for (; i < iL; i++){
        columnEl = columnEls.item(i);

        var column = columns[i],
          columnLeft = parseInt(columnEl.css('left'));

        if(column.hidden){
          continue;
        }

        if(columnLeft !== left){
          columnEl.stop();
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     * @param {Number} [columnWidth]
     */
    showColumn(orderIndex, columnWidth){
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

      if(F.isNumber(columnWidth)){
        columnEl.css('width', columnWidth + 'px');
      }

      columnEl.show();

      for (; i < iL; i++){
        columnEl = columnEls.item(i);

        const columnLeft = parseInt(columnEl.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        //if(columnLeft !== left){
          columnEl.stop();
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        //}

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     */
    removeColumn(orderIndex){
      var me = this,
        columns = me.el.select('.' + GRID_COLUMN_CLS),
        column = columns.item(orderIndex),
        columnWidth = parseInt(column.css('width')),
        i = orderIndex + 1,
        iL = columns.length;

      column.destroy();

      for (; i < iL; i++){
        const _column = columns.item(i),
          left = parseInt(_column.css('left')) - columnWidth;

        _column.attr('index', i - 1);
        _column.css('left', left);
      }
    },
    /*
     * @param {Number} index
     * @param {Object} column
     */
    insertColumn(index, column){
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

      for (; j < jL; j++){
        if(!_columns[j].hidden){
          left += _columns[j].width;
        }
      }

      passedLeft = left;

      for (; i < iL; i++){
        if(_columns[i].hidden){
          continue;
        }

        const _column = columns.item(i);
        left = parseInt(_column.css('left')) + column.width;

        _column.css('left', left);
        _column.attr('index', i + 1);
      }

      el.attr('role', 'presentation');
      el.addCls(GRID_COLUMN_CLS);
      el.attr('grid', w.id);

      if (column.index === '$selected' || column.select){
        el.addCls(GRID_COLUMN_SELECT_CLS);
      }
      else {
        switch (column.type){
          case 'order':
            el.addCls(GRID_COLUMN_ORDER_CLS);
            break;
          case 'rowdrag':
            el.addCls(GRID_COLUMN_ROW_DRAG_CLS);
            break;
        }
      }

      if (column.cls){
        el.addCls(column.cls);
      }

      if(column.type === 'tree'){
        el.addCls(GRID_COLUMN_TREE_CLS);
        if(column.folder){
          el.addCls('fancy-grid-tree-column-folder');
        }
      }

      if (column.type === 'text'){
        el.addCls(GRID_COLUMN_TEXT_CLS);
      }

      el.css({
        width: width + 'px'
      });
      el.attr('index', index);

      if (column.cellAlign){
        el.css('text-align', column.cellAlign);
      }

      if (column.ellipsis === true){
        switch (column.type){
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

      const scrolled = w.scroller.getScroll();
      el.css('top', -scrolled);

      if (index === 0 && columns.length){
        el.css('left', '0px');
        me.el.dom.insertBefore(el.dom, columns.item(index).dom);
      }
      else if (index !== 0 && columns.length){
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
    reSetIndexes(){
      const me = this,
        columnsDom = me.el.select(`.${GRID_COLUMN_CLS}`);

      columnsDom.each((el, i) => {
        el.attr('index', i);
      });
    },
    /*
     *
     */
    clearColumnsStyles(){
      const me = this,
        cells = me.el.select(`div.${GRID_CELL_CLS}`);

      cells.each((cell) =>{
        cell.css('color', '');
        cell.css('background-color', '');
      });
    },
    /*
     *
     */
    updateColumnsSizes(){
      let me = this,
        w = me.widget,
        columns = me.getColumns(),
        left = 0;

      if (me.side === 'center') {
        left = -w.scroller.scrollLeft;
      }

      F.each(columns, (column, i) => {
        if (column.hidden) {
          return;
        }

        const el = me.el.select(`.${GRID_COLUMN_CLS}[index="${i}"]`);
        if(Fancy.nojQuery){
          //Bug: zepto dom module does not support for 2 animation params.
          //It is not fix
          //el.animate({'width': column.width}, ANIMATE_DURATION);
          //el.animate({'left': left}, ANIMATE_DURATION);
          el.css({
            width: column.width,
            left
          });
        }
        else{
          el.$dom.stop();

          el.animate({
            width: column.width,
            left: left
          }, ANIMATE_DURATION, undefined, () =>{
            el.css('overflow', '');
          });

          //el.css('overflow', '');
        }

        left += column.width;
      });
    },
    /*
     *
     */
    reSetColumnsAlign(){
      const me = this,
        columns = me.getColumns(),
        columnEls = this.el.select(`.${GRID_COLUMN_CLS}`);

      columnEls.each(function(columnEl, i){
        const column = columns[i];

        columnEl.css('text-align', column.cellAlign || '');
      });
    },
    /*
     *
     */
    reSetColumnsCls(){
      const me = this,
        columns = me.getColumns(),
        columnEls = me.el.select(`.${GRID_COLUMN_CLS}`);

      columnEls.each((columnEl, i) => {
        const column = columns[i],
          clss = columnEl.attr('class').split(' ');

        F.each(clss, (cls) => {
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

        if (column.cls) {
          columnEl.addCls(column.cls);
        }

        if (column.ellipsis) {
          switch (column.type){
            case 'checkbox':
              break;
            default:
              columnEl.addCls(GRID_COLUMN_ELLIPSIS_CLS);
          }
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
    /*
     * @param {String] cellSelector
     */
    initTouchContextMenu(cellSelector){
      const me = this;

      me.el.on('touchstart', me.onTouchStart, me, cellSelector);
    },
    /*
     *
     */
    onTouchStart(e){
      const me = this;

      me.touchEvent = e;
      me.intTouchStart = setTimeout(() =>{
        me.touchLongPress = true;
      }, 1000);

      me.el.once('touchend', me.onTouchEnd, me);
      me.el.once('touchmove', me.onTouchMove, me);
    },
    /*
     *
     */
    onTouchEnd(){
      const me = this,
        w = me.widget;

      if (me.touchLongPress) {
        w.fire('contextmenu', me.getEventParams(me.touchEvent));
      }

      clearInterval(me.intTouchStart);
      me.el.un('touchmove', me.onTouchMove);
      delete me.touchLongPress;
    },
    /*
     *
     */
    onTouchMove(){
      const me = this;

      clearInterval(me.intTouchStart);
      delete me.touchLongPress;
      me.un('touchend', me.onTouchEnd);
    },
    /*
     *
     */
    onContextMenu(e){
      const me = this,
        w = me.widget;

      w.fire('contextmenu', me.getEventParams(e));
    },
    /*
     *
     */
    updateColumnsVisibility(){
      const me = this,
        columns = me.getColumns(),
        //For jQuery :not does not work on me.el
        columnEls = me.el.parent().select(`:not(.${GRID_ROW_EXPAND_CLS}) .${GRID_COLUMN_CLS}`);

      columnEls.each((columnEl, i) => {
        const column = columns[i];

        if (column.hidden) {
          columnEl.hide();
        }
        else if(columnEl.css('display') === 'none'){
          columnEl.show();
        }
      });
    },
    /*
     *
     */
    onBodyLeave(){
      delete this.prevCellOver;
    }
  });

})();
