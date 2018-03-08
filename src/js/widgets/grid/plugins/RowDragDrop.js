/*
 * @class Fancy.grid.plugin.RowDragDrop
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CLS = F.GRID_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
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
    constructor: function (config) {
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

      me.disableSelectionMove();
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
        w = me.widget;

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
    },
    onCellMouseDown: function () {
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = true;
      docEl.once('mouseup', me.onDocMouseUp, me);
    },
    onDocMouseUp: function (e) {
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = false;
      me.mouseDownDragEl = false;
      w.enableSelection();

      if(me.tipShown) {
        docEl.un('mousemove', me.onDocMouseMove);
        me.hideTip();
        me.clearCellsMask();
        me.fire('drop');
        me.tipShown = false;
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

      if (me.cellMouseDown !== true || selected.length === 0) {
        return;
      }

      me.activeRowIndex = o.rowIndex;
      me.showCellsDropMask();
    },
    onCellLeave: function (grid, params) {
      var me = this,
        docEl = F.get(document);

      if(!me.cellMouseDown){
        return;
      }

      if(me.tipShown){
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

      me.tip.update(text);
      if(selection.length) {
        me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
      }
      else{
        me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
      }
    },
    onDocMouseMove: function (e) {
      var me = this;

      me.showTip(e);
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
        rowIndex = me.activeRowIndex,
        item = w.get(rowIndex);

      w.clearSelection();

      w.remove(selection);
      //TODO: If raw is selected that it can not detect row
      rowIndex = w.getRowById(item.id);
      w.insert(rowIndex, selection);
      F.each(selection, function (item) {
        var rowIndex = w.getRowById(item.id);
        w.flashRow(rowIndex);
      });
    },
    onBeforeCellMouseDown: function (el, o) {
      var me = this,
        docEl = Fancy.get(document),
        w = me.widget,
        selected = w.getSelection();

      if(o.column.type === 'select'){
        return;
      }

      if(o.column.type === 'rowdrag'){
        me.mouseDownDragEl = true;
        docEl.once('mousemove', function (e) {
          me.showTip(e);
          docEl.on('mousemove', me.onDocMouseMove, me);
        });
      }

      if (selected.length > 1) {
        w.stopSelection();
      }
    }
  });

})();