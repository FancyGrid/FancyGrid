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
