Fancy.Mixin('Fancy.store.mixin.Search', {
  /*
   * TODO: Clean function. Needs to find out code after 'return' is still needed.
   */
  searchCheckItem: function(item){
    var me = this,
      searches = me.searches;

    if(!Fancy.isObject(searches)){
      searches = String(searches).toLocaleLowerCase();

      for(var p in item.data){
        if( new RegExp(searches).test( String(item.data[p]).toLocaleLowerCase() ) ){
          return true;
        }
      }
    }

    return false;
  },
  searchData: function(){
    var me = this,
      data = me.data,
      searchedData = [],
      i = 0,
      iL = data.length,
      searchOrder = [],
      item = [],
      order = me.order;

    if(me.filteredData){
      data = me.filteredData;
    }

    if(me.remoteSearch){
      me.serverSearch();
    }

    if(me.filterOrder){
      order = me.filterOrder;
    }

    for(;i<iL;i++){
      if(order){
        searchOrder.push(order[i]);
        item = data[order[i]];
      }
      else {
        searchOrder.push(i);
        item = data[i];
      }

      if(me.searchCheckItem(item)){
        searchedData.push(item);
      }
    }

    me.searchOrder = searchOrder;
    me.searchedData = searchedData;

    if(me.paging){
      me.calcPages();
    }
    me.fire('search');
  },
  //TODO
  serverSearch: function(){
    var me = this,
      value = '[',
      filters = me.filters || {};

    for(var p in filters){
      var filterItem = filters[p];
      for(var q in filterItem){
        switch(q){
          case 'type':
          case 'format':
            continue;
        }
        var operator = me.filterOperators[q];
        value += '{"operator":"' + operator + '","value":"' + filterItem[q] + '","property":"' + p + '"},';
      }
    }

    value = value.replace(/\,$/, '');

    value += ']';

    me.params = me.params || {};

    if(value === '[]'){
      value = '';
      delete me.params[me.filterParam];
    }
    else {
      //me.params[me.filterParam] = encodeURIComponent(value);
      me.params[me.filterParam] = value;
    }

    me.loadData();
  }
});