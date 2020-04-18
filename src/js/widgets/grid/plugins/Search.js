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
  constructor: function(){
    this.searches = {};
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);

    //me.generateKeys();
    this.ons();
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
      setTimeout(function () {
        w.fire('filter', s.filters);
      },1);
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
    var w = this.widget,
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

    if(me.items){
      me.keys = {};

      Fancy.each(me.items, function (item) {
        me.keys[item.index] = true;
      })
    }
    else if(!me.keys){
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
        var index = column.index;

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

    for(var p in me.keys) {
      if(filters[p] === undefined){
        continue;
      }

      delete filters[p]['*'];
    }

    s.filters = filters;
    delete me.searches;

    if(w.state){
      w.state.onFilter();
    }
  },
  /*
   *
   */
  clearBarField: function(){
    var me = this,
      field = me.getSearchField('tbar');

    if(field){
      field.clear();
    }

    field = me.getSearchField('subTBar');

    if(field){
      field.clear();
    }
  },
  /*
   * @params {String} value
   */
  setValueInField: function (value) {
    var me = this,
      field = me.getSearchField('tbar');

    if(field){
      field.set(value, false);
    }

    field = me.getSearchField('subTBar');

    if(field){
      field.set(value, false);
    }
  },
  /*
   * @params {String} barType
   * @return {Field|undefined}
   */
  getSearchField: function (barType) {
    var me = this,
      w = me.widget,
      bar = w[barType],
      i = 0,
      iL = (bar || []).length,
      field;

    for(;i<iL;i++){
      field = bar[i];
      if(field.type === 'search'){
        return field;
      }
    }

    return field;
  }
});