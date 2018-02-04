/*
 * @mixin Fancy.store.mixin.Tree
 */
Fancy.Mixin('Fancy.store.mixin.Tree', {
  /*
   *
   */
  initTreeData: function(){
    var me = this;

    me.isTree = true;

    if(!me.data || me.data.length === 0){
      //TODO:
    }
    else{
      var data;
      if(Fancy.isObject(me.data)){
        data = me.treeReadData(me.data.items);
      }
      else {
        data = me.treeReadData(me.data);
      }

      me.setData(data);
    }
  },
  treeReadData: function (data, deep, parentId) {
    var me = this,
      _data = [];

    deep = deep || 1;

    Fancy.each(data, function (dataItem) {
      //get model and init new item model
      if(dataItem.data){
        dataItem = dataItem.data;
      }

      dataItem.$deep = deep;
      dataItem.leaf = !!dataItem.leaf;
      dataItem.expanded = !!dataItem.expanded;

      if(dataItem.child && dataItem.child.length){
        dataItem.leaf = false;
      }

      if(parentId){
        dataItem.parentId = parentId;
      }

      if(!dataItem.id){
        Fancy.idSeed++;
        dataItem.id = Fancy.idSeed + 1000;
      }

      _data.push(dataItem);

      if(dataItem.expanded){
        _data = _data.concat(me.treeReadData(dataItem.child || [], deep + 1, dataItem.id));
      }
    });

    return _data;
  },
  treeGetDataAsTree: function () {
    var me = this,
      _core = [];

    Fancy.each(me.data, function (item) {
      if(item.get('$deep') === 1){
        _core.push(item.data);
      }
    });

    return _core;
  },
  treeSort: function (data, action, key, type) {
    var me = this,
      _data = [],
      dataSorted = [],
      dataValues = {},
      sorted = [];

    Fancy.each(data, function (item) {
      _data.push(item[key]);
      dataValues[item[key]] = item;
    });

    var isAllEmpty = false;
    var isAllEqual = false;

    if(_data.length){
      isAllEmpty = true;
      isAllEqual = true;

      var prevValue;

      Fancy.each(data, function (item, i) {
        if(item[key] !== ''){
          isAllEmpty = false;
        }

        if(prevValue !== undefined && prevValue !== item[key]){
          isAllEqual = false;
        }

        prevValue = item[key];
      });
    }

    if(type === 'number') {
      switch (action) {
        case 'asc':
          dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
            return a - b;
          });
          break;
        case 'desc':
          dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
            return b - a;
          });
          break;
      }
    }
    else{
      switch (action) {
        case 'asc':
          dataSorted = Fancy.Array.copy(_data).sort();
          break;
        case 'desc':
          dataSorted = Fancy.Array.copy(_data).sort();
          dataSorted = dataSorted.reverse();
          break;
      }
    }

    Fancy.each(dataSorted, function (v, i) {
      var item = dataValues[v];

      if(isAllEmpty || isAllEqual){
        item = data[i];
      }

      if(item.child && item.expanded){
        item.sorted = me.treeSort(item.child, action, key, type);
      }

      sorted.push(item);
    });

    return sorted;
  },
  treeReadSortedId: function (data) {
    var me = this,
      ids = [];

    Fancy.each(data, function (item) {
      ids.push(item.id);

      if(item.sorted && item.expanded){
        ids = ids.concat(me.treeReadSortedId(item.sorted));
      }
    });

    return ids;
  },
  treeReBuildData: function () {
    var me = this,
      coreData = [],
      data = [];

    Fancy.each(me.data, function (item) {
      if(item.get('$deep') === 1){
        coreData.push(item.data);
      }
    });

    data = me.treeReadData(coreData);

    me.setData(data);
  }
});