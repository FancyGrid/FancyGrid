/*
 * @class Fancy.grid.plugin.RowDragDrop
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;
  var GRID_ROW_DRAG_EL_CLS = F.GRID_ROW_DRAG_EL_CLS;

  F.define('Fancy.grid.plugin.RowDragDrop', {
    extend: F.Plugin,
    ptype: 'grid.rowdragdrop',
    inWidgetName: 'rowdragdrop',
    dropOK: false,
    cellMaskCls: 'fancy-drop-cell-mask',
    cellFirstRowMaskCls: 'fancy-drop-cell-first-mask',
    dropZoneCls: 'fancy-drop-zone-active',
    dropOkCls: 'fancy-drop-ok',
    dropNotOkCls: 'fancy-drop-not-ok',
    droppable: true,
    dropZoneOverClass: GRID_BODY_CLS,
    tipShown: false,
    /*
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
      me.addEvents('drop');
      me.ons();
      me.initDropCls();
      me.initEnterLeave();

      //me.disableSelectionMove();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.on('beforecellmousedown', me.onBeforeCellMouseDown, me);
      w.on('cellmousedown', me.onCellMouseDown, me);
      w.on('rowenter', me.onRowEnter, me);
      w.on('cellleave', me.onCellLeave, me);
      me.on('drop', me.onDrop, me);
    },
    disableSelectionMove: function () {
      var me = this,
        w = me.widget;

      w.selection.disableSelectionMove();
    },
    showTip: function (e) {
      var me = this,
        w = me.widget,
        selection = w.getSelection();

      if(selection.length === 0){
        return;
      }

      if(!me.tip){
        me.initTip();
      }

      me.updateTipText();

      if (e) {
        me.tip.show(e.pageX + 20, e.pageY + 20);
      }

      me.tipShown = true;
    },
    hideTip: function () {
      var me = this;

      if(me.tip){
        me.tip.hide();
      }

      me.tipShown = false;
    },
    onCellMouseDown: function (grid, o) {
      var me = this,
        docEl = F.get(document),
        targetEl = F.get(o.e.target),
        tagName = targetEl.dom.tagName.toLocaleLowerCase();

      if(tagName !== 'svg' && tagName !== 'path'){
        return;
      }

      me.cellMouseDown = F.get(o.cell);
      docEl.once('mouseup', me.onDocMouseUp, me);
    },
    onDocMouseUp: function (e) {
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = false;
      me.mouseDownDragEl = false;
      delete me.tipValue;

      if(me.tipShown) {
        docEl.un('mousemove', me.onDocMouseMove);
        me.hideTip();
        me.clearCellsMask();
        if(me.dropOK){
          me.fire('drop');
        }
        me.tipShown = false;
      }

      if(w.selection){
        setTimeout(function () {
          w.selection.clearOverCells();
        }, 1);
        w.enableSelection();
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onRowEnter: function (grid, o) {
      var me = this,
        w = me.widget,
        selected = w.getSelection();

      if (!me.cellMouseDown || selected.length === 0 || !me.tipShown) {
        return;
      }

      if(o.rowIndex !== 0){
        var prevRowIndex = o.rowIndex - 1;

        if(w.body.getCell(prevRowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS)){
          me.dropOK = false;

          me.clearCellsMask();
          delete me.activeRowIndex;
          return;
        }
        else{
          if(w.body.getCell(o.rowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS) && selected.length === 1){
            me.dropOK = false;

            me.clearCellsMask();
            delete me.activeRowIndex;
            return;
          }
          else {
            if(selected.length > 1){
              var rowsGoOneByOne = true,
                prevRowIndex;

              F.each(selected, function (item) {
                if(prevRowIndex === undefined){
                  prevRowIndex = w.getRowById(item.id);
                  return;
                }

                var rowIndex = w.getRowById(item.id);
                if(prevRowIndex !== rowIndex - 1){
                  rowsGoOneByOne = false;
                  return true;
                }
                prevRowIndex = rowIndex;
              });

              if(rowsGoOneByOne && w.body.getCell(o.rowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS)){
                me.dropOK = false;

                me.clearCellsMask();
                delete me.activeRowIndex;
                return;
              }
            }
            me.dropOK = true;
          }
        }

        var prevItem = w.get(prevRowIndex);
        me.insertItem = prevItem;
      }
      else{
        if(w.body.getCell(o.rowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS)){
          if(selected.length > 1){
            var rowsGoOneByOne = true,
              prevRowIndex;

            F.each(selected, function (item) {
              if(prevRowIndex === undefined){
                prevRowIndex = w.getRowById(item.id);
                return;
              }

              var rowIndex = w.getRowById(item.id);
              if(prevRowIndex !== rowIndex - 1){
                rowsGoOneByOne = false;
                return true;
              }
              prevRowIndex = rowIndex;
            });

            if(rowsGoOneByOne && w.body.getCell(o.rowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS)){
              me.dropOK = false;

              me.clearCellsMask();
              delete me.activeRowIndex;
              return;
            }

            me.dropOK = true;
          }
          else{
            me.dropOK = false;

            me.clearCellsMask();
            delete me.activeRowIndex;
            return;
          }
        }
        else {
          me.dropOK = true;
        }

        me.insertItem = 0;
      }

      var memory = w.selection.memory;
      if(memory && memory.all && memory.exceptedLength === 0){
        me.dropOK = false;
        delete me.activeRowIndex;
        return;
      }

      me.activeRowIndex = o.rowIndex;
      me.showCellsDropMask();
    },
    onCellLeave: function (grid, params) {
      var me = this,
        docEl = F.get(document),
        cell = F.get(params.cell);

      if(!me.cellMouseDown){
        return;
      }

      if(me.tipShown){
        return;
      }

      if(!cell.hasClass(GRID_CELL_SELECTED_CLS)){
        return;
      }

      if(!me.tip){
        me.initTip();
      }

      me.updateTipText();
      me.showTip(params.e);

      docEl.on('mousemove', me.onDocMouseMove, me);
      //docEl.on('mouseup', me.onDocMouseUp, me);
    },
    /*
     * @param {String} text
     * @param {Object} e
     */
    initTip: function () {
      var me = this,
        dropNotOkCls = me.dropNotOkCls;

      if (!me.tip) {
        me.tip = new F.ToolTip({
          cls: dropNotOkCls,
          text: ''
        });
      }
    },
    updateTipText: function () {
      var me = this,
        w = me.widget,
        lang = w.lang,
        selection = w.getSelection(),
        text = F.String.format(lang.dragText, [selection.length, selection.length > 1 ? 's' : '']);

      if(me.tipValue && selection.length === 1){
        text = me.tipValue;
      }

      me.tip.update(text);
      if(selection.length && me.dropOK != false) {
        me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
      }
      else{
        me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
      }
    },
    onDocMouseMove: function (e) {
      var me = this;

      if(me.cellMouseDown && me.cellMouseDown.hasClass(GRID_CELL_SELECTED_CLS)){
        me.showTip(e);
      }
      else{
        me.hideTip();
      }
    },
    showCellsDropMask: function () {
      var me = this,
        w = me.widget,
        rowIndex = me.activeRowIndex - 1;

      me.clearCellsMask();
      if(rowIndex === -1){
        w.el.select('.' + GRID_CELL_CLS + '[index="' + 0 + '"]').addCls(me.cellFirstRowMaskCls);
      }
      else {
        w.el.select('.' + GRID_CELL_CLS + '[index="' + rowIndex + '"]').addCls(me.cellMaskCls);
      }
    },
    clearCellsMask: function () {
      var me = this,
        w = me.widget;

      w.el.select('.' + me.cellMaskCls).removeCls(me.cellMaskCls);
      w.el.select('.' + me.cellFirstRowMaskCls).removeCls(me.cellFirstRowMaskCls);
    },
    onDrop: function () {
      var me = this,
        w = me.widget,
        selection = w.getSelection(),
        rowIndex;

      w.draggingRows = true;

      if(!w.selection.memory){
        w.clearSelection();
      }

      w.remove(selection, null, false);
      //TODO: If raw is selected that it can not detect row
      if(me.insertItem === 0){
        rowIndex = 0;
      }
      else{
        rowIndex = w.getRowById(me.insertItem.id) + 1;
      }

      w.insert(rowIndex, selection, false);
      w.store.changeDataView();
      w.update();
      if(!w.selection.memory){
        F.each(selection, function (item) {
          var rowIndex = w.getRowById(item.id);
          w.flashRow(rowIndex);
        });
      }
      w.fire('dragrows', selection);
      delete w.draggingRows;
      w.enableSelection();
    },
    onBeforeCellMouseDown: function (el, o) {
      var me = this,
        docEl = Fancy.get(document),
        w = me.widget,
        targetEl = F.get(o.e.target);

      if(o.column.type !== 'rowdrag' && !o.column.rowdrag){
        return;
      }

      if(o.column.rowdrag){
        me.tipValue = o.value;
      }

      if(o.column.type === 'rowdrag' || o.column.rowdrag){
        if(targetEl.dom.tagName.toLocaleLowerCase() === 'svg' || targetEl.parent().dom.tagName.toLocaleLowerCase() === 'svg'){
          if(!Fancy.get(o.cell).hasClass(GRID_CELL_SELECTED_CLS)){
            if(w.selection.row){
              w.selectRow(o.rowIndex);
            }
            else if(w.selection.rows){
              w.selectRow(o.rowIndex, true, true);
            }
          }

          me.mouseDownDragEl = true;
          docEl.once('mousemove', function (e) {
            me.showTip(e);
            docEl.on('mousemove', me.onDocMouseMove, me);
          });
          w.stopSelection();
        }
      }
    },
    /*
     *
     */
    initDropCls: function () {
      var me = this,
        w = me.widget;

      var dropCls = '#' + w.id + ' .' + me.dropZoneOverClass;

      me.dropCls = dropCls;
    },
    /*
     *
     */
    initEnterLeave: function () {
      var me = this,
        dropEl = F.select(me.dropCls);

      if (dropEl.length === 0) {
        setTimeout(function () {
          me.initEnterLeave();
        }, 500);
        return;
      }

      dropEl.on('mouseleave', me.onMouseLeaveDropGroup, me);
    },
    onMouseLeaveDropGroup: function () {
      var me = this;

      me.dropOK = false;
      me.clearCellsMask();
    }
  });

})();