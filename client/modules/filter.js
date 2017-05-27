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

	    if(indexFilters.type === 'date'){
		    indexValue = Number(Fancy.Date.parse(indexValue, indexFilters.format.edit));
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
            passed = indexValue != value;
            break;
          case '':
            passed = new RegExp(String(value).toLocaleLowerCase()).test(String(indexValue).toLocaleLowerCase());
            break;
          case '*':
            passed = new RegExp(String(value).toLocaleLowerCase()).test(String(indexValue).toLocaleLowerCase());
            wait = true;
            break;
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
    }

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
      me.params[me.filterParam] = encodeURIComponent(value);
    }

    me.loadData();
  }
});/*
 * @class Fancy.grid.plugin.Filter
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Filter', {
  extend: Fancy.Plugin,
  ptype: 'grid.filter',
  inWidgetName: 'filter',
  autoEnterDelay: 500,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    me.filters = {};
    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget,
      s = w.store;
    
    w.once('render', function(){
      me.render();
    });

    w.on('columnresize', me.onColumnResize, me);
    w.on('filter', me.onFilter, me);
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget,
      header = w.header,
      leftHeader = w.leftHeader,
      rightHeader = w.rightHeader,
      columns = w.columns,
      leftColumns = w.leftColumns,
      rightColumns = w.rightColumns,
      i = 0,
      iL = columns.length,
      column,
      cell;

    for(;i<iL;i++){
      column = columns[i];
      cell = header.getCell(i);
      if(column.filter && column.filter.header){
        me.renderFilter(column.type, column, cell);
        cell.addClass(w.filterHeaderCellCls);
      }
      else if(me.header){
        cell.addClass(w.cellHeaderDoubleSize);
      }
    }

    i = 0;
    iL = leftColumns.length;

    for(;i<iL;i++){
      column = leftColumns[i];
      cell = leftHeader.getCell(i);
      if(column.filter && column.filter.header){
        me.renderFilter(column.type, column, cell);
        cell.addClass(w.filterHeaderCellCls);
      }
      else if(me.header){
        cell.addClass(w.cellHeaderDoubleSize);
      }
    }

    i = 0;
    iL = rightColumns.length;

    for(;i<iL;i++){
      column = rightColumns[i];
      cell = rightHeader.getCell(i);
      if(column.filter && column.filter.header){
        me.renderFilter(column.type, column, cell);
        cell.addClass(w.filterHeaderCellCls);
      }
      else if(me.header){
        cell.addClass(w.cellHeaderDoubleSize);
      }
    }
  },
  /*
   * @param {String} type
   * @param {Object} column
   * @param {Fancy.Element} dom
   */
  renderFilter: function(type, column, dom) {
    var me = this,
      w = me.widget,
      field,
      style = {
        position: 'absolute',
        bottom: '3px'
      },
      filter = column.filter,
      theme = w.theme,
      tip = filter.tip;

    switch (type) {
      case 'date':
        var events = [];

        events.push({
          change: me.onDateChange,
          scope: me
        });

        var format;

        if(Fancy.isString(column.format)){
          switch(column.format){
            case 'date':
              format = column.format;
              break;
          }
        }

        field = new Fancy.DateRangeField({
          renderTo: dom.dom,
          value: new Date(),
          format: column.format,
          label: false,
          padding: false,
          style: style,
          events: events,
          width: column.width - 8,
          emptyText: filter.emptyText,
          dateImage: false,
          theme: theme
        });
        break;
      case 'string':
        var events = [{
            enter: me.onEnter,
            scope: me
          }];

        if( me.autoEnterDelay !== false ){
          events.push({
            key: me.onKey,
            scope: me
          });
        }

        field = new Fancy.StringField({
          renderTo: dom.dom,
          label: false,
          padding: false,
          style: style,
          events: events,
          emptyText: filter.emptyText,
          tip: tip
        });
        break;
      case 'number':
      case 'grossloss':
      case 'progressbar':
      case 'progressdonut':
        var events = [{
            enter: me.onEnter,
            scope: me
          }];

        if( me.autoEnterDelay !== false ){
          events.push({
            key: me.onKey,
            scope: me
          });
        }

        field = new Fancy.NumberField({
          renderTo: dom.dom,
          label: false,
          padding: false,
          style: style,
          emptyText: filter.emptyText,
          events: events,
          tip: tip
        });
        break;
      case 'combo1':
        var data = [],
          i = 0,
          iL = column.data.length;

        for(;i<iL;i++){
          var value = column.data[i];

          data.push({
            index: value,
            valueText: value
          });
        }

        field = new Fancy.TagField({
          renderTo: dom.dom,
          label: false,
          style: style,
          displayKey: 'valueText',
          valueKey: 'index',
          value: '',
          itemCheckBox: true,
          theme: theme,
          events: [{
            change: me.onEnter,
            scope: me
          }],
          data: data
        });

        field.size({
          width: column.width - 26,
          height: 26
        });
        break;
      case 'combo':
        var displayKey = 'valueText';
        var valueKey = 'valueText';

        var data;

        if(column.displayKey !== undefined){
          displayKey = column.displayKey;
          valueKey = displayKey;
        }

        if(Fancy.isObject(column.data) || Fancy.isObject(column.data[0])) {
          data = column.data;
        }
        else{
          data = me.configComboData(column.data);
        }

        field = new Fancy.Combo({
          renderTo: dom.dom,
          label: false,
          padding: false,
          style: style,
          width: column.width - 8,
          displayKey: displayKey,
          valueKey: valueKey,
          value: '',
          itemCheckBox: true,
          height: 28,
          emptyText: filter.emptyText,
          theme: theme,
          tip: tip,
          events: [{
            change: me.onEnter,
            scope: me
          }],
          data: data
        });

        break;
      case 'checkbox':
        field = new Fancy.Combo({
          renderTo: dom.dom,
          label: false,
          padding: false,
          style: style,
          displayKey: 'valueText',
          valueKey: 'index',
          width: column.width - 8,
          emptyText: filter.emptyText,
          value: '',
          editable: false,
          events: [{
            change: me.onEnter,
            scope: me
          }],
          data: [{
            index: '',
            valueText: ''
          }, {
            index: 'false',
            valueText: w.lang.no
          }, {
            index: 'true',
            valueText: w.lang.yes
          }]
        });

        break;
      default:
        var events = [{
          enter: me.onEnter,
          scope: me
        }];

        if( me.autoEnterDelay !== false ){
          events.push({
            key: me.onKey,
            scope: me
          });
        }

        field = new Fancy.StringField({
          renderTo: dom.dom,
          label: false,
          style: style,
          padding: false,
          emptyText: filter.emptyText,
          events: events
        });
    }

    field.filterIndex = column.index;
    field.column = column;

    /*
    field.el.on('click', function (e) {
      e.stopPropagation();
    });
    */

    if(type !== 'date') {
      field.el.css('padding-left', '4px');
      field.el.css('padding-top', '0px');
    }

    switch(type){
      case 'checkbox':
      case 'combo':
      case 'date':
        break;
      default:
        field.setInputSize({
          width: column.width - 8
        });
    }
  },
  /*
   * @param {Object} field
   * @param {String|Number} value
   * @param {Object} options
   */
  onEnter: function(field, value, options){
    var me = this,
      filterIndex = field.filterIndex,
      signs = {
        '<': true,
        '>': true,
        '!': true,
        '=': true
      };
	
	  options = options || {};

    if(me.intervalAutoEnter){
      clearInterval(me.intervalAutoEnter);
      me.intervalAutoEnter = false;
    }
    delete me.intervalAutoEnter;

    if(value.length === 0){
      me.filters[field.filterIndex] = {};
      me.updateStoreFilters();
      return;
    }

    var filters = me.processFilterValue(value, field.column.type),
      i = 0,
      iL = filters.length;

    me.filters[filterIndex] = {};

    for(;i<iL;i++) {
      var filter = filters[i];

      me.filters[filterIndex][filter.operator] = filter.value;
      Fancy.apply(me.filters[filterIndex], options);
    }

    me.updateStoreFilters();
  },
  /*
   * @param {String|Number} value
   * @param {String} type
   */
  processFilterValue: function(value, type) {
    var signs = {
        '<': true,
        '>': true,
        '!': true,
        '=': true
      },
      operator,
      _value,
      i = 0,
      iL = 3,
      filters = [],
      splitted = value.split(','),
      j = 0,
      jL = splitted.length;

    for(;j<jL;j++){
      i = 0;
      operator = '';
      _value = splitted[j];

      for (; i < iL; i++) {
        if (signs[_value[i]]) {
          operator += _value[i];
        }
      }

      _value = _value.replace(new RegExp('^' + operator), '');

      if(_value.length < 1){
        continue;
      }

      if(type === 'number'){
        _value = Number(_value);
      }

      filters.push({
        operator: operator,
        value: _value
      });
    }

    return filters;
  },
  /*
   *
   */
  updateStoreFilters: function(){
    var me = this,
      w = me.widget,
      s = w.store;

    s.filters = me.filters;

    s.changeDataView();
    w.update();

    w.fire('filter', me.filters);
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onColumnResize: function(grid, o){
    var me = this,
      w = me.widget,
      cell = Fancy.get(o.cell),
      width = o.width,
      fieldEl = cell.select('.fancy-field'),
      field;

    if(fieldEl.length === 0){}
    else if(fieldEl.length === 2){
      field = Fancy.getWidget(fieldEl.item(0).dom.id);

      field.setWidth((width - 8) / 2);

      field = Fancy.getWidget(fieldEl.item(1).dom.id);

      field.setWidth((width - 8) / 2);
    }
    else {
      field = Fancy.getWidget(fieldEl.dom.id);

      if(field.wtype === 'field.combo'){
        field.size({
          width: width - 8
        });

        field.el.css('width', width - 8 + 5);
      }
      else {
        field.setInputSize({
          width: width - 8
        });
      }
    }
  },
  /*
   * @param {Object} field
   * @param {String|Number} value
   * @param {Object} e
   */
  onKey: function(field, value, e){
    var me = this,
      autoEnterTime = me.autoEnterTime || +new Date();

    if( e.keyCode === Fancy.key.ENTER ){
      return;
    }

    me.autoEnterTime = +new Date();

    if(!me.intervalAutoEnter){
      me.intervalAutoEnter = setInterval(function(){
        var now = new Date();

        if(!me.intervalAutoEnter){
          return;
        }

        if(now - me.autoEnterTime > me.autoEnterDelay){
          clearInterval(me.intervalAutoEnter);
          delete me.intervalAutoEnter;
          value = field.getValue();

          me.onEnter(field, value);
        }
      }, 200);
    }
  },
  /*
   * @param {Object} field
   * @param {*} date
   */
  onDateChange: function(field, date){
    var me = this,
      w = me.widget,
      format = field.format,
      s = w.store,
      dateFrom = field.dateField1.getDate(),
      dateTo = field.dateField2.getDate(),
      value,
      isValid1 = dateFrom.toString() !== 'Invalid Date' && Fancy.isDate(dateFrom),
      isValid2 = dateTo.toString() !== 'Invalid Date' && Fancy.isDate(dateTo),
      value1,
      value2,
      isRemote = s.remoteFilter;

    if(isValid1){
      dateFrom = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
    }

    if(isValid2){
      dateTo = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());
    }

    if(isValid1 && isValid2){
      if(isRemote !== true) {
        value1 = Number(dateFrom);
        value2 = Number(dateTo);
      }
      else{
        value1 = Fancy.Date.format(dateFrom, format.edit);
        value2 = Fancy.Date.format(dateTo, format.edit);
      }

      value = '>=' + value1 + ',<=' + value2;
    }
    else if(isValid1){
      if(isRemote !== true) {
        value = '>=' + Number(dateFrom);
      }
      else{
        value = '>=' + Fancy.Date.format(dateFrom, format.edit);
      }

      me.clearFilter(field.filterIndex, '<=', false);
    }
    else if(isValid2){
      if(isRemote !== true) {
        value = '<=' + Number(dateTo);
      }
      else{
        value = '<=' + Fancy.Date.format(dateFrom, format.edit);
      }

      me.clearFilter(field.filterIndex, '>=', false);
    }
    else{
      me.clearFilter(field.filterIndex);
    }

    if(value) {
      me.onEnter(field, value, {
		    type: 'date',
		    format: field.format
	    });
    }
  },
  /*
   * @param {String} index
   * @param {String} operator
   * @param {Boolean} update
   */
  clearFilter: function(index, operator, update){
    var me = this;

    if(operator === undefined){
      delete me.filters[index];
    }
    else{
      if(me.filters[index]){
        delete me.filters[index][operator];
      }
    }

    if(update !== false) {
      me.updateStoreFilters();
    }
  },
  onFilter: function(){
    var me = this,
      w = me.widget;

    w.scroll(0, 0);
  },
  /*
   * @param {Array} data
   * @return {Array}
   */
  configComboData: function(data){
    var i = 0,
      iL = data.length,
      _data = [];

    if(Fancy.isObject(data)){
      return data;
    }

    for(;i<iL;i++){
      _data.push({
        index: i,
        valueText: data[i]
      });
    }

    return _data;
  }
});/*
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
      w = me.widget,
      s = w.store;
    
    w.once('init', function(){
      //me.render();
      me.generateKeys();
    });
  },
  /*
   * @param {*} keys
   * @param {*} values
   */
  search: function(keys, values){
    var me = this;

    me.searches = {};

    if(!keys && !values ){
      me.clear();
      me.updateStoreSearches();
      return;
    }

    if(Fancy.isArray(keys) === false && !values){
      me.searches = keys;
    }

    me.setFilters();
    me.updateStoreSearches();
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
      w = me.widget,
      s = w.store;

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

      var fields = [],
        i = 0,
        iL = columns.length;

      for(;i<iL;i++){
        var column = columns[i],
          index = column.index || column.key;

        if(column.searchable === false){
          continue;
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
            continue;
        }

        if(index){
          fields.push(index);
        }
      }

      i = 0;
      iL = fields.length;

      for(;i<iL;i++){
        if(fields[i] === '$selected'){
          continue;
        }

        me.keys[fields[i]] = true;
      }
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