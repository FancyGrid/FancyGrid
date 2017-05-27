/*
 * @class Fancy.grid.plugin.GridToGrid
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.GridToGrid', {
  extend: Fancy.Plugin,
  ptype: 'grid.dragdrop',
  inWidgetName: 'dragdrop',
  dropOK: false,
  cellMaskCls: 'fancy-drop-cell-mask',
  dropZoneCls: 'fancy-drop-zone-active',
  dropOkCls: 'fancy-drop-ok',
  dropNotOkCls: 'fancy-drop-not-ok',
  dropHeaderMaskCls: 'fancy-drop-header-mask',
  droppable: true,
  dropZoneOverClass: 'fancy-grid-body',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this,
      w = me.widget;

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
    var me = this,
      w = me.widget;
    
    w.el.addClass(me.dragGroup);
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      store = w.store,
      docEl = Fancy.get(document);

    w.on('render', function(){
      me.addDragDropCls();
    });

    if( me.dropGroup ){
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
      rowIndex = dropGrid.activeRowEnterIndex === undefined? dropGrid.getViewTotal():dropGrid.activeRowEnterIndex;

    //w.clearSelection();
    //dropGrid.clearSelection();

    w.fire('dropitems', items, rowIndex);
    if(me.onDrop){
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
      docEl = Fancy.get(document),
      selected = w.getSelection(),
      e = o.e,
      isCTRL = e.ctrlKey;

    if(isCTRL && w.multiSelect === true){
      return;
    }

    if(selected.length > 1){
      var i = 0,
        iL = selected.length,
        passed = false;

      for(;i<iL;i++){
        if(selected[i].id === o.id){
          passed = true;
          break;
        }
      }

      if(passed === false){
        return;
      }

      w.stopSelection();

      docEl.once('mouseup', me.onDocMouseUp, me);
      docEl.on('mousemove', me.onDocMouseMove, me);

      docEl.once('mouseup', function(){
        w.enableSelection();
      }, me);

      selected = w.getSelection();
      var text = Fancy.String.format(lang.dragText, [selected.length, selected.length > 1? 's': '']);

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
      docEl = Fancy.get(document),
      selected = w.getSelection();

    if(w.selection.enabled === false){
      return;
    }

    var e = o.e,
      isCTRL = e.ctrlKey;

    if(isCTRL && w.multiSelect === true){
      return;
    }

    if(o.column.index === '$selected'){}
    else{
      w.clearSelection();
    }

    docEl.once('mouseup', me.onDocMouseUp, me);
    docEl.on('mousemove', me.onDocMouseMove, me);
    
    me.cellMouseDown = true;
    me.activeRowIndex = o.rowIndex;
  },
  initEnterLeave: function(){
    var me = this,
      dropEl = Fancy.select(me.dropCls);

    if(dropEl.length === 0){
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
    
    if(!me.cellMouseDown){
      return;
    }

    var targetEl = Fancy.get(e.currentTarget);
    
    me.dropGrid = Fancy.getWidget(targetEl.closest('.fancy-grid').attr('id'));

    if(me.dropGrid && me.dropGrid.dragdrop && me.dropGrid.dragdrop.droppable === false){
      me.dropOK = false;
      if( me.tip ){
        me.tip.el.replaceClass(me.dropOkCls, me.dropNotOkCls);
      }
      return;
    }

    me.setDropGridCellsMask();
    if( !me.dropGridEventInited ){
      me.onsDropGrid();
    }

    targetEl.addClass(me.dropZoneCls);
    
    me.dropOK = true;

    if( me.tip ){
      me.tip.el.replaceClass(me.dropNotOkCls, me.dropOkCls);
    }
  },
  /*
   * @param {Object} e
   */
  onMouseLeaveDropGroup: function(e){
    var me = this;
    
    if(!me.cellMouseDown){
      return;
    }
    
    Fancy.get(e.currentTarget).removeClass(me.dropZoneCls);
    
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
      
    if(!dropGrid || !me.cellMouseDown){
      return;
    }
      
    total = dropGrid.getTotal();
    
    if(total === 0){
      dropGrid.el.addClass(me.dropHeaderMaskCls);
    }
    else{
      dropGrid.el.select('.fancy-grid-cell[index="'+(total - 1)+'"]').addClass(me.cellMaskCls);
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

    if( me.cellMouseDown === false ){
      //Fix core bug. In future needs to find out what it is.
      //'un' does not unset handler
      me.dropGrid.un('rowenter', me.onDropGridRowEnter);
      me.dropGrid.un('rowleave', me.onDropGridRowLeave);
    }

    me.clearCellsMask();
    
    if(o.rowIndex === 0){
      grid.el.addClass(me.dropHeaderMaskCls);
    }
    else{
      grid.el.select('.fancy-grid-cell[index="'+(o.rowIndex - 1)+'"]').addClass(me.cellMaskCls);
    }

    if( me.cellMouseDown === false ){
      me.clearCellsMask();
    }

    if(me.dropGrid){
      me.dropGrid.activeRowEnterIndex = o.rowIndex;
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onDropGridRowLeave: function(grid, o){
    var me = this;
    
    me.clearCellsMask();
    me.setDropGridCellsMask();

    if(me.dropGrid){
      delete me.dropGrid.activeRowEnterIndex;
    }
  },
  clearCellsMask: function(){
    var me = this,
      cellMaskCls = me.cellMaskCls;
    
    if(!me.dropGrid){
      return;
    }
    
    me.dropGrid.el.removeClass(me.dropHeaderMaskCls);
    me.dropGrid.el.select('.' + cellMaskCls).removeClass(cellMaskCls);
  },
  /*
   * @param {Object} e
   */
  onDocMouseUp: function(e){
    var me = this,
      w = me.widget,
      docEl = Fancy.get(document);
    
    me.cellMouseDown = false;
    if(me.tip){
      me.tip.hide();
    }
    w.enableSelection();
    
    docEl.un('mousemove', me.onDocMouseMove);
    
    if(me.dropOK === true){
      w.clearSelection();
      me.dropGrid.clearSelection();
      me.fire('drop', me.dragItems);
    }
    
    delete me.dragItems;
    me.dropOK = false;
    
    Fancy.select('.'+me.dropZoneCls).removeClass(me.dropZoneCls);
    
    me.clearCellsMask();    
    
    if(me.dropGrid){
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
    var me = this,
      w = me.widget;
    
    if(!me.dragItems){
      return;
    }
    
    me.tip.show(e.pageX + 20, e.pageY + 20);
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
      if(me.onceStopDrag){
        me.onceStopDrag = false;
        return;
      }
      
      if(me.cellMouseDown !== true || me.dragItems){
        return;
      }

      var selected = w.getSelection(),
        text = Fancy.String.format(lang.dragText, [selected.length, selected.length > 1? 's': '']);

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

    if(me.cellMouseDown !== true || me.dragItems){
      return;
    }
    
    if(o.rowIndex !== me.activeRowIndex){
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
    
    if(!me.tip){
      me.tip = new Fancy.ToolTip({
        cls: dropNotOkCls,
        text: text
      });
    }
    
    if(e){
      me.tip.show(e.pageX + 20, e.pageY + 20);
    }
    
    me.tip.update(text);
    me.tip.el.replaceClass(me.dropOkCls, dropNotOkCls);
  }
});