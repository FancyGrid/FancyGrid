/*
 * @mixin Fancy.grid.body.mixin.Updater
 */
(function() {
  //SHORTCUTS
  var F = Fancy;

  // CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_EVEN_CLS = F.GRID_CELL_EVEN_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_COLUMN_TEXT_CLS = F.GRID_COLUMN_TEXT_CLS;
  var GRID_COLUMN_ELLIPSIS_CLS = F.GRID_COLUMN_ELLIPSIS_CLS;
  var GRID_COLUMN_ORDER_CLS = F.GRID_COLUMN_ORDER_CLS;
  var GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  var GRID_COLUMN_TREE_CLS = F.GRID_COLUMN_TREE_CLS;
  var GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  var GRID_CELL_DIRTY_CLS = F.GRID_CELL_DIRTY_CLS;
  var GRID_CELL_DIRTY_EL_CLS = F.GRID_CELL_DIRTY_EL_CLS;
  var GRID_PSEUDO_CELL_CLS = F.GRID_PSEUDO_CELL_CLS;
  var GRID_EMPTY_CLS =  F.GRID_EMPTY_CLS;
  var GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  var GRID_COLUMN_SPARKLINE_BULLET_CLS = F.GRID_COLUMN_SPARKLINE_BULLET_CLS;
  var GRID_COLUMN_CHART_CIRCLE_CLS = F.GRID_COLUMN_CHART_CIRCLE_CLS;
  var GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS =  F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  var GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;
  var GRID_COLUMN_PROGRESS_CLS = F.GRID_COLUMN_PROGRESS_CLS;
  var GRID_COLUMN_PROGRESS_BAR_CLS = F.GRID_COLUMN_PROGRESS_BAR_CLS;
  var GRID_COLUMN_H_BAR_CLS = F.GRID_COLUMN_H_BAR_CLS;
  var GRID_COLUMN_ROW_DRAG_CLS = F.GRID_COLUMN_ROW_DRAG_CLS;
  var GRID_ROW_DRAG_EL_CLS = F.GRID_ROW_DRAG_EL_CLS;

  F.ns('Fancy.grid.body.mixin');

  /*
   * @mixin Fancy.grid.body.mixin.Updater
   */
  F.grid.body.mixin.Updater = function () {};

  F.grid.body.mixin.Updater.prototype = {
    /*
     * @param {String} type
     */
    update: function (type) {
      var me = this,
        w = me.widget,
        s = w.store,
        changes;

      switch (type){
        case 'cell':
        case 'cells':
          break;
        default:
          me.checkDomColumns();
      }

      if (s.loading) {
        return;
      }

      switch (type){
        case 'row':
        case 'rows':
          changes = s.changed;

          for(var id in changes){
            var item = changes[id],
              rowIndex = w.getRowById(id);

            for(var key in item){
              switch (key){
                case 'length':
                  break;
                default:
                  me.updateRows(rowIndex);
              }
            }
          }
          break;
        case 'cell':
        case 'cells':
          changes = s.changed;

          for(var id in changes){
            var item = changes[id],
              rowIndex = w.getRowById(id);

            for(var key in item){
              switch (key){
                case 'length':
                  break;
                default:
                  var _o = w.getColumnOrderByKey(key);

                  me.updateRows(rowIndex, _o.order);
              }
            }
          }

          break;
        default:
          me.checkDomCells();
          me.updateRows();
      }

      me.showEmptyText();
    },
    /*
     *
     */
    checkDomColumns: function () {
      var me = this,
        w = me.widget,
        numExistedColumn = me.el.select('.' + GRID_COLUMN_CLS).length,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length;

      if (iL <= numExistedColumn) {
        return;
      }

      for (; i < iL; i++) {
        var column = columns[i],
          width = column.width,
          el = F.get(document.createElement('div'));

        if (column.hidden) {
          el.css('display', 'none');
        }

        el.addCls(GRID_COLUMN_CLS);
        el.attr('grid', w.id);
        el.attr('role', 'presentation');

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

        if(column.type === 'tree'){
          el.addCls(GRID_COLUMN_TREE_CLS);
          if(column.folder){
            el.addCls('fancy-grid-tree-column-folder');
          }
        }

        if(column.rowdrag){
          el.addCls(GRID_COLUMN_ROW_DRAG_CLS);
        }

        if (column.cls) {
          el.addCls(column.cls);
        }

        if (column.type === 'text') {
          el.addCls(GRID_COLUMN_TEXT_CLS);
        }

        el.css({
          width: width + 'px'
        });
        el.attr('index', i);

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

        me.el.dom.appendChild(el.dom);
      }

      me.fire('adddomcolumns');
    },
    /*
     * @param {number} indexOrder
     */
    checkDomCells: function (indexOrder) {
      var me = this,
        w = me.widget,
        body = w.body,
        s = w.store,
        i = 0,
        iL = s.dataView.length,
        j = 0,
        jL,
        columns;

      if(s.infinite){
        iL = s.infiniteDisplayedRows;
        if(iL > s.dataView.length){
          iL = s.dataView.length;
        }
      }

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      jL = columns.length;

      var columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        dataLength = s.getLength(),
        cellTpl = me.cellTpl;

      if (w.cellWrapper) {
        cellTpl = me.cellWrapperTpl;
      }

      if (indexOrder !== undefined) {
        j = indexOrder;
        jL = indexOrder;
      }

      for (; j < jL; j++) {
        var columnDom = columsDom.item(j),
          delta = 0;

        delta = dataLength - columnDom.select('.' + GRID_CELL_CLS).length;
        i = iL - delta;

        for (; i < iL; i++) {
          var cellHTML = cellTpl.getHTML({});

          var el = F.get(document.createElement('div'));
          el.attr('role', 'gridcell');
          el.css({
            height: w.cellHeight + 'px'
          });
          el.addCls(GRID_CELL_CLS);
          el.attr('index', i);

          if (i % 2 !== 0 && w.striped) {
            el.addCls(GRID_CELL_EVEN_CLS)
          }
          el.update(cellHTML);
          columnDom.dom.appendChild(el.dom);

          if(body.el.select('.' + GRID_CELL_CLS + '.' + GRID_CELL_SELECTED_CLS + '[index="'+i+'"]').length){
            el.addCls(GRID_CELL_SELECTED_CLS);
          }
        }

        if (w.nativeScroller && (me.side === 'left' || me.side === 'right')) {
          columnDom.select('.' + GRID_PSEUDO_CELL_CLS).destroy();

          var cellHTML = cellTpl.getHTML({
            cellValue: '&nbsp;'
          });

          var el = F.get(document.createElement('div'));
          el.attr('role', 'gridcell');
          el.css({
            height: w.cellHeight + 'px'
          });
          el.addCls(GRID_PSEUDO_CELL_CLS);

          el.update(cellHTML);
          columnDom.dom.appendChild(el.dom);
        }
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {Number} columnIndex
     */
    updateRows: function (rowIndex, columnIndex) {
      var me = this,
        w = me.widget,
        i = 0,
        columns,
        iL;

      if (rowIndex === undefined) {
        me.clearDirty();
      }
      else {
        me.clearDirty(rowIndex);
      }

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      iL = columns.length;

      if (columnIndex !== undefined) {
        i = columnIndex;
        iL = columnIndex + 1;

        //if(iL >= columns.length){
        if(iL > columns.length){
          return;
        }
      }

      for (; i < iL; i++) {
        var column = columns[i];

        switch (column.type) {
          case 'string':
          case 'number':
          case 'combo':
          case 'action':
          case 'text':
          case 'date':
          case 'currency':
            me.renderUniversal(i, rowIndex);
            break;
          case 'tree':
            me.renderTree(i, rowIndex);
            break;
          case 'order':
            me.renderOrder(i, rowIndex);
            break;
          case 'expand':
            me.renderExpand(i, rowIndex);
            break;
          case 'select':
            me.renderSelect(i, rowIndex);
            break;
          case 'color':
            me.renderColor(i, rowIndex);
            break;
          case 'checkbox':
            me.renderCheckbox(i, rowIndex);
            break;
          case 'switcher':
            me.renderCheckbox(i, rowIndex, true);
            break;
          case 'image':
            me.renderImage(i, rowIndex);
            break;
          case 'sparklineline':
            me.renderSparkLine(i, rowIndex, 'line');
            break;
          case 'sparklinebar':
            me.renderSparkLine(i, rowIndex, 'bar');
            break;
          case 'sparklinetristate':
            me.renderSparkLine(i, rowIndex, 'tristate');
            break;
          case 'sparklinediscrete':
            me.renderSparkLine(i, rowIndex, 'discrete');
            break;
          case 'sparklinebullet':
            me.renderSparkLine(i, rowIndex, 'bullet');
            break;
          case 'sparklinepie':
            me.renderSparkLine(i, rowIndex, 'pie');
            break;
          case 'sparklinebox':
            me.renderSparkLine(i, rowIndex, 'box');
            break;
          case 'circle':
            me.renderCircle(i, rowIndex);
            break;
          case 'progressdonut':
            me.renderProgressDonut(i, rowIndex);
            break;
          case 'progressbar':
            me.renderProgressBar(i, rowIndex);
            break;
          case 'hbar':
            me.renderHBar(i, rowIndex);
            break;
          case 'grossloss':
            me.renderGrossLoss(i, rowIndex);
            break;
          case 'rowdrag':
            me.renderRowDrag(i, rowIndex);
            break;
          default:
            throw new Error('[FancyGrid error] - not existed column type ' + column.type);
        }

        if(column.select){
          me.renderSelect(i, rowIndex, true);
        }

        if(column.rowdrag){
          me.renderRowDrag(i, rowIndex, true);
        }
      }

      me.removeNotUsedCells();
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderUniversal: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        lang = w.lang,
        emptyValue = w.emptyValue,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        currencySign = lang.currencySign,
        isComplexInner = false;

      if(column.select){
        isComplexInner = true;
      }

      if(column.rowdrag){
        isComplexInner = true;
      }

      if (column.index !== undefined) {
        key = column.index;
      }
      else {
        key = column.type === 'action' ? 'none' : undefined;
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var infiniteScrolledToRow = 0;
      if(w.infinite){
        infiniteScrolledToRow = s.infiniteScrolledToRow;
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if(jL > numOfVisibleCells){
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        if(w.infinite){
          var rowData = s.dataView[j + infiniteScrolledToRow],
            cell = cellsDom.item(j);

          if(rowData === undefined){
            w.el.select('.' + GRID_CELL_CLS + '[index="'+j+'"]').css('visibility', 'hidden');
            break;
          }
          else {
            if(cell.css('visibility') === 'hidden'){
              w.el.select('.' + GRID_CELL_CLS + '[index="'+j+'"]').css('visibility', '');
              break;
            }
          }
        }

        var data = s.get(j),
          id = s.getId(j + infiniteScrolledToRow),
          inner = cellsDomInner.item(j),
          cell = cellsDom.item(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j + infiniteScrolledToRow),
            inner: inner,
            cell: cell
          },
          value,
          dirty = false;

        if (s.changed[o.id] && s.changed[o.id][column.index]) {
          dirty = true;
        }

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j + infiniteScrolledToRow, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        switch (column.type) {
          case 'currency':
            if (value !== '') {
              value = currencySign + value;
            }
            o.value = value;
            break;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        switch (value) {
          case '':
          case undefined:
            value = emptyValue;
            break;
        }

        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        if (dirty && w.dirtyEnabled) {
          me.enableCellDirty(cell);
        }

        cell.css(o.style);

        if(isComplexInner){
          var complexInner = [];
          if(column.rowdrag){
            complexInner.push('<div class="fancy-grid-cell-inner-rowdrag"></div>');
          }

          if(column.select){
            complexInner.push('<div class="fancy-grid-cell-inner-select"></div>');
          }
          else{
            if(column.rowdrag){
              complexInner.push('<div class="fancy-grid-cell-inner-rowdrag-fix"></div>');
            }
          }

          var innerText = inner.select('.fancy-grid-cell-inner-text');
          if(innerText.length){
            innerText.update(value);
          }
          else {
            complexInner.push('<div class="fancy-grid-cell-inner-text">' + value + '</div>');
            inner.update(complexInner.join(' '));
          }
        }
        else if (!o.column.widget) {
          inner.update(value);
        }

        if(o.column.autoHeight){
          cell.css('height', '');
          var cellHeight = parseInt(cell.css('height')) + 4;

          if(cellHeight < w.cellHeight){
            cellHeight = w.cellHeight;
          }

          w.rowheight.add(id, cellHeight);
        }
      }
    },
    /*
     * @param {Number} i
     */
    renderOrder: function (i) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j = 0,
        jL = s.getLength(),
        plusValue = 0;

      if (w.paging) {
        plusValue += s.showPage * s.pageSize;
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }

        plusValue = s.infiniteScrolledToRow;
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          },
          value = j + 1 + plusValue;

        o.value = value;

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        var cell = cellsDom.item(j);
        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        cell.css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     * @param {Boolean} [complex]
     */
    renderRowDrag: function (i, rowIndex, complex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j = 0,
        jL = s.getLength();

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          },
          value = '<svg class="'+GRID_ROW_DRAG_EL_CLS+'" style="opacity: 0;" viewBox="0 0 6 14"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2h2V0H0v2zm0 4h2V4H0v2zm0 3.999h2V8H0v1.999zM0 14h2v-2H0v2zM4 0v2h2V0H4zm0 6h2V4H4v2zm0 3.999h2V8H4v1.999zM4 14h2v-2H4v2z"></path></svg>';

        o.value = value;

        var cell = cellsDom.item(j);
        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        cell.css(o.style);
        if(complex){
          var renderTo = cellsDomInner.item(j).select('.fancy-grid-cell-inner-rowdrag').item(0);
          renderTo.update(value);
        }
        else {
          cellsDomInner.item(j).update(value);
        }
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderTree: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        key = column.index;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var cellInnerEl = cellsDomInner.item(j),
          dataItem = w.get(j),
          value = dataItem.get(key),
          deep = Number(dataItem.get('$deep')) - 1,
          expanderCls = 'fancy-grid-tree-expander';

        if(dataItem.get('leaf')){
          expanderCls = 'fancy-grid-tree-expander-leaf';
        }

        if(dataItem.get('expanded')){
          expanderCls += ' fancy-grid-tree-expander-expanded';
        }

        var marginLeft = deep * 15;
        var nodeImg = '';

        if(column.render){
          var o = column.render({
            item: dataItem,
            data: dataItem.data,
            deep: deep,
            leaf: dataItem.get('leaf'),
            rowIndex: rowIndex,
            column: column,
            value: value
          });

          if(o.nodeImgCls){
            nodeImg = '<span class="fancy-grid-tree-expander-node '+(o.nodeImgCls)+'"></span>';
          }

          if(o.value !== undefined){
            value = o.value;
          }
        }


        if(column.folder){
          var leaf = dataItem.get('leaf'),
            expanded = dataItem.get('expanded');

          if(leaf){
            nodeImg = '<span class="fancy-grid-tree-folder-file"></span>';
          }
          else{
            if(expanded){
              nodeImg = '<span class="fancy-grid-tree-folder-opened"></span>';
            }
            else{
              nodeImg = '<span class="fancy-grid-tree-folder-closed"></span>';
            }
          }
        }

        if(dataItem.get('leaf')){
          marginLeft -= 8;
        }

        var cellInner = [];

        cellInner.push('<span class="' + expanderCls + '" style="margin-left: ' + marginLeft + 'px;"></span>');
        if(column.select){
          cellInner.push('<span class="fancy-grid-cell-inner-select" style="margin-left: 6px;"></span>');
        }
        cellInner.push(nodeImg);
        cellInner.push('<span class="fancy-grid-tree-expander-text">' + value + '</span>');

        cellInnerEl.update(cellInner.join(''));
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderExpand: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var cellInnerEl = cellsDomInner.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          dataItem = w.get(j),
          dataItemId = dataItem.id;

        if (isCheckBoxInside === false) {
          cellsDomInner.item(j).update('');

          checkBox = new F.CheckBox({
            renderTo: cellsDomInner.item(j).dom,
            renderId: true,
            value: false,
            label: false,
            expander: true,
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              change: function (checkbox, value) {
                rowIndex = checkbox.el.parent().parent().attr('index');

                if (value) {
                  w.expander.expand(rowIndex);
                }
                else {
                  w.expander.collapse(rowIndex);
                }
              }
            }]
          });
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);

          if (w.expander._expandedIds[dataItemId]) {
            checkBox.set(true, false);
          }
          else {
            checkBox.set(false, false);
          }
        }

        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          };

        if(column.render){
          if(column.render(o).hidden === true){
            checkBox.hide();
          }
          else{
            checkBox.show();
          }
        }
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    clearCls: function (cell) {
      var w = this.widget;

      F.each(w.cellStylingCls, function (cls) {
        cell.removeCls(cls);
      });
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderColor: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        o.value = value;

        var cell = cellsDom.item(j);
        cell.css(o.style);

        var cellInner = cell.select('.' + GRID_CELL_INNER_CLS);
        cellInner.update('<div class="fancy-grid-color-cell" style="background: ' + value + ';"></div>');
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCombo: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          o = {
            rowIndex: j,
            value: value,
            style: {}
          };

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCheckbox: function (i, rowIndex, isSwitcher) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        widgetName = 'CheckBox';

      if(isSwitcher){
        widgetName = 'Switcher';
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          value = s.get(j, key),
          cellInnerEl = cellsDomInner.item(j),
          cell = cellsDom.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          dirty = false,
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j),
            value: value
          };

        if (s.changed[o.id] && s.changed[o.id][column.index]) {
          dirty = true;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (isCheckBoxInside === false) {
          if (!o.stopped) {
            var editable = true;

            if (w.rowEdit) {
              editable = false;
            }

            cellsDomInner.item(j).update('');

            new F[widgetName]({
              renderTo: cellsDomInner.item(j).dom,
              renderId: true,
              value: value,
              label: false,
              editable: editable,
              style: {
                padding: '0px',
                display: 'inline-block'
              },
              events: [{
                beforechange: function (checkbox) {
                  if (column.index === '$selected' || column.select) {
                    return;
                  }

                  if (column.editable !== true) {
                    checkbox.canceledChange = true;
                  }
                }
              }, {
                change: function (checkbox, value) {
                  if (column.index === '$selected' || column.select) {
                    return;
                  }

                  w.celledit.checkBoxChangedValue = value;
                }
              }]
            });
          }
          else {
            cellsDomInner.item(j).update(value);
          }
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);
          if (o.stopped) {
            checkBox.destroy();
            cellsDomInner.item(j).update(value);
          }
          else {
            checkBox.set(value, false);
          }
        }

        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        cell.css(o.style);

        if (dirty && w.dirtyEnabled) {
          var cell = cellsDom.item(j);
          me.enableCellDirty(cell);
        }
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     * @param {Boolean} [complex]
     */
    renderSelect: function (i, rowIndex, complex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var item,
          value = false,
          id = s.get(j, 'id'),
          cellInnerEl = cellsDomInner.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          editable = true;

        if (w.selection.memory) {
          if (w.selection.memory.all && !w.selection.memory.excepted[id]) {
            value = true;
            w.selection.domSelectRow(j);
          }
          else if (w.selection.memory.has(id)) {
            value = true;
            w.selection.domSelectRow(j);
          }
          else {
            value = false;
            w.selection.domDeSelectRow(j);
          }

          if(s.isTree){
            item = s.getItem(j);
            var $selected = item.get('$selected');

            if($selected){
              var recurseSelect = function (childs) {
                F.each(childs, function (child) {
                  if(!child.fields){
                    return;
                  }

                  if(child.get('$selected') === false){
                    w.selection.memory.remove(child.id);
                    return;
                  }

                  item.set('$selected', undefined);
                  child.set('$selected', true);
                  w.selection.memory.add(child.id);

                  if(child.data.child && child.data.child[0] && child.data.child[0].fields){
                    recurseSelect(child.data.child);
                  }
                });
              };

              recurseSelect(item.data.child);
            }
            else if($selected === false){
              /*
              F.each(item.data.child, function (child) {
                if(!child.fields){
                  return;
                }

                child.set('$selected', false);
                w.selection.memory.remove(child.id);
              });
              */
            }
          }
        }
        else{
          if(cellInnerEl.parent().hasClass(GRID_CELL_SELECTED_CLS)){
            value = true;
          }
        }

        if(column.type !== 'select' && !column.select){
          continue;
        }

        if(w.selection.disabled){
          editable = false;
        }

        if (isCheckBoxInside === false) {
          var renderTo = cellsDomInner.item(j);

          if(complex){
            renderTo = renderTo.select('.fancy-grid-cell-inner-select').item(0).dom;
            if(!Fancy.isBoolean(value)) {
              value = false;
            }
          }
          else{
            cellsDomInner.item(j).update('');
            renderTo = renderTo.dom;
          }

          var checkBoxConfig = {
            renderTo: renderTo,
            renderId: true,
            value: value,
            label: false,
            stopIfCTRL: true,
            editable: editable,
            disabled: !editable,
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              beforechange: function (field) {
                if(w.selection.stopOneTick) {
                  field.canceledChange = true;
                }
              }
            }]
          };

          var checkBox = new F.CheckBox(checkBoxConfig);

          if(s.isTree && w.selection.memory){
            if(w.selection.memory.tree.selected[id] && !w.selection.memory.tree.allSelected[id] && item){
              var child = item.get('child');
              if(child && child.length){
                checkBox.setMiddle(true);
              }
            }
          }
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);
          checkBox.set(value, false);
        }
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderImage: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          data = s.get(j),
          o = {
            rowIndex: j,
            value: value,
            data: data,
            style: {}
          },
          attr = '';

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (o.attr) {
          for (var p in o.attr) {
            attr += p + '="' + o.attr[p] + '"';
          }
        }

        value = '<img ' + attr + ' src="' + o.value + '">';

        cellsDom.item(j).css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     * @param {String} type
     */
    renderSparkLine: function (i, rowIndex, type) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columnWidth = column.width,
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        _sparkConfig = column.sparkConfig || {};

      columnDom.addCls(GRID_COLUMN_SPARKLINE_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkHeight = cellHeight - 1,
        sparkWidth = columnWidth - 20,
        widthName;

      switch (type) {
        case 'line':
        case 'pie':
        case 'box':
          widthName = 'width';
          break;
        case 'bullet':
          widthName = 'width';
          sparkHeight -= 11;
          columnDom.addCls(GRID_COLUMN_SPARKLINE_BULLET_CLS);
          break;
        case 'discrete':
          widthName = 'width';
          sparkWidth = columnWidth;
          sparkHeight -= 2;
          break;
        case 'bar':
        case 'tristate':
          widthName = 'barWidth';
          break;
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          data = s.get(j),
          o = {
            rowIndex: j,
            value: value,
            data: data,
            style: {}
          };

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (F.isArray(column.values)) {
          var k = 0,
            kL = column.values.length;

          value = [];

          for (; k < kL; k++) {
            value.push(s.get(j, column.values[k]));
          }
        }

        cellsDom.item(j).css(o.style);
        var innerDom = cellsDomInner.item(j).dom,
          sparkConfig = {
            type: type,
            fillColor: 'transparent',
            height: sparkHeight
          };

        F.apply(sparkConfig, _sparkConfig);

        if (type === 'bar' || type === 'tristate') {
          sparkWidth = columnWidth - 20;
          sparkWidth = sparkWidth / value.length;
        }

        sparkConfig[widthName] = sparkWidth;

        F.$(innerDom).sparkline(value, sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderProgressDonut: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      columnDom.addCls(GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);
        var sparkConfig = column.sparkConfig || {},
          renderTo = cellsDomInner.item(j).dom;

        F.apply(sparkConfig, {
          renderTo: renderTo,
          value: value
        });

        if (!sparkConfig.size && !sparkConfig.height && !sparkConfig.width) {
          sparkConfig.size = w.cellHeaderHeight - 3 * 2;
        }

        F.get(renderTo).update('');

        new F.spark.ProgressDonut(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderGrossLoss: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      columnDom.addCls(GRID_COLUMN_GROSSLOSS_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkConfig = column.sparkConfig || {};

      if (sparkConfig.showOnMax) {
        sparkConfig.maxValue = Math.max.apply(Math, s.getColumnData(key, column.smartIndexFn));
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          column: column
        });

        new F.spark.GrossLoss(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderProgressBar: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        maxValue = 100;

      columnDom.addCls(GRID_COLUMN_PROGRESS_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkConfig = column.sparkConfig || {};
      if (sparkConfig.percents === false) {
        maxValue = Math.max.apply(Math, s.getColumnData(key));
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        var _renderTo = F.get(cellsDomInner.item(j).dom);

        if (_renderTo.select('.' + GRID_COLUMN_PROGRESS_BAR_CLS).length) {
          var spark = F.getWidget(_renderTo.select('.' + GRID_COLUMN_PROGRESS_BAR_CLS).item(0).attr('id'));
          spark.value = value;
          spark.maxValue = maxValue;
          spark.update();
          continue;
        }

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          column: column,
          maxValue: maxValue
        });

        new F.spark.ProgressBar(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderHBar: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        sparkConfig = column.sparkConfig || {},
        disabled = column.disabled || {};

      columnDom.addCls(GRID_COLUMN_H_BAR_CLS);

      var values = {},
        i = 0,
        iL,
        kL,
        maxItemValue = Number.MIN_VALUE;

      if (F.isArray(column.index)) {
        iL = column.index.length;
        for (; i < iL; i++) {
          var _key = column.index[i];

          if (disabled[_key]) {
            continue;
          }

          values[_key] = s.getColumnData(_key);

          var _maxItemValue = Math.max.apply(Math, values[_key]);
          if (_maxItemValue > maxItemValue) {
            maxItemValue = _maxItemValue;
          }

          kL = values[_key].length;
        }
      }
      else {
        var data = s.getColumnData(column.index),
          fields = [];

        iL = data.length;

        for (; i < iL; i++) {
          var n = 0,
            nL = data[i].length;

          for (; n < nL; n++) {
            if (disabled[n]) {
              continue;
            }

            values[n] = values[n] || [];
            values[n].push(data[i][n]);
          }
        }

        for (var p in values) {
          var _maxItemValue = Math.max.apply(Math, values[p]);
          fields.push(p);

          if (_maxItemValue > maxItemValue) {
            maxItemValue = _maxItemValue;
          }

          kL = values[p].length;
        }

        if (!column.fields) {
          column.fields = fields;
        }
      }

      var sum = [],
        k = 0;

      for (; k < kL; k++) {
        sum[k] = 0;
        for (var p in values) {
          if (column.fields && disabled[column.index + '.' + p]) {
            continue;
          }
          else if (disabled[p]) {
            continue;
          }

          sum[k] += values[p][k];
        }
      }

      var maxValue = Math.max.apply(Math, sum);

      sparkConfig.maxItemValue = maxItemValue;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        var _renderTo = F.get(cellsDomInner.item(j).dom);

        if (_renderTo.select('.fancy-spark-hbar').length) {
          var spark = F.getWidget(_renderTo.select('.fancy-spark-hbar').item(0).attr('id'));
          spark.maxValue = maxValue;
          spark.maxItemValue = maxItemValue;
          spark.update(data);
          continue;
        }

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          data: data,
          column: column,
          maxValue: maxValue,
          height: w.cellHeight - 1
        });

        new F.spark.HBar(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCircle: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        cellHeight = w.cellHeight - 4;

      columnDom.addCls(GRID_COLUMN_CHART_CIRCLE_CLS);

      function pieChart(percentage, size) {
        //http://jsfiddle.net/da5LN/62/

        var svgns = "http://www.w3.org/2000/svg";
        var chart = document.createElementNS(svgns, "svg:svg");
        chart.setAttribute("width", size);
        chart.setAttribute("height", size);
        chart.setAttribute("viewBox", "0 0 " + size + " " + size);

        var back = document.createElementNS(svgns, "circle");
        back.setAttributeNS(null, "cx", size / 2);
        back.setAttributeNS(null, "cy", size / 2);
        back.setAttributeNS(null, "r", size / 2);
        var color = "#F0F0F0";
        if (size > 50) {
          color = "F0F0F0";
        }

        if (percentage < 0) {
          color = '#F9DDE0';
        }

        back.setAttributeNS(null, "fill", color);
        chart.appendChild(back);

        var path = document.createElementNS(svgns, "path");
        var unit = (Math.PI * 2) / 100;
        var startangle = 0;
        var endangle = percentage * unit - 0.001;
        var x1 = (size / 2) + (size / 2) * Math.sin(startangle);
        var y1 = (size / 2) - (size / 2) * Math.cos(startangle);
        var x2 = (size / 2) + (size / 2) * Math.sin(endangle);
        var y2 = (size / 2) - (size / 2) * Math.cos(endangle);
        var big = 0;
        if (endangle - startangle > Math.PI) {
          big = 1;
        }
        var d = "M " + (size / 2) + "," + (size / 2) +
          " L " + x1 + "," + y1 +
          " A " + (size / 2) + "," + (size / 2) +
          " 0 " + big + " 1 " +
          x2 + "," + y2 +
          " Z";

        path.setAttribute("d", d); // Set this path
        if (percentage < 0) {
          path.setAttribute("fill", '#EA7369');
        }
        else {
          path.setAttribute("fill", '#44A4D3');
        }
        chart.appendChild(path);

        var front = document.createElementNS(svgns, "circle");
        front.setAttributeNS(null, "cx", (size / 2));
        front.setAttributeNS(null, "cy", (size / 2));
        front.setAttributeNS(null, "r", (size * 0.25));
        front.setAttributeNS(null, "fill", "#fff");
        chart.appendChild(front);
        return chart;
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      if(w.infinite) {
        var numOfVisibleCells = w.getNumOfVisibleCells();

        if (jL > numOfVisibleCells) {
          jL = numOfVisibleCells
        }
      }

      for (; j < jL; j++) {
        var value,
          data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {}
          };

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        var innerDom = cellsDomInner.item(j).dom;

        if (innerDom.innerHTML === '') {

          innerDom.appendChild(pieChart(value, cellHeight));
        }
      }
    },
    /*
     *
     */
    removeNotUsedCells: function () {
      var me = this,
        w = me.widget,
        store = w.store,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS),
        i = 0,
        iL = columnsDom.length;

      for (; i < iL; i++) {
        var columnDom = columnsDom.item(i),
          cellsDom = columnDom.select('.' + GRID_CELL_CLS),
          j = store.getLength(),
          jL = cellsDom.length;

        for (; j < jL; j++) {
          cellsDom.item(j).remove();
        }
      }
    },
    /*
     * @param {String|Object} format
     * @return {Function|String|Object}
     */
    getFormat: function (format) {
      var me = this,
        w = me.widget,
        lang = w.lang;

      switch (format) {
        case 'number':
          return function (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang.thousandSeparator);
          };
        case 'date':
          return function (value) {
            var date = F.Date.parse(value, lang.date.read, format.mode);
            value = F.Date.format(date, lang.date.write, format.mode);

            return value;
          };
      }

      switch (format.type) {
        case 'date':
          return function (value) {
            if (!value || value.length === 0) {
              return '';
            }
            var date = F.Date.parse(value, format.read, format.mode);
            value = F.Date.format(date, format.write, undefined, format.mode);


            return value;
          };
      }

      if (format.inputFn) {
        return format.inputFn;
      }
    },
    /*
     * @param {String} value
     * @param {*} format
     * @return {String}
     */
    format: function (value, format) {
      switch (F.typeOf(format)) {
        case 'string':
          value = this.getFormat(format)(value);
          break;
        case 'function':
          value = format(value);
          break;
        case 'object':
          if (format.inputFn) {
            value = format.inputFn(value);
          }
          else {
            value = this.getFormat(format)(value);
          }

          break;
      }

      return value;
    },
    /*
     * @param {Fancy.Element} cell
     */
    enableCellDirty: function (cell) {
      if (cell.hasCls(GRID_CELL_DIRTY_CLS)) {
        return;
      }

      cell.addCls(GRID_CELL_DIRTY_CLS);
      cell.append('<div class="' + GRID_CELL_DIRTY_EL_CLS + '"></div>');
    },
    /*
     * @param {Number} rowIndex
     */
    clearDirty: function (rowIndex) {
      var me = this;

      if (rowIndex !== undefined) {
        me.el.select('.' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .' + GRID_CELL_DIRTY_EL_CLS).destroy();
        me.el.select('.' + GRID_CELL_DIRTY_CLS + '[index="' + rowIndex + '"]').removeCls(GRID_CELL_DIRTY_CLS);
        return;
      }

      me.el.select('.' + GRID_CELL_DIRTY_EL_CLS).destroy();
      me.el.select('.' + GRID_CELL_DIRTY_CLS).removeCls(GRID_CELL_DIRTY_CLS);
    },
    /*
     *
     */
    showEmptyText: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      if (me.side !== 'center') {
        return;
      }

      if (me.emptyTextEl) {
        me.emptyTextEl.destroy();
        delete me.emptyTextEl;
      }

      if (s.dataView.length === 0) {
        var el = F.get(document.createElement('div'));

        el.addCls(GRID_EMPTY_CLS);
        el.update(w.emptyText);

        me.emptyTextEl = F.get(me.el.dom.appendChild(el.dom));
      }
    }
  };

})();