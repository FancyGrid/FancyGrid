/*
 * @class Fancy.grid.plugin.Selection
 * @extends Fancy.Plugin
 */
Fancy.modules['selection'] = true;
(function(){
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_OVER_CLS = F.GRID_CELL_OVER_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;
  var GRID_CELL_ACTIVE_CLS = F.GRID_CELL_ACTIVE_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_COLUMN_OVER_CLS = F.GRID_COLUMN_OVER_CLS;
  var GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  var GRID_COLUMN_SELECTED_CLS = F.GRID_COLUMN_SELECTED_CLS;
  var GRID_ROW_OVER_CLS = F.GRID_ROW_OVER_CLS;
  var GRID_HEADER_CLS = F.GRID_HEADER_CLS;
  var GRID_HEADER_CELL_SELECT_CLS = F.GRID_HEADER_CELL_SELECT_CLS;
  var GRID_HEADER_CELL_TEXT_CLS = F.GRID_HEADER_CELL_TEXT_CLS;
  var GRID_COLUMN_TREE_EXPANDER_CLS = F.GRID_COLUMN_TREE_EXPANDER_CLS;
  var FIELD_CHECKBOX_CLS = F.FIELD_CHECKBOX_CLS;
  var FIELD_CHECKBOX_ON_CLS = F.FIELD_CHECKBOX_ON_CLS;
  var FIELD_CHECKBOX_INPUT_CLS = F.FIELD_CHECKBOX_INPUT_CLS;
  var GRID_COPY_TEXTAREA = F.GRID_COPY_TEXTAREA;
  var FIELD_CHECKBOX_MIDDLE_CLS = F.FIELD_CHECKBOX_MIDDLE_CLS;

  F.define('Fancy.grid.plugin.Selection', {
    extend: F.Plugin,
    ptype: 'grid.selection',
    inWidgetName: 'selection',
    mixins: [
      'Fancy.grid.selection.mixin.Navigation'
    ],
    enabled: true,
    checkboxRow: false,
    checkOnly: false,
    memory: false,
    disabled: false,
    selectLeafsOnly: false,
    keyNavigation: true,
    allowDeselect: false,
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

      if (me.memory) {
        me.initMemory();
      }

      me.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.once('render', function () {
        me.initTrackOver();
        me.initColumnTrackOver();
        me.initCellTrackOver();
        me.initCellSelection();
        me.initRowSelection();
        me.initColumnSelection();

        if (me.keyNavigation) {
          me.initNavigation();
        }

        me.initCopyKeys();

        w.on('changepage', me.onChangePage, me);
        w.on('load', me.onLoad, me);

        if(F.nojQuery){
          me.initFixTrackOver();
        }

        me.initCopyEl();
      });

      w.on('sort', me.onSort, me);

      w.on('columndrag', me.onColumnDrag, me);
      w.on('lockcolumn', me.onColumnLock, me);
      w.on('rightlockcolumn', me.onColumnRightLock, me);
      w.on('unlockcolumn', me.onUnColumnLock, me);
      w.on('filter', me.onFilter, me);
      w.on('expand', me.onExpand, me);
      w.on('collapse', me.onCollapse, me);
      w.on('dragrows', me.onDragRows, me);
      w.on('remove', me.onRemoveRows, me);

      w.on('treeexpand', me.onTreeExpand, me);
      w.on('treecollapse', me.onTreeCollapse, me);
    },
    /*
     *
     */
    initMemory: function () {
      var me = this,
        w = me.widget;

      me.memory = {
        all: false,
        exceptedLength: 0,
        selectedLength: 0,
        excepted: {},
        selected: {},
        tree: {
          selected: {},//Selected parents. Selected nodes in memory.selected
          allSelected: {},//Parents with all selected childs
          selectedLength: {}//Number of selected parent nodes
        },
        addDirtyParent: function (id, parentId, all) {
          if(me.selModel !== 'rows'){
            return;
          }

          var item = w.getById(id),
            child = item.get('child');

          if(!child){
            if(parentId){
              me.memory.tree.selected[parentId] = true;

              me.memory.tree.selectedLength[parentId] = me.memory.tree.selectedLength[parentId] || 0;
              me.memory.tree.selectedLength[parentId]++;

              var parentItem = w.getById(parentId),
                parentChild = parentItem.get('child');

              if(parentChild.length === me.memory.tree.selectedLength[parentId]){
                me.memory.tree.allSelected[parentId] = true;
                delete me.memory.tree.selected[parentId];
              }
            }
          }
          else if(all !== false){
            delete me.memory.tree.selected[id];
            if(parentId){
              if(!me.memory.tree.allSelected[id] && !me.memory.tree.selected[id]){
                me.memory.tree.selectedLength[parentId]++;
              }
            }

            me.memory.tree.allSelected[id] = true;
            me.memory.tree.selectedLength[id] = child.length;
            me.memory.clearChild(child);
          }
          else{
            if(child){
              me.memory.tree.selected[id] = true;
            }

            if(!me.memory.tree.selectedLength[id]){
              me.memory.tree.selectedLength[id] = 1;
            }
          }

          if(parentId){
            var parentItem = w.getById(parentId);

            if(parentItem.data.parentId){
              me.memory.addDirtyParent(parentId, parentItem.data.parentId, false);
            }

            if(child.length){
              me.memory.addDirtyParent(parentId, parentItem.data.parentId, false);
            }
          }

          if(child){
            var allSelectedChilds = 0;

            F.each(child, function (_child) {
              var id = _child.id;

              if(!id){
                return true;
              }

              if(me.memory.tree.allSelected[id]){
                allSelectedChilds++;
              }
            });

            if(child.length === allSelectedChilds){
              delete me.memory.tree.selected[id];
              me.memory.tree.allSelected[id] = true;
            }
          }
        },
        removeDirtyParent: function (id, parentId) {
          if(me.selModel !== 'rows'){
            return;
          }

          var parentItem = w.getById(parentId),
            child;

          if(parentItem){
            child = parentItem.get('child');
          }

          if(me.memory.tree.allSelected[id]){
            delete me.memory.tree.allSelected[id];
            delete me.memory.tree.selectedLength[id];
          }

          if(me.memory.selected[id]){
            delete me.memory.selected[id];
            me.memory.selectedLength--;
          }

          delete me.memory.tree.selected[id];
          if(me.memory.tree.allSelected[parentId]){
            delete me.memory.tree.allSelected[parentId];
            me.memory.tree.selectedLength[parentId] = child.length;

            if(child.length !== 1){
              me.memory.tree.selected[parentId] = true;
            }
            else{
              delete me.memory.tree.selected[parentId];
            }
          }

          if(me.memory.tree.selectedLength[parentId]){
            me.memory.tree.selectedLength[parentId]--;
          }

          if(me.memory.tree.selectedLength[parentId] === 0){
            delete me.memory.tree.selected[parentId];
            delete me.memory.tree.selectedLength[parentId];

            var grandParentId = parentItem.get('parentId');

            if(grandParentId){
              me.memory.removeDirtyParent(parentId, grandParentId);
            }
          }
        },
        clearChild: function (child) {
          F.Array.each(child, function (item) {
            var id = item.id;

            if(me.memory.tree.selectedLength[id]){
              me.memory.selected[id] = true;
              delete me.memory.tree.allSelected[id];
              delete me.memory.tree.selected[id];
              delete me.memory.tree.selectedLength[id];
              var _child = item.get('child');
              if(_child){
                me.memory.clearChild(_child);
              }
            }
          });
        },
        setAll: function () {
          var filteredDataMap = w.store.filteredDataMap;

          if(filteredDataMap){
            me.memory.selectedLength = 0;
            for(var p in filteredDataMap){
              me.memory.add(p);
            }
            me.memory.excepted = {};
            me.memory.all = true;
            me.memory.exceptedLength = 0;
          }
          else {
            F.apply(me.memory, {
              all: true,
              exceptedLength: 0,
              selectedLength: 0,
              excepted: {},
              selected: {}
            });
          }
        },
        clearAll: function () {
          F.apply(me.memory, {
            all: false,
            exceptedLength: 0,
            selectedLength: 0,
            excepted: {},
            selected: {}
          });
        },
        add: function (id) {
          var item = w.getById(id);

          if(item) {
            item.set('$selected', true);
          }

          if(me.row){
            me.memory.clearAll();
          }

          if(!me.memory.selected[id]){
            me.memory.selected[id] = item.data;
            me.memory.selectedLength++;
          }

          if(me.memory.excepted[id] === true){
            delete me.memory.excepted[id];
            me.memory.exceptedLength--;
          }
        },
        remove: function (id) {
          var item = w.getById(id);

          if (item) {
            item.set('$selected', false);
          }

          //if(me.memory.selected[id] === true){
          if(me.memory.selected[id]){
            delete me.memory.selected[id];
            me.memory.selectedLength--;
          }

          if(me.memory.all === true){
            if(!me.memory.excepted[id]){
              me.memory.excepted[id] = true;
              me.memory.exceptedLength++;
            }
          }

          var total = w.getTotal();

          if(me.memory.exceptedLength === total){
            me.memory.clearAll();
          }
        },
        has: function (id) {
          return !!me.memory.selected[id] && !me.memory.excepted[id];
        }
      };
    },
    /*
     *
     */
    initTrackOver: function () {
      var me = this,
        w = me.widget;

      w.on('rowenter', me.onRowEnter, me);
      w.on('rowleave', me.onRowLeave, me);
    },
    /*
     *
     */
    initCellTrackOver: function () {
      var me = this,
        w = me.widget;

      w.on('cellenter', me.onCellEnter, me);
      w.on('cellleave', me.onCellLeave, me);
    },
    /*
     *
     */
    initColumnTrackOver: function () {
      var me = this,
        w = me.widget;

      w.on('columnenter', me.onColumnEnter, me);
      w.on('columnleave', me.onColumnLeave, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onCellEnter: function (grid, params) {
      var w = this.widget;

      if (!w.cellTrackOver || w.startResizing || F.isTouch) {
        return;
      }

      F.get(params.cell).addCls(GRID_CELL_OVER_CLS);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onCellLeave: function (grid, params) {
      var w = this.widget;

      if (!w.cellTrackOver || w.startResizing) {
        return;
      }

      F.get(params.cell).removeCls(GRID_CELL_OVER_CLS);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onColumnEnter: function (grid, params) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        scroller = w.scroller;

      if((columndrag && columndrag.status === 'dragging') || F.isTouch){
        return;
      }

      if(w.startResizing){
        return;
      }

      if (!w.columnTrackOver || scroller.bottomKnobDown || scroller.rightKnobDown || params.column.trackOver === false || me.keyNavigating) {
        return;
      }

      F.get(params.columnDom).addCls(GRID_COLUMN_OVER_CLS);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onColumnLeave: function (grid, params) {
      var w = this.widget;

      if(w.startResizing){
        return;
      }

      if (!w.columnTrackOver) {
        return;
      }

      F.get(params.columnDom).removeCls(GRID_COLUMN_OVER_CLS);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onRowEnter: function (grid, params) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        scroller = w.scroller;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if(F.isTouch){
        return;
      }

      if(w.startResizing){
        return;
      }

      if (this.enabled === false) {
        return;
      }

      if (!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown || me.keyNavigating) {
        return;
      }

      var rowCells = w.getDomRow(params.rowIndex);

      F.each(rowCells, function (cell) {
        F.get(cell).addCls(GRID_ROW_OVER_CLS);
      });

      w.fire('rowtrackenter', params);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onRowLeave: function (grid, params) {
      var w = this.widget;

      if(w.startResizing){
        return;
      }

      if (this.enabled === false) {
        return;
      }

      if (!w.trackOver) {
        return;
      }

      var rowCells = w.getDomRow(params.rowIndex);

      F.each(rowCells, function (cell) {
        F.get(cell).removeCls(GRID_ROW_OVER_CLS);
      });

      w.fire('rowtrackleave', params);
    },
    /*
     *
     */
    onChangePage: function () {
      if (this.memory) {
        return;
      }

      this.clearSelection();
    },
    onLoad: function () {
      var me = this;

      if (me.memory) {
        return;
      }

      me.clearSelection();
    },
    /*
     *
     */
    initCellSelection: function () {
      var me = this,
        w = me.widget;

      w.on('cellclick', me.onCellClick, me);

      w.on('cellmousedown', me.onCellMouseDownCells, me);
      w.on('cellenter', me.onCellEnterSelection, me);
    },
    /*
     *
     */
    initRowSelection: function () {
      var me = this,
        w = me.widget;

      if (w.checkboxRowSelection) {
        me.checkboxRow = true;
        setTimeout(function () {
          if (me.selModel === 'rows') {
            me.renderHeaderCheckBox();
          }
        }, 1);
      }

      w.on('rowclick', me.onRowClick, me);

      w.on('cellmousedown', me.onCellMouseDownRows, me);
      w.on('cellclick', me.onCellClickRows, me);
      w.on('rowenter', me.onRowEnterSelection, me);
      w.on('columndrag', me.onColumnDrag, me);
    },
    /*
     * @param {Object} grid
     * @param {Object} params
     */
    onCellMouseDownRows: function (grid, params) {
      var me = this,
        w = me.widget,
        s = w.store,
        targetEl = F.get(params.e.target),
        column = params.column,
        treeMemory = s.isTree && me.memory,
        docEl = F.get(document.body);

      if(me.stopOneTick){
        delete me.stopOneTick;
      }

      if(me.checkOnly && !F.get(params.e.target).hasClass(FIELD_CHECKBOX_INPUT_CLS)){
        return;
      }

      if(me.disabled){
        return;
      }

      if(me.selectLeafsOnly){
        if(!params.data.leaf){
          me.stopOneTick = true;
          return;
        }
      }

      if (!me.rows || !me.enabled) {
        return;
      }

      if (me.checkOnly && (params.column.index !== '$selected' && !params.column.select)) {
        return;
      }

      if(column.type === 'tree'){
        if(targetEl.hasCls(GRID_COLUMN_TREE_EXPANDER_CLS)){
          return;
        }
      }

      if(!me.selectLeafsOnly && !params.data.leaf && targetEl.hasClass(FIELD_CHECKBOX_INPUT_CLS)){
        var checkBox = F.getWidget(targetEl.parent().parent().attr('id')),
          value = !checkBox.get();

        me.selectNodesChilds(params.id, value);
      }

      if(document.activeElement){
        document.activeElement.blur();
      }

      var e = params.e,
        target = e.target,
        isCTRL = e.ctrlKey;

      var rowIndex = params.rowIndex,
        rowCells = w.getDomRow(rowIndex);

      if ((isCTRL || me.allowDeselect) && w.multiSelect) {
        if (F.get(rowCells[0]).hasCls(GRID_CELL_SELECTED_CLS)) {
          me.domDeSelectRow(rowIndex);
          if (me.checkboxRow) {
            me.deSelectCheckBox(rowIndex);
          }
          if(treeMemory) {
            me.memory.removeDirtyParent(params.id, params.data.parentId);
            docEl.once('mouseup', function () {
              setTimeout(function () {
                me.updateSelectCheckBoxes();
              }, 100);
            });
          }
        }
        else {
          me.domSelectRow(rowIndex);
          if (me.checkboxRow) {
            me.selectCheckBox(rowIndex);
          }
          if(treeMemory) {
            me.memory.addDirtyParent(params.id, params.data.parentId);
          }
        }
      }
      else {
        if (params.column.index === '$selected' || params.column.select) {
          var checkbox = F.getWidget(F.get(params.cell).select('.' + FIELD_CHECKBOX_CLS).attr('id'));

          if (checkbox.el.within(target)) {
            if (checkbox.get() === true) {
              me.domDeSelectRow(rowIndex);
              if(treeMemory) {
                me.memory.removeDirtyParent(params.id, params.data.parentId);
                docEl.once('mouseup', function () {
                  setTimeout(function () {
                    me.updateSelectCheckBoxes();
                  }, 100);
                });
              }
            }
            else {
              me.domSelectRow(rowIndex);
              if(treeMemory) {
                me.memory.addDirtyParent(params.id, params.data.parentId);
              }
            }
          }
          else {
            me.clearSelection();
            me.domSelectRow(rowIndex);
            if (me.checkboxRow) {
              me.selectCheckBox(rowIndex);
            }
            if(treeMemory) {
              me.memory.addDirtyParent(params.id, params.data.parentId);
            }
          }
        }
        else {
          me.clearSelection();
          me.domSelectRow(rowIndex);
          if (me.checkboxRow) {
            me.selectCheckBox(rowIndex);
          }
          if(treeMemory) {
            me.memory.addDirtyParent(params.id, params.data.parentId);
          }
        }
      }

      me.isMouseDown = true;
      me.startRowSelection = rowIndex;

      F.$(document).one('mouseup', function () {
        delete me.isMouseDown;
        delete me.startCellSelection;
      });

      me.clearActiveCell();
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);

      w.fire('select', me.getSelection());

      if(treeMemory) {
        //setTimeout(function () {
          me.updateTreeSelection();
        //}, 200);
      }
    },
    /*
     * @param {Number} rowIndex
     */
    selectCheckBox: function (rowIndex) {
      var me = this,
        w = me.widget,
        checkBoxEls = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .' + FIELD_CHECKBOX_CLS);

      checkBoxEls.each(function (item) {
        F.getWidget(item.attr('id')).set(true);
      });

      if (w.selModel === 'rows') {
        me.updateHeaderCheckBox();
      }
    },
    /*
     * @param {Number} rowIndex
     */
    deSelectCheckBox: function (rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        checkBoxEls = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .' + FIELD_CHECKBOX_CLS),
        id = s.get(rowIndex, 'id');

      if (!id) {
        return;
      }

      if (me.memory) {
        me.memory.remove(id);
      }

      checkBoxEls.each(function (item) {
        F.getWidget(item.attr('id')).set(false);
      });

      me.updateHeaderCheckBox();
    },
    /*
     * @param {Number} rowIndex
     */
    domSelectRow: function (rowIndex) {
      if(!this.widget.inited){
        return;
      }

      var me = this,
        w = me.widget,
        s = w.store,
        rowCells,
        id = s.get(rowIndex, 'id'),
        selected = false;

      if(w.startResizing){
        return;
      }

      if (me.memory) {
        if(!w.sorting && !w.filtering && !me.deselectingAll && !w.draggingRows){
          me.memory.add(id);
        }
        /*
        else if(!w.draggingRows && !w.sorting && !w.filtering){
          return;
        }*/
      }

      rowCells = w.getDomRow(rowIndex);

      F.each(rowCells, function (cell) {
        cell = F.get(cell);
        if(cell.hasClass(GRID_CELL_SELECTED_CLS)){
          selected = true;
        }
        else {
          cell.addCls(GRID_CELL_SELECTED_CLS);
        }
      });

      if(selected === false){
        w.fire('selectrow', rowIndex, w.get(rowIndex));
      }
    },
    /*
     * @param {Number} rowIndex
     */
    domDeSelectRow: function (rowIndex) {
      if(!this.widget.inited){
        return;
      }

      var me = this,
        w = me.widget,
        s = w.store,
        rowCells,
        id = s.get(rowIndex, 'id'),
        selected = true;

      if (me.memory) {
        if(!w.filtering && !me.deselectingAll && !w.draggingRows && !w.sorting){
          me.memory.remove(id);
        }
        /*
        else if(!me.deselectingAll && !w.draggingRows && !w.sorting){
          return;
        }*/
      }

      rowCells = w.getDomRow(rowIndex);

      F.each(rowCells, function (cell) {
        cell = F.get(cell);

        if(cell.hasClass(GRID_CELL_SELECTED_CLS)){
          cell.removeCls(GRID_CELL_SELECTED_CLS);
        }
        else {
          selected = false;
        }
      });

      if(selected){
        w.fire('deselectrow', rowIndex, w.get(rowIndex));
      }
    },
    /*
     * @param {Object} grid
     * @param {Object} params
     */
    onColumnEnterSelection: function (grid, params) {
      var me = this,
        w = me.widget;

      if (!me.columns || me.isMouseDown !== true) {
        return;
      }

      var start = {
        columnIndex: me.startColumnColumnIndex,
        side: me.startColumnSide
      };

      var end = {
        columnIndex: params.columnIndex,
        side: params.side
      };

      if (start.side === end.side) {
        switch (start.side) {
          case 'center':
            me.clearSelection('right');
            me.clearSelection('left');
            break;
          case 'left':
            me.clearSelection('center');
            me.clearSelection('right');
            break;
          case 'right':
            me.clearSelection('center');
            me.clearSelection('left');
            break;
        }

        me.selectColumns(start.columnIndex, end.columnIndex, start.side);
      }
      else if (start.side === 'center' && end.side === 'right') {
        me.selectColumns(start.columnIndex, w.columns.length, 'center');
        me.selectColumns(0, end.columnIndex, 'right');
      }
      else if (start.side === 'center' && end.side === 'left') {
        me.selectColumns(0, start.columnIndex, 'center');
        me.selectColumns(end.columnIndex, w.leftColumns.length, 'left');
      }
      else if (start.side === 'left' && end.side === 'center') {
        me.clearSelection('right');
        me.selectColumns(start.columnIndex, w.leftColumns.length, 'left');
        me.selectColumns(0, end.columnIndex, 'center');
      }
      else if (start.side === 'left' && end.side === 'right') {
        me.selectColumns(start.columnIndex, w.leftColumns.length, 'left');
        me.selectColumns(0, w.columns.length, 'center');
        me.selectColumns(0, end.columnIndex, 'right');
      }
      else if (start.side === 'right' && end.side === 'center') {
        me.clearSelection('left');
        me.selectColumns(0, start.columnIndex, 'right');
        me.selectColumns(end.columnIndex, w.columns.length, 'center');
      }
      else if (start.side === 'right' && end.side === 'left') {
        me.selectColumns(0, start.columnIndex, 'right');
        me.selectColumns(0, w.columns.length, 'center');
        me.selectColumns(end.columnIndex, w.leftColumns.length, 'left');
      }

      me.clearActiveCell();
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);
    },
    /*
     * @param {Object} grid
     * @param {Object} params
     */
    onRowEnterSelection: function (grid, params) {
      var me = this,
        w = me.widget;

      if(w.startResizing){
        return;
      }

      if (me.enabled === false) {
        return;
      }

      if (!me.rows || me.isMouseDown !== true) {
        return;
      }

      if(!me.mouseMoveSelection){
        return;
      }

      var rowStart = me.startRowSelection,
        rowEnd = params.rowIndex,
        newSelectedRows = {};

      if (rowStart > rowEnd) {
        rowStart = params.rowIndex;
        rowEnd = me.startRowSelection;
      }

      var i = rowStart,
        iL = rowEnd + 1;

      for (; i < iL; i++) {
        newSelectedRows[i] = true;
      }

      var currentSelected = me.getSelectedRowByColumn(params.columnIndex, params.side),
        toSelect = {},
        toDeselect = {};

      for (var p in newSelectedRows) {
        if (currentSelected[p] !== true) {
          toSelect[p] = true;
        }
      }

      for (var p in currentSelected) {
        if (newSelectedRows[p] !== true) {
          toDeselect[p] = true;
        }
      }

      for (var p in toSelect) {
        me.domSelectRow(p);
        if (me.checkboxRow) {
          me.selectCheckBox(p);
        }
      }

      for (var p in toDeselect) {
        me.domDeSelectRow(p);
        if (me.checkboxRow) {
          me.deSelectCheckBox(p);
        }
      }

      me.clearActiveCell();
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);

      w.fire('select', me.getSelection());
    },
    /*
     * @param {Number} columnIndex
     * @param {String} side
     * @return {Object}
     */
    getSelectedRowByColumn: function (columnIndex, side) {
      var w = this.widget,
        body;

      switch (side) {
        case 'left':
          body = w.leftBody;
          break;
        case 'center':
          body = w.body;
          break;
        case 'right':
          body = w.rightBody;
          break;
      }

      var columnEl = body.el.select('.' + GRID_COLUMN_CLS + '[index="' + columnIndex + '"][grid="' + w.id + '"]'),
        selectedCells = columnEl.select('.' + GRID_CELL_SELECTED_CLS),
        selectedRows = {};

      selectedCells.each(function (cell) {
        selectedRows[Number(cell.attr('index'))] = true;
      });

      return selectedRows;
    },
    /*
     * @return {Number}
     */
    getSelectedRow: function () {
      var w = this.widget,
        body = w.body,
        selectedCells = body.el.select('.' + GRID_CELL_SELECTED_CLS);

      if (selectedCells.length === 0) {
        return -1;
      }

      return Number(selectedCells.item(0).attr('index'));
    },
    /*
     * @return {Array}
     */
    getSelectedRows: function () {
      var w = this.widget,
        body = w.body,
        columnEl = body.el.select('.' + GRID_COLUMN_CLS + '[index="0"][grid="' + w.id + '"]'),
        selectedCells = columnEl.select('.' + GRID_CELL_SELECTED_CLS),
        rows = [];

      selectedCells.each(function (cell) {
        rows.push(Number(cell.attr('index')));
      });

      return rows;
    },
    /*
     *
     */
    initColumnSelection: function () {
      var me = this,
        w = me.widget;

      me.selectedColumns = [];

      w.on('columnclick', me.onColumnClick, me);
      w.on('columnmousedown', me.onColumnMouseDown, me);
      w.on('columnenter', me.onColumnEnterSelection, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onColumnClick: function (grid, params) {
      var me = this;

      if (!me.column || params.column.selectable === false) {
        return;
      }

      var columnEl = F.get(params.columnDom);

      if (me.column) {
        me.selectedColumns[0] = params;
      }

      me.clearSelection();

      columnEl.addCls(GRID_COLUMN_SELECTED_CLS);
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onRowClick: function (grid, params) {
      var me = this,
        w = me.widget,
        s = w.store,
        rowIndex = params.rowIndex,
        target = F.get(params.e.target);

      if(me.disabled){
        return;
      }

      if (!me.row || params === false) {
        return;
      }

      if (me.checkOnly && (params.column.index !== '$selected' && !params.column.select)) {
        return;
      }

      if(me.selectLeafsOnly){
        if(!params.data.leaf){
          return;
        }
      }

      var column = params.column,
        select = true;

      if(column.type === 'tree'){
        if(target.hasCls(GRID_COLUMN_TREE_EXPANDER_CLS)){
          return;
        }
      }

      if (column.type === 'action' && column.items) {
        F.each(column.items, function (item) {
          if (item.action === 'remove') {
            select = false;
          }
        });
      }

      var hasSelection = F.get(params.cell).hasClass(GRID_CELL_SELECTED_CLS);

      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);

      if (params.column.index === '$selected' || params.column.select) {
        var checkbox = F.getWidget(F.get(params.cell).select('.' + FIELD_CHECKBOX_CLS).attr('id')),
          checked = checkbox.get();

        if (checkbox.el.within(target)) {
          me.clearSelection();
          if (checked === true) {
            me.selectCheckBox(rowIndex);
            me.domSelectRow(rowIndex);
          }
          else {
            me.deSelectCheckBox(rowIndex);
          }
        }
        else {
          if(me.checkOnly){
            return;
          }

          me.clearSelection();

          if (checked !== true) {
            me.selectCheckBox(rowIndex);
            me.domSelectRow(rowIndex);
          }
          else {
            me.deSelectCheckBox(rowIndex);
          }
        }

        w.fire('select', me.getSelection());
      }
      else if (select) {
        me.clearSelection();
        if((me.allowDeselect) && hasSelection) {}
        else {
          me.domSelectRow(rowIndex);
          me.selectCheckBox(rowIndex);
        }
        w.fire('select', me.getSelection());
      }
    },
    /*
     * @param {Object} grid
     * @param {Object} params
     */
    onCellClickRows: function (grid, params) {
      var me = this,
        w = me.widget;

      if(me.disabled){
        return;
      }

      if (!me.rows || !me.enabled) {
        return;
      }

      if (me.checkOnly && (params.column.index !== '$selected' && !params.column.select)) {
        return;
      }

      var e = params.e,
        isCTRL = e.ctrlKey,
        rowIndex = params.rowIndex;

      if ((isCTRL || me.allowDeselect) && w.multiSelect) {}
      else if (params.column.index === '$selected' || params.column.select) {
        var checkbox = F.getWidget(F.get(params.cell).select('.' + FIELD_CHECKBOX_CLS).attr('id'));
        if(checkbox.middle !== true) {
          if (checkbox.get() === true) {
            me.selectCheckBox(rowIndex);
          }
          else {
            me.deSelectCheckBox(rowIndex);
          }
        }
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectRow: function (rowIndex, value, multi) {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody;

      if(value === undefined){
        value = true;
      }

      multi = multi || false;

      if(w.startResizing){
        return;
      }

      if (!me.row && !me.rows) {
        throw new Error('[FancyGrid Error] - row selection was not enabled');
      }

      if(!multi){
        me.clearSelection();
      }

      if(value){
        me.domSelectRow(rowIndex);
      }
      else{
        me.domDeSelectRow(rowIndex);
      }

      F.each(w.columns, function (column, i) {
        if(column.type === 'select' || column.select){
          var el = body.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"]' + ' .' + GRID_CELL_CLS + '[index="'+rowIndex+'"]' + ' .' + FIELD_CHECKBOX_CLS),
            checkBox = Fancy.getWidget(el.attr('id'));

          if(checkBox){
            checkBox.set(value);
          }
        }
      });

      F.each(w.leftColumns, function (column, i) {
        if(column.type === 'select' || column.select){
          var el = leftBody.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"]' + ' .' + GRID_CELL_CLS + '[index="'+rowIndex+'"]' + ' .' + FIELD_CHECKBOX_CLS),
            checkBox = Fancy.getWidget(el.attr('id'));

          if(checkBox){
            checkBox.set(value);
          }
        }
      });

      F.each(w.rightColumns, function (column, i) {
        if(column.type === 'select' || column.select){
          var el = rightBody.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"]' + ' .' + GRID_CELL_CLS + '[index="'+rowIndex+'"]' + ' .' + FIELD_CHECKBOX_CLS),
            checkBox = Fancy.getWidget(el.attr('id'));

          if(checkBox){
            checkBox.set(value);
          }
        }
      });

      w.fire('select', me.getSelection());
    },
    /*
     * @param {Number|String} id
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectById: function (id, value, multi) {
      var me = this,
        w = me.widget,
        rowIndex = w.find('id', String(id))[0];

      if(rowIndex !== undefined){
        me.selectRow(rowIndex, value, multi);
      }
      else{
        rowIndex = w.find('id', Number(id))[0];

        if(rowIndex !== undefined){
          me.selectRow(rowIndex, value, multi);
        }
        else{
          if(me.memory){
            if(value === true || value === undefined){
              me.memory.add(id);
            }
            else{
              me.memory.remove(id);
            }
          }
        }
      }
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onCellClick: function (grid, params) {
      var me = this,
        w = me.widget;

      if (!me.cell) {
        return;
      }

      me.clearSelection();

      F.get(params.cell).addCls(GRID_CELL_SELECTED_CLS, GRID_CELL_ACTIVE_CLS);

      w.fire('select', me.getSelection());
    },
    /*
     * @param {String} side
     */
    clearSelection: function (side) {
      var me = this,
        w = me.widget;

      if (me.checkboxRow) {
        var selected = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + FIELD_CHECKBOX_ON_CLS),
          rows = {};

        selected.each(function (item) {
          var rowIndex = item.closest('.' + GRID_CELL_CLS).attr('index');

          if(rows[rowIndex]){
            return;
          }

          rows[rowIndex] = true;
          me.deSelectCheckBox(rowIndex);
        });
      }

      if (me.memory) {
        me.memory.clearAll();
      }

      if (side) {
        switch (side) {
          case 'left':
            w.leftBody.el.select('.' + GRID_CELL_SELECTED_CLS).removeCls(GRID_CELL_SELECTED_CLS);
            w.leftBody.el.select('.' + GRID_COLUMN_SELECTED_CLS).removeCls(GRID_COLUMN_SELECTED_CLS);
            w.leftBody.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
            break;
          case 'center':
            w.body.el.select('.' + GRID_CELL_SELECTED_CLS).removeCls(GRID_CELL_SELECTED_CLS);
            w.body.el.select('.' + GRID_COLUMN_SELECTED_CLS).removeCls(GRID_COLUMN_SELECTED_CLS);
            w.body.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
            break;
          case 'right':
            w.rightBody.el.select('.' + GRID_CELL_SELECTED_CLS).removeCls(GRID_CELL_SELECTED_CLS);
            w.rightBody.el.select('.' + GRID_COLUMN_SELECTED_CLS).removeCls(GRID_COLUMN_SELECTED_CLS);
            w.rightBody.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
            break;
        }
      }
      else {
        w.el.select('.' + GRID_CELL_SELECTED_CLS).removeCls(GRID_CELL_SELECTED_CLS);
        w.el.select('.' + GRID_COLUMN_SELECTED_CLS).removeCls(GRID_COLUMN_SELECTED_CLS);
        w.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
      }

      me.clearActiveCell();

      w.fire('clearselect');
      w.fire('select', w.getSelection());
    },
    /*
     *
     */
    onSort: function () {
      var me = this;

      me.clearActiveCell();
      if (me.memory) {
        me.updateSelection();
        return;
      }

      me.clearSelection();
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onCellEnterSelection: function (grid, params) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        numOfSelectedCells = 0;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if (!me.cells || me.isMouseDown !== true) {
        return;
      }

      me.prevCellsSelection = params.cell;
      me.prevCellRowIndex = params.rowIndex;
      me.prevCellColumnIndex = params.columnIndex;
      me.prevCellSide = params.side;

      var start = {
        rowIndex: me.startCellRowIndex,
        columnIndex: me.startCellColumnIndex,
        side: me.startCellSide
      };

      var end = {
        rowIndex: params.rowIndex,
        columnIndex: params.columnIndex,
        side: params.side
      };

      if (params.rowIndex < me.startCellRowIndex) {
        start.rowIndex = params.rowIndex;
        end.rowIndex = me.startCellRowIndex;
      }

      if (me.startCellSide === params.side) {
        if (params.columnIndex < me.startCellColumnIndex) {
          start.columnIndex = params.columnIndex;
          end.columnIndex = me.startCellColumnIndex;
        }

        numOfSelectedCells = me.selectCells(start, end, start.side);

        if (me.startCellSide === 'left') {
          me.clearSelection('center');
          me.clearSelection('right');
        }
        else if (me.startCellSide === 'center') {
          me.clearSelection('left');
          me.clearSelection('right');
        }
        else if (me.startCellSide === 'right') {
          me.clearSelection('left');
          me.clearSelection('center');
        }
      }
      else {
        if (me.startCellSide === 'left') {
          numOfSelectedCells = me.selectCells(start, {
            rowIndex: params.rowIndex,
            columnIndex: w.leftColumns.length - 1
          }, 'left');

          if (params.side === 'center') {
            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex,
            }, end, 'center');

            me.clearSelection('right');
          }
          else if (params.side === 'right') {
            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex
            }, {
              columnIndex: w.columns.length - 1,
              rowIndex: end.rowIndex
            }, 'center');

            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex
            }, end, 'right');
          }
        }
        else if (me.startCellSide === 'center') {
          if (params.side === 'left') {
            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex
            }, {
              rowIndex: end.rowIndex,
              columnIndex: start.columnIndex
            }, 'center');

            numOfSelectedCells += me.selectCells({
              columnIndex: end.columnIndex,
              rowIndex: start.rowIndex
            }, {
              rowIndex: end.rowIndex,
              columnIndex: w.leftColumns.length - 1
            }, 'left');
          }
          else if (params.side === 'right') {
            numOfSelectedCells += me.selectCells({
              columnIndex: start.columnIndex,
              rowIndex: start.rowIndex
            }, {
              columnIndex: w.columns.length - 1,
              rowIndex: end.rowIndex
            }, 'center');

            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex
            }, {
              columnIndex: end.columnIndex,
              rowIndex: end.rowIndex
            }, 'right');
          }
        }
        else if (me.startCellSide === 'right') {
          numOfSelectedCells += me.selectCells({
            columnIndex: 0,
            rowIndex: start.rowIndex
          }, {
            columnIndex: start.columnIndex,
            rowIndex: end.rowIndex
          }, 'right');

          if (params.side === 'center') {
            numOfSelectedCells += me.selectCells({
              columnIndex: end.columnIndex,
              rowIndex: start.rowIndex
            }, {
              columnIndex: w.columns.length - 1,
              rowIndex: end.rowIndex
            }, 'center');
            me.clearSelection('left');
          }
          else if (params.side === 'left') {
            numOfSelectedCells += me.selectCells({
              columnIndex: 0,
              rowIndex: start.rowIndex
            }, {
              columnIndex: w.columns.length - 1,
              rowIndex: end.rowIndex
            }, 'center');

            numOfSelectedCells += me.selectCells({
              columnIndex: end.columnIndex,
              rowIndex: start.rowIndex
            }, {
              columnIndex: w.leftColumns.length - 1,
              rowIndex: end.rowIndex
            }, 'left');
          }
        }
      }

      me.endCellRowIndex = end.rowIndex;
      me.clearActiveCell();
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);

      w.fire('select', me.getSelection());
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onColumnMouseDown: function (grid, params) {
      var me = this,
        w = me.widget;

      if (!me.columns || params.column.selectable === false || !me.enabled) {
        return;
      }

      if(document.activeElement){
        document.activeElement.blur();
      }

      var columnEl = F.get(params.columnDom);

      me.isMouseDown = true;
      me.startColumnColumnIndex = params.columnIndex;
      me.startColumnSide = params.side;

      me.clearSelection();

      columnEl.addCls(GRID_COLUMN_SELECTED_CLS);

      F.$(document).one('mouseup', function () {
        delete me.isMouseDown;
      });

      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);

      w.fire('select', me.getSelection());
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} params
     */
    onCellMouseDownCells: function (grid, params) {
      var me = this,
        w = me.widget;

      if (w.celledit) {
        w.celledit.hideEditor();
      }

      if (!me.cells || !me.enabled) {
        return;
      }

      if(document.activeElement){
        document.activeElement.blur();
      }

      var cellEl = F.get(params.cell);

      me.clearSelection();

      w.el.select('.' + GRID_CELL_ACTIVE_CLS).removeCls(GRID_CELL_ACTIVE_CLS);
      cellEl.addCls(GRID_CELL_SELECTED_CLS, GRID_CELL_ACTIVE_CLS);
      me.isMouseDown = true;
      me.startCellSelection = params.cell;
      me.startCellRowIndex = params.rowIndex;
      me.startCellColumnIndex = params.columnIndex;
      me.startCellSide = params.side;

      F.$(document).one('mouseup', function () {
        delete me.isMouseDown;
        delete me.startCellSelection;
      });

      w.fire('select', me.getSelection());
    },
    /*
     * @param {Object} params
     */
    selectCell: function (params) {
      var me = this,
        w = me.widget,
        id = params.id,
        index = params.index,
        rowIndex = w.getRowById(id),
        columnOrder = w.getColumnOrderByKey(index),
        columnOrderIndex = columnOrder.order,
        body = w.getBody(columnOrder.side),
        cell = body.getCell(rowIndex, columnOrderIndex);

      w.clearSelection();
      me.clearActiveCell();
      F.get(params.cell).addCls(GRID_CELL_ACTIVE_CLS);
      cell.addCls(GRID_CELL_SELECTED_CLS);
      //w.scroller.scrollToCell(cell.dom, true);
      w.scroller.scrollToCell(cell.dom, true, params.firstRow);
    },
    /*
     * @param {Number} start
     * @param {Number} end
     * @param {String} side
     */
    selectCells: function (start, end, side) {
      var me = this,
        w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        i = start.rowIndex,
        iL = end.rowIndex + 1,
        b,
        j,
        jL,
        selectedCells = me.getSelectedCells(side || 'center'),
        needToSelect = {},
        toSelect = {},
        toDeselect = {};

      i = start.rowIndex;
      iL = end.rowIndex + 1;
      for (; i < iL; i++) {
        needToSelect[i] = needToSelect[i] || {};
        j = start.columnIndex;
        jL = end.columnIndex + 1;

        for (; j < jL; j++) {
          needToSelect[i][j] = true;
        }
      }

      for (var p in needToSelect) {
        if (selectedCells[p] === undefined) {
          toSelect[p] = needToSelect[p];
        }
        else {
          for (var q in needToSelect[p]) {
            if (selectedCells[p][q] !== true) {
              toSelect[p] = toSelect[p] || {};
              toSelect[p][q] = true;
            }
          }
        }
      }

      for (var p in selectedCells) {
        if (needToSelect[p] === undefined) {
          toDeselect[p] = selectedCells[p];
        }
        else {
          for (var q in selectedCells[p]) {
            if (needToSelect[p][q] !== true) {
              toDeselect[p] = toDeselect[p] || {};
              toDeselect[p][q] = true;
            }
          }
        }
      }

      switch (side) {
        case 'left':
          b = leftBody;
          break;
        case 'center':
          b = body;
          break;
        case 'right':
          b = rightBody;
          break;
        default:
          b = body;
      }

      for (var p in toSelect) {
        for (var q in toSelect[p]) {
          var cell = b.getCell(p, q);

          cell.addCls(GRID_CELL_SELECTED_CLS);
        }
      }

      for (var p in toDeselect) {
        for (var q in toDeselect[p]) {
          var cell = b.getCell(p, q);

          cell.removeCls(GRID_CELL_SELECTED_CLS);
        }
      }
    },
    /*
     * @param {String} side
     * @return {Array}
     */
    getSelectedCells: function (side) {
      var me = this,
        w = me.widget,
        body = w.getBody(side || 'center'),
        selectedCells = body.el.select('.' + GRID_CELL_SELECTED_CLS),
        selected = {},
        i = 0,
        iL = selectedCells.length;

      for (; i < iL; i++) {
        var cell = selectedCells.item(i),
          columnIndex = Number(cell.parent().attr('index')),
          rowIndex = Number(cell.attr('index'));

        selected[rowIndex] = selected[rowIndex] || {};
        selected[rowIndex][columnIndex] = true;
      }

      return selected;
    },
    /*
     * @return {Array}
     */
    getNumberSelectedCells: function () {
      return this.widget.el.select('.' + GRID_CELL_SELECTED_CLS).length;
    },
    /*
     * @param {String} side
     * @return {Array}
     */
    getSelectedColumns: function (side) {
      var w = this.widget,
        body = w.getBody(side),
        selected = {},
        selectedColumns = body.el.select('.' + GRID_COLUMN_SELECTED_CLS),
        i = 0,
        iL = selectedColumns.length;

      for (; i < iL; i++) {
        selected[selectedColumns.item(i).attr('index')] = true;
      }

      return selected;
    },
    /*
     * @param {Number} start
     * @param {Number} end
     * @param {String} side
     */
    selectColumns: function (start, end, side) {
      var me = this,
        selectedColumns = me.getSelectedColumns(side || 'center'),
        needToSelect = {},
        toSelect = {},
        toDeselect = {},
        i = start,
        iL = end;

      if (iL < i) {
        i = end;
        iL = start;
      }

      iL++;
      for (; i < iL; i++) {
        needToSelect[i] = true;
      }

      for (var p in needToSelect) {
        if (selectedColumns[p] !== true) {
          toSelect[p] = true;
        }
      }

      for (var p in selectedColumns) {
        if (needToSelect[p] !== true) {
          toDeselect[p] = true;
        }
      }

      for (var p in toSelect) {
        me.selectColumn(p, side);
      }

      for (var p in toDeselect) {
        me.deselectColumn(p, side);
      }
    },
    /*
     * @param {Object} columnIndex
     * @param {String} side
     */
    selectColumn: function (columnIndex, side) {
      var w = this.widget,
        body = w.getBody(side || 'center'),
        columnEl = F.get(body.getDomColumn(columnIndex));

      columnEl.addCls(GRID_COLUMN_SELECTED_CLS);
    },
    /*
     * @param {Object} columnIndex
     * @param {String} side
     */
    deselectColumn: function (columnIndex, side) {
      var w = this.widget,
        body = w.getBody(side || 'center'),
        columnEl = F.get(body.getDomColumn(columnIndex));

      columnEl.removeCls(GRID_COLUMN_SELECTED_CLS);
    },
    /*
     * @param {Object} returnModel
     * @return {Fancy.Model|Array}
     */
    getSelection: function (returnModel) {
      var me = this,
        w = me.widget,
        s = w.store,
        model = {},
        excepted;

      switch (me.selModel) {
        case 'row':
          model.row = me.getSelectedRow();

          if(model.row !== -1) {
            model.items = [s.get(model.row)];
            model.rows = [model.row];
          }
          else {
            model.items = [];
            model.rows = [];
          }
          break;
        case 'rows':
          model.rows = me.getSelectedRows();
          if (me.memory && me.memory.all) {
            excepted = me.memory.excepted;
            if(s.filteredDataMap){
              model.items = Fancy.Array.copy(s.filteredData);
            }
            else{
              model.items = Fancy.Array.copy(s.data);
            }
          }
          else {
            model.items = [];
            if(me.memory && !Fancy.Object.isEmpty(me.memory.selected)){
              var selected = me.memory.selected;

              if(s.filteredDataMap){
                for (var p in selected) {
                  if(s.filteredDataMap[p]){
                    model.items.push(s.getById(p));
                  }
                }
              }
              else {
                for (var p in selected) {
                  var item = s.getById(p);
                  if(item){
                    model.items.push(item);
                  }
                  else{
                    model.items.push(me.memory.selected[p]);
                  }
                }
              }
            }
            else {
              var i = 0,
                iL = model.rows.length;

              for (; i < iL; i++) {
                model.items.push(s.get(model.rows[i]));
              }
            }
          }
          break;
        case 'cells':
          model.items = me.getSelectedData();
          if(returnModel) {
            var cells = w.el.select('.' + GRID_CELL_SELECTED_CLS);
            if (cells.length > 1) {
              model.nodes = [];
              F.each(cells.dom, function (cellDom) {
                model.nodes.push(me.getNodeInfo(new F.Element(cellDom)));
              });
            }
            else if (cells.length === 1) {
              model.nodes = [this.getNodeInfo(cells)];
            }
            else {
              model.nodes = [];
            }
          }
          break;
        case 'cell':
          model.items = me.getSelectedData();
          if(returnModel) {
            var cell = w.el.select('.' + GRID_CELL_SELECTED_CLS);
            if (cell.length) {
              model.nodes = [this.getNodeInfo(cell)];
            }
            else {
              model.nodes = [];
            }
          }
          break;
        case 'column':
          break;
        case 'columns':
          break;
      }

      if(excepted){
        var items = [];

        F.each(model.items, function (item, i) {
          if (F.isObject(item.data)) {
            model.items[i] = item.data;
          }

          var id = model.items[i].id;
          if(!excepted[id]){
            items.push(model.items[i]);
          }
        });

        model.items = items;
      }
      else {
        F.each(model.items, function (item, i) {
          if (item && F.isObject(item.data)) {
            model.items[i] = item.data;
          }
        });
      }

      if (returnModel) {
        return model;
      }

      return model.items || [];
    },
    /*
     *
     */
    renderHeaderCheckBox: function () {
      var me = this,
        w = this.widget;

      if(w.header) {
        me._renderHeaderCheckBox(w.leftHeader, w.leftColumns);
        me._renderHeaderCheckBox(w.header, w.columns);
        me._renderHeaderCheckBox(w.rightHeader, w.rightColumns);
      }
    },
    /*
     * @param {Fancy.Header} header
     * @param {Array} columns
     */
    _renderHeaderCheckBox: function (header, columns) {
      var me = this,
        w = me.widget,
        memory = me.memory,
        selected = w.getSelection();

      F.each(columns, function (column, i) {
        if ((column.index === '$selected' || column.select) && column.headerCheckBox !== false) {
          var cell = header.getCell(i);
          cell.addCls(GRID_HEADER_CELL_SELECT_CLS);
          var headerCellContainer = cell.firstChild(),
            editable = !me.disabled,
            textEl = cell.select('.' + GRID_HEADER_CELL_TEXT_CLS);

          if(!column.select){
            textEl.update('');
          }
          else{
            textEl.update(column.title || '');
          }

          if(headerCellContainer.select('.'+FIELD_CHECKBOX_CLS).length){
            var checkbox = F.getWidget(headerCellContainer.select('.'+FIELD_CHECKBOX_CLS).item(0).attr('id'));
            checkbox.destroy();
          }

          var value = false;

          if(me.memory){
            if(memory.all){
              value = true;
            }
          }
          else{
            if(selected.length === w.getViewTotal() && selected.length !== 0){
              value = true;
            }
          }

          column.headerCheckBox = new F.CheckBox({
            renderTo: headerCellContainer.dom,
            renderBefore: column.select? textEl: undefined,
            renderId: true,
            value: value,
            label: false,
            editable: editable,
            disabled: me.disabled,
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              change: function (checkbox, value) {
                if (value) {
                  if (memory) {
                    memory.setAll();
                  }
                  me.selectAll();
                }
                else {
                  if (memory) {
                    memory.clearAll();
                  }
                  me.deSelectAll();
                }

                me.updateHeaderCheckBox();
              }
            }]
          });
        }
      });
    },
    /*
     *
     */
    selectAll: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        headerCheckBoxEls = w.el.select('.' + GRID_HEADER_CELL_SELECT_CLS + ' .' + FIELD_CHECKBOX_CLS),
        i = 0,
        iL = w.getViewTotal();

      if(me.memory && s.isTree){
        me.memory.tree.selected = {};
        me.memory.tree.allSelected = {};
        me.memory.tree.selectedLength = {};
        me.updateTreeSelection();
      }

      me.selectingAll = true;

      for (; i < iL; i++) {
        var checkBoxEls = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + GRID_CELL_CLS + '[index="' + i + '"] .' + FIELD_CHECKBOX_CLS),
          j = 0,
          jL = checkBoxEls.length;

        for (; j < jL; j++) {
          var checkBox = F.getWidget(checkBoxEls.item(j).attr('id'));

          checkBox.setValue(true);
        }

        me.domSelectRow(i);
      }

      headerCheckBoxEls.each(function (item) {
        var checkBox = F.getWidget(item.attr('id'));

        checkBox.setValue(true, false);
      });

      w.fire('select', w.getSelection());
      setTimeout(function () {
        delete me.selectingAll;
      }, 1);
    },
    /*
     *
     */
    deSelectAll: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        i = 0,
        iL = w.getViewTotal();

      if(me.memory && s.isTree){
        me.memory.tree.selected = {};
        me.memory.tree.allSelected = {};
        me.memory.tree.selectedLength = {};
        me.updateTreeSelection();
      }

      me.deselectingAll = true;

      for (; i < iL; i++) {
        var checkBoxEls = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + GRID_CELL_CLS + '[index="' + i + '"] .' + FIELD_CHECKBOX_CLS);

        checkBoxEls.each(function (item) {
          var checkBox = F.getWidget(item.attr('id'));

          checkBox.setValue(false);
        });

        me.domDeSelectRow(i);
      }

      me.updateHeaderCheckBox();
      w.fire('clearselect');
      w.fire('select', w.getSelection());

      delete me.deselectingAll;
    },
    /*
     *
     */
    updateHeaderCheckBox: function () {
      var me = this,
        w = me.widget,
        total = w.getTotal(),
        headerCheckBoxEls = w.el.select('.' + GRID_HEADER_CELL_SELECT_CLS + ' .' + FIELD_CHECKBOX_CLS);
        //headerCheckBoxEls = w.el.select('.' + GRID_HEADER_CLS + ' .' + FIELD_CHECKBOX_CLS);

      headerCheckBoxEls.each(function (item) {
        var checkBox = F.getWidget(item.attr('id'));

        if(me.memory){
          if(me.memory.selectedLength > 0 || me.memory.all){
            if(me.memory.selectedLength === total){
              checkBox.setValue(true, false);
              checkBox.setMiddle(false);
            }
            else {
              if(me.memory.all && me.memory.exceptedLength === 0){
                checkBox.setValue(true, false);
                checkBox.setMiddle(false);
              }
              else {
                checkBox.setMiddle(true);
                checkBox.setValue(false, false);
              }
            }
          }
          else {
            checkBox.setMiddle(false);
            checkBox.setValue(false, false);
          }
        }
        else{
          if(me.selectingAll){
            checkBox.setValue(true, false);
          }
          else {
            checkBox.setValue(false, false);
          }
          //checkBox.setMiddle(false);
        }
      });
    },
    /*
     *
     */
    stopSelection: function () {
      this.enabled = false;
    },
    enableSelection: function (value) {
      var me = this;

      if(me.disabled === true){
        me.enableHeaderCheckBoxes();
      }
      me.disabled = false;
      me.disabled = false;

      if (value !== undefined) {
        this.enabled = value;
        return;
      }

      this.enabled = true;
    },
    initFixTrackOver: function(){
      var me = this,
        w = me.widget;

      if(w.columns){
        w.body.el.on('mouseleave', me.onBodyMouseLeave, me);
        w.body.el.on('mouseenter', me.onBodyMouseEnter, me);
      }

      if(w.leftColumns){
        w.leftBody.el.on('mouseleave', me.onLeftBodyMouseLeave, me);
        w.leftBody.el.on('mouseenter', me.onLeftBodyMouseEnter, me);
      }

      if(w.rightColumns){
        w.rightBody.el.on('mouseleave', me.onRightBodyMouseLeave, me);
        w.rightBody.el.on('mouseenter', me.onRightBodyMouseEnter, me);
      }
    },
    onBodyMouseLeave: function () {
      var me = this,
        w = me.widget;

      me.clearBodyTrackCls(w.body);
    },
    onBodyMouseEnter: function () {
      var me = this;

      me.rowTrackFixInBody = true;
      setTimeout(function () {
        me.rowTrackFixInBody = false;
      }, 30);
    },
    onLeftBodyMouseLeave: function () {
      var me = this,
        w = me.widget;

      me.clearBodyTrackCls(w.leftBody);
    },
    onLeftBodyMouseEnter: function () {
      var me = this;

      me.rowTrackFixInBody = true;
      setTimeout(function () {
        me.rowTrackFixInBody = false;
      }, 30);
    },
    onRightBodyMouseLeave: function () {
      var me = this,
        w = me.widget;

      me.clearBodyTrackCls(w.rightBody);
    },
    onRightBodyMouseEnter: function () {
      var me = this;

      me.rowTrackFixInBody = true;
      setTimeout(function () {
        me.rowTrackFixInBody = false;
      }, 30);
    },
    clearBodyTrackCls: function (body) {
      var me = this,
        w = me.widget;

      if(w.cellTrackOver){
        body.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
      }

      if(w.trackOver){
        delete body.prevCellOver;
        if(me.rowTrackFixInterval){
          clearInterval(me.rowTrackFixInterval);
          delete me.rowTrackFixInterval;
        }

        me.rowTrackFixInterval = setTimeout(function () {
          if(!me.rowTrackFixInBody){
            w.el.select('.' + GRID_ROW_OVER_CLS).removeCls(GRID_ROW_OVER_CLS);
          }
        }, 20);
      }
    },
    /*
     *
     */
    onColumnLock: function () {
      var me = this,
        w = me.widget,
        selectModel;

      if(me.cells || me.cell || me.column || me.columns){
        me.clearSelection();
        return;
      }

      selectModel = me.getSelection(true);

      //reselecting rows
      F.each(selectModel.rows, function (rowIndex) {
        w.selectRow(rowIndex, true, w.selModel === 'rows');
      }, 100);

      setTimeout(function(){
        me.renderHeaderCheckBox();
      }, 100);
    },
    /*
     *
     */
    onColumnRightLock: function () {
      var me = this,
        w = me.widget,
        selectModel;

      if(me.cells || me.cell || me.column || me.columns){
        me.clearSelection();
        return;
      }

      setTimeout(function(){
        selectModel = me.getSelection(true);

        //reselecting rows
        F.each(selectModel.rows, function (rowIndex) {
          w.selectRow(rowIndex, true, w.selModel === 'rows');
        });
      }, 100);

      setTimeout(function(){
        me.renderHeaderCheckBox();
      }, 100);
    },
    /*
     *
     */
    onUnColumnLock: function () {
      var me = this,
        w = me.widget,
        selectModel;

      if(me.cells || me.cell || me.column || me.columns){
        me.clearSelection();
        return;
      }

      setTimeout(function(){
        selectModel = me.getSelection(true);

        //reselecting rows
        F.each(selectModel.rows, function (rowIndex) {
          w.selectRow(rowIndex, true, w.selModel === 'rows');
        });
      }, 100);

      setTimeout(function(){
        me.renderHeaderCheckBox();
      }, 100);
    },
    /*
     *
     */
    disableSelection: function(){
      var me = this;

      me.disabled = true;
      me.enableHeaderCheckBoxes(false);
    },
    /*
     *
     */
    enableHeaderCheckBoxes: function (enabled) {
      var me = this,
        w = me.widget,
        body = w.body,
        leftBody = w.leftBody,
        rightBody = w.rightBody,
        method = 'enable';

      if(enabled === false){
        method = 'disable';
      }

      F.each(w.columns, function (column, i) {
        if(column.type === 'select' && column.headerCheckBox){
          column.headerCheckBox[method]();

          body.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"] .' + FIELD_CHECKBOX_CLS).each(function (el) {
            F.getWidget(el.attr('id'))[method]();
          });
        }
      });

      F.each(w.leftColumns, function (column, i) {
        if(column.type === 'select' && column.headerCheckBox){
          column.headerCheckBox[method]();

          leftBody.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"] .' + FIELD_CHECKBOX_CLS).each(function (el) {
            F.getWidget(el.attr('id'))[method]();
          });
        }
      });

      F.each(w.rightColumns, function (column, i) {
        if(column.type === 'select' && column.headerCheckBox){
          column.headerCheckBox[method]();

          rightBody.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"] .' + FIELD_CHECKBOX_CLS).each(function (el) {
            F.getWidget(el.attr('id'))[method]();
          });
        }
      });
    },
    /*
     *
     */
    onFilter: function () {
      var me = this,
        w = me.widget;

      me.clearActiveCell();
      if(!me.memory){
        me.clearSelection();
      }

      if(me.selModel === 'rows') {
        F.each(w.leftColumns, function (column, i) {
          if (column.type === 'select') {
            var cell = w.leftHeader.getCell(i),
              checkBox = F.getWidget(cell.select('.' + FIELD_CHECKBOX_CLS).attr('id'));

            if(checkBox){
              if(me.memory && me.memory.all){}
              else {
                checkBox.set(false, false);
              }
            }
          }
        });

        F.each(w.columns, function (column, i) {
          if (column.type === 'select') {
            var cell = w.header.getCell(i),
              checkBox = F.getWidget(cell.select('.' + FIELD_CHECKBOX_CLS).attr('id'));

            if(checkBox){
              if(me.memory && me.memory.all){}
              else {
                checkBox.set(false, false);
              }
            }
          }
        });

        F.each(w.rightColumns, function (column, i) {
          if (column.type === 'select') {
            var cell = w.rightHeader.getCell(i),
              checkBox = F.getWidget(cell.select('.' + FIELD_CHECKBOX_CLS).attr('id'));

            if(checkBox){
              if(me.memory && me.memory.all){}
              else {
                checkBox.set(false, false);
              }
            }
          }
        });
      }
    },
    /*
     *
     */
    onExpand: function () {
      var me = this;

      me.clearActiveCell();
      if(!me.memory){
        me.clearSelection();
      }
    },
    /*
     *
     */
    onCollapse: function () {
      var me = this;

      me.clearActiveCell();
      if(!me.memory){
        me.clearSelection();
      }
    },
    /*
     *
     */
    getActiveCell: function () {
      var me = this,
        w = me.widget,
        cell = w.el.select('.' + GRID_CELL_ACTIVE_CLS);

      if(!cell.dom){
        cell = w.el.select('.' + GRID_CELL_SELECTED_CLS);

        if(!cell.dom){
          cell = w.body.getCell(0, 0);
        }
        else{
          cell = cell.item(0);
        }
      }

      return cell;
    },
    /*
     *
     */
    getActiveCellInfo: function () {
      var me = this,
        w = me.widget,
        cell = cell || me.getActiveCell(),
        side = w.getSideByCell(cell),
        rowIndex = Number(cell.attr('index')),
        columnIndex = Number(cell.parent().attr('index'));

      return {
        side: side,
        rowIndex: rowIndex,
        columnIndex: columnIndex
      }
    },
    /*
     *
     */
    clearActiveCell: function () {
      var me = this,
        w = me.widget,
        cell = w.el.select('.' + GRID_CELL_ACTIVE_CLS);

      cell.removeCls(GRID_CELL_ACTIVE_CLS);
    },
    initCopyEl: function () {
      var me = this,
        w = me.widget,
        el = F.get(document.createElement('textarea'));

      el.addCls(GRID_COPY_TEXTAREA);
      el.attr('aria-hidden', 'true');

      me.copyEl = F.get(w.el.dom.appendChild(el.dom));
    },
    /*
     * @param {Boolean} copyHeader
     */
    copy: function(copyHeader){
      var me = this,
        w = me.widget,
        copyEl = me.copyEl,
        selection;

      switch(me.selModel){
        case 'cells':
        case 'cell':
          var data = me.getSelectedData(copyHeader);
          var dataStr = '';

          F.each(data, function (dataItem) {
            dataStr += dataItem.join('\t') + '\n';
          });

          copyEl.dom.value = dataStr;
          break;
        case 'rows':
        case 'row':
          selection = me.getSelection();
          var columns = [].concat(w.leftColumns).concat(w.columns).concat(w.rightColumns);
          var dataStr = '';

          if(copyHeader){
            var itemData = [];
            F.each(columns, function (column) {
              switch(column.index){
                case '$selected':
                case '$rowdrag':
                  return;
              }

              itemData.push(column.index || '');
            });
            dataStr += itemData.join('\t') + '\n';
          }

          F.each(selection, function (item) {
            var itemData = [];
            F.each(columns, function (column) {
              switch(column.index){
                case '$selected':
                case '$rowdrag':
                  return;
              }

              if(column.index){
                itemData.push(item[column.index]);
              }
            });

            dataStr += itemData.join('\t') + '\n';
          });

          copyEl.dom.value = dataStr;

          break;
        case 'columns':
        case 'column':
          var data = [];
          var dataView = w.getDataView();

          var getSideData = function (side) {
            var columns = w.getColumns(side),
              selection = me.getSelectedColumns(side);

            for(var p in selection){
              var column = columns[p];

              if(copyHeader){
                data.push([]);
                data[0].push(column.title || '');
              }

              if(column.index){
                F.each(dataView, function (item, i) {
                  if(copyHeader){
                    i++;
                  }

                  if(data[i] === undefined){
                    data[i] = [];
                  }

                  data[i].push(item[column.index]);
                });
              }
            }
          }

          if(w.leftColumns){
            getSideData('left');
          }

          if(w.columns){
            getSideData('center');
          }

          if(w.rightColumns){
            getSideData('right');
          }

          var dataStr = '';

          F.each(data, function (dataItem) {
            dataStr += dataItem.join('\t') + '\n';
          });

          copyEl.dom.value = dataStr;
          break;
      }

      copyEl.dom.select();
      copyEl.dom.focus();

      document.execCommand('copy');
    },
    initCopyKeys: function () {
      var me = this,
        doc = Fancy.get(document);

      doc.on('keydown', me.onKeyDownCopy, me);
    },
    /*
     * @param {Object} e
     */
    onKeyDownCopy: function (e) {
      var me = this,
        w = me.widget,
        keyCode = e.keyCode,
        key = Fancy.key;

      if(w.activated === false){
        return;
      }

      if(!e.ctrlKey){
        return;
      }

      switch (keyCode) {
        case key.C:
          if(w.celledit && w.celledit.activeEditor){
            return;
          }
          if(w.textSelection){
            return;
          }
          me.copy();
          break;
        case key.V:
          //TODO
          break;
      }
    },
    onColumnDrag: function(){
      var me = this;

      setTimeout(function(){
        me.renderHeaderCheckBox();
      }, 100);
    },
    disableSelectionMove: function () {
      var me = this;

      me.mouseMoveSelection = false;
    },
    /*
     * @return {Array}
     */
    getSelectedData: function(copyHeader){
      var me = this,
        w = me.widget,
        data = [];

      var getSelectedDataInSide = function (side) {
        var columns = w.getColumns(side),
          selection = me.getSelectedCells(side),
          i = 0,
          headerCopied = false;

        for(var p in selection){
          var item = w.get(p),
            selectedRow = selection[p];

          if(!headerCopied && copyHeader){
            data.push([]);
            for(var q in selectedRow) {
              var column = columns[q];

              if(column.index === ''){

              }

              data[0].push(column.title || '');
            }
            i++;
            headerCopied = true;
          }

          for(var q in selectedRow){
            var column = columns[q];
            if(!data[i]){
              data[i] = [];
            }

            if(column.index){
              data[i].push(item.get(column.index));
            }
          }
          i++;
        }
      };

      getSelectedDataInSide('left');
      getSelectedDataInSide('center');
      getSelectedDataInSide('right');

      return data;
    },
    /*
     * @param {Number} id
     */
    selectNodesChilds: function (id, value) {
      var me = this,
        w =  me.widget,
        item = w.getById(id);

      if(value === false && me.memory){
        me.memory.remove(id);
      }

      item.set('$selected', value);
      var selectChilds = function (childs) {
        F.each(childs, function (child, i) {
          child.$selected = value;
          if(!child.id){
            return true;
          }

          var rowIndex = w.getRowById(child.id);
          if(rowIndex !== undefined){
            w.selectRow(rowIndex, value, true);
          }

          if(value === false && me.memory){
            me.memory.remove(id);
          }

          if(child.data && child.data.child){
            selectChilds(child.data.child);
          }
        });
      };

      selectChilds(item.data.child);
    },
    /*
     *
     */
    clearOverCells: function () {
      var me = this,
        w = me.widget;

      w.el.select('.' + GRID_CELL_OVER_CLS).removeCls(GRID_CELL_OVER_CLS);
    },
    /*
     *
     */
    onDragRows: function () {
      var me = this;

      //TODO: fix Issue #2072

      me.clearActiveCell();
    },
    /*
     *
     */
    onRemoveRows: function () {
      var me = this;

      if(me.rows){
        if(me._interval) {
          clearInterval(me._interval);
        }

        me._interval = setTimeout(function () {
          me.updateHeaderCheckBox();
          delete me._interval;
        }, 1);
      }
    },
    /*
     *
     */
    onTreeExpand: function () {
      var me = this,
        w = me.widget;

      if(!me.memory){
        w.clearSelection();
      }
      else{
        me.updateSelection();
        me.updateTreeSelection();
      }
    },
    /*
     *
     */
    onTreeCollapse: function () {
      var me = this,
        w = me.widget;

      if(!me.memory){
        w.clearSelection();
      }
      else{
        me.updateSelection();
        me.updateTreeSelection();
      }
    },
    /*
     *
     */
    updateSelection: function () {
      var me = this,
        w = me.widget,
        body = w.body;

      if(!me.memory){
        return;
      }

      var selectedRows = body.el.select('.' + GRID_COLUMN_CLS + '[index="0"] .' + GRID_CELL_SELECTED_CLS);

      selectedRows.each(function (el) {
        var rowIndex = el.attr('index'),
          item = w.get(rowIndex),
          id = item.id;

        if(!me.memory.has(id)){
          me.domDeSelectRow(rowIndex);
        }
      });

      for(var id in me.memory.selected){
        var rowIndex = w.getRowById(id);

        if(rowIndex !== undefined){
          me.domSelectRow(rowIndex);
        }
      }
    },
    /*
     *
     */
    updateSelectCheckBoxes: function () {
      var me = this,
        w = me.widget;

      if(!me.memory){
        return;
      }

      var selectedCheckBoxes = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + FIELD_CHECKBOX_ON_CLS);

      selectedCheckBoxes.each(function (el) {
        var rowIndex = el.closest('.' + GRID_CELL_CLS).attr('index'),
          item = w.get(rowIndex),
          id = item.id;

        if(!me.memory.has(id)){
          var checkBox = F.getWidget(el.attr('id'));

          checkBox.set(false, false);
          me.domDeSelectRow(rowIndex);
        }
      });
    },
    /*
     *
     */
    updateTreeSelection: function () {
      var me = this,
        w = me.widget;

      for(var id in me.memory.tree.selected){
        var rowIndex = w.getRowById(id),
          checkboxEls = w.el.select('.' + GRID_COLUMN_SELECT_CLS + ' .' + GRID_CELL_CLS + '[index="' + rowIndex + '"]' + ' .' + FIELD_CHECKBOX_CLS);

        if(me.memory.tree.allSelected[id]){
          checkboxEls.each(function (el) {
            var _id = el.attr('id'),
              checkBox = F.getWidget(_id);

            setTimeout(function () {
              checkBox.set(true, false);
              checkBox.setMiddle(false);
              me.memory.add(id);
              me.domSelectRow(rowIndex);
            }, 200);
          });
        }
        else {
          checkboxEls.each(function (el) {
            var id = el.attr('id'),
              checkBox = F.getWidget(id);

            checkBox.setMiddle(true);
          });
        }
      }

      var middleCheckBoxes = w.el.select('.' + GRID_COLUMN_CLS + '.' + GRID_COLUMN_SELECT_CLS + ' .' + FIELD_CHECKBOX_MIDDLE_CLS);

      middleCheckBoxes.each(function (el) {
        var cell = el.closest('.' + GRID_CELL_CLS),
          rowIndex = cell.attr('index'),
          id = w.get(rowIndex, 'id'),
          checkBox = F.getWidget(el.attr('id'));

        if(!me.memory.tree.selected[id]){
          checkBox.setMiddle(false);
          if(!me.memory.tree.allSelected[id]){
            checkBox.set(false, false);
          }
          else{
            checkBox.setMiddle(false);
          }
        }

        if(me.memory.tree.allSelected[id]){
          setTimeout(function () {
            checkBox.set(true, false);
            checkBox.setMiddle(false);
            me.memory.add(id);
            me.domSelectRow(rowIndex);
          }, 200);
        }
        else {
          //me.domDeSelectRow(rowIndex);
        }

        if(checkBox.hasCls(FIELD_CHECKBOX_ON_CLS)){
          checkBox.removeCls(FIELD_CHECKBOX_MIDDLE_CLS);
          me.domSelectRow(rowIndex);
          me.memory.add(id);
          me.memory.removeDirtyParent(id);
        }

        if(cell.hasCls(GRID_CELL_SELECTED_CLS) && !checkBox.hasCls(FIELD_CHECKBOX_ON_CLS)){
          checkBox.set(true, false);
        }
      });
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getNodeInfo: function (cell) {
      var me = this,
        w = me.widget,
        columnEl = cell.parent(),
        bodyEl = columnEl.parent(),
        sideEl = bodyEl.parent(),
        side = '';

      if(sideEl.hasCls('fancy-grid-center')){
        side = 'center';
      }
      else if(sideEl.hasCls('fancy-grid-left')){
        side = 'left';
      }
      else if(sideEl.hasCls('fancy-grid-right')){
        side = 'right';
      }

      var columns = w.getColumns(side);

      return {
        side: side,
        columnIndex: Number(columnEl.attr('index')),
        index: columns[Number(columnEl.attr('index'))].index,
        column: columns[Number(columnEl.attr('index'))],
        rowIndex: Number(cell.attr('index')),
        cell: cell,
        value: cell.select('.fancy-grid-cell-inner').dom.innerHTML
      };
    }
  });

})();/*
 * @class Fancy.grid.selection.mixin.Navigation
 * TODO: write realization for key navigation
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var GRID_CELL_ACTIVE_CLS = F.GRID_CELL_ACTIVE_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;

  F.Mixin('Fancy.grid.selection.mixin.Navigation', {
    /*
     *
     */
    initNavigation: function () {
      this.addEvents('up', 'down', 'left', 'right');
      this.onsNav();
    },
    /*
     *
     */
    onsNav: function () {
      var me = this,
        doc = Fancy.get(document);

      doc.on('keydown', me.onKeyDown, me);
    },
    /*
     * @param {Object} e
     */
    onKeyDown: function (e) {
      var me = this,
        w = me.widget,
        keyCode = e.keyCode,
        key = Fancy.key;

      if(w.activated === false){
        return;
      }

      if(!me.keyNavigating) {
        var docEl = F.get(document);

        docEl.once('keyup', function () {
          delete me.keyNavigating;
        });
      }

      switch (keyCode) {
        case key.TAB:
          break;
        case key.UP:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveUp();
          break;
        case key.DOWN:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveDown();
          break;
        case key.LEFT:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveLeft();
          break;
        case key.RIGHT:
          me.keyNavigating = true;
          e.preventDefault();
          me.moveRight();
          break;
        case key.PAGE_UP:
          //me.keyNavigating = true;
          e.preventDefault();
          me.scrollPageUP();
          break;
        case key.PAGE_DOWN:
          //me.keyNavigating = true;
          e.preventDefault();
          me.scrollPageDOWN();
          break;
        case key.ENTER:
          if(w.celledit && !w.celledit.activeEditor) {
            if(w.selection && w.selection.selModel === 'cell' || w.selection.selModel === 'cells'){
              var activeCell = w.selection.getActiveCell();

              if(activeCell){
                var info = w.selection.getActiveCellInfo(),
                  columns = w.getColumns(info.side);

                info.column = columns[info.columnIndex];
                if(info.column.editable !== true){
                  return;
                }
                info.cell = activeCell.dom;
                var item = w.get(info.rowIndex);
                info.item = item;
                info.data = item.data;

                if (info.column.smartIndexFn) {
                  info.value = info.column.smartIndexFn(info.data);
                }
                else{
                  info.value = w.store.get(info.rowIndex, info.column.index);
                }

                w.celledit.edit(info);
              }
            }
          }
          break;
        case key.BACKSPACE:
        case key.DELETE:
          //TODO
          break;
        case key.ESC:
          break;
          /*
        case key.ZERO:
        case key.ONE:
        case key.TWO:
        case key.THREE:
        case key.FOUR:
        case key.FIVE:
        case key.SIX:
        case key.SEVEN:
        case key.EIGHT:
        case key.NINE:
        case key.A:
        case key.B:
        case key.C:
        case key.D:
        case key.E:
        case key.F:
        case key.G:
        case key.H:
        case key.I:
        case key.J:
        case key.K:
        case key.L:
        case key.M:
        case key.N:
        case key.O:
        case key.P:
        case key.Q:
        case key.R:
        case key.S:
        case key.T:
        case key.U:
        case key.V:
        case key.W:
        case key.X:
        case key.Y:
        case key.Z:
        */
        default:
          if(w.startEditByTyping && w.celledit && !w.celledit.activeEditor) {
            if(w.selection && w.selection.selModel === 'cell' || w.selection.selModel === 'cells') {
              var activeCell = w.selection.getActiveCell();

              if(activeCell) {
                var info = w.selection.getActiveCellInfo(),
                  columns = w.getColumns(info.side);

                info.column = columns[info.columnIndex];
                if(info.column.editable !== true){
                  return;
                }
                info.cell = activeCell.dom;
                var item = w.get(info.rowIndex);
                info.item = item;
                info.data = item.data;

                info.value = '';

                w.celledit.edit(info);
              }
            }
          }
          break;
      }
    },
    moveRight: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.columnIndex++;
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        switch(info.side){
          case 'left':
            if(w.columns){
              info.columnIndex = 0;
              body = w.getBody('center');
              info.side = 'center';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'center':
            if(w.rightColumns && w.rightColumns.length){
              info.columnIndex = 0;
              body = w.getBody('right');
              info.side = 'right';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
          case 'right':
            return;
        }
      }

      if(!nextCell.dom){
        return;
      }

      switch(info.side){
        case 'left':
          var _column = w.leftColumns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.leftColumns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.leftColumns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
              //TODO for center side
              var i = info.columnIndex,
                iL = w.columns.length,
                foundVisibleColumn = false;

              for(;i<iL;i++){
                _column = w.columns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(foundVisibleColumn){
                info.side = 'center';
                body = w.getBody(info.side);
              }
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
        case 'center':
          //TODO
          var _column = w.columns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.columns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.columns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
              //TODO for right side
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
        case 'right':
          var _column = w.rightColumns[info.columnIndex];

          if(_column.hidden) {
            var i = info.columnIndex,
              iL = w.rightColumns.length,
              foundVisibleColumn = false;

            for(;i<iL;i++){
              _column = w.rightColumns[i];

              if(!_column.hidden){
                foundVisibleColumn = true;
                info.columnIndex = i;
                break;
              }
            }

            if(!foundVisibleColumn){
              info.columnIndex--;
            }

            nextCell = body.getCell(info.rowIndex, info.columnIndex);
          }
          break;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'column':
        case 'columns':
          me.clearSelection();
          me.selectColumn(info.columnIndex, info.side);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    },
    moveLeft: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell,
        side;

      info.columnIndex--;

      if (info.columnIndex < 0) {
        switch (info.side) {
          case 'left':
            return;
          case 'center':
            if (w.leftColumns && w.leftColumns.length) {
              info.columnIndex = w.leftColumns.length - 1;
              body = w.getBody('left');
              info.side = 'left';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);

              var _column = w.leftColumns[info.columnIndex];
              if(_column.hidden){
                var i = info.columnIndex - 1,
                  foundVisibleColumn = false;

                for(;i>=0;i--){
                  _column = w.leftColumns[i];

                  if(!_column.hidden){
                    foundVisibleColumn = true;
                    info.columnIndex = i;
                    break;
                  }
                }
              }

              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            else{
              return;
            }
            break;
          case 'right':
            if (w.columns && w.columns.length) {
              info.columnIndex = w.columns.length - 1;
              body = w.getBody('center');
              info.side = 'center';
              nextCell = body.getCell(info.rowIndex, info.columnIndex);
            }
            break;
        }
      }
      else {
        switch (info.side) {
          case 'left':
            var _column = w.leftColumns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.leftColumns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;
              }
            }
            break;
          case 'center':
            var _column = w.columns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.columns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;

                if(w.leftColumns){
                  var i = w.leftColumns.length - 1,
                    foundVisibleColumn = false;

                  for(;i>=0;i--){
                    _column = w.leftColumns[i];

                    if(!_column.hidden){
                      foundVisibleColumn = true;
                      info.columnIndex = i;
                      break;
                    }
                  }

                  if(foundVisibleColumn){
                    side = 'left';
                    body = w.getBody(side);
                  }
                }
              }
            }
            break;
          case 'right':
            var _column = w.rightColumns[info.columnIndex];

            if(_column.hidden){
              var i = info.columnIndex - 1,
                foundVisibleColumn = false;

              for(;i>=0;i--){
                _column = w.rightColumns[i];

                if(!_column.hidden){
                  foundVisibleColumn = true;
                  info.columnIndex = i;
                  break;
                }
              }

              if(!foundVisibleColumn){
                info.columnIndex++;
                //TODO for center side

                var i = w.columns.length - 1,
                  foundVisibleColumn = false;

                side = 'center';
                body = w.getBody(side);

                for(;i>=0;i--){
                  _column = w.columns[i];

                  if(!_column.hidden){
                    foundVisibleColumn = true;
                    info.columnIndex = i;
                    break;
                  }
                }
              }
            }
            break;
        }
        nextCell = body.getCell(info.rowIndex, info.columnIndex);
      }

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'column':
        case 'columns':
          me.clearSelection();
          me.selectColumn(info.columnIndex, info.side);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
      }
    },
    moveUp: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.rowIndex--;
      if(info.rowIndex < 0){
        return;
      }
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'row':
        case 'rows':
          me.clearSelection();
          me.selectRow(info.rowIndex);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          if(me.selModel === 'rows'){
            me.updateHeaderCheckBox();
          }
          break;
      }
    },
    moveDown: function () {
      var me = this,
        w = me.widget,
        info = me.getActiveCellInfo(),
        body = w.getBody(info.side),
        nextCell;

      info.rowIndex++;
      nextCell = body.getCell(info.rowIndex, info.columnIndex);

      if(!nextCell.dom){
        return;
      }

      switch(me.selModel){
        case 'cell':
        case 'cells':
          me.clearSelection();
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          break;
        case 'row':
        case 'rows':
          me.clearSelection();
          me.selectRow(info.rowIndex);
          nextCell.addCls(GRID_CELL_ACTIVE_CLS, GRID_CELL_SELECTED_CLS);
          w.scroller.scrollToCell(nextCell.dom, true);
          if(me.selModel === 'rows'){
            me.updateHeaderCheckBox();
          }
          break;
      }
    },
    /*
     *
     */
    scrollPageUP: function () {
      var me = this,
        w = me.widget,
        bodyHeight = parseInt(w.body.el.height()),
        scroller = w.scroller,
        newScroll = scroller.scrollTop - bodyHeight;

      if(newScroll < 0){
        newScroll = 0;
      }

      w.scroll(newScroll);
    },
    /*
     *
     */
    scrollPageDOWN: function () {
      var me = this,
        w = me.widget,
        gridBorders = w.gridBorders,
        bodyViewHeight = w.getBodyHeight() - gridBorders[0] - gridBorders[2],
        viewHeight = w.getCellsViewHeight() - gridBorders[0] - gridBorders[2],
        scroller = w.scroller,
        newScroll = scroller.scrollTop + bodyViewHeight;

      if(newScroll > viewHeight - bodyViewHeight){
        newScroll = viewHeight - bodyViewHeight;
      }

      if(newScroll < 0){
        newScroll = 0;
      }

      w.scroll(newScroll);
    }
  });

})();