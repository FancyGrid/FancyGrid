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
  treeSort: function (data, action, key, type) {
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

      Fancy.each(data, function (item, i) {
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

    Fancy.each(data, function (item, i) {
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
});/*
 * @class Fancy.grid.plugin.Tree
 * @extends Fancy.Plugin
 */
(function () {

  var getChildNumber = function (items, num) {
    num = num || 0;
    var me = this,
      w = me.widget;

    Fancy.each(items, function (item) {
      num++;
      var itemData = item.data?item.data:item;

      if(w.store.filteredData){
        //Getting item data from grid
        if(itemData.id) {
          if(w.store.map[itemData.id]){
            itemData = w.store.map[itemData.id].data
          }
        }
      }
      else{
        //Getting item data from grid
        itemData = w.getById(itemData.id).data;
      }

      var child = itemData.child;
      //if(itemData.filteredChild){
        //child = itemData.filteredChild;
      //}

      if(child && itemData.expanded){
        num += getChildNumber.apply(me, [child]);
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

      me.expandMap = {};

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
        filteredChild = item.get('filteredChild'),
        id = item.get('id');

      me.expandMap[id] = false;

      if(filteredChild){
        //child = filteredChild;
      }

      item.set('expanded', false);

      var rowIndex = s.getRow(item.get('id')),
        i = 0,
        iL = getChildNumber.apply(this, [child]);

      if(s.filteredData){
        var itemId = item.get('id'),
          startIndex,
          _parentIds = {};

        _parentIds[itemId] = true;

        var i = 0,
          iL = s.data.length,
          deepStart;

        for(;i<iL;i++){
          item = s.data[i];

          if(deepStart && deepStart >= item.data.$deep){
            break;
          }

          if(_parentIds[item.data.parentId]){
            if(!deepStart){
              deepStart = item.data.$deep - 1;
            }

            if(!startIndex){
              startIndex = i;
            }

            var removedItem = s.data.splice(startIndex, 1)[0];

            if(removedItem.data.child){
              _parentIds[removedItem.data.id] = true;
            }

            delete s.map[removedItem.id];
            i--;
            iL--;
          }

          if(item.data.child && deepStart){
            _parentIds[item.data.id] = true;
          }
        }

        if(s.order){
          delete s.order;
          delete s.filterOrder;
          s.reSort();
        }

        s.changeDataView();
      }
      else{
        w.store.treeCollapsing = true;
        for (; i < iL; i++) {
          w.removeAt(rowIndex + 1);
        }
        delete w.store.treeCollapsing;
      }

      //if(!child){
        w.update();
      //}
    },
    expandRow: function (item) {
      var me = this,
        w = me.widget,
        s = w.store,
        child = item.get('child'),
        filteredChild = item.get('filteredChild'),
        id = item.get('id'),
        parentId = item.get('parentId');

      if(filteredChild){
        //child = filteredChild;
      }

      if(me.singleExpand){
        if(parentId){
          var parent = w.getById(parentId),
            parentChild = parent.get('child');

          //Bad for performance
          Fancy.each(parentChild, function (item) {
            var expanded = item.get('expanded');

            if(me.expandMap[item.id] !== undefined){
              expanded = me.expandMap[item.id];
            }

            if(expanded === true) {
              me.collapseRow(w.getById(item.id));
            }
          });
        }
        else{
          var parentChild = w.findItem('parentId', '');

          Fancy.each(parentChild, function (child) {
            var expanded = child.get('expanded');

            if(me.expandMap[child.id] !== undefined){
              expanded = me.expandMap[child.id];
            }

            if(expanded === true) {
              me.collapseRow(child);
            }
          });
        }
      }

      me.expandMap[id] = true;

      item.set('expanded', true);

      var rowIndex = s.getRow(item.get('id')),
        deep = item.get('$deep') + 1,
        childsModelsRequired = false;

      if(s.filteredData){
        //Bad about performance
        var itemId = item.get('id');
        Fancy.each(s.data, function (item, i) {
          if(item.id === itemId){
            rowIndex = i;
            return true;
          }
        });
      }

      var expandChilds = function (child, rowIndex, deep, _id) {
        _id = _id || id;

        Fancy.each(child, function (item, i) {
          var itemData = item.data;
          if(!item.data){
            childsModelsRequired = true;
            itemData = item;
          }

          itemData.$deep = deep;
          itemData.parentId = _id;
          var expanded = itemData.expanded;
          if(me.expandMap[itemData.id] !== undefined){
            expanded = me.expandMap[itemData.id];
            itemData.expanded = expanded;
          }

          rowIndex++;

          w.insert(rowIndex, itemData);

          if(expanded === true){
            var child = itemData.child;
            if(itemData.filteredChild){
              //child = itemData.filteredChild;
            }
            rowIndex = expandChilds(child, rowIndex, deep + 1, itemData.id);
          }
        });

        return rowIndex;
      };

      w.store.treeExpanding = true;
      expandChilds(child, rowIndex, deep);
      delete w.store.treeExpanding;

      if(childsModelsRequired){

        Fancy.each(item.data.child, function (_child, i) {
          var childItem = s.getById(_child.id);

          //This case could occur for filtered data
          if(childItem === undefined){
            return;
          }

          item.data.child[i] = childItem;
        });
      }

      //if(!child){
        w.update();
      //}

      //Sorted
      if(s.sorters){
        //TODO: needed to do sub sorting of only expanded
        //If item contains sorted than needs to detirmine that it suits or not
        //Also it needs to think about multisorting
        //var sorter = s.sorters[0];

        //s.sort(sorter.dir.toLocaleLowerCase(), sorter._type, sorter.key, {});

        if(s.order){
          delete s.order;
          delete s.filterOrder;
          s.reSort();
        }
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