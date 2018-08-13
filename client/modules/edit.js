/*
 * @class Fancy.grid.plugin.Edit
 */
Fancy.define('Fancy.grid.plugin.Edit', {
  extend: Fancy.Plugin,
  ptype: 'grid.edit',
  inWidgetName: 'edit',
  clicksToEdit: 2,
  tabColumnsSupport: {
    date: true,
    combo: true,
    image: true,
    number: true,
    string: true,
    text: true
  },
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    me.addEvents('tab');

    me.Super('init', arguments);

    w.once('render', function(){
      me.ons();
      s.on('beforeupdate', me.onStoreCRUDBeforeUpdate, me);
      s.on('update', me.onStoreCRUDUpdate, me);

      s.on('beforedestroy', me.onStoreCRUDBeforeDestroy, me);
      s.on('destroy', me.onStoreCRUDDestroy, me);
      s.on('create', me.onCreate, me);
    });
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      clickEventName = 'cell' + me.getClickEventName();

    w.on('cellclick', me.onClickCell, me);
    s.on('set', me.onStoreSet, me);
    me.on('tab', me.onTab, me);

    w.once('init', function(){
      if(clickEventName !== 'cell'){
        w.on(clickEventName, me.onClickCellToEdit, me);
      }
    });

    w.on('activate', me.onGridActivate, me);
    w.on('deactivate', me.onGridDeActivate, me);
  },
  /*
   *
   */
  onGridActivate: function(){
    Fancy.get(document).on('keydown', this.onKeyDown, this);
  },
  /*
   *
   */
  onGridDeActivate: function(){
    Fancy.get(document).un('keydown', this.onKeyDown, this);
  },
  /*
   * @param {Object} e
   */
  onKeyDown: function(e){
    var keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode) {
      case key.TAB:
        this.fire('tab', e);
        break;
    }
  },
  /*
   * @param {Object} me
   * @param {Object} e
   */
  onTab: function(me, e){
    var me = this,
      w = me.widget,
      activeParams = me.activeCellEditParams;

    if(!activeParams){
      return;
    }

    e.preventDefault();

    var params = me.getNextCellEditParam();

    if(w.celledit) {
      w.celledit.hideEditor();
      if (w.tabEdit !== false) {
        setTimeout(function () {
          w.celledit.edit(params);
        }, 100);
      }
    }
  },
  /*
   * @return {Object}
   */
  getNextCellEditParam: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      activeParams = me.activeCellEditParams,
      leftColumns = w.leftColumns;

    var columnIndex = activeParams.columnIndex,
      rowIndex = activeParams.rowIndex,
      side = activeParams.side,
      body,
      columns = w.getColumns(side),
      nextColumn = columns[columnIndex + 1],
      nextCell,
      key,
      id;

    var i = 0,
      maxRecursion = 20;

    for(;i<maxRecursion;i++){
      var cellInfo = me.getNextCellInfo({
        side: side,
        columnIndex: columnIndex,
        rowIndex: rowIndex
      });

      side = cellInfo.side;
      columnIndex = cellInfo.columnIndex;
      rowIndex = cellInfo.rowIndex;
      columns = w.getColumns(side);
      nextColumn = columns[cellInfo.columnIndex];

      if(me.tabColumnsSupport[nextColumn.type] && nextColumn.editable === true){
        break;
      }
    }

    body = w.getBody(side);
    nextCell = body.getCell(rowIndex, columnIndex).dom;
    if(!nextCell){
      side = 'center';
      if(leftColumns.length){
        side = 'left';
      }

      rowIndex = 0;
      columnIndex = 0;

      body = w.getBody(side);
      nextCell = body.getCell(rowIndex, columnIndex).dom;
    }

    //TODO: function that get next editable cell(checkbox does not suit)
    //maybe in future to learn how other frameworks does it and checkbox also to add.

    key = nextColumn.index;
    id = s.getId(rowIndex);

    return {
      id: s.getId(rowIndex),
      side: side,
      column: nextColumn,
      cell: nextCell,
      columnIndex: columnIndex,
      rowIndex: rowIndex,
      value: s.get(rowIndex, key),
      data: s.get(rowIndex),
      item: s.getById(id)
    };
  },
  /*
   * @param {Object} o
   * @return {Object}
   */
  getNextCellInfo: function(o){
    var me = this,
      w = me.widget,
      side = o.side,
      columns = w.getColumns(side),
      columnIndex = o.columnIndex,
      rowIndex = o.rowIndex,
      nextColumn = columns[columnIndex + 1],
      rightColumns = w.rightColumns,
      leftColumns = w.leftColumns;

    if(nextColumn){
      columnIndex++;
    }
    else{
      switch(side){
        case 'left':
          side = 'center';
          columnIndex = 0;
          break;
        case 'center':
          if(rightColumns.length){
            side = 'right';
            columnIndex = 0;
          }
          else if(leftColumns.length){
            side = 'left';
            columnIndex = 0;
            rowIndex++;
          }
          else{
            columnIndex = 0;
            rowIndex++;
          }
          break;
        case 'right':
          if(leftColumns.length){
            side = 'left';
            columnIndex = 0;
            rowIndex++;
          }
          else{
            side = 'center';
            columnIndex = 0;
            rowIndex++;
          }
          break;
      }
    }

    return {
      side: side,
      rowIndex: rowIndex,
      columnIndex: columnIndex
    }
  },
  /*
   * @return {String}
   */
  getClickEventName: function(){
    switch(this.clicksToEdit){
      case 1:
        return 'click';
      case 2:
        return 'dblclick';
      case false:
        return '';
    }
  },
  /*
   *
   */
  stopEditor: function(){
    this.stopped = true;
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onClickCell: function(grid, o){
    var w = this.widget,
      column = o.column;

    if(column.editable && (column.type === 'checkbox' || column.type === 'switcher') && w.celledit){
      w.celledit.onCheckBoxChange(o);
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onClickCellToEdit: function(grid, o){
    var me = this,
      w = me.widget,
      column = o.column;

    if(w.rowedit){}
    else if(w.celledit){
      w.celledit.hideEditor();
    }

    me.fire('beforedit');

    if(me.stopped === true){
      me.stopped = false;
      return;
    }

    if(w.rowedit){
      w.rowedit.edit(o);
    }
    else if(column.editable && column.type !== 'checkbox' && column.type !== 'switcher' && w.celledit){
      w.celledit.edit(o);
    }
  },
  /*
   * @param {Fancy.Store} store
   * @param {Object} o
   */
  onStoreSet: function(store, o){
    this.widget.updater.updateRow(o.rowIndex);
  },
  /*
   *
   */
  onStoreCRUDBeforeUpdate: function(){
    var me = this,
      w = me.widget,
      o = me.activeCellEditParams;

    if(!o){
      return;
    }

    w.updater.updateRow(o.rowIndex);
  },
  /*
   * @param {Fancy.Store} store
   * @param {String|Number} id
   * @param {String} key
   * @param {*} value
   */
  onStoreCRUDUpdate: function(store, id, key, value){
    delete store.changed[id];

    this.clearDirty();
  },
  /*
   *
   */
  onStoreCRUDBeforeDestroy: function(){},
  /*
   *
   */
  onStoreCRUDDestroy: function(){
    this.widget.store.loadData();
    this.clearDirty();
  },
  /*
   *
   */
  clearDirty: function(){
    var w = this.widget;

    setTimeout(function() {
      w.leftBody.clearDirty();
      w.body.clearDirty();
      w.rightBody.clearDirty();
    }, 500);
  },
  /*
   * @param {Object} store
   * @param {Array} data
   */
  onCreate: function(store, data){
    var me = this,
      w = me.widget;

    w.updater.update();
    w.fire('insert', data);
    me.clearDirty();
  }
});/*
 * @class Fancy.grid.plugin.CellEdit
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;

  F.define('Fancy.grid.plugin.CellEdit', {
    extend: F.Plugin,
    ptype: 'grid.celledit',
    inWidgetName: 'celledit',
    editorsCls: 'fancy-grid-editors',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.once('render', function () {
        me.initEditorContainer();
        me.checkAutoInitEditors();
        w.on('scroll', me.onScroll, me);
        w.on('nativescroll', me.onNativeScroll, me);
        w.on('docclick', me.onDocClick, me);
        w.on('headercellmousedown', me.onHeaderCellMouseDown, me);
      });
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} e
     */
    onDocClick: function (grid, e) {
      var me = this,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        inCombo = true,
        target = e.target,
        targetEl = F.get(target);

      if (editor === undefined) {
        return;
      }
      else if (o.column.type === 'date') {
        return;
      }
      else if (o.column.type === 'combo') {
      }
      else {
        var cellEl = targetEl.closest('.' + GRID_CELL_CLS);

        if (!cellEl.dom && !editor.el.within(target)) {
          editor.hide();
        }
        return;
      }

      if (editor.el.within(target) === false && editor.list.within(target) === false && me.comboClick !== true) {
        inCombo = false;
      }

      if (inCombo === false) {
        editor.hide();
      }

      me.comboClick = false;
    },
    /*
     *
     */
    initEditorContainer: function () {
      var me = this,
        w = me.widget;

      me.editorsContainer = w.el.select('.' + me.editorsCls);
    },
    /*
     * @param {Object} o
     */
    edit: function (o) {
      var me = this,
        w = me.widget,
        column = o.column;

      if (column.index === '$selected') {
        return;
      }

      me.activeCellEditParams = o;
      w.edit.activeCellEditParams = o;

      column.editor = me.generateEditor(column);

      //me.hideEditor();
      w.scroller.scrollToCell(o.cell);
      me.showEditor(o);
    },
    /*
     * @param {Object} column
     * @return {Object}
     */
    generateEditor: function (column) {
      var me = this,
        w = me.widget,
        style = {
          position: 'absolute',
          left: '0px',
          top: '0px',
          display: 'none',
          padding: '0px'
        },
        type = column.type,
        editor,
        vtype = column.vtype,
        renderTo,
        theme = w.theme;

      if (column.editor) {
        return column.editor;
      }

      renderTo = me.editorsContainer.dom;

      var itemConfig = {
        renderTo: renderTo,
        label: false,
        style: style,
        checkValidOnTyping: true
      };

      switch (type) {
        case 'combo':
          var displayKey = 'text',
            valueKey = 'text',
            data = column.data,
            events = [{
              change: me.onComboChange,
              scope: me
            }];

          if (column.editorEvents) {
            var i = 0,
              iL = column.editorEvents.length;

            for (; i < iL; i++) {
              events.push(column.editorEvents[i]);
            }
          }

          if (column.displayKey !== undefined) {
            displayKey = column.displayKey;
            valueKey = displayKey;
          }

          if (theme === 'default') {
            theme = undefined;
          }

          if(column.minListWidth){
            itemConfig.minListWidth = column.minListWidth;
          }

          if(column.subSearch){
            itemConfig.subSearch = column.subSearch;
          }

          Fancy.apply(itemConfig, {
            theme: theme,
            data: data,
            displayKey: displayKey,
            valueKey: valueKey,
            value: 0,
            padding: false,
            vtype: vtype,
            events: events
          });

          if(column.emptyText){
            itemConfig.emptyText = column.emptyText;
          }

          if(column.displayTpl){
            itemConfig.displayTpl = column.displayTpl;
          }

          if(column.listItemTpl){
            itemConfig.listItemTpl = column.listItemTpl;
          }

          if(column.leftTpl){
            itemConfig.leftTpl = column.leftTpl;
          }

          if(column.leftWidth){
            itemConfig.leftWidth = column.leftWidth;
          }

          editor = new F.Combo(itemConfig);
          break;
        case 'text':
          editor = new F.TextArea({
            renderTo: renderTo,
            label: false,
            style: style,
            vtype: vtype,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            }]
          });
          break;
        case 'image':
        case 'string':
        case 'tree':
        case 'color':
          editor = new F.StringField({
            renderTo: renderTo,
            label: false,
            style: style,
            vtype: vtype,
            format: column.format,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            }]
          });
          break;
        case 'number':
        case 'currency':
          F.apply(itemConfig, {
            vtype: vtype,
            format: column.format,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            }]
          });

          if (column.spin !== undefined) {
            itemConfig.spin = column.spin;
          }

          if (column.step !== undefined) {
            itemConfig.step = column.step;
          }

          if (column.min !== undefined) {
            itemConfig.min = column.min;
          }

          if (column.max !== undefined) {
            itemConfig.max = column.max;
          }

          editor = new F.NumberField(itemConfig);
          break;
        case 'date':
          editor = new F.DateField({
            renderTo: renderTo,
            label: false,
            style: style,
            format: column.format,
            lang: w.lang,
            vtype: vtype,
            theme: theme,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            }]
          });

          break;
        default:
          throw new Error('[FancyGrid error] - type ' + type + ' editor does not exit');
      }

      return editor;
    },
    /*
     * @param {Object} o
     */
    showEditor: function (o) {
      var me = this,
        w = me.widget,
        column = o.column,
        type = column.type,
        //editor = me[type + 'Editor'],
        editor = column.editor,
        cell = o.cell,
        cellXY = me.getCellPosition(cell),
        cellSize = me.getCellSize(cell);

      if (type === 'combo') {
        me.comboClick = true;
      }

      me.activeEditor = editor;
      me.setEditorValue(o);
      if(o.rowIndex === 0){
        cellSize.height++;
      }

      if(column.minEditorWidth && cellSize.width < column.minEditorWidth){
        cellSize.width = column.minEditorWidth;
      }

      me.setEditorSize(cellSize);
      editor.show();
      editor.el.css(cellXY);

      editor.focus();

      if (type === 'combo') {
        if (o.value !== undefined) {
          editor.set(o.value, false);
        }
      }

      w.fire('startedit', o);
    },
    /*
     * @param {Number} side
     */
    setEditorSize: function (size) {
      var me = this;

      if (me.activeEditor.wtype === 'field.combo') {
        me.activeEditor.size(size);
      }
      else {
        me.activeEditor.setInputSize({
          width: size.width,
          height: size.height
        });
      }
    },
    /*
     *
     */
    hideEditor: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        value,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        column;

      if (editor) {
        column = o.column;
        value = editor.get();

        if (s.proxyType === 'server' && column.type !== 'combo') {
          key = me.getActiveColumnKey();
          value = me.prepareValue(value);

          s.set(o.rowIndex, key, value);
        }

        editor.hide();
        editor.hideErrorTip();
      }

      delete me.activeEditor;

      //Bug fix: when editor is out of side, grid el scrolls
      if (w.el.dom.scrollTop) {
        w.el.dom.scrollTop = 0;
      }
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellPosition: function (cell) {
      var me = this,
        w = me.widget,
        gridBorders = w.gridBorders,
        cellEl = F.get(cell),
        cellOffset = cellEl.offset(),
        gridOffset = w.el.offset(),
        offset = {
          left: parseInt(cellOffset.left) - parseInt(gridOffset.left) - 2 + 'px',
          top: parseInt(cellOffset.top) - parseInt(gridOffset.top) - (gridBorders[0] + gridBorders[2]) + 'px'
        };

      return offset;
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellSize: function (cell) {
      var me = this,
        w = me.widget,
        cellEl = F.get(cell),
        width = cellEl.width(),
        height = cellEl.height(),
        coeficient = 2;

      if (F.nojQuery && w.panelBorderWidth === 2) {
        coeficient = 1;
      }

      width += parseInt(cellEl.css('border-right-width')) * coeficient;
      height += parseInt(cellEl.css('border-bottom-width')) * coeficient;

      return {
        width: width,
        height: height
      };
    },
    /*
     * @param {Object} o
     */
    setEditorValue: function (o) {
      var me = this,
        editor = me.activeEditor;

      switch (o.column.type) {
        case 'combo':
          if (editor.valueIndex !== -1) {
            editor.set(editor.getValueKey(o.value), false);
          }
          break;
        case 'date':
          if(!o.value){
            o.value = '';
          }
          var format = o.column.format,
            date = F.Date.parse(o.value, format.read, format.mode);

          editor.set(date);
          break;
        default:
          editor.set(o.value);
      }
    },
    /*
     * @param {Object} editor
     * @param {String} value
     */
    onEditorEnter: function (editor, value) {
      this.hideEditor();
    },
    /*
     *
     */
    onHeaderCellMouseDown: function () {
      this.hideEditor();
    },
    /*
     * @param {Object} editor
     * @param {String} value
     */
    onKey: function (editor, value) {
    },
    /*
     * @param {String} value
     */
    setValue: function (value) {
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        o = me.activeCellEditParams,
        editor = me.activeEditor;

      if (editor === undefined) {
        return;
      }

      if (editor.isValid() === false) {
        return;
      }

      if (s.proxyType === 'server') {
        return;
      }

      key = me.getActiveColumnKey();

      value = me.prepareValue(value);

      if (editor.type === 'field.date' && editor.isEqual(s.get(o.rowIndex, key))) {
        return;
      }

      s.set(o.rowIndex, key, value);
    },
    /*
     * @param {Object} editor
     */
    onEditorBeforeHide: function (editor) {
      if (editor.isValid()) {
        this.setValue(editor.getValue());
      }
    },
    /*
     *
     */
    onScroll: function () {
      this.hideEditor();
    },
    /*
     *
     */
    onNativeScroll: function () {
      this.hideEditor();
    },
    /*
     * @param {Object} field
     */
    onBlur: function (field) {
      var me = this;

      if (!me.activeEditor || field.id === me.activeEditor.id) {
        if (field.mouseDownSpinUp === true || field.mouseDownSpinDown) {
          return;
        }

        me.hideEditor();
      }
    },
    /*
     * @param {*} value
     * @return {*}
     */
    prepareValue: function (value) {
      var me = this,
        type = me.getActiveColumnType(),
        o = me.activeCellEditParams,
        column = o.column,
        format = column.format;

      switch (type) {
        case 'number':
        case 'currency':
          if (format && format.inputFn) {
            var _value = '',
              i = 0,
              iL = value.length;

            if (F.isNumber(value)) {
              return value;
            }

            for (; i < iL; i++) {
              if (!isNaN(Number(value[i]))) {
                _value += value[i];
              }
            }

            value = _value;
          }
          else if (value !== '') {
            value = Number(value);
          }
          break;
        case 'date':
          if (column.format && column.format.read) {
            var date = column.editor.getDate();
            value = F.Date.format(date, column.format.read, undefined, column.format.mode);
          }
          break;
      }

      return value;
    },
    /*
     * @return {String}
     */
    getActiveColumnType: function () {
      var o = this.activeCellEditParams,
        column = o.column;

      return column.type;
    },
    /*
     * @return {String}
     */
    getActiveColumnKey: function () {
      var o = this.activeCellEditParams,
        column = o.column,
        key = column.index;

      return key;
    },
    /*
     * @param {Object} o
     */
    onCheckBoxChange: function (o) {
      var me = this,
        w = me.widget,
        column = o.column,
        key = column.index,
        s = w.store,
        value = me.checkBoxChangedValue;

      if (me.activeEditor) {
        me.hideEditor();
      }

      if (me.checkBoxChangedValue === undefined) {
        return
      }

      delete me.checkBoxChangedValue;

      me.activeCellEditParams = o;
      w.edit.activeCellEditParams = o;

      s.set(o.rowIndex, key, value);
    },
    /*
     * @param {Object} combo
     * @param {*} value
     */
    onComboChange: function (combo, value) {
      var me = this,
        w = me.widget,
        s = w.store,
        o = me.activeCellEditParams,
        key = me.getActiveColumnKey(),
        newValue = combo.getDisplayValue(value);

      s.set(o.rowIndex, key, newValue);
      me.hideEditor();
    },
    checkAutoInitEditors: function () {
      var me = this,
        w = me.widget;

      F.each(w.columns, function (column) {
        if (column.editorAutoInit) {
          column.editor = me.generateEditor(column);
        }
      });
    }
  });

})();/*
 * @class Fancy.grid.plugin.RowEdit
 */
