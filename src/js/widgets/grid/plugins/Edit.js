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
