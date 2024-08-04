/*
 * @class Fancy.grid.plugin.GridToGrid
 * @extends Fancy.Plugin
 */
Fancy.modules['dd'] = true;
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const GRID_BODY_CLS = F.GRID_BODY_CLS;
  const GRID_CLS = F.GRID_CLS;
  const GRID_CELL_CLS = F.GRID_CELL_CLS;

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
    init(){
      const me = this;

      me.addEvents('drop');
      me.Super('init', arguments);
      me.initDropCls();
      me.initEnterLeave();

      me.ons();
    },
    /*
     *
     */
    initDropCls(){
      let me = this,
        dropCls = `.${me.dropGroup}`;

      dropCls += ` .${me.dropZoneOverClass}`;

      me.dropCls = dropCls;
    },
    /*
     *
     */
    addDragDropCls(){
      this.widget.el.addCls(this.dragGroup);
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget;

      w.on('render', function(){
        me.addDragDropCls();
      });

      if (me.dropGroup) {
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
    onDropItems(dd, items){
      const me = this,
        w = me.widget,
        dropGrid = me.dropGrid,
        rowIndex = dropGrid.activeRowEnterIndex === undefined ? dropGrid.getViewTotal() : dropGrid.activeRowEnterIndex;

      w.fire('dropitems', items, rowIndex);
      if (me.onDrop) {
        me.onDrop.apply(w, [items, rowIndex]);
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onBeforeCellMouseDown(grid, o){
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

        F.each(selected, (item) => {
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

        docEl.once('mouseup', () => {
          w.enableSelection();
        }, me);

        selected = w.getSelection();
        const text = F.String.format(lang.dragText, [selected.length, selected.length > 1 ? 's' : '']);

        me.initTip(text);

        me.dragItems = w.getSelection();

        me.cellMouseDown = true;

      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellMouseDown(grid, o){
      const me = this,
        w = me.widget,
        docEl = F.get(document);

      if (w.selection.enabled === false) {
        return;
      }

      const e = o.e,
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
    initEnterLeave(){
      const me = this,
        dropEl = F.select(me.dropCls);

      if (dropEl.length === 0) {
        setTimeout(() => {
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
    onMouseEnterDropGroup(e){
      const me = this;

      if (!me.cellMouseDown) {
        return;
      }

      const targetEl = F.get(e.currentTarget);

      me.dropGrid = F.getWidget(targetEl.closest(`.${GRID_CLS}`).attr('id'));

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

      if (me.tip) {
        me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseLeaveDropGroup(e){
      const me = this;

      if (!me.cellMouseDown) {
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
    setDropGridCellsMask(){
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
    onsDropGrid(){
      const me = this;

      me.dropGrid.on('rowenter', me.onDropGridRowEnter, me);
      me.dropGrid.on('rowleave', me.onDropGridRowLeave, me);

      me.dropGridEventInited = true;
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onDropGridRowEnter(grid, o){
      const me = this;

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
    onDropGridRowLeave(){
      const me = this;

      me.clearCellsMask();
      me.setDropGridCellsMask();

      if (me.dropGrid){
        delete me.dropGrid.activeRowEnterIndex;
      }
    },
    clearCellsMask(){
      const me = this,
        cellMaskCls = me.cellMaskCls;

      if (!me.dropGrid){
        return;
      }

      me.dropGrid.el.removeCls(me.dropHeaderMaskCls);
      me.dropGrid.el.select(`.${cellMaskCls}`).removeCls(cellMaskCls);
    },
    /*
     * @param {Object} e
     */
    onDocMouseUp(){
      const me = this,
        w = me.widget,
        docEl = F.get(document);

      me.cellMouseDown = false;
      if (me.tip) {
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

      F.select(`.${me.dropZoneCls}`).removeCls(me.dropZoneCls);

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
    onDocMouseMove(e){
      if (!this.dragItems){
        return;
      }

      this.tip.show(e.pageX + 20, e.pageY + 20);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellLeave(grid, o){
      const me = this,
        w = me.widget,
        lang = w.lang;

      setTimeout(() => {
        if (me.onceStopDrag){
          me.onceStopDrag = false;
          return;
        }

        if (me.cellMouseDown !== true || me.dragItems){
          return;
        }

        const selected = w.getSelection(),
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
    onCellEnter(grid, o){
      const me = this;

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
    initTip(text, e){
      const me = this,
        dropNotOkCls = me.dropNotOkCls;

      if (!me.tip) {
        me.tip = new F.ToolTip({
          cls: dropNotOkCls,
          text
        });
      }

      if (e) {
        me.tip.show(e.pageX + 20, e.pageY + 20);
      }

      me.tip.update(text);
      me.tip.el.replaceClass(me.dropOkCls, dropNotOkCls);
    }
  });

})();
/*
 * @class Fancy.DragRowsManager
 * @singleton
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  F.define('Fancy.DragRowsManager', {
    singleton: true,
    /*
     * @constructor
     */
    constructor: function(){
      this.draggingRows = [];
    },
    /*
     * @params {Object} grid
     * @params {Array} rows
     */
    add(grid, rows){
      const me = this,
        docEl = Fancy.get(document);

      me.activeGrid = grid;
      me.draggingRows = rows;

      docEl.on('mouseenter', me.onMouseEnterGrid, me, `.${Fancy.GRID_CLS}`);

      if(me.activeGrid.dropZone){
        me.activeGrid.el.on('mouseleave', me.onMouseLeaveActiveGrid, me);
      }
    },
    /*
     *
     */
    remove(){
      const me = this,
        docEl = Fancy.get(document);

      if(me.activeGrid && me.activeGrid.dropZone){
        docEl.un('mousemove', me.onMouseMoveOutSideActiveGrid);
      }

      delete me.activeGrid;
      delete me.draggingRows;
      delete me.toGrid;
      delete me.droppable;
      delete me.dropOutSideRowIndex;

      docEl.un('mouseenter', me.onMouseEnterGrid);
    },
    onMouseEnterGrid(e){
      const me = this,
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

        const docEl = Fancy.get(document);

        if(F.nojQuery){
          me.toGrid.el.on('mouseleave', me.onMouseLeaveGrid, me);
        }
        else {
          docEl.once('mouseleave', me.onMouseLeaveGrid, me, '#' + me.toGrid.id);
        }

        setTimeout(() => {
          if(me.dropOutSideRowIndex === undefined && me.toGrid){
            const s = me.toGrid.store,
              data = s.getDataView(),
              rowIndex = data.length - 1;

            me.toGrid.rowdragdrop.activeRowIndex = rowIndex + 1;

            me.toGrid.rowdragdrop.insertItem = me.toGrid.get(rowIndex + 1);
            me.dropOutSideRowIndex = rowIndex + 1;

            me.toGrid.rowdragdrop.showCellsDropMask();
          }
        }, 100);
      }
    },
    onMouseLeaveGrid(){
      const me = this;

      if(F.nojQuery && me.toGrid){
        me.toGrid.el.un('mouseleave', me.onMouseLeaveGrid, me);
      }

      delete me.droppable;
      delete me.toGrid;
      delete me.dropOutSideRowIndex;
    },
    onMouseLeaveActiveGrid(){
      const me = this,
        docEl = Fancy.get(document);

      if(me.activeGrid && me.activeGrid.el){
        docEl.on('mousemove', me.onMouseMoveOutSideActiveGrid, me);

        me.activeGrid.el.on('mouseenter', function(){
          docEl.un('mousemove', me.onMouseMoveOutSideActiveGrid);
        });
      }
    },
    onMouseMoveOutSideActiveGrid(e){
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

        me.dropEl.once('mouseleave', () => {
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
  const F = Fancy;
  const DRM = F.DragRowsManager;

  //CONSTANTS
  const GRID_BODY_CLS = F.GRID_BODY_CLS;
  const GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;

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
    init(){
      const me = this;

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
    ons(){
      const me = this,
        w = me.widget;

      w.on('beforecellmousedown', me.onBeforeCellMouseDown, me);
      w.on('cellmousedown', me.onCellMouseDown, me);
      w.on('rowenter', me.onRowEnter, me);
      w.on('rowleave', me.onRowLeave, me, null, 100);
      me.on('drop', me.onDrop, me);
      me.on('dropoutside', me.onDropOutSide, me);
      me.on('start', me.onStart, me);
    },
    disableSelectionMove(){
      this.widget.selection.disableSelectionMove();
    },
    showTip(e){
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
    hideTip(){
      const me = this;

      if(me.tip){
        me.tip.hide();
      }

      me.tipShown = false;
    },
    onCellMouseDown(grid, o){
      const me = this,
        docEl = F.get(document),
        targetEl = F.get(o.e.target),
        tagName = targetEl.dom.tagName.toLocaleLowerCase();

      if(tagName !== 'svg' && tagName !== 'path'){
        return;
      }

      me.cellMouseDown = F.get(o.cell);
      docEl.once('mouseup', me.onDocMouseUp, me);
    },
    onDocMouseUp(){
      const me = this,
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
        setTimeout(() => {
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
    onRowEnter(grid, o){
      const me = this,
        w = me.widget,
        selected = me.singleRowToDrag ? [me.singleRowToDrag.data] : w.getSelection();

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

              F.each(selected, (item) => {
                if(prevRowIndex === undefined){
                  prevRowIndex = w.getRowById(item.id);
                  return;
                }

                const rowIndex = w.getRowById(item.id);
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

        const prevItem = w.get(prevRowIndex);
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

              const rowIndex = w.getRowById(item.id);
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

      const memory = w.selection.memory;
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
    initTip(){
      const me = this,
        dropNotOkCls = me.dropNotOkCls;

      if (!me.tip){
        me.tip = new F.ToolTip({
          cls: dropNotOkCls,
          text: ''
        });
      }
    },
    updateTipText(){
      var me = this,
        w = me.widget,
        lang = w.lang,
        selection = me.singleRowToDrag? [me.singleRowToDrag.data] : w.getSelection(),
        text = F.String.format(lang.dragText, [selection.length, selection.length > 1 ? 's' : '']);

      if(me.tipValue && selection.length === 1 && F.typeOf(me.tipValue) === 'string'){
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
    onDocMouseMove(e){
      const me = this;

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
    showCellsDropMask(){
      const me = this,
        w = me.widget,
        rowIndex = me.activeRowIndex - 1;

      me.clearCellsMask();
      if(rowIndex === -1){
        w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + 0 + '"]').addCls(me.cellFirstRowMaskCls);
      }
      else {
        w.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + rowIndex + '"]').addCls(me.cellMaskCls);
      }
    },
    clearCellsMask(){
      const me = this,
        w = me.widget;

      w.el.select('.' + me.cellMaskCls).removeCls(me.cellMaskCls);
      w.el.select('.' + me.cellFirstRowMaskCls).removeCls(me.cellFirstRowMaskCls);
    },
    onStart(){
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
    onDrop(){
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
          F.each(selection, (item) => {
            const itemRowIndex = w.getRowById(item.id);

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
        F.each(selection, (item) => {
          const rowIndex = w.getRowById(item.id);
          w.flashRow(rowIndex);
        });
      }
      w.fire('dragrows', selection, rowIndex);
      delete w.draggingRows;
      w.enableSelection();
    },
    onDropOutSide(){
      const me = this,
        w = me.widget,
        selection = me.singleRowToDrag ? [me.singleRowToDrag.data] : w.getSelection(),
        rowIndex = DRM.dropOutSideRowIndex || 0;

      if(!me.singleRowToDrag && w.dropOutSideActions){
        w.clearSelection();
      }

      if(w.dropOutSideActions){
        w.remove(selection, null, false);
        w.store.changeDataView();
        w.update();

        DRM.toGrid.insert(rowIndex, selection, false);
        DRM.toGrid.store.changeDataView();
        DRM.toGrid.update();
      }

      DRM.toGrid.rowdragdrop.clearCellsMask();
      DRM.toGrid.fire('dragrows', selection, rowIndex);

      if(w.dropOutSideActions){
        DRM.remove();
      }
    },
    onBeforeCellMouseDown(el, o){
      const me = this,
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
          docEl.once('mousemove', e => {
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
    initDropCls(){
      const me = this,
        w = me.widget;

      const dropCls = '#' + w.id + ' .' + me.dropZoneOverClass;

      me.dropCls = dropCls;
    },
    /*
     *
     */
    initEnterLeave(){
      const me = this,
        dropEl = F.select(me.dropCls);

      if (dropEl.length === 0){
        setTimeout(() => {
          me.initEnterLeave();
        }, 500);
        return;
      }

      dropEl.on('mouseleave', me.onMouseLeaveDropGroup, me);
    },
    onMouseLeaveDropGroup(){
      const me = this;

      me.dropOK = false;
      me.clearCellsMask();
    },
    onRowLeave(grid, params){
      var me = this,
        w = me.widget,
        s = w.store,
        data = s.getDataView(),
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

      if(rowIndex === activeRowIndex && data.length - 1 === rowIndex){
        me.activeRowIndex = me.activeRowIndex + 1;
        me.showCellsDropMask();

        me.insertItem = w.get(rowIndex);
      }
    }
  });

})();
