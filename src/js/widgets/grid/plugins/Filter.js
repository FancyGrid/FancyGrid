/*
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
      w = me.widget;

    me._renderSideFields(w.header, w.columns);
    me._renderSideFields(w.leftHeader, w.leftColumns);
    me._renderSideFields(w.rightHeader, w.rightColumns);
  },
  _renderSideFields: function(header, columns){
    var me = this,
      w = me.widget,
      i = 0,
      iL = columns.length,
      cell,
      column,
      cellHeaderTripleCls = w.cellHeaderTripleCls,
      cellHeaderDoubleCls = w.cellHeaderDoubleCls;

    for(;i<iL;i++){
      column = columns[i];
      cell = header.getCell(i);
      if(column.filter && column.filter.header){
        me.renderFilter(column.type, column, cell);
        if(me.groupHeader && !column.grouping){
          cell.addClass(cellHeaderTripleCls);
        }

        cell.addClass(w.filterHeaderCellCls);
      }
      else if(me.header){
        if(me.groupHeader && !column.grouping){
          cell.addClass(cellHeaderTripleCls);
        }
        else{
          if(column.grouping && me.groupHeader){
            cell.addClass(cellHeaderDoubleCls);
          }
          else if(!column.grouping){
            cell.addClass(cellHeaderDoubleCls);
          }
        }
      }
    }
  },
  _clearColumnsFields: function(columns, header, index, sign){
    var i = 0,
      iL = columns.length,
      column;

    for(;i<iL;i++){
      column = columns[i];
      if(column.filter && column.filter.header){
        if(index && column.index !== index){
          continue;
        }

        switch(column.type){
          case 'date':
            var els = header.getCell(i).select('.fancy-field'),
              fieldFrom = Fancy.getWidget(els.item(0).attr('id')),
              fieldTo = Fancy.getWidget(els.item(1).attr('id'));

            fieldFrom.clear();
            fieldTo.clear();
            break;
          default:
            var id = header.getCell(i).select('.fancy-field').attr('id'),
              field = Fancy.getWidget(id);

            if(sign){
              var splitted = field.get().split(',');

              if(splitted.length < 2 && !sign){
                field.clear();
              }
              else{
                var j = 0,
                  jL = splitted.length,
                  value = '';

                for(;j<jL;j++){
                  var splitItem = splitted[j];

                  if( !new RegExp(sign).test(splitItem) ){
                    value += splitItem;
                  }
                }

                field.set(value);
              }
            }
            else {
              field.clear();
            }
        }
      }
    }
  },
  clearColumnsFields: function(index, sign){
    var me = this,
      w = me.widget;

    this._clearColumnsFields(w.columns, w.header, index, sign);
    this._clearColumnsFields(w.leftColumns, w.leftHeader, index, sign);
    this._clearColumnsFields(w.rightColumns, w.rightHeader, index, sign);
  },
  _addValuesInColumnFields: function(columns, header, index, value, sign){
    var i = 0,
      iL = columns.length,
      column;

    for(;i<iL;i++){
      column = columns[i];
      if(column.index === index && column.filter && column.filter.header){
        switch(column.type){
          case 'date':
            var els = header.getCell(i).select('.fancy-field'),
              fieldFrom = Fancy.getWidget(els.item(0).attr('id')),
              fieldTo = Fancy.getWidget(els.item(1).attr('id'));

            fieldFrom.clear();
            fieldTo.clear();
            break;
          default:
            var id = header.getCell(i).select('.fancy-field').attr('id'),
              field = Fancy.getWidget(id),
              fieldValue = field.get(),
              splitted = field.get().split(',');

            if(splitted.length === 1 && splitted[0] === ''){
              field.set((sign || '') + value);
            }
            else if(splitted.length === 1){
              if(new RegExp(sign).test(fieldValue)){
                field.set((sign || '') + value);
              }
              else{
                field.set(fieldValue + ',' + (sign || '') + value);
              }
            }
            else{
              var j = 0,
                jL = splitted.length,
                newValue = '';

              for(;j<jL;j++){
                var splittedItem = splitted[j];

                if(!new RegExp(sign).test(splittedItem)){
                  if(newValue.length !== 0){
                    newValue += ',';
                  }
                  newValue += splittedItem;
                }
                else{
                  if(newValue.length !== 0){
                    newValue += ',';
                  }
                  newValue += (sign || '') + value;
                }
              }

              field.set(newValue);
            }
        }
      }
    }
  },
  addValuesInColumnFields: function(index, value, sign){
    var  me = this,
      w = me.widget;

    this._addValuesInColumnFields(w.columns, w.header, index, value, sign);
    this._addValuesInColumnFields(w.leftColumns, w.leftHeader, index, value, sign);
    this._addValuesInColumnFields(w.rightColumns, w.rightHeader, index, value, sign);
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
      case 'combo':
        var displayKey = 'text';
        var valueKey = 'text';

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
          },{
            empty: function(){
              this.set(-1);
            }
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
          displayKey: 'text',
          valueKey: 'value',
          width: column.width - 8,
          emptyText: filter.emptyText,
          value: '',
          editable: false,
          events: [{
            change: me.onEnter,
            scope: me
          }],
          data: [{
            value: '',
            text: ''
          }, {
            value: 'false',
            text: w.lang.no
          }, {
            value: 'true',
            text: w.lang.yes
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

    column.filterField = field;
  },
  /*
   * @param {Object} field
   * @param {String|Number} value
   * @param {Object} options
   */
  onEnter: function(field, value, options){
    var me = this,
      w = me.widget,
      s = w.store,
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

      if(w.grouping){
        w.grouping.reGroup();
      }

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

    if(s.remoteFilter){
      s.filters = me.filters;
      s.serverFilter();
    }
    else {
      me.updateStoreFilters();
    }

    if(w.grouping){
      if(s.remoteSort){
        s.once('load', function(){
          w.grouping.reGroup();
          w.fire('filter', me.filters);
        });
      }
      else {
        w.grouping.reGroup();
      }
    }
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

      switch(type){
        case 'number':
            _value = Number(_value);
          break;
        case 'combo':
            operator = '=';
          break;
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

    w.scroll(0);
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
        value: i,
        text: data[i]
      });
    }

    return _data;
  }
});