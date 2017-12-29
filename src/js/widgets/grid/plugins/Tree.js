/*
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
        item = o.item;

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

      for (; i < iL; i++) {
        w.removeAt(rowIndex + 1);
      }

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

      var expandChilds = function (child, rowIndex, deep) {
        Fancy.each(child, function (item) {
          item.$deep = deep;
          item.parentId = id;
          rowIndex++;
          w.insert(rowIndex, item);

          if(item.expanded === true){
            rowIndex = expandChilds(item.child, rowIndex, deep + 1);
          }
        });

        return rowIndex;
      };

      expandChilds(child, rowIndex, deep);

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