(function () {
  //SHORTCUTS
  var F = Fancy;
  var E = F.each;

  //CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var GRID_ROW_EDIT_CLS = F.GRID_ROW_EDIT_CLS;
  var GRID_ROW_EDIT_BUTTONS_CLS = F.GRID_ROW_EDIT_BUTTONS_CLS;
  var GRID_ROW_EDIT_BUTTON_UPDATE_CLS =  F.GRID_ROW_EDIT_BUTTON_UPDATE_CLS;
  var GRID_ROW_EDIT_BUTTON_CANCEL_CLS = F.GRID_ROW_EDIT_BUTTON_CANCEL_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.plugin.RowEdit', {
    extend: F.Plugin,
    ptype: 'grid.rowedit',
    inWidgetName: 'rowedit',
    rendered: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.on('scroll', me.onScroll, me);
      w.on('columnresize', me.onColumnResize, me);

      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      w.on('columndrag', me.onColumnDrag, me);

      if (w.grouping) {
        w.on('collapse', me.onCollapse, me);
        w.on('expand', me.onExpand, me);
      }
    },
    /*
     *
     */
    onCollapse: function () {
      this.hide();
    },
    /*
     *
     */
    onExpand: function () {
      this.hide();
    },
    /*
     * @param {Object} o
     */
    edit: function (o) {
      var me = this,
        w = me.widget,
        column = o.column;

      if (column && column.index === '$selected') {
        return;
      }

      w.scroller.scrollToCell(o.cell);
      me.showEditor(o);
    },
    /*
     * @param {Object} o
     */
    showEditor: function (o) {
      var me = this;

      me.changed = {};

      if (!me.rendered) {
        me.render();
        me.changePosition(o.rowIndex, false);
        me.setValues(o);
      }
      else {
        var isHidden = me.el.css('display') === 'none';
        me.show();
        me.changePosition(o.rowIndex, !isHidden);

        if(!isHidden){
          setTimeout(function () {
            me.setValues(o);
          }, F.ANIMATE_DURATION);
        }
        else {
          me.setValues(o);
        }
      }

      me.setSizes();
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget;

      if (w.leftColumns) {
        me.leftEl = me.renderTo(w.leftBody.el, w.leftColumns);
      }

      if (w.columns) {
        me.el = me.renderTo(w.body.el, w.columns);
      }

      if (w.rightColumns) {
        me.rightEl = me.renderTo(w.rightBody.el, w.rightColumns);
      }

      me.renderButtons();

      me.rendered = true;
    },
    /*
     * @param {Object} renderTo
     * @param {Array} columns
     *  @param {Number} order
     * @param {String} side
     * @param {String} fromSide
     * @return {Fancy.Element}
     */
    renderTo: function (renderTo, columns, order, side, fromSide) {
      var me = this,
        w = me.widget,
        container = F.get(document.createElement('div')),
        el,
        i = 0,
        iL = columns.length,
        theme = w.theme,
        column,
        style = {
          'float': 'left',
          margin: '0px',
          padding: '0px'
        },
        renderAfter,
        renderBefore;

      if (!side) {
        container.addCls(GRID_ROW_EDIT_CLS);
        el = F.get(renderTo.dom.appendChild(container.dom));
      }
      else {
        var fieldEls = renderTo.select('.' + FIELD_CLS);

        i = order;
        iL = order + 1;

        switch (side) {
          case 'right':
            if(fieldEls.length) {
              renderBefore = fieldEls.item(order);
            }
            break;
          case 'left':
            if(fieldEls.length){
              renderAfter = fieldEls.item(order);
            }
            break;
          case 'center':
            switch (fromSide) {
              case 'left':
                renderBefore = fieldEls.item(0);
                break;
              case 'right':
                renderAfter = fieldEls.item(fieldEls.length - 1);
                break;
            }
            break;
        }
      }

      if(i === -1){
        i = 0;
        iL = 1;
      }

      for (; i < iL; i++) {
        column = columns[i];

        var columnWidth = column.width;

        var itemConfig = {
          index: column.index,
          label: false,
          style: style,
          width: columnWidth,
          vtype: column.vtype,
          format: column.format,
          stopPropagation: true,
          theme: theme,
          checkValidOnTyping: true,
          events: [{
            change: me.onFieldChange,
            delay: 100,
            scope: me
          }, {
            enter: me.onFieldEnter,
            scope: me
          }]
        };

        switch (side) {
          case 'left':
            if(renderAfter){
              itemConfig.renderAfter = renderAfter;
            }
            else{
              itemConfig.renderTo = renderTo.dom;
            }
            break;
          case 'right':
            if(renderBefore){
              itemConfig.renderBefore = renderBefore;
            }
            else{
              itemConfig.renderTo = renderTo.dom;
            }
            break;
          case 'center':
            switch (fromSide) {
              case 'left':
                itemConfig.renderBefore = fieldEls.item(0);
                break;
              case 'right':
                itemConfig.renderAfter = fieldEls.item(fieldEls.length - 1);
                break;
            }
            break;
          default:
            itemConfig.renderTo = el.dom;
        }

        var editor;

        if (column.editable === false) {
          switch (column.type) {
            case 'string':
            case 'number':
              editor = new F.TextField(itemConfig);
              break;
            default:
              editor = new F.EmptyField(itemConfig);
          }
        }
        else {
          switch (column.type) {
            case 'date':
              if (column.format) {
                itemConfig.format = column.format;
              }

              editor = new F.DateField(itemConfig);
              break;
            case 'image':
            case 'string':
            case 'color':
              editor = new F.StringField(itemConfig);
              break;
            case 'number':
            case 'currency':
              if (column.spin) {
                itemConfig.spin = column.spin;
              }

              if (column.step) {
                itemConfig.step = column.step;
              }

              if (column.min) {
                itemConfig.min = column.min;
              }

              if (column.max) {
                itemConfig.max = column.max;
              }

              editor = new F.NumberField(itemConfig);
              break;
            case 'combo':
              F.apply(itemConfig, {
                data: column.data,
                value: -1,
                padding: false
              });

              if (column.displayKey) {
                itemConfig.displayKey = column.displayKey;
                itemConfig.valueKey = column.displayKey;
              }
              else {
                itemConfig.displayKey = 'text';
                itemConfig.valueKey = 'text';
              }

              if(column.minListWidth){
                itemConfig.minListWidth = column.minListWidth;
              }

              if(column.subSearch){
                itemConfig.subSearch = column.subSearch;
              }

              editor = new F.Combo(itemConfig);
              break;
            case 'checkbox':
              var paddingLeft;
              switch (column.cellAlign) {
                case 'left':
                  paddingLeft = 7;
                  break;
                case 'center':
                  paddingLeft = (column.width - 20 - 2) / 2;
                  break;
                case 'right':
                  paddingLeft = (column.width - 20) / 2 + 11;
                  break;
              }

              F.apply(itemConfig, {
                renderId: true,
                value: false,
                style: {
                  padding: '0px',
                  display: 'inline-block',
                  'padding-left': paddingLeft,
                  'float': 'left',
                  margin: '0px'
                }
              });

              editor = new F.CheckBox(itemConfig);
              break;
            case 'switcher':
              var paddingLeft;
              switch (column.cellAlign) {
                case 'left':
                case undefined:
                  paddingLeft = 7;
                  break;
                case 'center':
                  paddingLeft = (column.width - 20 - 2) / 2;
                  break;
                case 'right':
                  paddingLeft = (column.width - 20) / 2 + 11;
                  break;
              }

              F.apply(itemConfig, {
                renderId: true,
                value: false,
                style: {
                  padding: '0px',
                  display: 'inline-block',
                  'padding-left': paddingLeft,
                  'float': 'left',
                  margin: '0px'
                }
              });

              editor = new F.Switcher(itemConfig);
              break;
            default:
              editor = new F.EmptyField(itemConfig);
          }
        }

        column.rowEditor = editor;
      }

      return el;
    },
    /*
     *
     */
    renderButtons: function () {
      var me = this,
        w = me.widget,
        lang = w.lang,
        container = F.get(document.createElement('div')),
        el;

      container.addCls(GRID_ROW_EDIT_BUTTONS_CLS);

      el = F.get(w.body.el.dom.appendChild(container.dom));

      me.buttonsEl = el;

      me.buttonUpdate = new F.Button({
        cls: GRID_ROW_EDIT_BUTTON_UPDATE_CLS,
        renderTo: el.dom,
        text: lang.update,
        events: [{
          click: me.onClickUpdate,
          scope: me
        }]
      });

      me.buttonCancel = new F.Button({
        cls: GRID_ROW_EDIT_BUTTON_CANCEL_CLS,
        renderTo: el.dom,
        text: lang.cancel,
        events: [{
          click: me.onClickCancel,
          scope: me
        }]
      });
    },
    /*
     *
     */
    setSizes: function () {
      var me = this,
        w = me.widget;

      if (w.leftColumns) {
        me._setSizes(w.leftBody.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.leftColumns, 'left');
      }

      if (w.columns) {
        me._setSizes(w.body.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.columns);
      }

      if (w.rightColumns) {
        me._setSizes(w.rightBody.el.select('.' + GRID_CELL_CLS + '[index="0"]'), w.rightColumns, 'right');
      }

      me.setElSize();
    },
    /*
     *
     */
    setElSize: function () {
      var w = this.widget,
        centerWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth();

      if (centerWidth < centerFullWidth) {
        this.el.css('width', centerFullWidth);
      }
    },
    /*
     * @private
     * @param {Fancy.Elements} firstRowCells
     * @param {Array} columns
     * @param {String} side
     */
    _setSizes: function (firstRowCells, columns, side) {
      var me = this,
        i = 0,
        iL = columns.length,
        column,
        cellSize,
        cell,
        cellEl,
        editor,
        borderWidth = 1,
        offset = 2;

      for (; i < iL; i++) {
        column = columns[i];
        cell = firstRowCells.item(i).dom;
        cellEl = F.get(cell);
        cellSize = me.getCellSize(cell);
        editor = column.rowEditor;

        if (!editor) {
          continue;
        }

        if ((side === 'left' || side === 'right') && i === iL - 1) {
          cellSize.width--;
        }

        if(side === 'left' && column.type === 'select'){
          cellSize.width--;
        }

        cellSize.height -= 1;

        if (i === iL - 1) {
          editor.el.css('width', (cellSize.width - 2));
        }
        else {
          editor.el.css('width', (cellSize.width - 1));
        }

        editor.el.css('height', (cellSize.height));

        cellSize.width -= borderWidth * 2;
        cellSize.width -= offset * 2;

        cellSize.height -= offset * 2;

        me.setEditorSize(editor, cellSize);
      }
    },
    //Dublication code from Fancy.grid.plugin.CellEdit
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellSize: function (cell) {
      var cellEl = F.get(cell),
        width = cellEl.width(),
        height = cellEl.height(),
        coeficient = 2;

      //if (F.nojQuery && w.panelBorderWidth === 2) {
      if (F.nojQuery) {
        coeficient = 1;
      }

      width += parseInt(cellEl.css('border-right-width')) * coeficient;
      height += parseInt(cellEl.css('border-bottom-width')) * coeficient;

      return {
        width: width,
        height: height
      };
    },
    /*
     * @param {Object} editor
     * @param {Number} size
     */
    setEditorSize: function (editor, size) {
      if (editor.wtype === 'field.combo') {
        editor.size(size);

        editor.el.css('width', size.width + 5);
      }
      else {
        editor.setInputSize({
          width: size.width,
          height: size.height
        });
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} animate
     */
    changePosition: function (rowIndex, animate) {
      var me = this,
        w = me.widget,
        scrollTop = w.scroller.getScroll(),
        bottomScroll = w.scroller.getBottomScroll(),
        newTop = w.cellHeight * rowIndex - 1 - scrollTop,
        plusTop = 0;

      if (w.grouping) {
        plusTop += w.grouping.getOffsetForRow(rowIndex);
        newTop += plusTop;
      }

      if (me.leftEl) {
        if (animate !== false) {
          me.leftEl.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.leftEl.css('top', newTop);
        }
      }

      if (me.el) {
        if (animate !== false) {
          me.el.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.el.css('top', newTop);
        }
      }

      if (me.rightEl) {
        if (animate !== false) {
          me.rightEl.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.rightEl.css('top', newTop);
        }
      }

      var showOnTop = w.getViewTotal() - 3 < rowIndex,
        buttonTop = newTop;

      if (rowIndex < 3) {
        showOnTop = false;
      }

      if (showOnTop) {
        if (w.grouping) {
          if (w.getViewTotal() - 3 < rowIndex - w.grouping.getSpecialRowsUnder(rowIndex)) {
            buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
          }
          else {
            buttonTop = newTop + w.cellHeight;
            showOnTop = false;
          }
        }
        else {
          buttonTop = newTop - parseInt(me.buttonsEl.css('height')) + 1;
        }
      }
      else {
        buttonTop = newTop + w.cellHeight;
      }

      if (animate !== false) {
        me.buttonsEl.animate({
          top: buttonTop
        }, ANIMATE_DURATION);
      }
      else {
        me.buttonsEl.css('top', buttonTop);
      }

      me.el.css('left', -bottomScroll);

      me.changeButtonsLeftPos();

      me.activeRowIndex = rowIndex;
    },
    /*
     *
     */
    changeButtonsLeftPos: function () {
      var me = this,
        w = me.widget,
        viewWidth = w.getCenterViewWidth(),
        buttonsElWidth = parseInt(me.buttonsEl.css('width'));

      me.buttonsEl.css('left', (viewWidth - buttonsElWidth) / 2);
    },
    /*
     * @param {Object} o
     */
    setValues: function (o) {
      var me = this,
        w = me.widget;

      if (w.leftColumns) {
        me._setValues(o.data, w.leftColumns);
      }

      if (w.columns) {
        me._setValues(o.data, w.columns);
      }

      if (w.rightColumns) {
        me._setValues(o.data, w.rightColumns);
      }

      me.activeId = o.id;
      me.activeRowIndex = o.rowIndex;
    },
    /*
     * @private
     * @param {Array} data
     * @param {Array} columns
     */
    _setValues: function (data, columns) {
      E(columns, function (column) {
        var editor = column.rowEditor;

        if (editor) {
          switch (column.type) {
            case 'action':
            case 'button':
            case 'order':
            case 'select':
            case 'expand':
            case 'rowdrag':
              break;
            default:
              editor.set(data[column.index], false);
          }
        }
      });
    },
    /*
     *
     */
    onScroll: function () {
      var me = this;

      if (me.rendered === false) {
        return;
      }

      if (me.activeRowIndex !== undefined) {
        me.changePosition(me.activeRowIndex, false);
      }
    },
    /*
     *
     */
    onColumnResize: function () {
      var me = this;

      if (me.rendered === false) {
        return;
      }

      setTimeout(function () {
        me.setSizes();
      }, ANIMATE_DURATION);
    },
    /*
     *
     */
    onClickUpdate: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        data = me.prepareChanged(),
        rowIndex = s.getRow(me.activeId);

      s.setItemData(rowIndex, data);
      w.update();

      me.hide();
    },
    /*
     *
     */
    prepareChanged: function () {
      var me = this,
        w = me.widget,
        data = me.changed;

      for (var p in data) {
        var column = w.getColumnByIndex(p);

        switch (column.type) {
          case 'date':
            var date = F.Date.parse(data[p], column.format.edit, column.format.mode),
              formattedValue = F.Date.format(date, column.format.read, column.format.mode);

            data[p] = formattedValue;
            break;
        }
      }

      return data;
    },
    /*
     *
     */
    onClickCancel: function () {
      this.hide();
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      if (!me.el) {
        return;
      }

      if (me.leftEl) {
        me.leftEl.hide();
      }

      me.el.hide();

      if (me.rightEl) {
        me.rightEl.hide();
      }

      me.buttonsEl.hide();
    },
    /*
     *
     */
    show: function () {
      var me = this;

      if (me.leftEl) {
        if(me.leftEl.css('display') === 'none'){
          me.leftEl.css('opacity', 0);
        }
        me.leftEl.show();
        me.leftEl.animate({opacity: 1 }, ANIMATE_DURATION);
      }

      if(me.el.css('display') === 'none'){
        me.el.css('opacity', 0);
      }
      me.el.show();
      me.el.animate({opacity: 1 }, ANIMATE_DURATION);

      if (me.rightEl) {
        if(me.rightEl.css('display') === 'none'){
          me.rightEl.css('opacity', 0);
        }
        me.rightEl.show();
        me.rightEl.animate({opacity: 1 }, ANIMATE_DURATION);
      }

      if(me.buttonsEl.css('display') === 'none'){
        me.buttonsEl.css('opacity', 0);
      }
      me.buttonsEl.show();
      me.buttonsEl.animate({opacity: 1 }, ANIMATE_DURATION);
    },
    /*
     * @param {Object} field
     * @param {*} newValue
     * @param {*} oldValue
     */
    onFieldChange: function (field, newValue, oldValue) {
      var me = this;

      if (!field.isValid()) {
        delete me.changed[field.index];
      }
      else {
        me.changed[field.index] = newValue;
      }
    },
    /*
     *
     */
    onFieldEnter: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        rowIndex = s.getRow(me.activeId);

      s.setItemData(rowIndex, me.changed);
      w.update();

      me.hide();
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    hideField: function (index, side) {
      var w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor) {
        column.rowEditor.hide();
      }
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    showField: function (index, side) {
      var w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor) {
        column.rowEditor.show();
      }
    },
    /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
    moveEditor: function (column, index, side, fromSide) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = w.getColumns(side),
        editor = column.rowEditor,
        body = w.getBody(side),
        rowEditRowEl = body.el.select('.' + GRID_ROW_EDIT_CLS),
        item = s.getById(me.activeId),
        value = item.get(column.index),
        field;

      if(!rowEditRowEl.dom){
        return;
      }

      if (me.activeId === undefined) {
        value = s.ge1t(me.activeRowIndex)[column.index];
      }

      editor.destroy();
      me.renderTo(rowEditRowEl, columns, index, side, fromSide);

      field = me.getField(index, side);
      column.rowEditor = field;

      field.set(value);
      me.setSizes();

      me.changeButtonsLeftPos();
      me.reSetColumnsEditorsLinks();
    },
    /*
     * @param {Number} index
     * @param {String} side
     * @return {Object}
     */
    getField: function (index, side) {
      var w = this.widget,
        body = w.getBody(side),
        field;

      switch (side) {
        case 'left':
          index++;
          break;
      }

      field = F.getWidget(body.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS).item(index).attr('id'));

      return field;
    },
    /*
     *
     */
    reSetColumnsEditorsLinks: function () {
      var me = this,
        w = me.widget,
        cells = w.body.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.columns, function (column, i) {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.leftBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.leftColumns, function (column, i) {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.rightBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.rightColumns, function (column, i) {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });
    },
    onColumnDrag: function () {
      var me = this;

      me.destroyEls();
      me.hide();
    },
    onLockColumn: function () {
      var me = this;

      me.destroyEls();
      me.hide();
    },
    onRightLockColumn: function () {
      var me = this;

      me.destroyEls();
      me.hide();
    },
    onUnLockColumn:  function () {
      var me = this;

      me.destroyEls();
      me.hide();
    },
    destroyEls: function () {
      var me = this,
        w = me.widget;

      if(me.rendered){
        me.rendered = false;

        if (w.leftColumns) {
          F.each(w.leftColumns, function (column) {
            column.rowEditor.destroy();
          });
          me.leftEl.destroy();
        }

        if (w.columns) {
          F.each(w.columns, function (column) {
            column.rowEditor.destroy();
          });
          me.el.destroy();
        }

        if (w.rightColumns) {
          F.each(w.rightColumns, function (column) {
            column.rowEditor.destroy();
          });
          me.rightEl.destroy();
        }
      }
    }
  });

})();