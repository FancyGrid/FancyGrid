/*
 * @class Fancy.grid.plugin.Edit
 */
Fancy.modules['edit'] = true;
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
  constructor: function(){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init(){
    const me = this,
      w = me.widget,
      s = w.store;

    me.addEvents('tab');

    me.Super('init', arguments);

    w.once('render', () => {
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
  ons(){
    const me = this,
      w = me.widget,
      s = w.store,
      clickEventName = 'cell' + me.getClickEventName();

    w.on('cellclick', me.onClickCell, me);
    s.on('set', me.onStoreSet, me);
    me.on('tab', me.onTab, me);

    w.once('init', () => {
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
  onGridActivate(){
    Fancy.get(document).on('keydown', this.onKeyDown, this);
  },
  /*
   *
   */
  onGridDeActivate(){
    Fancy.get(document).un('keydown', this.onKeyDown, this);
  },
  /*
   * @param {Object} e
   */
  onKeyDown(e){
    const me = this,
      w = me.widget,
      keyCode = e.keyCode,
      key = Fancy.key;

    switch(keyCode){
      case key.TAB:
        this.fire('tab', e);
        break;
      case key.Z:
        w.undo();
        break;
    }
  },
  /*
   * @param {Object} me
   * @param {Object} e
   */
  onTab(me, e){
    const w = me.widget,
      activeParams = me.activeCellEditParams;

    if(!activeParams){
      return;
    }

    e.preventDefault();

    const params = me.getNextCellEditParam();

    if(w.celledit){
      w.celledit.hideEditor();
      if (w.tabEdit !== false){
        setTimeout(() => {
          w.celledit.edit(params);
        }, 100);
      }
    }
  },
  /*
   * @return {Object}
   */
  getNextCellEditParam(){
    const me = this,
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
      const cellInfo = me.getNextCellInfo({
        side: side,
        columnIndex: columnIndex,
        rowIndex: rowIndex
      });

      side = cellInfo.side;
      columnIndex = cellInfo.columnIndex;
      rowIndex = cellInfo.rowIndex;
      columns = w.getColumns(side);
      nextColumn = columns[cellInfo.columnIndex];

      if(me.tabColumnsSupport[nextColumn.type] && nextColumn.editable === true && !nextColumn.hidden){
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
      id,
      side,
      column: nextColumn,
      cell: nextCell,
      columnIndex,
      rowIndex,
      value: s.get(rowIndex, key),
      data: s.get(rowIndex),
      item: s.getById(id)
    };
  },
  /*
   * @param {Object} o
   * @return {Object}
   */
  getNextCellInfo(o){
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
      side,
      rowIndex,
      columnIndex
    };
  },
  /*
   * @return {String}
   */
  getClickEventName(){
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
  stopEditor(){
    this.stopped = true;
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onClickCell(grid, o){
    const w = this.widget,
      column = o.column;

    if(column.editable && (column.type === 'checkbox' || column.type === 'switcher') && w.celledit){
      w.celledit.onCheckBoxChange(o);
    }
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onClickCellToEdit(grid, o){
    const me = this,
      w = me.widget,
      column = o.column;

    if(w.rowedit){}
    else if(w.celledit){
      w.celledit.hideEditor();
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
  onStoreSet(store, o){
    this.widget.updater.updateRow(o.rowIndex);
  },
  /*
   *
   */
  onStoreCRUDBeforeUpdate(){
    const me = this,
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
  onStoreCRUDUpdate(store, id){
    delete store.changed[id];

    this.clearDirty();
  },
  /*
   *
   */
  onStoreCRUDBeforeDestroy(){},
  /*
   *
   */
  onStoreCRUDDestroy(){
    const me = this;

    clearInterval(me.intCrudDestroy);

    me.intCrudDestroy = setTimeout(() => {
      me.widget.store.loadData();
      me.clearDirty();
    }, 100);
  },
  /*
   *
   */
  clearDirty(){
    const w = this.widget;

    setTimeout(() => {
      w.leftBody.clearDirty();
      w.body.clearDirty();
      w.rightBody.clearDirty();
    }, 500);
  },
  /*
   * @param {Object} store
   * @param {Array} data
   */
  onCreate(store, data){
    const me = this,
      w = me.widget;

    w.updater.update();
    w.fire('insert', data);
    me.clearDirty();
  }
});
/*
 * @class Fancy.grid.plugin.CellEdit
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const GRID_ACTIVE_CELL_ENABLED = F.GRID_ACTIVE_CELL_ENABLED;

  F.define('Fancy.grid.plugin.CellEdit', {
    extend: F.Plugin,
    ptype: 'grid.celledit',
    inWidgetName: 'celledit',
    editorsCls: 'fancy-grid-editors',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget;

      w.once('render', () => {
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
    onDocClick(grid, e){
      var me = this,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        inCombo = true,
        target = e.target,
        targetEl = F.get(target);

      if (editor === undefined){
        return;
      }
      else if (o.column.type === 'date'){
        return;
      }
      else if (o.column.type === 'combo'){}
      else {
        const cellEl = targetEl.closest(`.${GRID_CELL_CLS}`);

        if (!cellEl.dom && !editor.el.within(target)){
          editor.hide();
        }
        return;
      }

      if (editor.el.within(target) === false && editor.list.within(target) === false && me.comboClick !== true){
        inCombo = false;
      }

      if (inCombo === false){
        editor.hide();
      }

      me.comboClick = false;
    },
    /*
     *
     */
    initEditorContainer(){
      const me = this,
        w = me.widget;

      me.editorsContainer = w.el.select(`.${me.editorsCls}`);
    },
    /*
     * @param {Object} o
     */
    edit(o){
      const me = this,
        w = me.widget,
        s = w.store,
        column = o.column;

      if (column.index === '$selected'){
        return;
      }

      if(w.selection && w.selection.activeCell){
        w.el.removeCls(GRID_ACTIVE_CELL_ENABLED);
      }

      me.activeCellEditParams = o;
      w.edit.activeCellEditParams = o;

      column.editor = me.generateEditor(column);

      //me.hideEditor();
      if(!s.infiniteScrolledToRow){
        w.scroller.scrollToCell(o.cell);
      }
      me.showEditor(o);
    },
    /*
     * @param {Object} column
     * @return {Object}
     */
    generateEditor(column){
      let me = this,
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

      if (column.editor){
        return column.editor;
      }

      renderTo = me.editorsContainer.dom;

      const itemConfig = {
        renderTo: renderTo,
        label: false,
        style: style,
        checkValidOnTyping: true,
        column: column
      };

      switch (type){
        case 'combo':
          var displayKey = 'text',
            valueKey = 'text',
            data = column.data,
            events = [{
              change: me.onComboChange,
              scope: me
            },{
              esc: me.onComboEsc,
              scope: me
            }, {
              beforekey: me.onBeforeKey,
              scope: me
            },{
              'add-new-value': me.onComboAddNewValue,
              scope: me
            }];

          if (column.editorEvents){
            var i = 0,
              iL = column.editorEvents.length;

            for (; i < iL; i++){
              events.push(column.editorEvents[i]);
            }
          }

          if (column.displayKey !== undefined){
            displayKey = column.displayKey;
            valueKey = column.valueKey || displayKey;
          }

          if (theme === 'default'){
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
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
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
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
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
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });

          if (column.spin !== undefined){
            itemConfig.spin = column.spin;
          }

          if (column.step !== undefined){
            itemConfig.step = column.step;
          }

          if (column.min !== undefined){
            itemConfig.min = column.min;
          }

          if (column.max !== undefined){
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
            i18n: w.i18n,
            vtype: vtype,
            theme: theme,
            checkValidOnTyping: true,
            events: [{
              enter: me.onEditorEnter,
              scope: me
            },{
              esc: me.onEditorEsc,
              scope: me
            }, {
              beforehide: me.onEditorBeforeHide,
              scope: me
            }, {
              blur: me.onBlur,
              scope: me
            },{
              beforekey: me.onBeforeKey,
              scope: me
            }]
          });
          break;
        case 'checkbox':
        case 'switcher':
          break;
        default:
          F.error('Type ' + type + ' editor does not exit');
      }

      return editor;
    },
    /*
     * @param {Object} o
     */
    showEditor(o){
      const me = this,
        w = me.widget,
        column = o.column,
        type = column.type,
        //editor = me[type + 'Editor'],
        editor = column.editor,
        cell = o.cell,
        cellXY = me.getCellPosition(cell),
        cellSize = me.getCellSize(cell);

      w.fire('beforeedit', o);

      if(w.edit.stopped === true){
        w.edit.stopped = false;
        return;
      }

      if (type === 'combo'){
        me.comboClick = true;
      }

      if(!editor){
        if(column.editable !== false && column.index){
          switch (type){
            case 'checkbox':
            case 'switcher':
              w.setById(o.item.id, column.index, !o.value);
              break;
          }
        }
        return;
      }

      me.activeEditor = editor;

      me.setEditorValue(o);
      //Bug fix with wrong validation on start
      if(o.value === ''){
        setTimeout(() => {
          var value = editor.get();

          if(value === '' && editor.input){
            value = editor.input.dom.value;
          }

          editor.validate(value);
        }, 1);
      }

      if(o.rowIndex === 0){
        cellSize.height++;
      }

      if(column.minEditorWidth && cellSize.width < column.minEditorWidth){
        cellSize.width = column.minEditorWidth;
      }

      me.setEditorSize(cellSize);
      editor.show();
      editor.el.css(cellXY);

      if (type === 'combo' && editor.subSearch){}
      else{
        editor.focus();
      }

      if(editor.input && column.cellAlign){
        editor.input.css('text-align', column.cellAlign);

        if(column.type === 'date' && column.cellAlign === 'right'){
          editor.input.css('padding-right', '23px');
        }
      }

      if (type === 'combo'){
        if (o.value !== undefined){
          editor.set(o.value, false);
        }

        if(editor.subSearch){
          editor.showList();
        }
      }

      w.fire('startedit', o);
    },
    /*
     * @param {Number} side
     */
    setEditorSize(size){
      const me = this;

      if (me.activeEditor.wtype === 'field.combo'){
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
    hideEditor(){
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        value,
        o = me.activeCellEditParams,
        editor = me.activeEditor,
        column;

      if(!editor){
        return;
      }

      if(!editor.isVisible()){
        return;
      }

      w.fire('beforeendedit', o);

      if(w.selection && w.selection.activeCell){
        w.el.addCls(GRID_ACTIVE_CELL_ENABLED);
      }

      if (editor){
        column = o.column;
        value = editor.get();

        if(o.column.beforeSaveFormat){
          switch (F.typeOf(o.column.beforeSaveFormat)){
            case 'string':
              value = this.getBeforeSaveFormat(o.column.beforeSaveFormat)(value, o);
              break;
            case 'function':
              value = o.column.beforeSaveFormat(value, o);
              break;
          }
        }

        if (s.proxyType === 'server' && column.type !== 'combo'){
          key = me.getActiveColumnKey();
          value = me.prepareValue(value);

          //date field when data item value is null
          if(value === '' && s.get(o.rowIndex, key) === null){}
          else{
            s.set(o.rowIndex, key, value);
          }
        }

        const editorValue = editor.getValue();

        if(editorValue !== value){
          editor.setValue(value);
        }
        editor.hide();
        editor.hideErrorTip();
      }

      setTimeout(() => {
        delete me.activeEditor;
        w.fire('endedit', o);
      },1);

      //Bug fix: when editor is out of side, grid el scrolls
      if (w.el.dom.scrollTop){
        w.el.dom.scrollTop = 0;
      }
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellPosition(cell){
      const me = this,
        w = me.widget,
        cellEl = F.get(cell),
        cellOffset = cellEl.offset(),
        gridOffset = w.el.offset(),
        //leftBorder = w.panel?  parseInt(w.el.css('border-left-width')),
        leftBorder = parseInt(w.el.css('border-left-width')),
        //topBorder = parseInt(w.el.css('border-top-width')),
        topBorder = parseInt(getComputedStyle(w.el.dom)['border-top-width']),
        topFix = w.panel && F.nojQuery ? 1 : 1,
        offset = {
          left: parseInt(cellOffset.left) - parseInt(gridOffset.left) - 1 - leftBorder + 'px',
          top: parseInt(cellOffset.top) - parseInt(gridOffset.top) - topFix - topBorder + 'px'
        };

      return offset;
    },
    /*
     * @param {Fancy.Element} cell
     * @return {Object}
     */
    getCellSize(cell){
      const cellEl = F.get(cell),
        width = cellEl.dom.clientWidth + 2,
        height = cellEl.dom.clientHeight + 2;

      return {
        width,
        height
      };
    },
    /*
     * @param {Object} o
     */
    setEditorValue(o){
      const me = this,
        editor = me.activeEditor;

      if(o.column.editFormat){
        switch (F.typeOf(o.column.editFormat)){
          case 'function':
            o.value = o.column.editFormat(o.value, o);
            break;
          case 'string':
            o.value = me.getEditFormat(o.column.editFormat)(o.value, o);
            break;
        }
      }

      switch (o.column.type){
        case 'combo':
          if (editor.valueIndex !== -1){
            editor.set(editor.getValueKey(o.value), false);
          }
          break;
        case 'date':
          if(!o.value){
            o.value = '';
          }
          const format = o.column.format,
            date = F.Date.parse(o.value, format.read, format.mode);

          editor.set(date);
          break;
        default:
          editor.set(o.value);
      }
    },
    /*
     * @param {Object} editor
     */
    onEditorEsc(){
      this.hideEditor();
    },
    /*
     * @param {Object} editor
     */
    onComboEsc(editor){
      const me = this;

      if(editor.list && editor.list.css('display') === 'block'){
        return;
      }

      if(editor.aheadList && editor.aheadList.css('display') === 'block'){
        return;
      }

      me.hideEditor();
    },
    /*
     * @param {Object} editor
     * @param {String} value
     */
    onEditorEnter(){
      const me = this,
        w = me.widget,
        selection = w.selection || {};

      me.hideEditor();

      if(selection.selectBottomCellAfterEdit){
        var cell = w.selectCellDown();
        setTimeout(()=> {
          w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
        }, 1);
      }

      switch(selection.continueEditOnEnter){
        case 'right':
          var cell = selection.moveRight();

          if(cell){
            setTimeout(() =>{
              w.editCell(cell);
            }, 100);
          }
          break;
        case 'bottom':
          var cell = selection.moveDown();

          if(cell){
            setTimeout(() => {
              w.editCell(cell);
            }, 100);
          }
          break;
      }
    },
    /*
     *
     */
    onHeaderCellMouseDown(){
      this.hideEditor();
    },
    /*
     * @param {String} value
     */
    setValue(value){
      var me = this,
        w = me.widget,
        s = w.store,
        key,
        o = me.activeCellEditParams,
        editor = me.activeEditor;

      if (editor === undefined){
        return;
      }

      if (editor.isValid() === false){
        return;
      }

      if (s.proxyType === 'server'){
        return;
      }

      if(w.rowheight){
        //It could be slow
        setTimeout(function(){
          w.update();
        },1);
      }

      key = me.getActiveColumnKey();

      value = me.prepareValue(value);

      if (editor.type === 'field.date' && editor.isEqual(s.get(o.rowIndex, key))){
        return;
      }

      s.set(o.rowIndex, key, value);
    },
    /*
     * @param {Object} editor
     */
    onEditorBeforeHide(editor){
      if (editor.isValid()){
        this.setValue(editor.getValue());
      }
    },
    /*
     *
     */
    onScroll(){
      this.hideEditor();
    },
    /*
     *
     */
    onNativeScroll(){
      this.hideEditor();
    },
    /*
     * @param {Object} field
     */
    onBlur(field){
      const me = this;

      if (!me.activeEditor || field.id === me.activeEditor.id){
        if (field.mouseDownSpinUp === true || field.mouseDownSpinDown){
          return;
        }

        me.hideEditor();
      }
    },
    /*
     * @param {*} value
     * @return {*}
     */
    prepareValue(value){
      const me = this,
        type = me.getActiveColumnType(),
        o = me.activeCellEditParams,
        column = o.column,
        format = column.format;

      if(format && format.beforeSaveFn){
        const editor = me.activeEditor;
        value = editor.input.dom.value;

        return format.beforeSaveFn(value);
      }

      switch (type){
        case 'number':
        case 'currency':
          if (format && format.inputFn){
            var _value = '',
              i = 0,
              iL = value.length;

            if (F.isNumber(value)){
              return value;
            }

            for (; i < iL; i++){
              if (!isNaN(Number(value[i]))){
                _value += value[i];
              }
            }

            value = _value;
          }
          else if (value !== ''){
            value = Number(value);
          }
          break;
        case 'date':
          if (column.format && column.format.read){
            const date = column.editor.getDate();

            if(value){
              value = F.Date.format(date, column.format.read, undefined, column.format.mode);
            }
          }
          break;
      }

      return value;
    },
    /*
     * @return {String}
     */
    getActiveColumnType(){
      const o = this.activeCellEditParams,
        column = o.column;

      return column.type;
    },
    /*
     * @return {String}
     */
    getActiveColumnKey(){
      const o = this.activeCellEditParams,
        column = o.column,
        key = column.index;

      return key;
    },
    /*
     * @param {Object} o
     */
    onCheckBoxChange(o){
      const me = this,
        w = me.widget,
        column = o.column,
        key = column.index,
        s = w.store,
        value = me.checkBoxChangedValue;

      if (me.activeEditor) {
        me.hideEditor();
      }

      if (me.checkBoxChangedValue === undefined){
        return;
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
    onComboChange(combo, value){
      const me = this,
        w = me.widget,
        s = w.store,
        o = me.activeCellEditParams,
        key = me.getActiveColumnKey();//,
        //newValue = combo.getDisplayValue(value);

      //s.set(o.rowIndex, key, newValue);
      s.set(o.rowIndex, key, value);
      me.hideEditor();
    },
    /*
     *
     */
    checkAutoInitEditors(){
      const me = this;

      this.widget.columns.forEach(column => {
        if (column.editorAutoInit) {
          column.editor = me.generateEditor(column);
        }
      });
    },
    /*
     * @param {Object} editor
     * @param {String} value
     * @param {Object} e
     */
    onBeforeKey(field, value, e){
      const me = this,
        w = me.widget,
        selection = w.selection || {},
        key = F.key;

      switch (e.keyCode){
        case key.UP:
          if(selection.selectUpCellOnUp){
            me.hideEditor();
            w.selectCellUp();
            setTimeout(() => {
              w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.DOWN:
          if(selection.selectBottomCellOnDown){
            me.hideEditor();
            w.selectCellDown();
            setTimeout(() => {
              w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
            }, 1);
          }
          break;
        case key.LEFT:
          if(selection.selectLeftCellOnLeftEnd){
            var carret = field.getInputSelection();

            if(carret.start === 0 && carret.end === 0){
              me.hideEditor();
              w.selectCellLeft();
              setTimeout(() => {
                w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
              }, 1);
            }
          }
          break;
        case key.RIGHT:
          if(selection.selectRightCellOnEnd){
            var carret = field.getInputSelection(),
              length = field.input.dom.value.length;

            if(carret.start === length && carret.end === length){
              me.hideEditor();
              w.selectCellRight();
              setTimeout(() => {
                w.el.select(`.${F.GRID_CELL_OVER_CLS}`).removeCls(F.GRID_CELL_OVER_CLS);
              }, 1);
            }
          }
          break;
      }
    },
    /*
     * @param {String} value
     * @return Function
     */
    getEditFormat(type){
      const me = this,
        w = me.widget,
        lang = w.lang,
        decimalSeparator = lang.decimalSeparator,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            const currencySign = params.column.currency || lang.currencySign,
              precision = params.column.precision || 0;

            value = F.Number.currencyFormat(value, decimalSeparator, thousandSeparator, precision);

            if(value !== ''){
              value = currencySign + value;
            }

            return value;
          };
      }
    },
    getBeforeSaveFormat(type){
      const me = this,
        w = me.widget,
        lang = w.lang,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            const currencySign = params.column.currency || lang.currencySign;

            value = value.replace(currencySign, '').replace(thousandSeparator, '');
            if(value !== ''){
              value = Number(value);
            }

            return value;
          };
      }
    },
    onComboAddNewValue(field, value){
      const me = this,
        w = me.widget,
        column = field.column,
        index = column.index,
        data = column.data;

      if(F.isObject(data[0])){
        data.push({
          text: value,
          value: value
        });
      }
      else{
        data.push(value);
      }

      w.setColumnComboData(index, data);
    }
  });

})();
/*
 * @class Fancy.grid.plugin.RowEdit
 */
(function(){
  //SHORTCUTS
  const F = Fancy;
  const E = F.each;

  //CONSTANTS
  const GRID_CELL_CLS = F.GRID_CELL_CLS;
  const FIELD_CLS = F.FIELD_CLS;
  const GRID_ROW_EDIT_CLS = F.GRID_ROW_EDIT_CLS;
  const GRID_ROW_EDIT_BUTTONS_CLS = F.GRID_ROW_EDIT_BUTTONS_CLS;
  const GRID_ROW_EDIT_BUTTON_UPDATE_CLS = F.GRID_ROW_EDIT_BUTTON_UPDATE_CLS;
  const GRID_ROW_EDIT_BUTTON_CANCEL_CLS = F.GRID_ROW_EDIT_BUTTON_CANCEL_CLS;
  const GRID_ACTIVE_CELL_ENABLED = F.GRID_ACTIVE_CELL_ENABLED;

  const ANIMATE_DURATION = F.ANIMATE_DURATION;

  //TEMPLATES
  const T_CELL_0 = `.${GRID_CELL_CLS}[index="0"]`

  F.define('Fancy.grid.plugin.RowEdit', {
    extend: F.Plugin,
    ptype: 'grid.rowedit',
    inWidgetName: 'rowedit',
    rendered: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons(){
      const me = this,
        w = me.widget;

      w.on('scroll', me.onScroll, me);
      w.on('columnresize', me.onColumnResize, me);

      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      w.on('beforecolumndrag', me.onBeforeColumnDrag, me);
      w.on('columndrag', me.onColumnDrag, me);
      w.on('columnhide', me.onColumnHide, me);
      w.on('columnshow', me.onColumnShow, me);

      if(w.grouping && w.grouping.by){
        w.on('collapse', me.onCollapse, me);
        w.on('expand', me.onExpand, me);
      }
    },
    /*
     *
     */
    onCollapse(){
      this.hide();
    },
    /*
     *
     */
    onExpand(){
      this.hide();
    },
    /*
     * @param {Object} o
     */
    edit(o){
      const me = this,
        w = me.widget,
        column = o.column;

      if (column && column.index === '$selected'){
        return;
      }

      me.activeCellEditParams = o;

      w.scroller.scrollToCell(o.cell);
      me.showEditor(o);
    },
    /*
     * @param {Object} o
     */
    showEditor(o){
      const me = this,
        w = me.widget;

      if(w.selection && w.selection.activeCell){
        w.el.removeCls(GRID_ACTIVE_CELL_ENABLED);
      }

      w.fire('beforeedit', o);

      if(w.edit.stopped === true){
        w.edit.stopped = false;
        return;
      }

      me.changed = {};

      for(var p in o.data){
        if(o.data[p] === null){
          o.data[p] = '';
        }
      }

      if (!me.rendered){
        me.render();
        me.changePosition(o.rowIndex, false);
        me.setValues(o);
      }
      else {
        const isHidden = me.el.css('display') === 'none';
        me.show();
        me.changePosition(o.rowIndex, !isHidden);

        if(!isHidden){
          setTimeout(function(){
            me.setValues(o);
          }, F.ANIMATE_DURATION);
        }
        else {
          me.setValues(o);
        }
      }

      me.setSizes(o);
    },
    /*
     *
     */
    render(){
      const me = this,
        w = me.widget;

      if (w.leftColumns){
        me.leftEl = me.renderTo(w.leftBody.el, w.leftColumns);
      }

      if (w.columns){
        me.el = me.renderTo(w.body.el, w.columns);
      }

      if (w.rightColumns){
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
    renderTo(renderTo, columns, order, side, fromSide){
      const fieldEls = renderTo.select(`.${FIELD_CLS}`);
      var me = this,
        w = me.widget,
        container = F.newEl('div'),
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

        i = order;
        iL = order + 1;

        switch (side){
          case 'right':
            if(fieldEls.length){
              renderBefore = fieldEls.item(order);
            }
            break;
          case 'left':
            if(fieldEls.length){
              renderAfter = fieldEls.item(order);
            }
            break;
          case 'center':
            switch (fromSide){
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

      for (; i < iL; i++){
        column = columns[i];

        const columnWidth = column.width;

        const itemConfig = {
          index: column.index,
          label: false,
          style,
          width: columnWidth,
          vtype: column.vtype,
          format: column.format,
          stopPropagation: true,
          theme,
          checkValidOnTyping: true,
          events: [{
            change: me.onFieldChange,
            delay: 100,
            scope: me
          }, {
            empty: me.onFieldEmpty,
            delay: 100,
            scope: me
          }, {
            enter: me.onFieldEnter,
            scope: me
          }]
        };

        switch (side){
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
            switch (fromSide){
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

        if (column.editable === false){
          switch (column.type){
            case 'string':
            case 'number':
              editor = new F.TextField(itemConfig);
              break;
            default:
              editor = new F.EmptyField(itemConfig);
          }
        }
        else {
          switch (column.type){
            case 'date':
              if (column.format){
                itemConfig.format = column.format;
              }

              editor = new F.DateField(itemConfig);
              break;
            case 'image':
            case 'string':
            case 'text':
            case 'color':
              editor = new F.StringField(itemConfig);
              break;
            case 'number':
            case 'currency':
              if (column.spin){
                itemConfig.spin = column.spin;
              }

              if (column.step){
                itemConfig.step = column.step;
              }

              if (column.min){
                itemConfig.min = column.min;
              }

              if (column.max){
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

              if (column.displayKey){
                itemConfig.displayKey = column.displayKey;
                itemConfig.valueKey = column.valueKey || column.displayKey;
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
              switch (column.cellAlign){
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
              switch (column.cellAlign){
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

        if(editor.input && column.cellAlign){
          editor.input.css('text-align', column.cellAlign);
        }

        column.rowEditor = editor;

        if(column.hidden){
          editor.hide();
        }
      }

      return el;
    },
    /*
     *
     */
    renderButtons(){
      var me = this,
        w = me.widget,
        lang = w.lang,
        container = F.newEl('div'),
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
    setSizes(o){
      const me = this,
        w = me.widget;

      w.leftColumns && me._setSizes(w.leftBody.el.select(T_CELL_0), w.leftColumns, 'left');
      w.columns && me._setSizes(w.body.el.select(T_CELL_0), w.columns);
      w.rightColumns && me._setSizes(w.rightBody.el.select(T_CELL_0), w.rightColumns, 'right');

      me.setElSize(o);
    },
    /*
     *
     */
    setElSize(o){
      var me = this,
        w = me.widget,
        centerWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth(),
        rowHeight;

      if (centerWidth < centerFullWidth) {
        me.el.css('width', centerFullWidth + 2);
      }

      if (o && o.cell) {
        rowHeight = o.cell.clientHeight + 3;

        me.el.css( 'height', rowHeight + 'px' );

        w.leftColumns && me.leftEl.css( 'height', rowHeight + 'px' );
        w.rightColumns && me.rightEl.css( 'height', rowHeight + 'px' );
      }

      //me.el.css('height', '');
    },
    /*
     * @private
     * @param {Fancy.Elements} firstRowCells
     * @param {Array} columns
     * @param {String} side
     */
    _setSizes(firstRowCells, columns, side){
      var me = this,
        i = 0,
        iL = columns.length,
        column,
        cellSize,
        cell,
        editor,
        borderWidth = 1,
        offset = 2;

      for (; i < iL; i++){
        column = columns[i];
        cell = firstRowCells.item(i).dom;
        cellSize = me.getCellSize(cell);
        editor = column.rowEditor;

        if (!editor){
          continue;
        }

        if ((side === 'left' || side === 'right') && i === iL - 1){
          cellSize.width--;
        }

        if(side === 'left' && column.type === 'select'){
          cellSize.width--;
        }

        cellSize.height -= 1;

        if (i === iL - 1){
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
    getCellSize(cell){
      var cellEl = F.get(cell),
        width = cellEl.width(),
        height = cellEl.height(),
        coeficient = 2;

      //if (F.nojQuery && w.panelBorderWidth === 2){
      if (F.nojQuery){
        coeficient = 1;
      }

      width += parseInt(cellEl.css('border-right-width')) * coeficient;
      height += parseInt(cellEl.css('border-bottom-width')) * coeficient;

      return {
        width,
        height
      };
    },
    /*
     * @param {Object} editor
     * @param {Number} size
     */
    setEditorSize(editor, size){
      if (editor.wtype === 'field.combo'){
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
    changePosition(rowIndex, animate){
      var me = this,
        w = me.widget,
        scrollTop = w.infinite? 0 : w.scroller.getScroll(),
        bottomScroll = w.scroller.getBottomScroll(),
        newTop = w.cellHeight * rowIndex - 1 - scrollTop,
        plusTop = 0;

      if(w.grouping && w.grouping.by){
        plusTop += w.grouping.getOffsetForRow(rowIndex);
        newTop += plusTop;
      }

      if (me.leftEl){
        if (animate !== false){
          me.leftEl.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.leftEl.css('top', newTop);
        }
      }

      if (me.el){
        if (animate !== false){
          me.el.animate({
            top: newTop
          }, ANIMATE_DURATION);
        }
        else {
          me.el.css('top', newTop);
        }
      }

      if (me.rightEl){
        if (animate !== false){
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

      if (rowIndex < 3){
        showOnTop = false;
      }

      if (showOnTop){
        if(w.grouping && w.grouping.by){
          if (w.getViewTotal() - 3 < rowIndex - w.grouping.getSpecialRowsUnder(rowIndex)){
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

      if(F.nojQuery){
        buttonTop += 1;
      }

      if (animate !== false){
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
    changeButtonsLeftPos(){
      const me = this,
        w = me.widget,
        viewWidth = w.getCenterViewWidth(),
        buttonsElWidth = parseInt(me.buttonsEl.css('width'));

      me.buttonsEl.css('left', (viewWidth - buttonsElWidth) / 2);
    },
    /*
     * @param {Object} o
     */
    setValues(o){
      const me = this,
        w = me.widget;

      if (w.leftColumns){
        me._setValues(o.data, w.leftColumns);
      }

      if (w.columns){
        me._setValues(o.data, w.columns);
      }

      if (w.rightColumns){
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
    _setValues(data, columns){
      const me = this;

      E(columns, function(column){
        const editor = column.rowEditor;

        if (editor) {
          switch (column.type){
            case 'action':
            case 'button':
            case 'order':
            case 'select':
            case 'expand':
            case 'rowdrag':
              break;
            default:
              var value = data[column.index];
              if(value === undefined){
                value = '';
              }

              if(column.editFormat){
                switch (F.typeOf(column.editFormat)){
                  case 'function':
                    value = column.editFormat(value, {column: column});
                    break;
                  case 'string':
                    value = me.getEditFormat(column.editFormat)(value, {column: column});
                    break;
                }
              }

              editor.set(value, false);
          }
        }
      });
    },
    /*
     *
     */
    onScroll(){
      const me = this,
        w = me.widget;

      if (me.rendered === false){
        return;
      }

      if(w.infinite){
        me.hide();
      }

      if (me.activeRowIndex !== undefined){
        me.changePosition(me.activeRowIndex, false);
      }
    },
    /*
     *
     */
    onColumnResize(){
      const me = this;

      if (me.rendered === false){
        return;
      }

      if(F.nojQuery){
        setTimeout(() => {
          me.setSizes();
        }, 400);
      }
      else {
        setTimeout(() => {
          me.setSizes();
        }, ANIMATE_DURATION);
      }
    },
    /*
     *
     */
    onClickUpdate(){
      this.saveChanges();
    },
    /*
     *
     */
    saveChanges(){
      var me = this,
        w = me.widget,
        s = w.store,
        data = me.prepareChanged(),
        rowIndex = s.getRow(me.activeId),
        values = me.getComboNewValues();

      for(const p in values){
        const _values = s.getColumnUniqueData(p);
        if(F.isString(_values[0])){
          _values.push(values[p]);
        }
        else{
          _values.push({
            value: values[p],
            text: values[p]
          });
        }
        w.setColumnComboData(p, _values);
      }

      F.apply(data, values);
      s.setItemData(rowIndex, data);
      w.update();

      me.hide();
    },
    /*
     *
     */
    prepareChanged(){
      const me = this,
        w = me.widget,
        data = me.changed;

      for (const p in data){
        const column = w.getColumnByIndex(p);

        switch (column.type){
          case 'date':
            const date = F.Date.parse(data[p], column.format.edit, column.format.mode),
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
    onClickCancel(){
      this.hide();
    },
    /*
     *
     */
    hide(){
      const me = this,
        w = me.widget;

      w.fire('beforeendedit', me.activeCellEditParams);

      if(w.selection && w.selection.activeCell){
        w.el.addCls(GRID_ACTIVE_CELL_ENABLED);
      }

      if (!me.el){
        return;
      }

      if (me.leftEl){
        me.leftEl.hide();
      }

      me.el.hide();

      if (me.rightEl){
        me.rightEl.hide();
      }

      me.buttonsEl.hide();

      w.fire('endedit', me.activeCellEditParams);
    },
    /*
     *
     */
    show(){
      const me = this;

      if (me.leftEl){
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

      if (me.rightEl){
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
    onFieldChange(field, newValue){
      const me = this;

      if (!field.isValid()){
        delete me.changed[field.index];
      }
      else {
        me.changed[field.index] = newValue;
      }
    },
    onFieldEmpty(field){
      const me = this;

      if (field.vtype && !field.isValid()){
        delete me.changed[field.index];
      }
      else {
        me.changed[field.index] = '';
      }
    },
    /*
     *
     */
    onFieldEnter(){
      this.saveChanges();
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    hideField(index, side){
      const w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor){
        column.rowEditor.hide();
      }
    },
    /*
     * @param {Number} index
     * @param {String} side
     */
    showField(index, side){
      const w = this.widget,
        columns = w.getColumns(side),
        column = columns[index];

      if (column.rowEditor){
        column.rowEditor.show();
      }
    },
    /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
    moveEditor(column, index, side, fromSide){
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

      if (me.activeId === undefined){
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
    getField(index, side){
      var w = this.widget,
        body = w.getBody(side),
        field;

      switch (side){
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
    reSetColumnsEditorsLinks(){
      var me = this,
        w = me.widget,
        cells = w.body.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.columns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.leftBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.leftColumns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });

      cells = w.rightBody.el.select('.' + GRID_ROW_EDIT_CLS + ' .' + FIELD_CLS);

      E(w.rightColumns, (column, i) => {
        column.rowEditor = F.getWidget(cells.item(i).attr('id'));
      });
    },
    onBeforeColumnDrag(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnDrag(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnHide(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onColumnShow(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onRightLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    onUnLockColumn(){
      const me = this;

      me.destroyEls();
      me.hide();
    },
    destroyEls(){
      const me = this,
        w = me.widget;

      if(me.rendered){
        me.rendered = false;

        if (w.leftColumns){
          F.each(w.leftColumns, column => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.leftEl.destroy();
        }

        if (w.columns){
          F.each(w.columns, column => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.el.destroy();
        }

        if (w.rightColumns){
          F.each(w.rightColumns, column => {
            column.rowEditor.destroy();
            delete column.rowEditor;
          });
          me.rightEl.destroy();
        }
      }
    },
    /*
     * @return {Boolean}
     */
    isVisible(){
      return this.el.css('display') !== 'none';
    },
    /*
     * @param {String} value
     * @return Function
     */
    getEditFormat(type){
      const me = this,
        w = me.widget,
        lang = w.lang,
        decimalSeparator = lang.decimalSeparator,
        thousandSeparator = lang.thousandSeparator;

      switch(type){
        case 'currency':
          return function(value, params){
            const currencySign = params.column.currency || lang.currencySign,
              precision = params.column.precision || 0;

            value = F.Number.currencyFormat(value, decimalSeparator, thousandSeparator, precision);

            if(value !== ''){
              value = currencySign + value;
            }

            return value;
          };
      }
    },
    /*
     *
     */
    getComboNewValues(){
      const me = this,
        w = me.widget,
        columns = w.getColumns(),
        values = {};

      F.each(columns, column => {
        if(column.type === 'combo' && column.editable && column.rowEditor){
          const editor = column.rowEditor,
            value = editor.get();

          if(editor.value === -1 && F.isString(value) && value.length){
            values[column.index] = value;
          }
          else if(editor.getInputValue() !== value){
            values[column.index] = editor.getInputValue();
          }
        }
      });

      return values;
    }
  });

})();
