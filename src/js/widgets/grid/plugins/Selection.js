/*
 * @class Fancy.grid.plugin.Selection
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Selection', {
  extend: Fancy.Plugin,
  ptype: 'grid.selection',
  inWidgetName: 'selection',
  mixins: [
    'Fancy.grid.selection.mixin.Navigation'
  ],
  enabled: true,
  checkboxRow: false,
  /*
   * @constructor
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
    var me = this;

    me.Super('init', arguments);
    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget;

    w.once('render', function() {
      me.initTrackOver();
      me.initColumnTrackOver();
      me.initCellTrackOver();
      me.initCellSelection();
      me.initRowSelection();
      me.initColumnSelection();
      if(w.keyNavigation){
        me.initNavigation();
      }
      w.on('changepage', me.onChangePage, me);
    });

    w.on('sort', me.onSort, me);
  },
  /*
   *
   */
  initTrackOver: function(){
    var me = this,
      w = me.widget;

    w.on('rowenter', me.onRowEnter, me);
    w.on('rowleave', me.onRowLeave, me);
  },
  /*
   *
   */
  initCellTrackOver: function(){
    var me = this,
      w = me.widget;

    w.on('cellenter', me.onCellEnter, me);
    w.on('cellleave', me.onCellLeave, me);
  },
  /*
   *
   */
  initColumnTrackOver: function(){
    var me = this,
      w = me.widget;

    w.on('columnenter', me.onColumnEnter, me);
    w.on('columnleave', me.onColumnLeave, me);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onCellEnter: function(grid, params){
    var me = this,
      w = me.widget;

    if(!w.cellTrackOver){
      return;
    }

    var cellEl = Fancy.get(params.cell);

    cellEl.addClass(w.cellOverCls);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onCellLeave: function(grid, params){
    var me = this,
      w = me.widget;

    if(!w.cellTrackOver){
      return;
    }

    var cellEl = Fancy.get(params.cell);

    cellEl.removeClass(w.cellOverCls);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onColumnEnter: function(grid, params){
    var me = this,
      w = me.widget,
      scroller = w.scroller;

    if(!w.columnTrackOver || scroller.bottomKnobDown || scroller.rightKnobDown || params.column.trackOver === false){
      return;
    }

    var columnEl = Fancy.get(params.columnDom);

    columnEl.addClass(w.columnOverCls);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onColumnLeave: function(grid, params){
    var me = this,
      w = me.widget;

    if(!w.columnTrackOver){
      return;
    }

    var columnEl = Fancy.get(params.columnDom);

    columnEl.removeClass(w.columnOverCls);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onRowEnter: function(grid, params){
    var me = this,
      w = me.widget,
      scroller = w.scroller;

    if(me.enabled === false){
      return;
    }

    if(!w.trackOver || scroller.bottomKnobDown || scroller.rightKnobDown){
      return;
    }

    var rowCells = w.getDomRow(params.rowIndex),
      i = 0,
      iL = rowCells.length;

    for(;i<iL;i++){
      Fancy.get(rowCells[i]).addClass(w.rowOverCls);
    }

    w.fire('rowtrackenter', params);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onRowLeave: function(grid, params){
    var me = this,
      w = me.widget;

    if(me.enabled === false){
      return;
    }

    if(!w.trackOver){
      return;
    }

    var rowCells = w.getDomRow(params.rowIndex),
      i = 0,
      iL = rowCells.length;

    for(;i<iL;i++){
      Fancy.get(rowCells[i]).removeClass(w.rowOverCls);
    }

    w.fire('rowtrackleave', params);
  },
  /*
   *
   */
  onChangePage: function(){
    var me = this;

    this.clearSelection();
  },
  /*
   *
   */
  initCellSelection: function(){
    var me = this,
      w = me.widget;

    w.on('cellclick', me.onCellClick, me);

    w.on('cellmousedown', me.onCellMouseDownCells, me);
    w.on('cellenter', me.onCellEnterSelection, me);
  },
  /*
   *
   */
  initRowSelection: function(){
    var me = this,
      w = me.widget;

    if(w.checkboxRowSelection){
      me.checkboxRow = true;
      setTimeout(function(){
        me.renderHeaderCheckBox();
      });
    }

    w.on('rowclick', me.onRowClick, me);

    w.on('cellmousedown', me.onCellMouseDownRows, me);
    w.on('cellclick', me.onCellClickRows, me);
    w.on('rowenter', me.onRowEnterSelection, me);
  },
  /*
   * @param {Object} grid
   * @param {Object} params
   */
  onCellMouseDownRows: function(grid, params){
    var me = this,
      w = me.widget;

    if(!me.rows || !me.enabled){
      return;
    }

    var e = params.e,
      target = e.target,
      isCTRL = e.ctrlKey;

    var rowIndex = params.rowIndex,
      rowCells = w.getDomRow(rowIndex),
      i = 0,
      iL = rowCells.length;

    if(isCTRL && w.multiSelect){
      if( Fancy.get(rowCells[0]).hasClass(w.cellSelectedCls) ){
        me.domDeSelectRow(rowIndex);
        if(me.checkboxRow){
          me.deSelectCheckBox(rowIndex);
        }
      }
      else {
        me.domSelectRow(rowIndex);
        if (me.checkboxRow) {
          me.selectCheckBox(rowIndex);
        }
      }
    }
    else{
      if(params.column.index === '$selected'){
        var checkbox = Fancy.getWidget(Fancy.get(params.cell).select('.fancy-field-checkbox').attr('id'));

        if(checkbox.el.within(target)) {
          me.domSelectRow(rowIndex);
          if (checkbox.get() === true) {
            me.domDeSelectRow(rowIndex);
          }
          else {
            me.domSelectRow(rowIndex);
          }
        }
        else{
          me.clearSelection();
          me.domSelectRow(rowIndex);
          if(me.checkboxRow){
            me.selectCheckBox(rowIndex);
          }
        }
      }
      else{
        me.clearSelection();
        me.domSelectRow(rowIndex);
        if(me.checkboxRow){
          me.selectCheckBox(rowIndex);
        }
      }
    }

    me.isMouseDown = true;
    me.startRowSelection = rowIndex;

    Fancy.$(document).one('mouseup', function(){
      delete me.isMouseDown;
      delete me.startCellSelection;
    });

    w.fire('select');
  },
  /*
   * @param {Object} grid
   * @param {Object} params
   */
  onCellClickRows: function(grid, params){
    var me = this,
      w = me.widget;

    if(!me.rows || !me.enabled){
      return;
    }

    var e = params.e,
      isCTRL = e.ctrlKey;

    var rowIndex = params.rowIndex,
      rowCells = w.getDomRow(rowIndex),
      i = 0,
      iL = rowCells.length;

    if(isCTRL && w.multiSelect){

    }
    else{
      if(params.column.index === '$selected'){
        var checkbox = Fancy.getWidget(Fancy.get(params.cell).select('.fancy-field-checkbox').attr('id'));
        if(checkbox.get() === true){
          me.selectCheckBox(rowIndex);
        }
        else{
          me.deSelectCheckBox(rowIndex);
        }
      }
      else{}
    }
  },
  /*
   * @param {Number} rowIndex
   */
  selectCheckBox: function(rowIndex){
    var me = this,
      w = me.widget,
      checkBoxEls = w.el.select('.fancy-grid-cell-select .fancy-grid-cell[index="'+rowIndex+'"] .fancy-field-checkbox'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));
      checkBox.set(true);
    }

    me.clearHeaderCheckBox();
    //w.set(rowIndex, '$selected', true);
  },
  /*
   * @param {Number} rowIndex
   */
  deSelectCheckBox: function(rowIndex){
    var me = this,
      w = me.widget,
      checkBoxEls = w.el.select('.fancy-grid-cell-select .fancy-grid-cell[index="'+rowIndex+'"] .fancy-field-checkbox'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));
      checkBox.set(false);
    }

    me.clearHeaderCheckBox();
    //w.set(rowIndex, '$selected', true);
  },
  /*
   * @param {Number} rowIndex
   */
  domSelectRow: function(rowIndex){
    var me = this,
      w = me.widget,
      rowCells = w.getDomRow(rowIndex),
      i = 0,
      iL = rowCells.length;

    for(;i<iL;i++){
      Fancy.get(rowCells[i]).addClass(w.cellSelectedCls);
    }
  },
  /*
   * @param {Number} rowIndex
   */
  domDeSelectRow: function(rowIndex){
    var me = this,
      w = me.widget,
      rowCells = w.getDomRow(rowIndex),
      i = 0,
      iL = rowCells.length;

    for(;i<iL;i++){
      Fancy.get(rowCells[i]).removeClass(w.cellSelectedCls);
    }
  },
  /*
   * @param {Object} grid
   * @param {Object} params
   */
  onColumnEnterSelection: function(grid, params){
    var me = this,
      w = me.widget;

    if(!me.columns || me.isMouseDown !== true){
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

    if(start.side === end.side){
      switch(start.side){
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
    else if(start.side === 'center' && end.side === 'right'){
      me.selectColumns(start.columnIndex, w.columns.length, 'center');
      me.selectColumns(0, end.columnIndex, 'right');
    }
    else if(start.side === 'center' && end.side === 'left'){
      me.selectColumns(0, start.columnIndex, 'center');
      me.selectColumns(end.columnIndex, w.leftColumns.length, 'left');
    }
    else if(start.side === 'left' && end.side === 'center'){
      me.clearSelection('right');
      me.selectColumns(start.columnIndex, w.leftColumns.length, 'left');
      me.selectColumns(0, end.columnIndex, 'center');
    }
    else if(start.side === 'left' && end.side === 'right'){
      me.selectColumns(start.columnIndex, w.leftColumns.length, 'left');
      me.selectColumns(0, w.columns.length, 'center');
      me.selectColumns(0, end.columnIndex, 'right');
    }
    else if(start.side === 'right' && end.side === 'center'){
      me.clearSelection('left');
      me.selectColumns(0, start.columnIndex, 'right');
      me.selectColumns(end.columnIndex, w.columns.length, 'center');
    }
    else if(start.side === 'right' && end.side === 'left'){
      me.selectColumns(0, start.columnIndex, 'right');
      me.selectColumns(0, w.columns.length, 'center');
      me.selectColumns(end.columnIndex, w.leftColumns.length, 'left');
    }
  },
  /*
   * @param {Object} grid
   * @param {Object} params
   */
  onRowEnterSelection: function(grid, params){
    var me = this,
      w = me.widget;

    if(me.enabled === false){
      return;
    }

    if(!me.rows || me.isMouseDown !== true){
      return;
    }

    var rowCells = w.getDomRow(params.rowIndex),
      i = 0,
      iL = rowCells.length,
      rowStart = me.startRowSelection,
      rowEnd = params.rowIndex,
      newSelectedRows = {};

    if(rowStart > rowEnd){
      rowStart = params.rowIndex;
      rowEnd = me.startRowSelection;
    }

    var j = rowStart,
      jL = rowEnd + 1;

    for(;j<jL;j++){
      newSelectedRows[j] = true;
    }

    var currentSelected = me.getSelectedRowByColumn(params.columnIndex, params.side),
      toSelect = {},
      toDeselect = {};

    for(var p in newSelectedRows){
      if(currentSelected[p] !== true){
        toSelect[p] = true;
      }
    }

    for(var p in currentSelected){
      if(newSelectedRows[p] !== true){
        toDeselect[p] = true;
      }
    }

    for(var p in toSelect){
      me.domSelectRow(p);
      if(me.checkboxRow){
        me.selectCheckBox(p);
      }
    }

    for(var p in toDeselect){
      me.domDeSelectRow(p);
      if(me.checkboxRow){
        me.deSelectCheckBox(p);
      }
    }

    w.fire('select');
  },
  /*
   * @param {Number} columnIndex
   * @param {String} side
   * @return {Object}
   */
  getSelectedRowByColumn: function(columnIndex, side){
    var me = this,
      w = me.widget,
      body;

    switch (side){
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

    var columnEl = body.el.select('.fancy-grid-column[index="'+columnIndex+'"][grid="'+ w.id +'"]');

    var selectedCells = columnEl.select('.'+w.cellSelectedCls);

    var selectedRows = {},
      i = 0,
      iL = selectedCells.length;

    for(;i<iL;i++){
      selectedRows[Number(selectedCells.item(i).attr('index'))] = true;
    }

    return selectedRows;
  },
  /*
   * @return {Number}
   */
  getSelectedRow: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      selectedCells = body.el.select('.' + w.cellSelectedCls);

    if(selectedCells.length === 0){
      return -1;
    }

    return Number(selectedCells.item(0).attr('index'));
  },
  /*
   * @return {Array}
   */
  getSelectedRows: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      columnEl = body.el.select('.fancy-grid-column[index="0"][grid="' + w.id + '"]'),
      selectedCells = columnEl.select('.' + w.cellSelectedCls),
      rows = [],
      i = 0,
      iL = selectedCells.length;

    for(;i<iL;i++){
      rows.push( Number( selectedCells.item(i).attr('index') ) );
    }

    return rows;
  },
  /*
   *
   */
  initColumnSelection: function(){
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
  onColumnClick: function(grid, params) {
    var me = this,
      w = me.widget;

    if(!me.column || params.column.selectable === false){
      return;
    }

    var columnEl = Fancy.get(params.columnDom);

    if (me.column) {
      me.selectedColumns[0] = params;
    }

    me.clearSelection();

    columnEl.addClass(w.columnSelectedCls);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onRowClick: function(grid, params) {
    var me = this,
      w = me.widget;

    if(!me.row || params === false){
      return;
    }

    var column = params.column,
      select = true;

    if(column.type === 'action' && column.items){
      var j = 0,
        jL = column.items.length;

      for(;j<jL;j++){
        if(column.items[j].action === 'remove'){
          select = false;
        }
      }
    }

    var rowCells = w.getDomRow(params.rowIndex),
      i = 0,
      iL = rowCells.length;

    me.clearSelection();

    if(select) {
      for (; i < iL; i++) {
        Fancy.get(rowCells[i]).addClass(w.cellSelectedCls);
      }

      w.fire('select');
    }
  },
  /*
   * @param {Number} rowIndex
   */
  selectRow: function(rowIndex){
    var me = this,
      w = me.widget;

    if(!me.row && !me.rows){
      throw new Error('[FancyGrid Error] - row selection was not enabled');
    }

    me.clearSelection();

    var rowCells = w.getDomRow(rowIndex),
      i = 0,
      iL = rowCells.length;

    for(;i<iL;i++){
      Fancy.get(rowCells[i]).addClass(w.cellSelectedCls);
    }

    w.fire('select');
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onCellClick: function(grid, params){
    var me = this,
      w = me.widget;

    if(!me.cell){
      return;
    }

    me.clearSelection();

    Fancy.get(params.cell).addClass(w.cellSelectedCls);

    w.fire('select');
  },
  /*
   * @param {String} side
   */
  clearSelection: function(side){
    var me = this,
      w = me.widget;

    if(me.checkboxRow){
      var selected = w.body.el.select('.fancy-grid-column[index="0"] .' + w.cellSelectedCls),
        i = 0,
        iL = selected.length;

      for(;i<iL;i++){
        var rowIndex = selected.item(i).attr('index');

        me.deSelectCheckBox(rowIndex);
      }
    }

    if(side){
      switch(side){
        case 'left':
          w.leftBody.el.select('.' + w.cellSelectedCls).removeClass(w.cellSelectedCls);
          w.leftBody.el.select('.' + w.columnSelectedCls).removeClass(w.columnSelectedCls);
          w.leftBody.el.select('.' + w.cellOverCls).removeClass(w.cellOverCls);
          break;
        case 'center':
          w.body.el.select('.' + w.cellSelectedCls).removeClass(w.cellSelectedCls);
          w.body.el.select('.' + w.columnSelectedCls).removeClass(w.columnSelectedCls);
          w.body.el.select('.' + w.cellOverCls).removeClass(w.cellOverCls);
          break;
        case 'right':
          w.rightBody.el.select('.' + w.cellSelectedCls).removeClass(w.cellSelectedCls);
          w.rightBody.el.select('.' + w.columnSelectedCls).removeClass(w.columnSelectedCls);
          w.rightBody.el.select('.' + w.cellOverCls).removeClass(w.cellOverCls);
          break;
      }
    }
    else {
      w.el.select('.' + w.cellSelectedCls).removeClass(w.cellSelectedCls);
      w.el.select('.' + w.columnSelectedCls).removeClass(w.columnSelectedCls);
      w.el.select('.' + w.cellOverCls).removeClass(w.cellOverCls);
    }

    w.fire('clearselect');
  },
  /*
   *
   */
  onSort: function(){
    var me = this,
      w = me.widget;

    me.clearSelection();
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onCellEnterSelection: function(grid, params){
    var me = this,
      w = me.widget,
      numOfSelectedCells = 0;

    if(!me.cells || me.isMouseDown !== true){
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

    if(params.rowIndex < me.startCellRowIndex){
      start.rowIndex = params.rowIndex;
      end.rowIndex = me.startCellRowIndex;
    }

    if(me.startCellSide === params.side){
      if (params.columnIndex < me.startCellColumnIndex) {
        start.columnIndex = params.columnIndex;
        end.columnIndex = me.startCellColumnIndex;
      }

      numOfSelectedCells = me.selectCells(start, end, start.side);

      if(me.startCellSide === 'left'){
        me.clearSelection('center');
        me.clearSelection('right');
      }
      else if(me.startCellSide === 'center'){
        me.clearSelection('left');
        me.clearSelection('right');
      }
      else if(me.startCellSide === 'right'){
        me.clearSelection('left');
        me.clearSelection('center');
      }
    }
    else{
      if(me.startCellSide === 'left') {
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
      else if(me.startCellSide === 'center'){
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
        else if(params.side === 'right'){
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
          },{
            columnIndex: end.columnIndex,
            rowIndex: end.rowIndex
          }, 'right');
        }
      }
      else if(me.startCellSide === 'right'){
        numOfSelectedCells += me.selectCells({
          columnIndex: 0,
          rowIndex: start.rowIndex
        },{
          columnIndex: start.columnIndex,
          rowIndex: end.rowIndex
        }, 'right');

        if (params.side === 'center') {
          numOfSelectedCells += me.selectCells({
            columnIndex: end.columnIndex,
            rowIndex: start.rowIndex
          },{
            columnIndex: w.columns.length - 1,
            rowIndex: end.rowIndex
          }, 'center');
          me.clearSelection('left');
        }
        else if(params.side === 'left'){
          numOfSelectedCells += me.selectCells({
            columnIndex: 0,
            rowIndex: start.rowIndex
          },{
            columnIndex: w.columns.length - 1,
            rowIndex: end.rowIndex
          }, 'center');

          numOfSelectedCells += me.selectCells({
            columnIndex: end.columnIndex,
            rowIndex: start.rowIndex
          },{
            columnIndex: w.leftColumns.length - 1,
            rowIndex: end.rowIndex
          }, 'left');
        }
      }
    }

    me.endCellRowIndex = end.rowIndex;

    w.fire('select');
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onColumnMouseDown: function(grid, params){
    var me = this,
      w = me.widget;

    if(!me.columns || params.column.selectable === false || !me.enabled){
      return;
    }

    var columnEl = Fancy.get(params.columnDom);

    me.isMouseDown = true;
    me.startColumnColumnIndex = params.columnIndex;
    me.startColumnSide = params.side;

    me.clearSelection();

    columnEl.addClass(w.columnSelectedCls);

    Fancy.$(document).one('mouseup', function(){
      delete me.isMouseDown;
    });


    w.fire('select');
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} params
   */
  onCellMouseDownCells: function(grid, params){
    var me = this,
      w = me.widget;

    if(w.celledit){
      w.celledit.hideEditor();
    }

    if(!me.cells || !me.enabled){
      return;
    }

    var cellEl = Fancy.get(params.cell);

    me.clearSelection();

    cellEl.addClass(w.cellSelectedCls);
    me.isMouseDown = true;
    me.startCellSelection = params.cell;
    me.startCellRowIndex = params.rowIndex;
    me.startCellColumnIndex = params.columnIndex;
    me.startCellSide = params.side;

    Fancy.$(document).one('mouseup', function(){
      delete me.isMouseDown;
      delete me.startCellSelection;
    });

    w.fire('select');
  },
  /*
   * @param {Number} start
   * @param {Number} end
   * @param {String} side
   */
  selectCells: function(start, end, side){
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
      numOfSelecedCells = 0,
      selectedCells = me.getSelectedCells(side || 'center'),
      needToSelect = {},
      toSelect = {},
      toDeselect = {};

    i = start.rowIndex;
    iL = end.rowIndex + 1;
    for(;i<iL;i++){
      needToSelect[i] = needToSelect[i] || {};
      j = start.columnIndex;
      jL = end.columnIndex + 1;

      for(;j<jL;j++){
        needToSelect[i][j] = true;
      }
    }

    for(var p in needToSelect){
      if(selectedCells[p] === undefined){
        toSelect[p] = needToSelect[p];
      }
      else{
        for(var q in needToSelect[p]){
          if(selectedCells[p][q] !== true) {
            toSelect[p] = toSelect[p] || {};
            toSelect[p][q] = true;
          }
        }
      }
    }

    for(var p in selectedCells){
      if(needToSelect[p] === undefined){
        toDeselect[p] = selectedCells[p];
      }
      else{
        for(var q in selectedCells[p]){
          if(needToSelect[p][q] !== true) {
            toDeselect[p] = toDeselect[p] || {};
            toDeselect[p][q] = true;
          }
        }
      }
    }

    switch(side){
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

    for(var p in toSelect){
      for(var q in toSelect[p]){
        var cell = b.getCell(p, q);

        cell.addClass(w.cellSelectedCls);
      }
    }

    for(var p in toDeselect){
      for(var q in toDeselect[p]){
        var cell = b.getCell(p, q);

        cell.removeClass(w.cellSelectedCls);
      }
    }
  },
  /*
   * @param {String} side
   * @return {Array}
   */
  getSelectedCells: function(side){
    var me = this,
      w = me.widget,
      body = w.getBody(side || 'center'),
      selectedCells = body.el.select('.' + w.cellSelectedCls),
      selected = {},
      i = 0,
      iL = selectedCells.length;

    for(;i<iL;i++){
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
  getNumberSelectedCells: function(){
    var me = this,
      w = me.widget;

    return w.el.select('.' + w.cellSelectedCls).length;
  },
  /*
   * @param {String} side
   * @return {Array}
   */
  getSelectedColumns: function(side){
    var me = this,
      w = me.widget,
      body = w.getBody(side),
      selected = {},
      selectedColumns = body.el.select('.' + w.columnSelectedCls),
      i = 0,
      iL = selectedColumns.length;

    for(;i<iL;i++){
      selected[selectedColumns.item(i).attr('index')] = true;
    }

    return selected;
  },
  /*
   * @param {Number} start
   * @param {Number} end
   * @param {String} side
   */
  selectColumns: function(start, end, side){
    var me = this,
      w = me.widget,
      selectedColumns = me.getSelectedColumns(side || 'center'),
      needToSelect = {},
      toSelect = {},
      toDeselect = {},
      i = start,
      iL = end;

    if(iL<i){
      i = end;
      iL = start;
    }

    iL++;
    for(;i<iL;i++){
      needToSelect[i] = true;
    }

    for(var p in needToSelect){
      if(selectedColumns[p] !== true){
        toSelect[p] = true;
      }
    }

    for(var p in selectedColumns){
      if(needToSelect[p] !== true){
        toDeselect[p] = true;
      }
    }

    for(var p in toSelect){
      me.selectColumn(p, side);
    }

    for(var p in toDeselect){
      me.deselectColumn(p, side);
    }
  },
  /*
   * @param {Object} columnIndex
   * @param {String} side
   */
  selectColumn: function(columnIndex, side){
    var me = this,
      w = me.widget,
      body = w.getBody(side || 'center'),
      columnEl = Fancy.get( body.getDomColumn(columnIndex) );

    columnEl.addClass(w.columnSelectedCls);
  },
  /*
   * @param {Object} columnIndex
   * @param {String} side
   */
  deselectColumn: function(columnIndex, side){
    var me = this,
      w = me.widget,
      body = w.getBody(side || 'center'),
      columnEl = Fancy.get( body.getDomColumn(columnIndex) );

    columnEl.removeClass(w.columnSelectedCls);
  },
  /*
   * @param {Object} returnModel
   * @return {Fancy.Model|Array}
   */
  getSelection: function(returnModel){
    var me = this,
      w = me.widget,
      s = w.store,
      model = {};

    switch(me.selModel){
      case 'row':
        model.row = me.getSelectedRow();
        if(model.row !== -1){
          model.items = [ s.get(model.row) ];
          model.rows = [model.row];
        }
        else{
          model.items = [];
          model.rows = [];
        }
        break;
      case 'rows':
        model.rows = me.getSelectedRows();
        model.items = [];

        var i = 0,
          iL = model.rows.length;

        for(;i<iL;i++){
          model.items.push( s.get(model.rows[i]) );
        }
        break;
      case 'cells':
        break;
      case 'cell':
        break;
      case 'column':
        break;
      case 'columns':
        break;
    }

    if(returnModel){
      return model;
    }
    return model.items;
  },
  /*
   *
   */
  renderHeaderCheckBox: function(){
    var me = this,
      w = me.widget;

    me._renderHeaderCheckBox(w.leftHeader, w.leftColumns);
    me._renderHeaderCheckBox(w.header, w.columns);
    me._renderHeaderCheckBox(w.rightHeader, w.rightColumns);
  },
  /*
   * @param {Fancy.Header} header
   * @param {Array} columns
   */
  _renderHeaderCheckBox: function(header, columns){
    var me = this,
      i = 0,
      iL = columns.length,
      column;

    for(;i<iL;i++){
      column = columns[i];

      if(column.index === '$selected'){
        var headerCellContainer = header.getCell(i).firstChild();

        column.headerCheckBox = new Fancy.CheckBox({
          renderTo: headerCellContainer.dom,
          renderId: true,
          value: false,
          label: false,
          style: {
            padding: '0px',
            display: 'inline-block'
          },
          events: [{
            change: function(checkbox, value){
              if(value){
                me.selectAll();
              }
              else{
                me.deSelectAll();
              }
            }
          }]
        });
      }
    }
  },
  /*
   *
   */
  selectAll: function(){
    var me = this,
      w = me.widget,
      checkBoxEls = w.el.select('.fancy-grid-cell-select .fancy-field-checkbox'),
      headerCheckBoxEls = w.el.select('.fancy-grid-header-cell-select .fancy-field-checkbox'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));

      checkBox.setValue(true);
      me.domSelectRow(i);
    }

    i = 0;
    iL = headerCheckBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(headerCheckBoxEls.item(i).attr('id'));

      checkBox.setValue(true, false);
    }
  },
  /*
   *
   */
  deSelectAll: function(){
    var me = this,
      w = me.widget,
      checkBoxEls = w.el.select('.fancy-grid-cell-select .fancy-field-checkbox'),
      headerCheckBoxEls = w.el.select('.fancy-grid-header-cell-select .fancy-field-checkbox'),
      i = 0,
      iL = checkBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(checkBoxEls.item(i).attr('id'));

      checkBox.setValue(false);
      me.domDeSelectRow(i);
    }

    me.clearHeaderCheckBox();
  },
  /*
   *
   */
  clearHeaderCheckBox: function(){
    var me = this,
      w = me.widget,
      headerCheckBoxEls = w.el.select('.fancy-grid-header-cell-select .fancy-field-checkbox'),
      i = 0,
      iL = headerCheckBoxEls.length;

    for(;i<iL;i++){
      var checkBox = Fancy.getWidget(headerCheckBoxEls.item(i).attr('id'));

      checkBox.setValue(false, false);
    }
  },
  stopSelection: function(){
    this.enabled = false;
  },
  enableSelection: function(value){
    var me = this;

    if(value !== undefined){
      me.enabled = value;
      return;
    }

    me.enabled = true;
  }
});