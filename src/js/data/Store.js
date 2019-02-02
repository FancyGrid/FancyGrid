/*
 * @class Fancy.Store
 */
Fancy.define('Fancy.Store', {
  extend: Fancy.Event,
  mixins: [
    'Fancy.store.mixin.Paging',
    'Fancy.store.mixin.Infinite',
    'Fancy.store.mixin.Proxy',
    'Fancy.store.mixin.Rest',
    'Fancy.store.mixin.Reader',
    'Fancy.store.mixin.Writer',
    'Fancy.store.mixin.Sort',
    'Fancy.store.mixin.Edit',
    'Fancy.store.mixin.Grouping',
    'Fancy.store.mixin.Filter',
    'Fancy.store.mixin.Search',
    'Fancy.store.mixin.Dirty',
    'Fancy.store.mixin.Tree'
  ],
  pageSize: 10,
  showPage: 0,
  pages: 0,
  dirty: false,
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
    me.init();

    me.data = me.data || [];
    me.dataView = me.dataView || [];
    me.dataViewMap = me.dataViewMap  || {};
    me.map = {};

    me.setModel();

    if(me.data) {
      if (me.data.proxy) {
        me.initProxy();
      }
      else if(!me.widget.isTreeData){
        me.setData(me.data);
      }
    }

    me.readSmartIndexes();

    if(me.widget.grouping){
      me.orderDataByGroupOnStart();
    }

    if(me.widget.isTreeData){
      me.initTreeData();
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents(
      'add', 'change', 'changepages', 'set',
      //Proxy(server) CRUD-s events, maybe will be used not only for it, but now only for server CRUD-s
      'beforeupdate', 'update',
      'beforeremove',
      'remove',
      'beforedestroy', 'destroy',
      'beforecreate', 'create',
      'beforesort', 'sort',
      'beforeload', 'load',
      'filter',
      'beforeinsert', 'insert',
      'servererror', 'serversuccess'
    );
    me.initId();
    me.initPlugins();

    if(me.paging){
      me.initPaging();
    }

    if(me.infinite){
      me.initInfinite();
    }

    if( me.initTrackDirty ) {
      me.initTrackDirty()
    }
  },
  /*
   *
   */
  setModel: function(){
    var me = this,
      model = me.model;

    if(model === undefined){
      model = Fancy.Model;
    }
    else{
      model = Fancy.ClassManager.get(me.model);
    }

    me.model = model;
    me.fields = model.prototype.fields;
    if( me.fields === undefined){
      throw new Error('needed to set fields in Model of Store');
    }
  },
  /*
   * @param {Array} data
   */
  setData: function(data){
    var me = this,
      i = 0,
      iL = data.length,
      model = me.model,
      item;

    me.data = [];
    me.dataView = [];
    me.dataViewMap = {};
    me.dataViewIndexes = {};

    if(me.collapsed) {
      for (; i < iL; i++) {
        item = new model(data[i]);

        me.data[i] = item;
        me.map[item.id] = item;
      }
    }
    else {
      if(me.expanded){
        //??? It looks like never reaches
        for (; i < iL; i++) {
          item = new model(data[i]);

          me.data[i] = item;
          me.map[item.id] = item;
        }
      }
      else {
        if(me.paging ){
          for (; i < iL; i++) {
            item = new model(data[i]);

            me.data[i] = item;
            if(i < me.pageSize){
              me.dataView[i] = item;
              me.dataViewMap[item.id] = i;
              me.dataViewIndexes[i] = i;
            }
            me.map[item.id] = item;
          }
        }
        else {
          for (; i < iL; i++) {
            item = new model(data[i]);

            me.data[i] = item;
            me.dataView[i] = item;
            me.dataViewMap[item.id] = i;
            me.dataViewIndexes[i] = i;
            me.map[item.id] = item;
          }
        }
      }
    }

    if(me.isTree){
      Fancy.each(me.data, function (item, i) {
        if(item.get('expanded')){
          Fancy.each(item.data.child, function (_child,_i) {
            var childItem = me.getById(_child.id);

            item.data.child[_i] = childItem;
          });
        }
      });
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {Fancy.Model}
   */
  getItem: function(rowIndex){
    var me = this;

    return me.dataView[rowIndex];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {Boolean} origin
   */
  get: function(rowIndex, key, origin){
    var me = this,
      data;

    if(rowIndex === undefined){
      return me.data;
    }

    var item = me.dataView[rowIndex];

    if(!item){
      if(me.order){
        item = me.data[me.order[rowIndex]]
      }
      else {
        item = me.data[rowIndex];
      }

      if(item){
        if(key === 'id'){
          return item.data[key] || item.id;
        }

        return item.data[key];
      }

      return item;
    }

    if(key === undefined){
      data = item.data;

      if(data.id === undefined){
        data.id = me.dataView[rowIndex].id;
      }

      return me.dataView[rowIndex].data;
    }
    else if(key === 'none'){
      return '';
    }

    if(origin){
      item = me.data[rowIndex];

      if(key === 'id'){
        return item.data[key] || item.id;
      }

      return item.data[key];
    }
    else {
      item = me.dataView[rowIndex];

      if(key === 'id'){
        return item.data[key] || item.id;
      }

      return item.data[key];
    }
  },
  /*
   * @param {Number} rowIndex
   * @return {String|Number}
   */
  getId: function(rowIndex){
    return this.dataView[rowIndex].id;
  },
  /*
   * @param {Number} id
   * @return {Fancy.Model}
   */
  getRow: function(id){
    return this.dataViewMap[id];
  },
  /*
   * @param {Number} rowIndex
   * @param {String|Number} key
   * @param {String|Number} value
   * @param {String|Number} [id]
   */
  set: function(rowIndex, key, value, id){
    var me = this,
      item,
      oldValue,
      infiniteScrolledToRow = 0;

    if(me.infiniteScrolledToRow){
      infiniteScrolledToRow = me.infiniteScrolledToRow;
    }

    if(rowIndex + infiniteScrolledToRow === -1){
      item = me.getById(id);
    }
    else{
      item = me.dataView[rowIndex + infiniteScrolledToRow];
      id = item.data.id || item.id;
    }

    if(value === undefined){
      var data = key;

      for(var p in data){
        if(p === 'id'){
          continue;
        }

        var _data;

        if(rowIndex + infiniteScrolledToRow === -1){
          oldValue = item.get(p);
          item.set(p, data[p]);

          _data = item.data;
        }
        else {
          oldValue = me.get(rowIndex + infiniteScrolledToRow, p);
          me.dataView[rowIndex + infiniteScrolledToRow].data[p] = data[p];

          _data = me.dataView[rowIndex + infiniteScrolledToRow].data;
        }

        me.fire('set', {
          id: id,
          data: _data,
          rowIndex: rowIndex,
          infiniteRowIndex: rowIndex + infiniteScrolledToRow,
          key: p,
          value: data[p],
          oldValue: oldValue,
          item: item
        });
      }

      if(me.proxyType === 'server' && me.autoSave) {
        me.proxyCRUD('UPDATE', id, data);
      }

      return;
    }
    else{
      if(rowIndex + infiniteScrolledToRow === -1){
        oldValue = item.get(key);
      }
      else {
        oldValue = me.get(rowIndex + infiniteScrolledToRow, key);
      }

      if(oldValue == value){
        return;
      }
    }

    if(rowIndex + infiniteScrolledToRow === -1){
      item.set(key, value);
    }
    else {
      var _item = me.dataView[rowIndex + infiniteScrolledToRow];
      if(_item.data.parentId){
        //TODO: it is bad about perfomance, it needs to redo.
        var parentItem = me.getById(_item.data.parentId);

        Fancy.each(parentItem.data.child, function (child, i) {
          if(child.id === _item.id){
            child[key] = value;
          }
        });
      }

      _item.data[key] = value;
    }

    if(me.proxyType === 'server' && me.autoSave){
      me.proxyCRUD('UPDATE', id, key, value);
    }

    var _data;

    if(rowIndex === -1){
      _data = item.data;
    }
    else{
      _data = me.dataView[rowIndex + infiniteScrolledToRow].data;
    }

    me.fire('set', {
      id: id,
      data: _data,
      rowIndex: rowIndex,
      infiniteRowIndex: rowIndex + infiniteScrolledToRow,
      key: key,
      value: value,
      oldValue: oldValue,
      item: item
    });
  },
  /*
   * @param {Number} rowIndex
   * @param {Object} data
   */
  setItemData: function(rowIndex, data){
    var me = this,
      pastData = me.get(rowIndex);

    if(me.infinite){
      rowIndex -= me.infiniteScrolledToRow;
    }

    if(me.writeAllFields && me.proxyType === 'server'){
      me.set(rowIndex, data);
    }
    else {
      for (var p in data) {
        if (pastData[p] == data[p]) {
          continue;
        }

        me.set(rowIndex, p, data[p]);
      }
    }
  },
  /*
   * @return {Number}
   */
  getLength: function(){
    var me = this,
      length = me.dataView.length;

    if(me.infinite){
      if(length > me.infiniteDisplayedRows){
        length = me.infiniteDisplayedRows;
      }
    }

    return length;
  },
  /*
   * @return {Number}
   */
  getTotal: function(){
    var me = this;

    if(me.pageType === 'server'){
      return me.totalCount;
    }

    if(me.filteredData){
      return me.filteredData.length;
    }

    if(me.data === undefined){
      return 0;
    }
    else if(Fancy.isObject(me.data)){
      return 0;
    }

    return me.data.length;
  },
  /*
   * @param {Object} data
   * @param {Boolean} force
   */
  defineModel: function(data, force){
    var me = this,
      s = me.store;

    if(me.model && me.fields && me.fields.length !== 0 && !force){
      return;
    }

    var data = data || me.data || s.data,
      fields = me.getFieldsFromData(data),
      modelName = 'Fancy.model.'+Fancy.id();

    Fancy.define(modelName, {
      extend: Fancy.Model,
      fields: fields
    });

    me.model = modelName;
    me.fields = fields;

    me.setModel();
  },
  /*
   * @param {Object} data
   * @return {Array}
   */
  getFieldsFromData: function(data){
    var items = data.items || data;

    if( data.fields){
      return data.fields;
    }

    if( !items ){
      throw new Error('not set fields of data');
    }

    var itemZero = items[0],
      fields = [];

    if(items.length === undefined){
      itemZero = items;
    }

    for(var p in itemZero){
      fields.push(p);
    }

    return fields;
  },
  /*
   * @param {String|Number} key
   * @param {Object} options
   * @return {Array}
   */
  getColumnOriginalValues: function(key, options){
    var me = this,
      i = 0,
      values = [],
      options = options || {},
      dataProperty = options.dataProperty || 'data',
      data = me[dataProperty],
      iL = data.length;

    if(options.smartIndexFn){
      for(;i<iL;i++){
        values.push(options.smartIndexFn(data[i].data));
      }
    }
    else{
      if(options.format){
        if(options.type === 'date'){
          for (; i < iL; i++) {
            var value = data[i].data[key];

            if(value === null){
              values.push(Math.NEGATIVE_INFINITY);
            }
            else {
              values.push(Fancy.Date.parse(value, options.format, options.mode));
            }
          }
        }
        else{
          for (; i < iL; i++) {
            values.push(data[i].data[key]);
          }
        }
      }
      else {
        if(options.groupMap){
          me.groupMap = {};

          for (; i < iL; i++) {
            var item = data[i],
              value = item.data[key];

            values.push(value);
            me.groupMap[item.id] = value;
          }
        }
        else {
          for (; i < iL; i++) {
            var itemData = data[i].data || data[i];
            values.push(itemData[key]);
          }
        }
      }
    }

    return values;
  },
  /*
   * @param {Object} [o]
   */
  changeDataView: function(o){
    var me = this,
      o = o || {},
      groupBy,
      dataView = [],
      dataViewMap = {},
      i = 0,
      iL = me.data.length,
      isFiltered = !!me.filters,
      isSearched = !!me.searches,
      data = me.data;

    if(isFiltered) {
      if (!o.stoppedFilter && !o.doNotFired) {
        me.filterData();
      }
      else if (me.paging && me.pageType === 'server') {
        return;
      }

      if (!me.remoteFilter) {
        data = me.filteredData;

        if(data === undefined){
          data = me.data;
        }

        iL = data.length;
      }
    }

    if(isSearched) {
      me.searchData();
      data = me.searchedData;
      iL = data.length;
    }

    me.dataViewIndexes = {};
    me.dataViewMap = {};

    if(me.paging){
      if( me.pageType === 'server' ){
        i = 0;
      }
      else {
        i = me.showPage * me.pageSize;
      }

      iL = i + me.pageSize;
    }

    var totalCount = me.getTotal();

    if(iL > me.data.length){
      iL = me.data.length;
    }

    if(isFiltered && iL > totalCount){
      iL = totalCount;
    }

    if(Fancy.isObject(me.data)){
      iL = 0;
    }

    var item;

    if(me.order){
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[me.order[i]].data[groupBy] ] ){
            if(isFiltered === true){
              me.dataViewIndexes[dataView.length] = me.filterOrder[i];
              item = data[ i ];
            }
            else {
              me.dataViewIndexes[dataView.length] = me.order[i];
              item = data[me.order[i]];
            }

            dataView.push( item );

            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          if(isFiltered === true){
            me.dataViewIndexes[dataView.length] = me.filterOrder[i];
            item = data[ i ]
          }
          else {
            me.dataViewIndexes[dataView.length] = me.order[i];
            item = data[me.order[i]];
          }

          dataView.push( item );
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }
    else{
      if(me.grouping){
        groupBy = me.grouping.by;

        for(;i<iL;i++){
          if( me.expanded[ me.data[i].data[groupBy] ] ){
            me.dataViewIndexes[dataView.length] = i;
            item = data[i];
            dataView.push(item);
            dataViewMap[item.id] = dataView.length - 1;
          }
        }
      }
      else {
        for(;i<iL;i++){
          me.dataViewIndexes[dataView.length] = i;
          item = data[i];
          dataView.push(data[i]);
          dataViewMap[item.id] = dataView.length - 1;
        }
      }
    }

    me.dataView = dataView;
    me.dataViewMap = dataViewMap;

    if(!o.doNotFired){
      me.fire('change');
    }
  },
  /*
   * @param {String|Number} key
   * @param {Function} fn
   * @return {Array}
   */
  getColumnData: function(key, fn){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    if(fn){
      for (; i < iL; i++) {
        _data.push(fn(me.data[i].data));
      }
    }
    else {
      for (; i < iL; i++) {
        _data.push(me.data[i].data[key]);
      }
    }

    return _data;
  },
  /*
   * @return {Array}
   */
  getData: function(){
    var me = this,
      i = 0,
      iL = me.data.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.data[i].data);
    }

    return _data;
  },
  /*
   * @return {Array}
   */
  getDataView: function(){
    var me = this,
      i = 0,
      iL = me.dataView.length,
      _data = [];

    for(;i<iL;i++){
      _data.push(me.dataView[i].data);
    }

    return _data;
  },
  /*
   * @param {String} id
   * @return {Fancy.Model}
   */
  getById: function(id){
    var me = this;

    return me.map[id];
  },
  /*
   * @param {String} id
   * @param {String} newId
   */
  changeItemId: function(id, newId){
    var me = this,
      item = me.getById(id);

    if(!item){
      return false;
    }

    item.id = newId;
    if(item.data.id !== undefined){
      item.data.id = newId;
    }

    delete  me.map[id];
    me.map[newId] = item;
    me.fire('changeitemid', id, newId);
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   * @param {Boolean} [complex]
   * @return {Array}
   */
  find: function(key, value, complex){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length,
      item,
      founded = [];

    if(complex){
      iL = me.data.length;
      for (; i < iL; i++) {
        if(me.order){
          item = me.data[me.order[i]];
        }
        else {
          item = me.data[i];
        }

        if (item.data[key] === value) {
          founded.push(i);
        }
      }
    }
    else {
      for (; i < iL; i++) {
        item = dataView[i];

        if (item.data[key] === value) {
          founded.push(i);
        }
      }
    }

    return founded;
  },
  /*
   * @param {String} key
   * @param {*} value
   * @return {Array}
   */
  findItem: function(key, value){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded = [];

    for(;i<iL;i++){
      item = data[i];

      if(item.data[key] === value){
        founded.push(item);
      }
    }

    return founded;
  },
  /*
   * @param {String} id
   * @return {Array}
   */
  getDataIndex: function(id){
    var me = this,
      data = me.data,
      i = 0,
      iL = data.length,
      item,
      founded;

    for(;i<iL;i++){
      item = data[i];

      if(item.data['id'] === id){
        founded = i;
      }
    }

    return founded;
  },
  /*
   * @param {Function} fn
   * @param {Object} scope
   */
  each: function(fn, scope){
    var me = this,
      dataView = me.dataView,
      i = 0,
      iL = dataView.length;

    if(scope){
      for(;i<iL;i++){
        fn.apply(this, [dataView[i]]);
      }
    }
    else{
      for(;i<iL;i++){
        fn(dataView[i]);
      }
    }
  },
  /*
   *
   */
  readSmartIndexes: function(){
    var me = this,
      w = me.widget,
      numOfSmartIndexes = 0,
      smartIndexes = {};

    Fancy.each(w.columns, function(column){
      if(column.smartIndexFn){
        smartIndexes[column.index] = column.smartIndexFn;
        numOfSmartIndexes++;
      }
    });

    if(numOfSmartIndexes){
      me.smartIndexes = smartIndexes;
    }
  },
  destroy: function () {
    var me = this;

    Fancy.each(me.data, function (item) {
      delete item.data;
      delete item.id;
    });

    me.data = [];
    me.map = {};
    me.dataView = [];
    me.dataViewIndexes = {};
    me.dataViewMap = {};
  }
});