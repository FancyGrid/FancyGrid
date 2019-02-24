/*
 * @mixin Fancy.store.mixin.Sort
 */
Fancy.modules['sort'] = true;
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
      iL,
      customSort = options.sorter;

    if(me.isTree){
      columnOriginalValues = me.getColumnOriginalValues('id');

      var treeData = me.treeGetDataAsTree(),
        sortedData = me.treeSort(treeData, action, key, 'number', customSort);

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

            if(customSort){
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                return customSort('asc', a, b);
              }));
            }
            else {
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                return a - b;
              }));
            }
          }
          break;
        case 'desc':
          for(;i<iL;i++) {
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);

            if(customSort){
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                customSort('desc', a, b);
              }));
            }
            else {
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                return b - a;
              }));
            }
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
          if(customSort){
            sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
              return customSort('asc', a, b);
            });
          }
          else {
            sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
              return a - b;
            });
          }

          sortedColumnValues = sortedColumnValues.concat(notNumber);
          break;
        case 'desc':
          if(customSort){
            sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
              return customSort('desc', a, b);
            });
          }
          else {
            sortedColumnValues = Fancy.Array.copy(toSortValues).sort(function (a, b) {
              return b - a;
            });
          }

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
  sortString: function(action, key, options){
    var me = this,
      columnOriginalValues = [],
      sortedColumnValues,
      i,
      iL,
      customSort = options.sorter;

    if(me.isTree){
      columnOriginalValues = me.getColumnOriginalValues('id');

      var treeData = me.treeGetDataAsTree(),
        sortedData = me.treeSort(treeData, action, key, 'string', customSort);

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

            if(customSort){
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                return customSort('asc', a, b);
              }));
            }
            else {
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort());
            }
          }
          break;
        case 'desc':
          for(;i<iL;i++) {
            columnOriginalValues = columnOriginalValues.concat(_columnOriginalValues[i].values);
            if(customSort){
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort(function (a, b) {
                return customSort('desc', a, b);
              }));
            }
            else {
              sortedColumnValues = sortedColumnValues.concat(_columnOriginalValues[i].values.sort().reverse());
            }
          }
          break;
      }
    }
    else {
      columnOriginalValues = me.getColumnOriginalValues(key);

      switch (action) {
        case 'asc':
          if(customSort){
            sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort(function (a, b) {
              return customSort('asc', a, b);
            });
          }
          else {
            sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort();
          }
          break;
        case 'desc':
          if(customSort){
            sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort(function (a, b) {
              return customSort('desc', a, b);
            });
          }
          else {
            sortedColumnValues = Fancy.Array.copy(columnOriginalValues).sort();
            sortedColumnValues = sortedColumnValues.reverse();
          }
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
});