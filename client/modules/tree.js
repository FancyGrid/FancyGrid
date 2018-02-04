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
});/*
 * @class Fancy.grid.plugin.Tree
 * @extends Fancy.Plugin
 */
(function () {

  var getChildNumber = function (items, num) {
    num = num || 0;

    Fancy.each(items, function (item) {
      num++;
      if(item.child && item.expanded){
        num += getChildNumber(item.child);
      }
    });

    return num;
  };

  Fancy.define('Fancy.grid.plugin.Tree', {
    extend: Fancy.Plugin,
    ptype: 'grid.tree',
    inWidgetName: 'tree',
    singleExpand: false,
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
      var me = this;

      me.Super('init', arguments);
      me.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.once('init', function () {
        w.on('rowdblclick', me.onRowDBLClick, me);
        w.on('cellclick', me.onTreeExpanderClick, me);
        w.on('beforesort', me.onBeforeSort, me);
      });
    },
    onRowDBLClick: function (grid, o) {
      var me = this,
        w = me.widget,
        item = o.item;

      if (item.get('leaf')) {
        return;
      }

      if(w.edit && w.edit.clicksToEdit === 2){
        return;
      }

      var expanded = item.get('expanded');

      if (expanded) {
        me.collapseRow(o.item);
      }
      else {
        me.expandRow(o.item);
      }
    },
    onTreeExpanderClick: function (grid, o) {
      var me = this,
        item = o.item,
        target = Fancy.get(o.e.target);

      if(!target.hasClass('fancy-grid-tree-expander')){
        return;
      }

      if (item.get('leaf')) {
        return;
      }

      var expanded = item.get('expanded');

      if (expanded) {
        me.collapseRow(o.item);
      }
      else {
        me.expandRow(o.item);
      }
    },
    collapseRow: function (item) {
      var me = this,
        w = me.widget,
        s = w.store,
        child = item.get('child'),
        id = item.get('id'),
        parentId = item.get('parentId');

      item.set('expanded', false);

      if(parentId){
        var parent = w.getById(parentId),
          parentChild = parent.get('child');

        //Bad for performance
        Fancy.each(parentChild, function (item) {
          if(item.id === id){
            item.expanded = false;
          }
        });
      }

      var rowIndex = s.getRow(item.get('id')),
        i = 0,
        iL = getChildNumber(child);

      w.store.treeCollapsing = true;
      for (; i < iL; i++) {
        w.removeAt(rowIndex + 1);
      }
      delete w.store.treeCollapsing;

      if(!child){
        w.update();
      }
    },
    expandRow: function (item) {
      var me = this,
        w = me.widget,
        s = w.store,
        child = item.get('child'),
        id = item.get('id'),
        parentId = item.get('parentId');

      if(me.singleExpand){
        if(parentId){
          var parent = w.getById(parentId),
            parentChild = parent.get('child');

          //Bad for performance
          Fancy.each(parentChild, function (item) {
            if(item.expanded === true) {
              me.collapseRow(w.getById(item.id));
            }
          });
        }
        else{
          var parentChild = w.findItem('parentId', '');

          Fancy.each(parentChild, function (child) {
            if(child.get('expanded') === true) {
              me.collapseRow(child);
            }
          });
        }
      }

      if(parentId){
        var parent = w.getById(parentId),
          parentChild = parent.get('child');

        //Bad for performance
        Fancy.each(parentChild, function (item) {
          if(item.id === id){
            item.expanded = true;
          }
        });
      }

      item.set('expanded', true);

      var rowIndex = s.getRow(item.get('id')),
        deep = item.get('$deep') + 1;

      var expandChilds = function (child, rowIndex, deep, _id) {
        _id = _id || id;

        Fancy.each(child, function (item) {
          item.$deep = deep;
          item.parentId = _id;
          rowIndex++;
          w.insert(rowIndex, item);

          if(item.expanded === true){
            rowIndex = expandChilds(item.child, rowIndex, deep + 1, item.id);
          }
        });

        return rowIndex;
      };

      w.store.treeExpanding = true;
      expandChilds(child, rowIndex, deep);
      delete w.store.treeExpanding;

      if(!child){
        w.update();
      }

      //Sorted
      if(s.sorters){
        var sorter = s.sorters[0];

        s.sort(sorter.dir.toLocaleLowerCase(), sorter._type, sorter.key, {});
      }
    },
    onBeforeSort: function (grid, options) {
      var me = this;

      if(options.action === 'drop'){
        me.onDropSort();
      }
    },
    onDropSort: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      s.treeReBuildData();
    }
  });

})();