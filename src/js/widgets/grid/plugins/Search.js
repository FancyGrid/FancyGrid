/*
 * @class Fancy.grid.plugin.Search
 */
Fancy.define('Fancy.grid.plugin.Search', {
  extend: Fancy.Plugin,
  ptype: 'grid.search',
  inWidgetName: 'searching',
  autoEnterDelay: 500,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.searches = {};
    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    //me.generateKeys();
    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget;
    
    w.once('init', function(){
      me.generateKeys();
    });
  },
  /*
   * @param {*} keys
   * @param {*} values
   */
  search: function(keys, values){
    var me = this,
      w = me.widget,
      s = w.store;

    me.searches = {};

    if(!keys && !values ){
      me.clear();
      me.updateStoreSearches();

      if(w.grouping){
        w.grouping.reGroup();
      }

      return;
    }

    if(Fancy.isArray(keys) === false && !values){
      me.searches = keys;
    }

    me.setFilters();

    if(s.remoteSort){
      s.serverFilter();
    }
    else {
      me.updateStoreSearches();
    }

    if(w.grouping){
      if(s.remoteSort){
        s.once('load', function(){
          w.grouping.reGroup();
        });
      }
      else {
        w.grouping.reGroup();
      }
    }
  },
  /*
   *
   */
  updateStoreSearches: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    s.changeDataView();
    w.update();
  },
  /*
   * @param {*} keys
   */
  setKeys: function(keys){
    var me = this;

    me.keys = keys;
    me.setFilters();
    me.updateStoreSearches();
  },
  /*
   * @return {Object}
   */
  generateKeys: function(){
    var me = this,
      w = me.widget;

    if(!me.keys){
      me.keys = {};

      var columns = [];

      if(w.columns){
        columns = columns.concat(w.columns);
      }

      if(w.leftColumns){
        columns = columns.concat(w.leftColumns);
      }

      if(w.rightColumns){
        columns = columns.concat(w.rightColumns);
      }

      var fields = [];

      Fancy.each(columns, function (column) {
        var index = column.index || column.key;

        if(column.searchable === false){
          return;
        }

        switch(column.type){
          case 'color':
          case 'combo':
          case 'date':
          case 'number':
          case 'string':
          case 'text':
          case 'currency':
            break;
          default:
            return;
        }

        if(index){
          fields.push(index);
        }
      });

      Fancy.each(fields, function(index){
        if(index === '$selected'){
          return;
        }

        me.keys[index] = true;
      });
    }

    return me.keys;
  },
  /*
   *
   */
  setFilters: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      filters = s.filters || {};

    if(me.searches === undefined || Fancy.isObject(me.searches)){
      me.clear();
      return;
    }

    for(var p in me.keys){
      if(me.keys[p] === false){
        if(filters[p]){
          delete filters[p]['*'];
        }
        continue;
      }

      filters[p] = filters[p] || {};

      filters[p]['*'] = me.searches;
    }

    me.filters = filters;
    s.filters = filters;
  },
  /*
   *
   */
  clear: function(){
    var me = this,
      w = me.widget,
      s = w.store,
      filters = s.filters || {};

    for(var p in me.keys){
      if(filters[p] === undefined){
        continue;
      }

      delete filters[p]['*'];
    }

    me.filters = filters;
    s.filters = filters;
    delete me.searches;
  }
});