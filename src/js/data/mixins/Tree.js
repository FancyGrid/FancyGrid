/*
 * @mixin Fancy.store.mixin.Tree
 */
Fancy.modules['tree'] = true;
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

      if(Fancy.isArray(dataItem.filteredChild) && dataItem.filteredChild.length){
        dataItem.leaf = false;
      }
      else if(dataItem.child && dataItem.child.length){
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
        /*
        if(Fancy.isArray(dataItem.filteredChild)){
          _data = _data.concat(me.treeReadData(dataItem.filteredChild || [], deep + 1, dataItem.id));
        }
        else {
          _data = _data.concat(me.treeReadData(dataItem.child || [], deep + 1, dataItem.id));
        }
        */
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
        _core.push(item);
      }
    });

    return _core;
  },
  treeSort: function (data, action, key, type, customSort) {
    var me = this,
      _data = [],
      dataSorted = [],
      dataValues = {},
      sorted = [];

    Fancy.each(data, function (item) {
      var itemData = item.data || item;
      _data.push(itemData[key]);

      if(dataValues[itemData[key]] === undefined){
        dataValues[itemData[key]] = item;
      }
      else{
        if(!Fancy.isArray(dataValues[itemData[key]])){
          dataValues[itemData[key]] = [dataValues[itemData[key]]];
        }
        dataValues[itemData[key]].push(item);
      }
    });

    var isAllEmpty = false;
    var isAllEqual = false;

    if(_data.length){
      isAllEmpty = true;
      isAllEqual = true;

      var prevValue;

      Fancy.each(data, function (item) {
        var itemData = item.data || item;

        if(itemData[key] !== ''){
          isAllEmpty = false;
        }

        if(prevValue !== undefined && prevValue !== itemData[key]){
          isAllEqual = false;
        }

        prevValue = itemData[key];
      });
    }

    if(type === 'number') {
      switch (action) {
        case 'asc':
          if(customSort){
            dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
              return customSort('asc', a, b);
            });
          }
          else {
            dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
              return a - b;
            });
          }
          break;
        case 'desc':
          if(customSort){
            dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
              return customSort('desc', a, b);
            });
          }
          else {
            dataSorted = Fancy.Array.copy(_data).sort(function (a, b) {
              return b - a;
            });
          }
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

      if(Fancy.isArray(item)){
        item = item.splice(0, 1)[0];
      }

      if(isAllEmpty || isAllEqual){
        item = data[i];
      }

      var itemData = item.data || item;

      if(itemData.child && itemData.expanded){
        /*
        if(itemData.filteredChild){
          item.data.sorted = me.treeSort(itemData.filteredChild, action, key, type);
        }
        else {
          item.data.sorted = me.treeSort(itemData.child, action, key, type);
        }
        */

        item.data.sorted = me.treeSort(itemData.child, action, key, type);
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
      //!important
      item = me.getById(item.id);

      if(item.data.expanded){
        if(item.data.sorted){
          ids = ids.concat(me.treeReadSortedId(item.data.sorted));
        }
        else if(item.data.child){
          ids = ids.concat(me.treeReadSortedId(item.data.child));
        }
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