/*
 * @mixin Fancy.store.mixin.Filter
 */
Fancy.modules['filter'] = true;
Fancy.Mixin('Fancy.store.mixin.Filter', {
  /*
   * @param {Object} item
   * @return {Boolean}
   */
  filterCheckItem: function(item){
    var me = this,
      w = me.widget,
      caseSensitive = w.filter.caseSensitive,
      filters = me.filters,
      passed = true,
      wait = false;

    if(me.isTree){
      var child = item.get('child');

      if(child){
        var filteredChild = [];

        Fancy.each(child, function (_child) {
          var item = _child.data? _child: new me.model(_child),
            filterChild = me.filterCheckItem(item);

          if(filterChild){
            filteredChild.push(_child);
          }
        });

        item.set('filteredChild', filteredChild);

        if(filteredChild.length){
          return true;
        }
      }
    }


    for(var p in filters){
      var column = w.getColumnByIndex(p),
        indexFilters = filters[p],
        indexValue = item.data[p];

      if(column && column.filter && column.filter.fn){
        return column.filter.fn(indexValue, filters, item);
      }

      if(me.smartIndexes && me.smartIndexes[p]){
        indexValue = me.smartIndexes[p](item.data);
      }
      else if(/\./.test(p)){
        var splitted = p.split('.');
        indexValue = item.data[splitted[0]][splitted[1]];
      }

      if(indexFilters.type === 'date'){
        if(indexValue === null){
          indexValue = Math.NEGATIVE_INFINITY;
        }
        else {
          indexValue = Number(Fancy.Date.parse(indexValue, indexFilters.format.read, indexFilters.format.mode));
        }
      }

      if(!caseSensitive && Fancy.isString(indexValue)){
        indexValue = indexValue.toLocaleLowerCase();
      }

      for(var q in indexFilters){
        switch(q){
          case 'type':
          case 'format':
            continue;
        }

        var value = indexFilters[q];

        if(!caseSensitive && Fancy.isString(value)){
          value = value.toLocaleLowerCase();
        }

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
            var checkEqual = function (value, indexValue) {
              value = String(value).toLocaleLowerCase();
              indexValue = String(indexValue).toLocaleLowerCase();

              value = value.replace(/\(/g, 'bracketleft');
              value = value.replace(/\)/g, 'bracketright');
              value = value.replace(/\+/g, 'plus');
              value = value.replace(/\-/g, 'minus');
              indexValue = indexValue.replace(/\(/g, 'bracketleft');
              indexValue = indexValue.replace(/\)/g, 'bracketright');
              indexValue = indexValue.replace(/\+/g, 'plus');
              indexValue = indexValue.replace(/\-/g, 'minus');

              return new RegExp(value).test(indexValue);
            };

            if(Fancy.isArray(value)){
              var i = 0,
                iL = value.length;

              for(;i<iL;i++){
                passed = checkEqual(value[i], indexValue);
                if(passed === false){
                  break;
                }
              }
            }
            else {
              passed = checkEqual(value, indexValue);
            }
            break;
          case '*':
            value = String(value).toLocaleLowerCase();

            passed = new RegExp(value).test(String(indexValue).toLocaleLowerCase());
            wait = true;
            break;
          case '|':
            passed = value[String(indexValue).toLocaleLowerCase()] === true;
            break;
          case 'fn':
            passed = value(indexValue, item) === true;
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
   * Problem: filterOrder contains the same value as order.
   * For usual filtering it is ok, but for Tree Grid it does not suit.
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

    for (; i < iL; i++) {
      if (me.order) {
        filterOrder.push(me.order[i]);
        item = data[me.order[i]];
      }
      else {
        filterOrder.push(i);
        item = data[i];
      }

      if (me.filterCheckItem(item)) {
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
      //me.params[me.filterParam] = encodeURIComponent(value);
      me.params[me.filterParam] = value;
    }

    me.loadData();
  }
});