/*
 * @mixin Fancy.store.mixin.Filter
 */
Fancy.Mixin('Fancy.store.mixin.Filter', {
  /*
   * @param {Object} item
   * @return {Boolean}
   */
  filterCheckItem: function(item){
    var me = this,
      filters = me.filters,
      passed = true,
      wait = false;

    for(var p in filters){
      var indexFilters = filters[p],
        indexValue = item.data[p];

      if(me.smartIndexes && me.smartIndexes[p]){
        indexValue = me.smartIndexes[p](item.data);
      }
      else if(/\./.test(p)){
        var splitted = p.split('.');
        indexValue = item.data[splitted[0]][splitted[1]];
      }

	    if(indexFilters.type === 'date'){
		    indexValue = Number(Fancy.Date.parse(indexValue, indexFilters.format.read, indexFilters.format.mode));
	    }
	  
      for(var q in indexFilters){
		    switch(q){
		      case 'type':
		      case 'format':
			      continue;
		    }

        var value = indexFilters[q];

        switch(q){
          case '<':
            passed = Number(indexValue) < value;
            break;
          case '>':
            passed = Number(indexValue) > value;
            break;
          case '<=':
            passed = Number(indexValue) <= value;
            break;
          case '>=':
            passed = Number(indexValue) >= value;
            break;
          case '=':
          case '==':
            if(Fancy.isArray(value)){
              Fancy.each(value, function (_v, i) {
                value[i] = String(_v);
              });

              indexValue = String(indexValue);
              passed = value.indexOf(indexValue) !== -1;
            }
            else{
              passed = indexValue == value;
            }
            break;
          case '===':
            if(Fancy.isArray(value)){
              indexValue = String(indexValue);
              passed = value.indexOf(indexValue) !== -1;
            }
            else{
              passed = indexValue === value;
            }
            break;
          case '!==':
            passed = indexValue !== value;
            break;
          case '!=':
            if(Fancy.isArray(value)){
              Fancy.each(value, function (_v, i) {
                value[i] = String(_v);
              });

              indexValue = String(indexValue);
              passed = value.indexOf(indexValue) === -1;
            }
            else {
              passed = indexValue != value;
            }
            break;
          case '':
            value = String(value).toLocaleLowerCase();
            indexValue = String(indexValue).toLocaleLowerCase();

            value = value.replace(/\(/g, 'bracketleft');
            value = value.replace(/\)/g, 'bracketright');
            indexValue = indexValue.replace(/\(/g, 'bracketleft');
            indexValue = indexValue.replace(/\)/g, 'bracketright');

            passed = new RegExp(value).test(indexValue);
            break;
          case '*':
            passed = new RegExp(String(value).toLocaleLowerCase()).test(String(indexValue).toLocaleLowerCase());
            wait = true;
            break;
          case '|':
            passed = value[String(indexValue).toLocaleLowerCase()] === true;
            break;
          default:
            throw new Error('FancyGrid Error 5: Unknown filter ' + q);
        }

        if(wait === true){
          if(passed === true){
            return true;
          }
        }
        else if(passed === false){
          return false;
        }
      }
    }

    if(wait === true && passed === false){
      return false;
    }

    return true;
  },
  /*
   *
   */
  filterData: function(){
    var me = this,
      data = me.data,
      filteredData = [],
      i = 0,
      iL = data.length,
      filterOrder = [],
      item = [];

    if(me.remoteFilter){
      me.serverFilter();
      return;
    }

    me.filteredDataMap = {};

    for(;i<iL;i++){
      if(me.order){
        filterOrder.push(me.order[i]);
        item = data[me.order[i]];
      }
      else {
        filterOrder.push(i);
        item = data[i];
      }

      if(me.filterCheckItem(item)){
        filteredData.push(item);
        me.filteredDataMap[item.id] = item;
      }
    }

    me.filterOrder = filterOrder;
    me.filteredData = filteredData;

    if(me.paging){
      me.calcPages();
    }
    me.fire('filter');
  },
  /*
   *
   */
  serverFilter: function(){
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

        if(operator === 'or'){
          var values = [];

          for(var pp in filterItem[q]){
            values.push(pp);
          }

          var filterValue = values.join(', ');

          value += '{"operator":"' + operator + '","value":"' + filterValue + '","property":"' + p + '"},';
        }
        else{
          value += '{"operator":"' + operator + '","value":"' + filterItem[q] + '","property":"' + p + '"},';
        }
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
      me.params[me.filterParam] = encodeURIComponent(value);
    }

    me.loadData();
  }
});