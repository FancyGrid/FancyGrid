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

    me.fire('beforesort', {
      key: 'key',
      action: action
    });

    if(me.multiSort && me.multiSortInited !== true){
      me.initMultiSort();
    }

    switch(type){
      case 'number':
      case 'checkbox':
      case 'switcher':
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
      case 'tree':
        fn = 'sortString';
        sortType = 'string';
        break;
      default:
        throw new Error('[FancyGrid error] - does not exist sort function for type ' + type);
    }

    if(me.multiSort){
      me.addSorter(key, action.toLocaleUpperCase(), sortType);
    }
    else{
      me.sorters = [];

      me.sorters.push({
        key: key,
        dir: action.toLocaleUpperCase().toLocaleUpperCase(),
        type: sortType,
        _type: type
      });
    }

    if(me.remoteSort){
      me.serverSort(action, type, key);
      return;
    }

    options.type = type;

    if(action === 'drop'){
      delete me.order;
    }
    else {
      me[fn](action, key, options);
    }

    if(me.multiSort){
      var i = 0,
        iL = me.sorters.length - 1;

      for(;i<iL;i++){
        me.multiSortOrder(i);
      }
    }

    me.changeDataView();
    me.fire('sort', {
      key: key,
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
      if(action === 'drop') {
        delete me.params[me.directionParam];
      }
      else{
        me.params[me.directionParam] = action;
      }
    }

    me.once('serversuccess', function () {
      me.fire('sort', {
        key: key,
        action: action
      });
    });
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

    if(me.isTree){
      columnOriginalValues = me.getColumnOriginalValues('id');

      var treeData = me.treeGetDataAsTree(),
        sortedData = me.treeSort(treeData, action, key, 'number');

      sortedColumnValues = me.treeReadSortedId(sortedData);
    }
    else if(me.grouping){
      //BUG: It does not work for date

      var _columnOriginalValues = me.getColumnOriginalValuesByGroup(key, me.grouping.by, options);
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

      var notNumber = [],
        toSortValues = Fancy.Array.copy(columnOriginalValues),
        i = 0,
        iL = toSortValues.length;

      for(;i<iL;i++){
        if(isNaN(toSortValues[i])){
          notNumber.push(toSortValues[i]);
          toSortValues.splice(i, 1);
          iL--;
        }
      }

      switch (action) {
        case 'asc':
          sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
            return a - b;
          });

          sortedColumnValues = sortedColumnValues.concat(notNumber);
          break;
        case 'desc':
          sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
            return b - a;
          });

          sortedColumnValues = notNumber.concat(sortedColumnValues);
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

    if(me.isTree){
      columnOriginalValues = me.getColumnOriginalValues('id');

      var treeData = me.treeGetDataAsTree(),
        sortedData = me.treeSort(treeData, action, key, 'string');

      sortedColumnValues = me.treeReadSortedId(sortedData);
    }
    else if(me.grouping){
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
    var mapValues = {},
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
      sorter = me.sorters[i],
      prevKey = me.sorters[i + 1].key,
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
        switch(sorter.dir){
          case 'ASC':
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort(function (a, b) {
              return a - b;
            });
            break;
          case 'DESC':
            sortedSubValues = Fancy.Array.copy(keyValues[j]).sort(function (a, b) {
              return b - a;
            });
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
  },
  reSort: function () {
    var me = this;
    
    Fancy.each(me.sorters, function (sorter) {
      me.sort(sorter.dir.toLocaleLowerCase(), sorter.type, sorter.key, {});
    });
  }
});/*
 * @class Fancy.grid.plugin.Sorter
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_COLUMN_SORT_ASC = F.GRID_COLUMN_SORT_ASC;
  var GRID_COLUMN_SORT_DESC = F.GRID_COLUMN_SORT_DESC;
  var GRID_COLUMN_RESIZER_CLS = F.GRID_COLUMN_RESIZER_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;
  var GRID_LEFT_CLS = F.GRID_LEFT_CLS;
  var GRID_RIGHT_CLS = F.GRID_RIGHT_CLS;

  F.define('Fancy.grid.plugin.Sorter', {
    extend: F.Plugin,
    ptype: 'grid.sorter',
    inWidgetName: 'sorter',
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
        me.onsHeaders();
      });
    },
    /*
     *
     */
    onsHeaders: function () {
      var me = this,
        w = me.widget;

      w.on('headercellclick', me.onHeaderCellClick, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onHeaderCellClick: function (grid, o) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        cellEl = F.get(o.cell),
        side = o.side,
        index = o.index,
        action,
        columns,
        column,
        key,
        e = o.e,
        target = e.target;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if (target.tagName.toLocaleLowerCase() === 'input') {
        return;
      }

      var field = cellEl.select('.' + FIELD_CLS);
      if (field.length > 0 && field.item(0).within(target) === true) {
        return;
      }

      if (cellEl.hasCls(GRID_COLUMN_RESIZER_CLS) || w.startResizing) {
        return;
      }

      columns = w.getColumns(side);

      if (cellEl.hasCls(GRID_COLUMN_SORT_ASC)) {
        action = 'desc';
      }
      else if (cellEl.hasCls(GRID_COLUMN_SORT_DESC)) {
        if(!w.multiSort){
          action = 'drop';
        }
        else {
          action = 'asc';
        }
      }
      else {
        action = 'asc';
      }

      column = columns[index];
      key = column.index;

      me.sort(action, key, side, column, cellEl);
    },
    /*
     * @param {String} dir
     * @param {String} index
     * @param {String} side
     * @param {Object} column
     * @param {Object} cell
     */
    sort: function (dir, index, side, column, cell) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = w.getColumns(side),
        i = 0,
        iL = columns.length,
        type,
        header = w.getHeader(side);

      if (!column || !cell) {
        for (; i < iL; i++) {
          if (columns[i].index === index) {
            column = columns[i];
            cell = header.getCell(i);
            break;
          }
        }
      }

      if (column.sortable !== true) {
        return;
      }

      if (w.multiSort) {
        me.clearHeaderMultiSortCls(dir, cell);
      }
      else {
        me.clearHeaderSortCls();
      }

      switch (dir) {
        case 'asc':
          cell.addCls(GRID_COLUMN_SORT_ASC);
          break;
        case 'desc':
          cell.addCls(GRID_COLUMN_SORT_DESC);
          break;
      }

      type = column.type;

      var format,
        mode;

      if (column.format) {
        if (F.isString(column.format)) {
          switch (column.format) {
            case 'date':
              format = w.lang.date.read;
              if (column.format.mode) {
                mode = column.format.mode;
              }
              break;
          }
        }
        else {
          switch (column.type) {
            case 'date':
              format = column.format.read;
              if (column.format.mode) {
                mode = column.format.mode;
              }
              break;
          }
        }
      }

      if (w.grouping) {
        if (s.remoteSort) {
          s.once('load', function () {
            w.grouping.reGroup();
            //Write code instead of reGroup
          });
        }
      }

      s.sort(dir, type, index, {
         smartIndexFn: column.smartIndexFn,
         format: format,
         mode: mode
      });
    },
    /*
     * @param {String} dir
     * @param {Fancy.Element} cellEl
     */
    clearHeaderMultiSortCls: function (dir, cellEl) {
      var me = this,
        w = me.widget,
        s = w.store,
        itemsASC,
        itemsDESC;

      switch (dir.toLocaleUpperCase()) {
        case 'ASC':
          cellEl.removeCls(GRID_COLUMN_SORT_DESC);
          break;
        case 'DESC':
          cellEl.removeCls(GRID_COLUMN_SORT_ASC);
          break;
      }

      itemsASC = w.el.select('.' + GRID_COLUMN_SORT_ASC);
      itemsDESC = w.el.select('.' + GRID_COLUMN_SORT_DESC);

      if (itemsASC.length + itemsDESC.length < s.multiSortLimit) {
        return;
      }

      //TODO: Small refactoring that decrease size
      var i = 0,
        iL = itemsASC.length,
        cellToRemoveCls;

      for (; i < iL; i++) {
        var cell = itemsASC.item(i),
          sideEl = cell.parent().parent(),
          side,
          columns,
          key,
          index = cell.attr('index');

        if (sideEl.hasCls(GRID_CENTER_CLS)) {
          side = 'center';
        }
        else if (sideEl.hasCls(GRID_LEFT_CLS)) {
          side = 'left';
        }
        else if (sideEl.hasCls(GRID_RIGHT_CLS)) {
          side = 'right';
        }

        columns = w.getColumns(side);
        key = columns[index].index;

        var firstSorter = s.sorters[0];

        if (firstSorter.key === key) {
          cellToRemoveCls = cell;
        }
      }

      var i = 0,
        iL = itemsDESC.length;

      for (; i < iL; i++) {
        var cell = itemsDESC.item(i),
          sideEl = cell.parent().parent(),
          side,
          columns,
          key,
          index = cell.attr('index');

        if (sideEl.hasCls(GRID_CENTER_CLS)) {
          side = 'center';
        }
        else if (sideEl.hasCls(GRID_LEFT_CLS)) {
          side = 'left';
        }
        else if (sideEl.hasCls(GRID_RIGHT_CLS)) {
          side = 'right';
        }

        columns = w.getColumns(side);
        key = columns[index].index;

        var firstSorter = s.sorters[0];

        if (firstSorter.key === key) {
          cellToRemoveCls = cell;
        }
      }

      cellToRemoveCls.removeCls(GRID_COLUMN_SORT_ASC);
      cellToRemoveCls.removeCls(GRID_COLUMN_SORT_DESC);
    },
    /*
     *
     */
    clearHeaderSortCls: function () {
      var el = this.widget.el;

      el.select('.' + GRID_COLUMN_SORT_ASC).removeCls(GRID_COLUMN_SORT_ASC);
      el.select('.' + GRID_COLUMN_SORT_DESC).removeCls(GRID_COLUMN_SORT_DESC);
    },
    updateSortedHeader: function () {
      var me = this,
        w = me.widget,
        header,
        s = w.store;

      me.clearHeaderSortCls();

      F.each(s.sorters, function (sorter, i) {
        var info = w.getColumnOrderByKey(sorter.key),
          cls = sorter.dir === 'ASC'? GRID_COLUMN_SORT_ASC : GRID_COLUMN_SORT_DESC;

        if(!info.side){
          return;
        }

        header = w.getHeader(info.side);
        var cell = header.getCell(info.order);

        if(cell){
          cell.addCls(cls);
        }
      });
    }
  });
})();