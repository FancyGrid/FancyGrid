/*
 * @mixin Fancy.store.mixin.Sort
 */
Fancy.Mixin('Fancy.store.mixin.Sort', {
  multiSortLimit: 3,
  /*
   * @param {'ASC'|'DESC'} action
   * @param {String} type
   * @param {String|Number} key
   * @param {Object} options
   */
  sort: function(action, type, key, options){
    var me = this,
      fn,
      sortType;

    if(me.multiSort && me.multiSortInited !== true){
      me.initMultiSort();
    }

    switch(type){
      case 'number':
      case 'checkbox':
      case 'progressdonut':
      case 'progressbar':
      case 'grossloss':
      case 'date':
      case 'currency':
        fn = 'sortNumber';
        sortType = 'number';
        break;
      case 'string':
      case 'combo':
      case 'text':
      case 'color':
        fn = 'sortString';
        sortType = 'string';
        break;
      default:
        throw new Error('[FancyGrid error] - does not exist sort function for type ' + type);
    }

    if(me.multiSort){
      me.addSorter(key, action.toLocaleUpperCase(), sortType);
    }

    if(me.remoteSort){
      me.serverSort(action, type, key);
      return;
    }

    options.type = type;

    me[fn](action, key, options);

    if(me.multiSort){
      var i = 0,
        iL = me.sorters.length - 1;

      for(;i<iL;i++){
        me.multiSortOrder(i);
      }
    }

    me.changeDataView();
    me.fire('sort', {
      key: 'key',
      action: action
    });
  },
  /*
   * @param {'ASC'|'DESC'} action
   * @param {String} type
   * @param {String|Number} key
   */
  serverSort: function(action, type, key){
    var me = this;

    me.params = me.params || {};

    if(me.multiSort){
      me.params['sorters'] = me.sorters;
    }
    else{
      me.params[me.sortParam] = key;
      me.params[me.directionParam] = action;
    }

    me.loadData();
  },
  /*
   * @param {'ASC'|'DESC'} action
   * @param {String} type
   * @param {String|Number} key
   */
  sortNumber: function(action, key, options){
    var me = this,
      columnOriginalValues = [],
      sortedColumnValues,
      i,
      iL;

    if(me.grouping){
      var _columnOriginalValues = me.getColumnOriginalValuesByGroup(key, me.grouping.by);
      sortedColumnValues = [];
      i = 0;
      iL = _columnOriginalValues.length;

      switch (action) {
        case 'asc':
          for(;i<iL;i++){
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);

            sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
              return a - b;
            }));
          }
          break;
        case 'desc':
          for(;i<iL;i++) {
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);

            sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
              return b - a;
            }));
          }
          break;
      }
    }
    else {
      columnOriginalValues = me.getColumnOriginalValues(key, options);

      switch (action) {
        case 'asc':
          sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort(function (a, b) {
            return a - b;
          });
          break;
        case 'desc':
          sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort(function (a, b) {
            return b - a;
          });
          break;
      }
    }

    me.order = me.getOrder(columnOriginalValues, sortedColumnValues);
  },
  /*
   * @param {'ASC'|'DESC'} action
   * @param {String|Number} key
   */
  sortString: function(action, key){
    var me = this,
      columnOriginalValues = [],
      sortedColumnValues,
      i,
      iL;

    if(me.grouping){
      var _columnOriginalValues = me.getColumnOriginalValuesByGroup(key, me.grouping.by);
      sortedColumnValues = [];
      i = 0;
      iL = _columnOriginalValues.length;

      switch (action) {
        case 'asc':
          for(;i<iL;i++){
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);
            sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort());
          }
          break;
        case 'desc':
          for(;i<iL;i++) {
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);
            sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort().reverse());
          }
          break;
      }
    }
    else {
      columnOriginalValues = me.getColumnOriginalValues(key);

      switch (action) {
        case 'asc':
          sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort();
          break;
        case 'desc':
          sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort();
          sortedColumnValues = sortedColumnValues.reverse();
          break;
      }
    }

    me.order = me.getOrder(columnOriginalValues, sortedColumnValues);
  },
  /*
   * @param {Array} original
   * @param {Array} sorted
   * @return {Array}
   */
  getOrder: function(original, sorted){
    var me = this,
      mapValues = {},
      i = 0,
      iL = original.length,
      order = [],
      subMapValues;

    for(;i<iL;i++){
      var value = original[i];
      if(mapValues[value] === undefined){
        mapValues[value] = [];
      }

      mapValues[value].push(i);
    }

    i = 0;
    for(;i<iL;i++){
      value = sorted[i];
      subMapValues = mapValues[value];
      order.push(subMapValues[0]);

      if(subMapValues.length > 1){
        subMapValues.splice(0, 1);
      }
    }

    return order;
  },
  /*
   * @param {Number} value
   * @param {String} action
   */
  changeOrderIndexes: function(value, action){
    var me = this;

    if(action === undefined){
      action = '-';
    }

    if(me.order === undefined){
      return;
    }

    var i = 0,
      iL = me.order.length;

    if(action === '-') {
      for(;i<iL;i++){
        if(me.order[i] > value){
          me.order[i]--;
        }
      }
    }
    else{
      for(;i<iL;i++){
        if(me.order[i] >= value){
          me.order[i]++;
        }
      }
    }
  },
  /*
   *
   */
  initMultiSort:function(){
    var me = this;

    me.multiSortInited = true;

    if(!me.sorters){
      me.sorters = [];
    }
  },
  /*
   * @param {String} key
   * @param {'ASC'|'DESC'} dir
   * @param {String} type
   */
  addSorter: function(key, dir, type){
    var me = this,
      i = 0,
      iL = me.sorters.length;

    for(;i<iL;i++){
      if(me.sorters[i].key === key){
        me.sorters.splice(i, 1);
        break;
        //if(me.sorters[i].dir !== dir){
          //me.sorters[i].dir = dir;
        //}
        //return;
      }
    }

    me.sorters.push({
      key: key,
      dir: dir.toLocaleUpperCase(),
      type: type
    });

    if(me.sorters.length > me.multiSortLimit){
      //me.sorters.pop();
      me.sorters.shift();
    }
  },
  /*
   * @param {Number} i
   */
  multiSortOrder: function(i){
    var me = this,
      w = me.widget,
      s = w.store,
      //sorter = me.sorters[i + 1],
      sorter = me.sorters[i],
      prevKey = me.sorters[i + 1].key,
      //prevKey = me.sorters[i].key,
      key = sorter.key,
      j = 0,
      jL = me.getTotal(),
      value,
      prevValue,
      keyValues = [],
      keyValue,
      newOrder = [],
      order = [];

    for(;j<jL;j++){
      value = s.get(me.order[j], prevKey, true);
      keyValue = s.get(me.order[j], key, true);

      if(value === prevValue){
        keyValues[keyValues.length - 1].push(keyValue);
        newOrder[newOrder.length - 1].push(me.order[j]);
      }
      else{
        keyValues.push([keyValue]);
        newOrder.push([me.order[j]]);
      }

      prevValue = value;
    }

    j = 0;
    jL = newOrder.length;

    for(;j<jL;j++){
      if(newOrder[j].length === 1){
        order.push(newOrder[j][0]);
        continue;
      }

      var sortedSubValues;

      if(sorter.type === 'number'){
        //console.log('number', sorter.dir);
        switch(sorter.dir){
          case 'ASC':
            //console.log(keyValues[j]);
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort(function (a, b) {
              return a - b;
            });
            //console.log(sortedSubValues);
            //console.log('--------------');
            break;
          case 'DESC':
            //console.log(keyValues[j]);
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort(function (a, b) {
              return b - a;
            });
            //console.log(sortedSubValues);
            //console.log('--------------');
            break;
        }
      }
      else if(sorter.type === 'string'){
        switch(sorter.dir){
          case 'ASC':
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort();
            break;
          case 'DESC':
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort().reverse();
            break;
        }
      }

      var originSubOrder = newOrder[j],
        newSubOrder = [],
        _newSubOrder;

      _newSubOrder = me.getOrder(keyValues[j], sortedSubValues);

      var k = 0,
        kL = _newSubOrder.length;

      for(;k<kL;k++){
        newSubOrder.push(originSubOrder[_newSubOrder[k]]);
      }

      //order = order.concat(newOrder[j]);
      order = order.concat(newSubOrder);
    }

    me.order = order;
  }
});/*
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
      s = w.store,
      cellEl = Fancy.get(o.cell),
      side = o.side,
      index = o.index,
      action,
      clsASC = w.clsASC,
      clsDESC = w.clsDESC,
      columns,
      column,
      key,
      type,
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

      var j = 0,
        jL = s.sorters.length,
        passed = false,
        firstSorter = s.sorters[0];

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

      var j = 0,
        jL = s.sorters.length,
        passed = false,
        firstSorter = s.sorters[0];

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