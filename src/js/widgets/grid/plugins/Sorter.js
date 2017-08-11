/*
 * @class Fancy.grid.plugin.Sorter
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Sorter', {
  extend: Fancy.Plugin,
  ptype: 'grid.sorter',
  inWidgetName: 'sorter',
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

    w.once('render', function(){
     me.onsHeaders();
    });
  },
  /*
   *
   */
  onsHeaders: function(){
    var me = this,
      w = me.widget;

    w.on('headercellclick', me.onHeaderCellClick, me);
  },
  /*
   * @param {Object} grid
   * @param {Object} o
   */
  onHeaderCellClick: function(grid, o){
    var me = this,
      w = me.widget,
      cellEl = Fancy.get(o.cell),
      side = o.side,
      index = o.index,
      action,
      clsASC = w.clsASC,
      clsDESC = w.clsDESC,
      columns,
      column,
      key,
      e = o.e,
      target = e.target;

    if(target.tagName.toLocaleLowerCase() === 'input'){
      return;
    }

    var field = cellEl.select('.fancy-field');
    if(field.length > 0 && field.item(0).within(target) === true){
       return;
    }

    if(cellEl.hasClass('fancy-grid-column-resizer') || w.startResizing){
      return;
    }

    columns = w.getColumns(side);

    if(cellEl.hasClass(clsASC)){
      action = 'desc';
    }
    else if(cellEl.hasClass(clsDESC)){
      action = 'asc';
    }
    else{
      action = 'asc';
    }

    column = columns[index];
    key = column.index || column.key;

    me.sort(action, key, side, column, cellEl);
  },
  sort: function(dir, index, side, column, cell){
    var me = this,
      w = me.widget,
      s = w.store,
      clsASC = w.clsASC,
      clsDESC = w.clsDESC,
      columns = w.getColumns(side),
      i = 0,
      iL = columns.length,
      type,
      header = w.getHeader(side);

    if(!column || !cell){
      for(;i<iL;i++){
        if(columns[i].index === index){
          column = columns[i];
          cell = header.getCell(i);
          break;
        }
      }
    }

    if(column.sortable !== true) {
      return;
    }

    if(w.multiSort){
      me.clearHeaderMultiSortCls(dir, cell);
    }
    else{
      me.clearHeaderSortCls();
    }

    switch(dir){
      case 'asc':
        cell.addClass(clsASC);
        break;
      case 'desc':
        cell.addClass(clsDESC);
        break;
    }

    type = column.type;

    var format;

    if(column.format){
      if(Fancy.isString(column.format)){
        switch (column.format) {
          case 'date':
            format = w.lang.date.read;
            break;
        }
      }
      else{
        switch(column.type){
          case 'date':
            format = column.format.read;
            break;
        }
      }
    }

    if(w.grouping){
      if(s.remoteSort){
        s.once('load', function(){
          w.grouping.reGroup();
          //Write code instead of reGroup
        });
      }
    }

    s.sort(dir, type, index, {
      smartIndexFn: column.smartIndexFn,
      format: format
    });
  },
  /*
   * @param {String} dir
   * @param {Fancy.Element} cellEl
   */
  clearHeaderMultiSortCls: function(dir, cellEl){
    var me = this,
      w = me.widget,
      s = w.store,
      clsASC = w.clsASC,
      clsDESC = w.clsDESC,
      itemsASC,
      itemsDESC;

    switch(dir.toLocaleUpperCase()){
      case 'ASC':
        cellEl.removeClass(clsDESC);
        break;
      case 'DESC':
        cellEl.removeClass(clsASC);
        break;
    }

    itemsASC = w.el.select('.'+clsASC);
    itemsDESC = w.el.select('.'+clsDESC);

    if(itemsASC.length + itemsDESC.length < 3){
      return;
    }

    //TODO: Small refactoring that decrease size
    var i = 0,
      iL = itemsASC.length,
      cellToRemoveCls;

    for(;i<iL;i++){
      var cell = itemsASC.item(i),
        sideEl = cell.parent().parent(),
        side,
        columns,
        key,
        index = cell.attr('index');

      if(sideEl.hasClass('fancy-grid-center')){
        side = 'center';
      }
      else if(sideEl.hasClass('fancy-grid-left')){
        side = 'left';
      }
      else if(sideEl.hasClass('fancy-grid-right')){
        side = 'right';
      }

      columns = w.getColumns(side);
      key = columns[index].index;

      var firstSorter = s.sorters[0];

      if(firstSorter.key === key){
        cellToRemoveCls = cell;
      }
    }

    var i = 0,
      iL = itemsDESC.length;

    for(;i<iL;i++){
      var cell = itemsDESC.item(i),
        sideEl = cell.parent().parent(),
        side,
        columns,
        key,
        index = cell.attr('index');

      if(sideEl.hasClass('fancy-grid-center')){
        side = 'center';
      }
      else if(sideEl.hasClass('fancy-grid-left')){
        side = 'left';
      }
      else if(sideEl.hasClass('fancy-grid-right')){
        side = 'right';
      }

      columns = w.getColumns(side);
      key = columns[index].index;

      var firstSorter = s.sorters[0];

      if(firstSorter.key === key){
        cellToRemoveCls = cell;
      }
    }

    cellToRemoveCls.removeClass(clsASC);
    cellToRemoveCls.removeClass(clsDESC);
  },
  /*
   *
   */
  clearHeaderSortCls: function(){
    var me = this,
      w = me.widget,
      clsASC = w.clsASC,
      clsDESC = w.clsDESC;

    w.el.select('.'+clsASC).removeClass(clsASC);
    w.el.select('.'+clsDESC).removeClass(clsDESC);
  }
});