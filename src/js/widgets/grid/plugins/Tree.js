/*
 * @class Fancy.grid.plugin.Tree
 * @extends Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var GRID_COLUMN_TREE_EXPANDER_CLS = F.GRID_COLUMN_TREE_EXPANDER_CLS;

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

      if(!target.hasClass(GRID_COLUMN_TREE_EXPANDER_CLS)){
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

      w.$onChangeUpdate = false;

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

      delete w.$onChangeUpdate;

      //if(!child){
        w.update();
      //}

      w.fire('treecollapse');
    },
    expandRow: function (item) {
      var me = this,
        w = me.widget,
        s = w.store,
        child = item.get('child'),
        filteredChild = item.get('filteredChild'),
        id = item.get('id'),
        parentId = item.get('parentId'),
        parentChild;


      w.$onChangeUpdate = false;

      if(filteredChild){
        //child = filteredChild;
      }

      if(me.singleExpand){
        if(parentId){
          var parent = w.getById(parentId);
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
          parentChild = w.findItem('parentId', '');

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

      delete w.$onChangeUpdate;

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

      w.fire('treeexpand');
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