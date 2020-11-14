/*
 * @class Fancy.grid.plugin.GridToGrid
 * @extends Fancy.Plugin
 */
Fancy.modules['dd'] = true;
(function(){
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CLS = F.GRID_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

  F.define('Fancy.grid.plugin.GridToGrid', {
    extend: F.Plugin,
    ptype: 'grid.dragdrop',
    inWidgetName: 'dragdrop',
    dropOK: false,
    cellMaskCls: 'fancy-drop-cell-mask',
    dropZoneCls: 'fancy-drop-zone-active',
    dropOkCls: 'fancy-drop-ok',
    dropNotOkCls: 'fancy-drop-not-ok',
    dropHeaderMaskCls: 'fancy-drop-header-mask',
    droppable: true,
    dropZoneOverClass: GRID_BODY_CLS,
    /*
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.addEvents('drop');
      me.Super('init', arguments);
      me.initDropCls();
      me.initEnterLeave();

      me.ons();
    },
    /*
     *
     */
    initDropCls: function(){
      var me = this,
        dropCls = '.' + me.dropGroup;

      dropCls += ' .' + me.dropZoneOverClass;

      me.dropCls = dropCls;
    },
    /*
     *
     */
    addDragDropCls: function(){
      this.widget.el.addCls(this.dragGroup);
    },
    /*
     *
     */
    ons: function(){
      var me = this,
        w = me.widget;

      w.on('render', function(){
        me.addDragDropCls();
      });

      if (me.dropGroup){
        w.on('beforecellmousedown', me.onBeforeCellMouseDown, me);
        w.on('cellmousedown', me.onCellMouseDown, me);
        w.on('cellleave', me.onCellLeave, me);
        w.on('cellenter', me.onCellEnter, me);
      }

      me.on('drop', me.onDropItems, me);
    },
    /*
     * @param {Object} dd
     * @param {*} items
     */
    onDropItems: function(dd, items){
      var me = this,
        w = me.widget,
        dropGrid = me.dropGrid,
        rowIndex = dropGrid.activeRowEnterIndex === undefined ? dropGrid.getViewTotal() : dropGrid.activeRowEnterIndex;

      w.fire('dropitems', items, rowIndex);
      if (me.onDrop){
        me.onDrop.apply(w, [items, rowIndex]);
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onBeforeCellMouseDown: function(grid, o){
      var me = this,
        w = me.widget,
        lang = w.lang,
        docEl = F.get(document),
        selected = w.getSelection(),
        e = o.e,
        isCTRL = e.ctrlKey;

      if (isCTRL && w.multiSelect === true){
        return;
      }

      if (selected.length > 1){
        var passed = false;

        F.each(selected, function(item){
          if (item.id === o.id){
            passed = true;
            return true;
          }
        });

        if (passed === false){
          return;
        }

        w.stopSelection();

        docEl.once('mouseup', me.onDocMouseUp, me);
        docEl.on('mousemove', me.onDocMouseMove, me);

        docEl.once('mouseup', function(){
          w.enableSelection();
        }, me);

        selected = w.getSelection();
        var text = F.String.format(lang.dragText, [selected.length, selected.length > 1 ? 's' : '']);

        me.initTip(text);

        me.dragItems = w.getSelection();

        me.cellMouseDown = true;

      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellMouseDown: function(grid, o){
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      if (w.selection.enabled === false){
        return;
      }

      var e = o.e,
        isCTRL = e.ctrlKey;

      if (isCTRL && w.multiSelect === true){
        return;
      }

      if (o.column.index === '$selected'){}
      else {
        w.clearSelection();
      }

      docEl.once('mouseup', me.onDocMouseUp, me);
      docEl.on('mousemove', me.onDocMouseMove, me);

      me.cellMouseDown = true;
      me.activeRowIndex = o.rowIndex;
    },
    /*
     *
     */
    initEnterLeave: function(){
      var me = this,
        dropEl = F.select(me.dropCls);

      if (dropEl.length === 0){
        setTimeout(function(){
          me.initEnterLeave();
        }, 500);
        return;
      }

      dropEl.on('mouseenter', me.onMouseEnterDropGroup, me);
      dropEl.on('mouseleave', me.onMouseLeaveDropGroup, me);
    },
    /*
     * @param {Object} e
     */
    onMouseEnterDropGroup: function(e){
      var me = this;

      if (!me.cellMouseDown){
        return;
      }

      var targetEl = F.get(e.currentTarget);

      me.dropGrid = F.getWidget(targetEl.closest('.' + GRID_CLS).attr('id'));

      if (me.dropGrid && me.dropGrid.dragdrop && me.dropGrid.dragdrop.droppable === false){
        me.dropOK = false;
        if (me.tip){
          me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
        }
        return;
      }

      me.setDropGridCellsMask();
      if (!me.dropGridEventInited){
        me.onsDropGrid();
      }

      targetEl.addCls(me.dropZoneCls);

      me.dropOK = true;

      if (me.tip){
        me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseLeaveDropGroup: function(e){
      var me = this;

      if (!me.cellMouseDown){
        return;
      }

      F.get(e.currentTarget).removeCls(me.dropZoneCls);

      me.dropOK = false;
      me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
      me.clearCellsMask();
    },
    /*
     *
     */
    setDropGridCellsMask: function(){
      var me = this,
        dropGrid = me.dropGrid,
        total;

      if (!dropGrid || !me.cellMouseDown){
        return;
      }

      total = dropGrid.getTotal();

      if (total === 0){
        dropGrid.el.addCls(me.dropHeaderMaskCls);
      }
      else {
        dropGrid.el.select('.' + GRID_CELL_CLS + '[index="' + (total - 1) + '"]').addCls(me.cellMaskCls);
      }
    },
    /*
     *
     */
    onsDropGrid: function(){
      var me = this;

      me.dropGrid.on('rowenter', me.onDropGridRowEnter, me);
      me.dropGrid.on('rowleave', me.onDropGridRowLeave, me);

      me.dropGridEventInited = true;
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onDropGridRowEnter: function(grid, o){
      var me = this;

      if (me.cellMouseDown === false){
        //Fix core bug. In future needs to find out what it is.
        //'un' does not unset handler
        me.dropGrid.un('rowenter', me.onDropGridRowEnter);
        me.dropGrid.un('rowleave', me.onDropGridRowLeave);
      }

      me.clearCellsMask();

      if (o.rowIndex === 0){
        grid.el.addCls(me.dropHeaderMaskCls);
      }
      else {
        grid.el.select('.' + GRID_CELL_CLS + '[index="' + (o.rowIndex - 1) + '"]').addCls(me.cellMaskCls);
      }

      if (me.cellMouseDown === false){
        me.clearCellsMask();
      }

      if (me.dropGrid){
        me.dropGrid.activeRowEnterIndex = o.rowIndex;
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onDropGridRowLeave: function(){
      var me = this;

      me.clearCellsMask();
      me.setDropGridCellsMask();

      if (me.dropGrid){
        delete me.dropGrid.activeRowEnterIndex;
      }
    },
    clearCellsMask: function(){
      var me = this,
        cellMaskCls = me.cellMaskCls;

      if (!me.dropGrid){
        return;
      }

      me.dropGrid.el.removeCls(me.dropHeaderMaskCls);
      me.dropGrid.el.select('.' + cellMaskCls).removeCls(cellMaskCls);
    },
    /*
     * @param {Object} e
     */
    onDocMouseUp: function(){
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = false;
      if (me.tip){
        me.tip.hide();
      }
      w.enableSelection();

      docEl.un('mousemove', me.onDocMouseMove);

      if (me.dropOK === true){
        w.clearSelection();
        me.dropGrid.clearSelection();
        me.fire('drop', me.dragItems);
      }

      delete me.dragItems;
      me.dropOK = false;

      F.select('.' + me.dropZoneCls).removeCls(me.dropZoneCls);

      me.clearCellsMask();

      if (me.dropGrid){
        me.dropGrid.un('rowenter', me.onDropGridRowEnter);
        me.dropGrid.un('rowleave', me.onDropGridRowLeave);
        //delete me.dropGrid;
      }

      delete me.dropGridEventInited;
    },
    /*
     * @param {Object} e
     */
    onDocMouseMove: function(e){
      if (!this.dragItems){
        return;
      }

      this.tip.show(e.pageX + 20, e.pageY + 20);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellLeave: function(grid, o){
      var me = this,
        w = me.widget,
        lang = w.lang;

      setTimeout(function(){
        if (me.onceStopDrag){
          me.onceStopDrag = false;
          return;
        }

        if (me.cellMouseDown !== true || me.dragItems){
          return;
        }

        var selected = w.getSelection(),
          text = F.String.format(lang.dragText, [selected.length, selected.length > 1 ? 's' : '']);

        w.stopSelection();
        me.initTip(text, o.e);

        me.tip.show();
        me.tip.el.css('display', 'block');

        me.dragItems = selected;
      }, 1);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellEnter: function(grid, o){
      var me = this;

      if (me.cellMouseDown !== true || me.dragItems){
        return;
      }

      if (o.rowIndex !== me.activeRowIndex){
        me.onceStopDrag = true;
        me.activeRowIndex = o.rowIndex;
      }
    },
    /*
     * @param {String} text
     * @param {Object} e
     */
    initTip: function(text, e){
      var me = this,
        dropNotOkCls = me.dropNotOkCls;

      if (!me.tip){
        me.tip = new F.ToolTip({
          cls: dropNotOkCls,
          text: text
        });
      }

      if (e){
        me.tip.show(e.pageX + 20, e.pageY + 20);
      }

      me.tip.update(text);
      me.tip.el.replaceClass(me.dropOkCls, dropNotOkCls);
    }
  });

})();/*
 * @class Fancy.DragRowsManager
 * @singleton
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  F.define('Fancy.DragRowsManager', {
    singleton: true,
    /*
     * @constructor
     */
    constructor: function(){
      var me = this;

      me.draggingRows = [];
    },
    /*
     * @params {Object} grid
     * @params {Array} rows
     */
    add: function(grid, rows){
      var me = this,
        docEl = Fancy.get(document);

      me.activeGrid = grid;
      me.draggingRows = rows;

      docEl.on('mouseenter', me.onMouserEnterGrid, me, '.' + Fancy.GRID_CLS);

      if(me.activeGrid.dropZone){
        me.activeGrid.el.on('mouseleave', me.onMouseLeaveActiveGrid, me);
      }
    },
    /*
     *
     */
    remove: function(){
      var me = this,
        docEl = Fancy.get(document);

      if(me.activeGrid && me.activeGrid.dropZone){
        docEl.un('mousemove', me.onMouseMoveOutSideActiveGrid);
      }

      delete me.activeGrid;
      delete me.draggingRows;
      delete me.toGrid;
      delete me.droppable;
      delete me.dropOutSideRowIndex;

      docEl.un('mouseenter', me.onMouserEnterGrid);
    },
    onMouserEnterGrid: function(e){
      var me = this,
        targetEl = Fancy.get(e.currentTarget);

      if(targetEl.id === me.activeGrid.el.id){
        return;
      }

      if(!me.toGrid){
        me.toGrid = Fancy.getWidget(targetEl.id);
      }
      else if(me.toGrid.id !== targetEl.id){
        me.toGrid = Fancy.getWidget(targetEl.id);
      }

      if(!me.toGrid){
        return true;
      }

      if(me.toGrid.droppable === true ||
        (F.isFunction(me.toGrid.droppable) &&
          me.toGrid.droppable(me.activeGrid, me.draggingRows) === true)){
        me.droppable = true;

        var docEl = Fancy.get(document);

        docEl.once('mouseleave', me.onMouseLeaveGrid, me, '#' + me.toGrid.id);

        setTimeout(function(){
          if(me.dropOutSideRowIndex === undefined && me.toGrid){
            var rowIndex = me.toGrid.getDisplayedData().length - 1;

            me.toGrid.rowdragdrop.activeRowIndex = rowIndex + 1;

            me.toGrid.rowdragdrop.insertItem = me.toGrid.get(rowIndex + 1);
            me.dropOutSideRowIndex = rowIndex + 1;

            me.toGrid.rowdragdrop.showCellsDropMask();
          }
        }, 100);
      }
    },
    onMouseLeaveGrid: function(){
      var me = this;

      delete me.droppable;
      delete me.toGrid;
      delete me.dropOutSideRowIndex;
    },
    onMouseLeaveActiveGrid: function(){
      var me = this,
        docEl = Fancy.get(document);

      if(me.activeGrid && me.activeGrid.el){
        docEl.on('mousemove', me.onMouseMoveOutSideActiveGrid, me);

        me.activeGrid.el.on('mouseenter', function(){
          docEl.un('mousemove', me.onMouseMoveOutSideActiveGrid);
        });
      }
    },
    onMouseMoveOutSideActiveGrid: function(e){
      var me = this,
        target = e.target,
        tagName = target.tagName.toLocaleLowerCase();

      if(me.dropEl){
        return;
      }

      switch(tagName){
        case 'html':
        case 'document':
        case 'body':
          return;
      }

      if(me.hoverEl === target){
        return;
      }

      me.hoverEl = target;

      if(me.activeGrid.dropZone(me.hoverEl)){
        me.dropEl = F.get(me.hoverEl);

        me.dropEl.once('mouseleave', function(){
          delete me.dropEl;
          delete me.hoverEl;

          if(me.activeGrid){
            me.activeGrid.rowdragdrop.dropOK = false;
          }
        });

        me.activeGrid.rowdragdrop.dropOK = true;
      }
      else{
        me.activeGrid.rowdragdrop.dropOK = false;
      }
    }
  });
})();

/*
 * @class Fancy.grid.plugin.RowDragDrop
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  var F = Fancy;
  var DRM = F.DragRowsManager;

  //CONSTANTS
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;

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
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function(){
      var me = this;

      me.Super('init', arguments);
      me.addEvents('drop', 'start', 'dropoutside');
      me.ons();
      me.initDropCls();
      me.initEnterLeave();

      //me.disableSelectionMove();
    },
    /*
     *
     */
    ons: function(){
      var me = this,
        w = me.widget;

      w.on('beforecellmousedown', me.onBeforeCellMouseDown, me);
      w.on('cellmousedown', me.onCellMouseDown, me);
      w.on('rowenter', me.onRowEnter, me);
      w.on('rowleave', me.onRowLeave, me, null, 100);
      me.on('drop', me.onDrop, me);
      me.on('dropoutside', me.onDropOutSide, me);
      me.on('start', me.onStart, me);
    },
    disableSelectionMove: function(){
      var me = this,
        w = me.widget;

      w.selection.disableSelectionMove();
    },
    showTip: function(e){
      var me = this,
        w = me.widget,
        selection;

      if(me.singleRowToDrag){
        selection = [me.singleRowToDrag.data];
      }
      else{
        selection = w.getSelection();
      }

      if(selection.length === 0){
        return;
      }

      if(!me.tip){
        me.initTip();
      }

      me.updateTipText();

      if (e){
        me.tip.show(e.pageX + 20, e.pageY + 20);
      }

      me.tipShown = true;
    },
    hideTip: function(){
      var me = this;

      if(me.tip){
        me.tip.hide();
      }

      me.tipShown = false;
    },
    onCellMouseDown: function(grid, o){
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
    onDocMouseUp: function(){
      var me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = false;
      me.mouseDownDragEl = false;
      delete me.tipValue;

      if(me.tipShown){
        docEl.un('mousemove', me.onDocMouseMove);
        me.hideTip();
        me.clearCellsMask();
        if(me.dropOK){
          me.fire('drop');
        }
        else if(DRM.droppable){
          me.fire('dropoutside');
        }
        me.tipShown = false;
      }

      if(w.selection){
        setTimeout(function(){
          w.selection.clearOverCells();
        }, 1);
        w.enableSelection();
      }

      DRM.remove();
      delete me.singleRowToDrag;
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onRowEnter: function(grid, o){
      var me = this,
        w = me.widget,
        selected = me.singleRowToDrag? [me.singleRowToDrag.data] : w.getSelection();

      if(DRM.droppable && DRM.toGrid.id === w.id){
        DRM.dropOutSideRowIndex = o.rowIndex;
      }
      else if (!me.cellMouseDown || selected.length === 0 || !me.tipShown){
        if(!me.singleRowToDrag){
          return;
        }
      }

      if(o.rowIndex !== 0){
        var prevRowIndex = o.rowIndex - 1;

        if( (me.singleRowToDrag && (me.singleRowToDrag.rowIndex === prevRowIndex || me.singleRowToDrag.rowIndex === o.rowIndex)) ||
          (w.body.getCell(prevRowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS) && !me.singleRowToDrag)){
          me.dropOK = false;

          me.clearCellsMask();
          delete me.activeRowIndex;
          return;
        }
        else{
          if( (me.singleRowToDrag && (o.rowIndex === me.singleRowToDrag.rowIndex || prevRowIndex === me.singleRowToDrag.rowIndex ) ) ||
            (!me.singleRowToDrag && w.body.getCell(o.rowIndex, 0).hasClass(GRID_CELL_SELECTED_CLS) && selected.length === 1)){
            me.dropOK = false;

            me.clearCellsMask();
            delete me.activeRowIndex;
            return;
          }
          else {
            if(selected.length > 1){
              var rowsGoOneByOne = true,
                prevRowIndex;

              F.each(selected, function(item){
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

            F.each(selected, function(item){
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
    /*
     * @param {String} text
     * @param {Object} e
     */
    initTip: function(){
      var me = this,
        dropNotOkCls = me.dropNotOkCls;

      if (!me.tip){
        me.tip = new F.ToolTip({
          cls: dropNotOkCls,
          text: ''
        });
      }
    },
    updateTipText: function(){
      var me = this,
        w = me.widget,
        lang = w.lang,
        selection = me.singleRowToDrag? [me.singleRowToDrag.data] : w.getSelection(),
        text = F.String.format(lang.dragText, [selection.length, selection.length > 1 ? 's' : '']);

      if(me.tipValue && selection.length === 1){
        text = me.tipValue;
      }

      me.tip.update(text);
      if(selection.length && me.dropOK != false){
        me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
      }
      else{
        if(DRM.droppable){
          me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
        }
        else {
          me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
        }
      }
    },
    onDocMouseMove: function(e){
      var me = this;

      if(me.singleRowToDrag || (me.cellMouseDown && me.cellMouseDown.hasClass(GRID_CELL_SELECTED_CLS))){
        if(!DRM.activeGrid){
          me.fire('start');
        }
        me.showTip(e);
      }
      else{
        me.hideTip();
      }
    },
    showCellsDropMask: function(){
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
    clearCellsMask: function(){
      var me = this,
        w = me.widget;

      w.el.select('.' + me.cellMaskCls).removeCls(me.cellMaskCls);
      w.el.select('.' + me.cellFirstRowMaskCls).removeCls(me.cellFirstRowMaskCls);
    },
    onStart: function(){
      var me = this,
        w = me.widget,
        selection;

      if(me.singleRowToDrag){
        selection = [me.singleRowToDrag.data];
      }
      else{
        selection = w.getSelection();
      }

      w.fire('dragstart', selection);
      if(selection.length){
        DRM.add(w, selection);
      }
    },
    onDrop: function(){
      var me = this,
        w = me.widget,
        selection = me.singleRowToDrag? [me.singleRowToDrag.data] : w.getSelection(),
        rowIndex;

      if(DRM.dropEl){
        if(DRM.activeGrid.dropZoneFn){
          DRM.activeGrid.dropZoneFn(selection);
        }

        return;
      }

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
        if(selection.length){
          var delta = 0;
          F.each(selection, function(item){
            var itemRowIndex = w.getRowById(item.id);

            if(itemRowIndex < rowIndex){
              delta++;
            }
          });

          rowIndex -= delta;
        }
      }

      w.insert(rowIndex, selection, false);
      w.store.changeDataView();
      w.update();
      if(!w.selection.memory){
        F.each(selection, function(item){
          var rowIndex = w.getRowById(item.id);
          w.flashRow(rowIndex);
        });
      }
      w.fire('dragrows', selection);
      delete w.draggingRows;
      w.enableSelection();
    },
    onDropOutSide: function(){
      var me = this,
        w = me.widget,
        selection = me.singleRowToDrag? [me.singleRowToDrag.data] : w.getSelection(),
        rowIndex = DRM.dropOutSideRowIndex || 0;

      if(!me.singleRowToDrag){
        w.clearSelection();
      }

      w.remove(selection, null, false);
      w.store.changeDataView();
      w.update();

      DRM.toGrid.insert(rowIndex, selection, false);
      DRM.toGrid.store.changeDataView();
      DRM.toGrid.update();
      DRM.toGrid.rowdragdrop.clearCellsMask();
      DRM.toGrid.fire('dragrows', selection);

      DRM.remove();
    },
    onBeforeCellMouseDown: function(el, o){
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
              //w.selectRow(o.rowIndex);
            }
            else if(w.selection.rows){
              //w.selectRow(o.rowIndex, true, true);
            }

            me.singleRowToDrag = o;
          }

          me.mouseDownDragEl = true;
          docEl.once('mousemove', function(e){
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
    initDropCls: function(){
      var me = this,
        w = me.widget;

      var dropCls = '#' + w.id + ' .' + me.dropZoneOverClass;

      me.dropCls = dropCls;
    },
    /*
     *
     */
    initEnterLeave: function(){
      var me = this,
        dropEl = F.select(me.dropCls);

      if (dropEl.length === 0){
        setTimeout(function(){
          me.initEnterLeave();
        }, 500);
        return;
      }

      dropEl.on('mouseleave', me.onMouseLeaveDropGroup, me);
    },
    onMouseLeaveDropGroup: function(){
      var me = this;

      me.dropOK = false;
      me.clearCellsMask();
    },
    onRowLeave: function(grid, params){
      var me = this,
        w = me.widget,
        rowIndex = params.rowIndex,
        activeRowIndex = me.activeRowIndex;

      if(!me.cellMouseDown){
        if(DRM.droppable){
          activeRowIndex = DRM.toGrid.rowdragdrop.activeRowIndex;

          if(rowIndex === activeRowIndex && DRM.toGrid.getDisplayedData().length - 1 === rowIndex){
            DRM.toGrid.rowdragdrop.activeRowIndex = rowIndex + 1;
            DRM.toGrid.rowdragdrop.showCellsDropMask();

            DRM.toGrid.rowdragdrop.insertItem = DRM.toGrid.get(rowIndex + 1);
            DRM.dropOutSideRowIndex = rowIndex + 1;
          }
        }

        return;
      }

      if(rowIndex === activeRowIndex && w.getDisplayedData().length - 1 === rowIndex){
        me.activeRowIndex = me.activeRowIndex + 1;
        me.showCellsDropMask();

        me.insertItem = w.get(rowIndex);
      }
    }
  });

})();