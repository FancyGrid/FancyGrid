/*
 * @class Fancy.grid.plugin.Filter
 * @extends Fancy.Plugin
 */
Fancy.modules['filter'] = true;
(function() {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var FIELD_CLS = F.FIELD_CLS;
  var GRID_HEADER_CELL_DOUBLE_CLS = F.GRID_HEADER_CELL_DOUBLE_CLS;
  var GRID_HEADER_CELL_TRIPLE_CLS = F.GRID_HEADER_CELL_TRIPLE_CLS;
  var GRID_HEADER_CELL_FILTER_CLS = F.GRID_HEADER_CELL_FILTER_CLS;
  var GRID_HEADER_CELL_FILTER_FULL_CLS = F.GRID_HEADER_CELL_FILTER_FULL_CLS;
  var GRID_HEADER_CELL_FILTER_SMALL_CLS = F.GRID_HEADER_CELL_FILTER_SMALL_CLS;

  F.define('Fancy.grid.plugin.Filter', {
    extend: F.Plugin,
    ptype: 'grid.filter',
    inWidgetName: 'filter',
    autoEnterDelay: 500,
    caseSensitive: true,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function () {
      this.filters = {};
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.once('render', function () {
        me.render();
      });

      w.on('columnresize', me.onColumnResize, me);
      w.on('filter', me.onFilter, me);
      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      w.on('columndrag', me.onColumnDrag, me);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget;

      if(w.header) {
        me._renderSideFields(w.header, w.columns);
        me._renderSideFields(w.leftHeader, w.leftColumns);
        me._renderSideFields(w.rightHeader, w.rightColumns);
      }
    },
    _renderSideFields: function (header, columns) {
      var me = this,
        i = 0,
        iL = columns.length,
        cell,
        column;

      for (; i < iL; i++) {
        column = columns[i];
        cell = header.getCell(i);
        if (column.filter && column.filter.header) {
          me.renderFilter(column.type, column, cell);
          if (me.groupHeader && !column.grouping) {
            cell.addCls(GRID_HEADER_CELL_TRIPLE_CLS);
          }

          cell.addCls(GRID_HEADER_CELL_FILTER_CLS);
        }
        else if (me.header) {
          if (me.groupHeader && !column.grouping) {
            cell.addCls(GRID_HEADER_CELL_TRIPLE_CLS);
          }
          else {
            if (column.grouping && me.groupHeader) {
              cell.addCls(GRID_HEADER_CELL_DOUBLE_CLS);
            }
            else if (!column.grouping) {
              cell.addCls(GRID_HEADER_CELL_DOUBLE_CLS);
            }
          }
        }
      }
    },
    _clearColumnsFields: function (columns, header, index, sign) {
      var i = 0,
        iL = columns.length,
        column;

      for (; i < iL; i++) {
        column = columns[i];
        if (column.filter && column.filter.header) {
          if (index && column.index !== index) {
            continue;
          }

          switch (column.type) {
            case 'date':
              var els = header.getCell(i).select('.' + FIELD_CLS),
                fieldFrom = F.getWidget(els.item(0).attr('id')),
                fieldTo = F.getWidget(els.item(1).attr('id'));

              fieldFrom.clear();
              fieldTo.clear();
              break;
            default:
              var id = header.getCell(i).select('.' + FIELD_CLS).attr('id'),
                field = F.getWidget(id);

              if (sign) {
                var splitted = field.get().split(',');

                if (splitted.length < 2 && !sign) {
                  field.clear();
                }
                else {
                  var j = 0,
                    jL = splitted.length,
                    value = '';

                  for (; j < jL; j++) {
                    var splitItem = splitted[j];

                    if (!new RegExp(sign).test(splitItem)) {
                      value += splitItem + ',';
                    }
                  }

                  if(value[value.length - 1] === ','){
                    value = value.substring(0, value.length - 1);
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
    clearColumnsFields: function (index, sign) {
      var me = this,
        w = me.widget;

      me._clearColumnsFields(w.columns, w.header, index, sign);
      me._clearColumnsFields(w.leftColumns, w.leftHeader, index, sign);
      me._clearColumnsFields(w.rightColumns, w.rightHeader, index, sign);
    },
    _addValuesInColumnFields: function (columns, header, index, value, sign) {
      var i = 0,
        iL = columns.length,
        column;

      for (; i < iL; i++) {
        column = columns[i];
        if (column.index === index && column.filter && column.filter.header) {
          switch (column.type) {
            case 'date':
              var els = header.getCell(i).select('.' + FIELD_CLS),
                fieldFrom = F.getWidget(els.item(0).attr('id')),
                fieldTo = F.getWidget(els.item(1).attr('id'));

              fieldFrom.clear();
              fieldTo.clear();
              break;
            default:
              var id = header.getCell(i).select('.' + FIELD_CLS).attr('id'),
                field = F.getWidget(id),
                fieldValue = field.get(),
                splitted = field.get().split(',');

              if (splitted.length === 1 && splitted[0] === '') {
                field.set((sign || '') + value);
              }
              else if (splitted.length === 1) {
                if (new RegExp(sign).test(fieldValue)) {
                  field.set((sign || '') + value);
                }
                else {
                  field.set(fieldValue + ',' + (sign || '') + value);
                }
              }
              else {
                var j = 0,
                  jL = splitted.length,
                  newValue = '',
                  founded = false;

                for (; j < jL; j++) {
                  var splittedItem = splitted[j];

                  if (!new RegExp(sign).test(splittedItem)) {
                    if (newValue.length !== 0) {
                      newValue += ',';
                    }
                    newValue += splittedItem;
                  }
                  else {
                    founded = true;
                    if (newValue.length !== 0) {
                      newValue += ',';
                    }
                    newValue += (sign || '') + value;
                  }
                }

                if(founded === false){
                  newValue += ',';
                  newValue += (sign || '') + value;
                }

                field.set(newValue);
              }
          }
        }
      }
    },
    addValuesInColumnFields: function (index, value, sign) {
      var me = this,
        w = me.widget;

      if(value === undefined || value === null || value.length === 0){
        return;
      }

      if(F.isFunction(value)){
        return;
      }

      me._addValuesInColumnFields(w.columns, w.header, index, value, sign);
      me._addValuesInColumnFields(w.leftColumns, w.leftHeader, index, value, sign);
      me._addValuesInColumnFields(w.rightColumns, w.rightHeader, index, value, sign);
    },
    /*
     * @param {String} type
     * @param {Object} column
     * @param {Fancy.Element} dom
     */
    renderFilter: function (type, column, dom) {
      var me = this,
        w = me.widget,
        field,
        style = {
          position: 'absolute',
          bottom: '3px'
        },
        filter = column.filter,
        theme = w.theme,
        tip = filter.tip,
        value = '',
        columnFilter = me.filters[column.index];

      if(columnFilter){
        for(var p in columnFilter){
          var _value = columnFilter[p];
          switch(p) {
            case '':
              value += _value;
              break;
            default:
              if(column.type === 'combo'){
                value = _value + ',';
              }
              else {
                value += p + _value + ',';
              }
          }
        }
      }

      if(value[value.length - 1] === ','){
        value = value.substring(0, value.length - 1);
      }

      if(Fancy.isObject(filter.header)){
        var fieldConfig = filter.header;

        F.apply(fieldConfig, {
          renderTo: dom.dom,
          label: false,
          style: style,
          theme: theme,
          widget: w,
          tip: tip,
          value: value,
          padding: false
         });

        var widgets = {
          combo: 'Combo'
        };

        if(fieldConfig.type === 'combo'){
          F.apply(fieldConfig, {
            width: column.width - 8,
            height: 28,
            multiSelect: column.multiSelect,
            itemCheckBox: column.itemCheckBox,
            minListWidth: column.minListWidth,
            listItemTpl: column.listItemTpl
          });
        }

        var widgetName = widgets[fieldConfig.type];

        field = new F[widgetName](fieldConfig);
      }
      else {
        switch (type) {
          case 'date':
            var events = [];

            events.push({
              change: me.onDateChange,
              scope: me
            });

            var format;

            if (F.isString(column.format)) {
              switch (column.format) {
                case 'date':
                  format = column.format;
                  break;
              }
            }

            field = new F.DateRangeField({
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
              value: value,
              theme: theme
            });
            break;
          case 'string':
            var events = [{
              enter: me.onEnter,
              scope: me
            }];

            if (me.autoEnterDelay !== false) {
              events.push({
                key: me.onKey,
                scope: me
              });
            }

            field = new F.StringField({
              renderTo: dom.dom,
              label: false,
              padding: false,
              style: style,
              events: events,
              emptyText: filter.emptyText,
              tip: tip,
              value: value,
              widget: w
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

            if (me.autoEnterDelay !== false) {
              events.push({
                key: me.onKey,
                scope: me
              });
            }

            field = new F.NumberField({
              renderTo: dom.dom,
              label: false,
              padding: false,
              style: style,
              emptyText: filter.emptyText,
              events: events,
              widget: w,
              value: value,
              tip: tip
            });
            break;
          case 'combo':
            var displayKey = 'text',
              valueKey = 'text',
              data;

            if (column.displayKey !== undefined) {
              displayKey = column.displayKey;
              valueKey = displayKey;
            }

            if (F.isObject(column.data) || F.isObject(column.data[0])) {
              data = column.data;
            }
            else {
              data = me.configComboData(column.data);
            }

            var selectAllText;

            if (column.filter && column.filter.selectAll) {
              selectAllText = column.filter.selectAll;
            }

            field = new F.Combo({
              renderTo: dom.dom,
              label: false,
              padding: false,
              style: style,
              width: column.width - 8,
              displayKey: displayKey,
              valueKey: valueKey,
              value: value,
              height: 28,
              emptyText: filter.emptyText,
              theme: theme,
              widget: w,
              tip: tip,
              multiSelect: column.multiSelect,
              itemCheckBox: column.itemCheckBox,
              minListWidth: column.minListWidth,
              listItemTpl: column.listItemTpl,
              selectAllText: selectAllText,
              subSearch: column.subSearch,
              events: [{
                change: me.onEnter,
                scope: me
              }, {
                empty: function () {
                  this.set(-1);
                }
              }],
              data: data
            });

            break;
          case 'select':
            if (w.selection && /row/.test(w.selection.selModel)) {
              field = new F.Combo({
                renderTo: dom.dom,
                label: false,
                padding: false,
                style: style,
                displayKey: 'text',
                valueKey: 'value',
                width: column.width - 8,
                emptyText: filter.emptyText,
                value: value,
                editable: false,
                subSearch: false,
                events: [{
                  change: me.onEnterSelect,
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
            }
            break;
          case 'checkbox':
            field = new F.Combo({
              renderTo: dom.dom,
              label: false,
              padding: false,
              style: style,
              displayKey: 'text',
              valueKey: 'value',
              width: column.width - 8,
              emptyText: filter.emptyText,
              value: value,
              editable: false,
              subSearch: false,
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

            if (me.autoEnterDelay !== false) {
              events.push({
                key: me.onKey,
                scope: me
              });
            }

            field = new F.StringField({
              renderTo: dom.dom,
              label: false,
              style: style,
              padding: false,
              value: value,
              emptyText: filter.emptyText,
              events: events
            });
        }
      }

      field.filterIndex = column.index;
      field.column = column;

      /*
      field.el.on('click', function (e) {
        e.stopPropagation();
      });
      */

      if (type !== 'date') {
        field.el.css('padding-left', '4px');
        field.el.css('padding-top', '0px');
      }

      switch (type) {
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
    onEnter: function (field, value, options) {
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

      if (me.intervalAutoEnter) {
        clearInterval(me.intervalAutoEnter);
        me.intervalAutoEnter = false;
      }
      delete me.intervalAutoEnter;

      if (value.length === 0) {
        me.filters[field.filterIndex] = {};
        me.clearFilter(field.filterIndex, undefined, false);
        me.updateStoreFilters();

        if (w.grouping) {
          w.grouping.reGroup();
        }

        return;
      }

      var filters = me.processFilterValue(value, field.column.type),
        i = 0,
        iL = filters.length;

      me.filters[filterIndex] = {};

      for (; i < iL; i++) {
        var filter = filters[i];

        if(filter.operator === ''){
          if(field.column.filter && field.column.filter.operator){
            filter.operator = field.column.filter.operator;
          }
        }

        if(filter.separator === '&'){
          if(F.isArray(me.filters[filterIndex][filter.operator])){
            me.filters[filterIndex][filter.operator].push(filter.value);
          }
          else{
            me.filters[filterIndex][filter.operator] = [filter.value];
          }
        }
        else {
          me.filters[filterIndex][filter.operator] = filter.value;
        }

        if (filter.operator !== '|') {
          //F.apply(me.filters[filterIndex], options);
        }

        if (field.column.type === 'date') {
          F.apply(me.filters[filterIndex], options);
        }
      }

      if (s.remoteFilter) {
        s.filters = me.filters;
        s.once('serversuccess', function () {
          w.fire('filter', me.filters);
        });
        s.serverFilter();
      }
      else {
        me.updateStoreFilters();
      }

      if (w.grouping) {
        if (s.remoteSort) {
          s.once('load', function () {
            w.grouping.reGroup();
            w.fire('filter', me.filters);
          });
        }
        else {
          w.grouping.reGroup();
        }
      }

      w.setSidesHeight();
    },
    /*
     * @param {Object} field
     * @param {String|Number} value
     * @param {Object} options
     */
    onEnterSelect: function (field, value, options) {
      var me = this,
        w = me.widget,
        selected = w.getSelection(),
        ids = [];

      Fancy.each(selected, function (item) {
        ids.push(item.id);
      });

      if(value === String(true)){
        if(ids.length){
          w.addFilter('id', ids, '=');
        }
        else{
          w.clearFilter('id', '=');
          w.clearFilter('id', '!=');
        }
      }
      else if(value === String(false)){
        w.clearFilter('id', '=');
        w.addFilter('id', ids, '!=');
      }
      else{
        w.clearFilter('id');
      }
    },
    /*
     * @param {String|Number} value
     * @param {String} type
     */
    processFilterValue: function (value, type) {
      var signs = {
          '<': true,
          '>': true,
          '!': true,
          '=': true,
          '|': true
        },
        operator,
        _value,
        i = 0,
        iL = 3,
        filters = [],
        splitted,
        j,
        jL;

      if (F.isArray(value)) {
        _value = {};

        F.Array.each(value, function (v, i) {
          _value[String(v).toLocaleLowerCase()] = true;
        });

        filters.push({
          operator: '|',
          value: _value
        });

        return filters;
      }

      var separator = ',';

      if(/\&/.test(value)){
        separator = '&';
      }

      splitted = value.split(separator);
      j = 0;
      jL = splitted.length;

      for (; j < jL; j++) {
        i = 0;
        operator = '';
        _value = splitted[j];

        for (; i < iL; i++) {
          if (signs[_value[i]]) {
            operator += _value[i];
          }
        }

        _value = _value.replace(new RegExp('^' + operator), '');

        if (_value.length < 1) {
          continue;
        }

        switch (type) {
          case 'number':
            _value = Number(_value);
            break;
          case 'combo':
            operator = '=';
            break;
        }

        filters.push({
          operator: operator,
          value: _value,
          separator: separator
        });
      }

      return filters;
    },
    /*
     * @param [update] Boolean
     */
    updateStoreFilters: function (update) {
      var me = this,
        w = me.widget,
        s = w.store,
        containFilters = false;

      w.filtering = true;
      s.filters = me.filters;

      for(var p in s.filters){
        var filter = s.filters[p];

        if(filter){
          containFilters = true;
          break;
        }
      }

      if(!containFilters){
        delete s.filteredData;
      }

      if(update !== false){
        s.changeDataView();
        w.update();

        w.fire('filter', me.filters);
        w.setSidesHeight();
      }

      if(!containFilters){
        delete s.filteredData;
        delete s.filteredDataMap;
        delete s.filterOrder;
      }

      delete w.filtering;
    },
    forceUpdateStoreFilters: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      s.changeDataView();
      w.update();

      w.fire('filter', me.filters);
      w.setSidesHeight();
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onColumnResize: function (grid, o) {
      var cell = F.get(o.cell),
        width = o.width,
        fieldEl = cell.select('.' + FIELD_CLS),
        field;

      if(fieldEl.length === 2){
        fieldEl = fieldEl.item(1);
      }

      if (fieldEl.length === 0) {}
      else if (fieldEl.length === 2) {
        field = F.getWidget(fieldEl.item(0).dom.id);

        field.setWidth((width - 8) / 2);

        field = F.getWidget(fieldEl.item(1).dom.id);

        field.setWidth((width - 8) / 2);
      }
      else {
        field = F.getWidget(fieldEl.dom.id);

        if (field.wtype === 'field.combo') {
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
    onKey: function (field, value, e) {
      var me = this;

      if (e.keyCode === F.key.ENTER) {
        return;
      }

      me.autoEnterTime = +new Date();

      if (!me.intervalAutoEnter) {
        me.intervalAutoEnter = setInterval(function () {
          var now = new Date();

          if (!me.intervalAutoEnter) {
            return;
          }

          if (now - me.autoEnterTime > me.autoEnterDelay) {
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
    onDateChange: function (field, date) {
      var me = this,
        w = me.widget,
        format = field.format,
        s = w.store,
        dateFrom = field.dateField1.getDate(),
        dateTo = field.dateField2.getDate(),
        value,
        isValid1 = dateFrom.toString() !== 'Invalid Date' && F.isDate(dateFrom),
        isValid2 = dateTo.toString() !== 'Invalid Date' && F.isDate(dateTo),
        value1,
        value2,
        isRemote = s.remoteFilter;

      if (isValid1) {
        dateFrom = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
      }

      if (isValid2) {
        dateTo = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());
      }

      if (isValid1 && isValid2) {
        if (isRemote !== true) {
          value1 = Number(dateFrom);
          value2 = Number(dateTo);
        }
        else {
          value1 = F.Date.format(dateFrom, format.edit, format.mode);
          value2 = F.Date.format(dateTo, format.edit, format.mode);
        }

        value = '>=' + value1 + ',<=' + value2;
      }
      else if (isValid1) {
        if (isRemote !== true) {
          value = '>=' + Number(dateFrom);
        }
        else {
          value = '>=' + F.Date.format(dateFrom, format.edit, format.mode);
        }

        me.clearFilter(field.filterIndex, '<=', false);
      }
      else if (isValid2) {
        if (isRemote !== true) {
          value = '<=' + Number(dateTo);
        }
        else {
          value = '<=' + F.Date.format(dateFrom, format.edit, format.mode);
        }

        me.clearFilter(field.filterIndex, '>=', false);
      }
      else {
        me.clearFilter(field.filterIndex);
      }

      if (value) {
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
    clearFilter: function (index, operator, update) {
      var me = this;

      if (operator === undefined) {
        delete me.filters[index];
      }
      else {
        if (me.filters[index]) {
          delete me.filters[index][operator];
        }
      }

      if (update !== false) {
        me.updateStoreFilters();
      }
    },
    onFilter: function () {
      this.widget.scroll(0);
    },
    /*
     * @param {Array} data
     * @return {Array}
     */
    configComboData: function (data) {
      var i = 0,
        iL = data.length,
        _data = [];

      if (F.isObject(data)) {
        return data;
      }

      for (; i < iL; i++) {
        _data.push({
          value: i,
          text: data[i]
        });
      }

      return _data;
    },
    destroyFields: function () {
      var me = this,
        w = me.widget;

      F.each(w.columns, function (column) {
        if(column.filterField){
          column.filterField.destroy();
          delete column.filterField;
        }
      });

      F.each(w.leftColumns, function (column) {
        if(column.filterField){
          column.filterField.destroy();
          delete column.filterField;
        }
      });

      F.each(w.rightColumns, function (column) {
        if(column.filterField){
          column.filterField.destroy();
          delete column.filterField;
        }
      });

      w.el.select('.' + GRID_HEADER_CELL_FILTER_CLS).removeCls(GRID_HEADER_CELL_FILTER_CLS);
      w.el.select('.' + GRID_HEADER_CELL_FILTER_FULL_CLS).removeCls(GRID_HEADER_CELL_FILTER_FULL_CLS);
      w.el.select('.' + GRID_HEADER_CELL_FILTER_SMALL_CLS).removeCls(GRID_HEADER_CELL_FILTER_SMALL_CLS);

      w.el.select('.' + GRID_HEADER_CELL_DOUBLE_CLS).removeCls(GRID_HEADER_CELL_DOUBLE_CLS);
      w.el.select('.' + GRID_HEADER_CELL_TRIPLE_CLS).removeCls(GRID_HEADER_CELL_TRIPLE_CLS);
    },
    /*
     *
     */
    onLockColumn: function () {
      this.render();
    },
    /*
     *
     */
    onUnLockColumn: function () {
      this.render();
    },
    /*
     *
     */
    onRightLockColumn: function () {
      this.render();
    },
    /*
     *
     */
    onColumnDrag: function () {
      var me = this;

      me.destroyFields();
      me.render();
    }
  });

})();