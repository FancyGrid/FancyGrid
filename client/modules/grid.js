/*
 * @mixin Fancy.grid.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.grid.mixin.PrepareConfig', {
  /*
  TODO: it goes many  time for columns, to get something and it takes a bit time.
  TODO: if possible to redo to one for, but maybe it is not so timely, so I am not sure
 */
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfig: function(config, originalConfig){
    var me = this;

    config._plugins = config._plugins || [];

    if(config.renderOuter){
      config.renderTo = config.renderOuter;
    }

    config = me.generateColumnsFromData(config, originalConfig);
    /*
     * prevent columns linking if one columns object for several grids
     */
    config = me.copyColumns(config, originalConfig);
    config = me.prepareConfigScroll(config, originalConfig);
    config = me.prepareConfigData(config, originalConfig);
    config = me.prepareConfigTheme(config, originalConfig);
    config = me.prepareConfigLang(config, originalConfig);
    config = me.prepareConfigSpark(config, originalConfig);
    config = me.prepareConfigPaging(config, originalConfig);
    config = me.prepareConfigTBar(config);
    config = me.prepareConfigExpander(config);
    config = me.prepareConfigColumnMinMaxWidth(config);
    config = me.prepareConfigGrouping(config);
    config = me.prepareConfigGroupHeader(config);
    config = me.prepareConfigSorting(config);
    config = me.prepareConfigEdit(config);
    config = me.prepareConfigSelection(config);
    config = me.prepareConfigLoadMask(config, originalConfig);
    config = me.prepareConfigDefaults(config);
    config = me.prepareConfigFilter(config, originalConfig);
    config = me.prepareConfigSearch(config);
    config = me.prepareConfigSummary(config);
    config = me.prepareConfigState(config, originalConfig);
    config = me.prepareConfigExporter(config);
    config = me.prepareConfigSmartIndex(config);
    config = me.prepareConfigActionColumn(config);
    config = me.prepareConfigWidgetColumn(config);
    config = me.prepareConfigChart(config, originalConfig);
    config = me.prepareConfigCellTip(config);
    config = me.prepareConfigColumnsWidth(config);
    config = me.prepareConfigSize(config, originalConfig);
    config = me.prepareConfigContextMenu(config, originalConfig);
    config = me.prepareConfigColumns(config);
    config = me.prepareConfigColumnsResizer(config);
    config = me.prepareConfigFooter(config);
    config = me.prepareConfigDD(config);

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  copyColumns: function(config, originalConfig){
    if(config.columns){
      config.columns = Fancy.Array.copy(config.columns, true);
    }

    if(originalConfig.columns){
      originalConfig.columns = Fancy.Array.copy(originalConfig.columns);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  generateColumnsFromData: function (config, originalConfig) {
    if(!config.columns && config.data && config.data.length && Fancy.isArray(config.data[0])){
      var firstDataRow = config.data[0] || config.data[0],
        columns = [],
        fields = [];

      Fancy.each(firstDataRow, function (value, i) {
        columns.push({
          index: 'autoIndex' + i
        });

        fields.push('autoIndex' + i);
      });

      config.columns = columns;
      config.data = {
        items: config.data,
        fields: fields
      };

      originalConfig.data = config.data;
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigScroll: function (config, originalConfig) {
    if(Fancy.isIE && originalConfig.nativeScroller !== false){
      config.nativeScroller = true;
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigSpark: function(config, originalConfig){
    var me = this;

    Fancy.each(config.columns, function(column){
      var spark = column.sparkConfig;

      if(spark && spark.legend){
        switch(spark.legend.type){
          case 'tbar':
          case 'bbar':
          case 'buttons':
            var barName = spark.legend.type,
              index = column.index;

            config[barName] = config[barName] || [];
            config[barName] = config[barName].concat(me._generateLegendBar(spark.title, index, spark.legend.style, column));
            break;
        }
      }
    });

    return config;
  },
  /*
   * @private
   * @param {String} title
   * @param {Object} style
   * @param {Object} column
   * @return {Array}
   */
  _generateLegendBar: function(title, indexes, style, column){
    var i = 0,
      iL = title.length,
      bar = [],
      me = this;

    var disabled = {
      length: 0
    };

    var legendFn = function(button){
      var grid = me,
        indexOrder;

      Fancy.each(me.columns, function(column, i){
        if(column.index === me.columns[i].index){
          indexOrder = i;
        }
      });

      if(!button.hasCls('fancy-legend-item-disabled') && title.length - 1 === disabled.length){
        return;
      }

      button.toggleCls('fancy-legend-item-disabled');

      if(button.hasCls('fancy-legend-item-disabled')){
        disabled[button.index] = true;
        grid.disableLegend(indexOrder, button.index);
        disabled.length++;
      }
      else{
        grid.enableLegend(indexOrder, button.index);
        delete disabled[button.index];
        disabled.length--;
      }
    };

    for(;i<iL;i++){
      var index = indexes[i];
      if(Fancy.isString(column.index)){
        index = column.index + '.' + i;
      }

      var buttonConfig = {
        handler: legendFn,
        index: index,
        imageColor: Fancy.COLORS[i],
        text: title[i]
      };

      if(i === 0 && style){
        buttonConfig.style = style;
      }

      bar.push(buttonConfig);
    }

    return bar;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigData: function(config, originalConfig){
    if(Fancy.isArray(config.data) && config.data.length === 0 && config.columns){
      var fields = [];

      Fancy.each(config.columns, function(column){
        if(column.index){
          fields.push(column.index || column.key);
        }
      });

      config.data = {
        fields: fields,
        items: []
      };
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigLoadMask: function(config){
    config._plugins.push({
      type: 'grid.loadmask'
    });

    return config;
  },
  /*
   * @param {Array} data
   */
  reConfigStore: function(data){
    var me = this,
      s = me.store,
      fields = me.getFieldsFromData(data),
      modelName = 'Fancy.model.'+Fancy.id();

    Fancy.define(modelName, {
      extend: Fancy.Model,
      fields: fields
    });

    me.model = modelName;
    s.model = modelName;

    me.fields = fields;
    s.fields = fields;
    s.setModel();
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigDefaults: function(config){
    config.defaults = config.defaults || {};

    if(config.defaults.type === undefined){
      config.defaults.type = 'string';
    }

    Fancy.each(config.defaults, function(value, p){
      Fancy.each(config.columns, function(column){
        switch(column.type){
          case 'select':
          case 'order':
          case 'expand':
          case 'rowdrag':
            return;
            break;
        }

        if(column[p] === undefined){
          column[p] = config.defaults[p];
        }

        if(p === 'width' && column[p].flex){
          delete column[p].width;
        }
      });
    });

    return config;
  },
  prepareConfigColumnMinMaxWidth: function(config){
    Fancy.each(config.columns, function(column){
      if(column.width === undefined && !column.flex && column.minWidth){
        column.width = column.minWidth;
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigCellTip: function(config){
    Fancy.each(config.columns, function(column){
      if(column.cellTip){
        config._plugins.push({
          type: 'grid.celltip'
        });
        return true;
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigDD: function(config){
    if(config.gridToGrid){
      var pluginConfig = {
        type: 'grid.dragdrop'
      };

      Fancy.apply(pluginConfig, config.gridToGrid);

      config._plugins.push(pluginConfig);
    }

    if(config.rowDragDrop){
      var pluginConfig = {
        type: 'grid.rowdragdrop'
      };

      Fancy.apply(pluginConfig, config.rowDragDrop);

      config._plugins.push(pluginConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigColumns: function(config){
    var columns = config.columns,
      leftColumns = [],
      rightColumns = [],
      i = 0,
      iL = columns.length,
      isDraggable = false,
      isTreeData = false,
      autoHeight = false,
      $selected = 0,
      $order = 0,
      $rowdrag = 0;


    for(;i<iL;i++){
      var column = columns[i];

      if(column.draggable){
        isDraggable = true;
      }

      if(column.type === 'tree'){
        isTreeData = true;
      }

      if(column.type === 'rowdrag' && !config.rowDragDrop){
        config.rowDragDrop = true;
      }

      if(column.headerCheckBox){
        column.sortable = false;
      }

      if(column.autoHeight){
        autoHeight = true;
      }

      switch(column.type){
        case 'select':
          this.checkboxRowSelection = true;
          this.multiSelect = true;
          columns[i].index = '$selected';
          columns[i].editable = true;
          $selected++;

          if($selected > 1){
            //columns[i].index += $selected;
          }
          break;
        case 'order':
          columns[i].editable = false;
          columns[i].sortable = false;
          columns[i].index = '$order';
          columns[i].cellAlign = 'right';
          $order++;

          if($order > 1){
            //columns[i].index += $order;
          }
          break;
        case 'rowdrag':
          columns[i].editable = false;
          columns[i].sortable = false;
          columns[i].resizable = false;
          columns[i].width = 30;
          columns[i].index = '$rowdrag';
          $rowdrag++;

          if($rowdrag > 1){
            //columns[i].index += $rowdrag;
          }
          break;
        case 'checkbox':
          if(column.cellAlign === undefined){
            column.cellAlign = 'center';
          }
          break;
        case 'currency':
          if(column.format === undefined){
            column.format = 'number';
          }
          break;
        case 'string':
        case 'number':
        case 'text':
        case 'date':
        case 'combo':
          if(column.ellipsis !== false){
            column.ellipsis = true;
          }
          break;
      }

      if(column.locked){
        leftColumns.push(column);
        columns.splice(i, 1);
        i--;
        iL--;
        continue;
      }

      if(column.rightLocked){
        rightColumns.push(column);
        columns.splice(i, 1);
        i--;
        iL--;
        continue;
      }
    }

    if(autoHeight){
      config._plugins.push({
        type: 'grid.rowheight'
      });
    }

    if(isDraggable){
      config._plugins.push({
        type: 'grid.columndrag'
      });
    }

    if(isTreeData){
      var treeConfig = {
        type: 'grid.tree'
      }

      if(config.singleExpand){
        treeConfig.singleExpand = config.singleExpand;
      }

      config._plugins.push(treeConfig);

      config.isTreeData = true;
    }

    config.leftColumns = leftColumns;
    config.rightColumns = rightColumns;

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigColumnsWidth: function(config){
    var columns = config.columns,
      width = config.width,
      gridBorders = config.gridBorders,
      gridWithoutPanelBorders = config.gridWithoutPanelBorders,
      panelBodyBorders = config.panelBodyBorders,
      columnsWithoutWidth = [],
      flexColumns = [],
      maxWidth = 100,
      minWidth = 50,
      defaultWidth = maxWidth,
      flexTotal = 0,
      column,
      hasLocked = false,
      hasRightLocked = false,
      bootstrapTab = false,
      _el = Fancy.get(config.renderTo || document.body);

    if((config.width < 1 || config.width === undefined) && _el.prop('tagName').toLocaleLowerCase() !== 'body') {
      bootstrapTab = _el.closest('.tab-pane');
      if (bootstrapTab) {
        bootstrapTab.css({
          display: 'block',
          visibility: 'hidden'
        });
      }
    }

    if(width === undefined || width === 'fit'){
      width = Fancy.get(config.renderTo || document.body).width();
    }

    width -= config.panelBorderWidth * 2;
    if(config.flexScrollSensitive !== false){
      width -= config.bottomScrollHeight;
    }
    else{
      var theme = this.theme;

      if(Fancy.isString(config.theme)){
        theme = config.theme;
      }
      else if(Fancy.isObject(config.theme)){
        if(config.theme.name){
          theme = config.theme.name;
        }
      }

      if(theme !== 'bootstrap-no-borders'){
        width -= 1;
      }
    }

    Fancy.each(columns, function(column, i){
      if(column.flex){
        config.hasFlexColumns = true;
      }

      switch(column.type){
        case 'select':
          if(column.width === undefined){
            column.width = 35;
          }
          break;
        case 'order':
          if(column.width === undefined){
            column.width = 40;
          }
          break;
        case 'rowdrag':
          if(column.width === undefined){
            column.width = 30;
          }
          break;
        case 'expand':
          if(column.width === undefined){
            column.width = 38;
          }
          break;
      }

      if(column.locked){
        hasLocked = true;
      }

      if(column.rightLocked){
        hasRightLocked = true;
      }

      if(column.width === undefined){
        if(column.flex){
          flexTotal += column.flex;
          flexColumns.push(i);
        }
        columnsWithoutWidth.push(i);
      }
      else if(Fancy.isNumber(column.width) ){
        width -= column.width;
      }
    });

    if(config.hasFlexColumns){
      config._plugins.push({
        type: 'grid.columnresizer'
      });
    }

    if(hasLocked && hasRightLocked){
      width -= 2;
    }

    var averageWidth = parseInt(width/columnsWithoutWidth.length);

    if(averageWidth < minWidth){
      averageWidth = minWidth;
    }

    if(averageWidth > maxWidth){
      defaultWidth = maxWidth;
    }

    if(averageWidth < minWidth){
      defaultWidth = minWidth;
    }

    var isOverFlow = false,
      _width = width;

    Fancy.each(columnsWithoutWidth, function(value){
      column = columns[value];
      if(column.flex === undefined){
        _width -= defaultWidth;
      }
    });

    if(flexTotal){
      var onePerCent = parseInt(_width/flexTotal);
      Fancy.each(flexColumns, function(columnIndex){
        _width -= onePerCent * columns[columnIndex].flex;
      });
    }

    if(_width < 0){
      isOverFlow = true;
    }

    Fancy.each(columnsWithoutWidth, function(value){
      column = columns[value];
      if(column.flex === undefined){
        column.width = defaultWidth;
        width -= defaultWidth;
      }
    });

    if(flexTotal){
      Fancy.each(flexColumns, function(value){
        column = columns[value];
        if(isOverFlow){
          column.width = defaultWidth * column.flex;
        }
        else {
          column.width = (width / flexTotal) * column.flex;
        }

        column.width = parseInt(column.width);

        if(column.minWidth && column.width < column.minWidth){
          column.width = column.minWidth;
        }
      });

      if(_width>= 1){
        Fancy.each(flexColumns, function(value){
          if(_width < 1){
            return true;
          }

          column = columns[value];

          column.width += 1;
          _width -= 1;
        });
      }
    }

    if(bootstrapTab){
      bootstrapTab.css({
        display: '',
        visibility: ''
      });
    }

    return config;
  },
  /*
   * @param {Object} column
   * @return {Object}
   */
  prepareConfigActionRender: function(column){
    return function(o){
      Fancy.each(column.items, function(item){
        var itemText = item.text || '',
          style = Fancy.styleToString(item.style),
          cls = item.cls || '';

        o.value += [
          '<div class="fancy-grid-column-action-item '+cls+'" style="' + style + '">',
          itemText,
          '</div>'
        ].join(" ");

        if(item.render){
          o = item.render(o);
        }
      });

      return o;
    }
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigSmartIndex: function(config){
    Fancy.each(config.columns, function(column){
      if(/\+|\-|\/|\*|\[|\./.test(column.index)){
        var smartIndex = column.index;

        switch(smartIndex){
          case 'xAxis.categories':
          case 'yAxis.categories':
          case 'zAxis.categories':
            return;
            break;
        }

        smartIndex = smartIndex.replace(/(\w+)/g, function(f, found, index, str){
          if(str[index - 1] === '.'){
            return found;
          }

          if(isNaN(Number(found))){
            return 'data.' + found;
          }
          return found;
        });
        smartIndex = 'return ' + smartIndex + ';';
        column.smartIndexFn = new Function('data', smartIndex);
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigActionColumn: function(config){
    var me = this,
      columns = config.columns,
      i = 0,
      iL = columns.length;

    for(;i<iL;i++){
      var column = columns[i];

      if(column.type === 'action'){
        column.sortable = false;
        column.editable = false;
        column.render = me.prepareConfigActionRender(column);

        var items = column.items;

        if(items !== undefined && items.length !== 0){
          var j = 0,
            jL = items.length,
            item;

          for(;j<jL;j++){
            item = items[j];
            switch(item.action){
              case 'remove':
                if(item.handler === undefined){
                  item.handler = function(grid, o){
                    grid.remove(o);
                  };
                }
                break;
              case 'dialog':
                (function(item) {
                  if (item.handler === undefined) {
                    var _items = [],
                      k = 0,
                      kL = columns.length,
                      height = 42 + 38 + 7;

                    for(;k<kL;k++){
                      var _column = columns[k];
                      switch (_column.type) {
                        case 'action':
                          continue;
                          break;
                      }

                      _items.push({
                        label: _column.title || '',
                        type: _column.type,
                        name: _column.index
                      });

                      height += 38;
                    }

                    item.handler = function(grid, o){
                      if(item.dialog){
                        item.dialog.show();
                        item.dialog.set(o.data);
                      }
                      else {
                        item.dialog = new FancyForm({
                          window: true,
                          draggable: true,
                          modal: true,
                          title: {
                            text: 'Edit',
                            tools: [{
                              text: 'Close',
                              handler: function(){
                                this.hide();
                              }
                            }]
                          },
                          width: 300,
                          height: height,
                          items: _items,
                          buttons: ['side', {
                            text: 'Clear',
                            handler: function(){
                              this.clear();
                            }
                          }, {
                            text: 'Save',
                            handler: function(){
                              var values = this.get();

                              if(!values.id){
                                return;
                              }

                              me.getById(values.id).set(values);
                              me.update();
                            }
                          }],
                          events: [{
                            init: function(){
                              this.show();
                              this.set(o.data);
                            }
                          }]
                        });
                      }
                    };
                  }
                })(item);

                break;
            }
          }
        }
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigWidgetColumn: function(config){
    var columns = config.columns,
      i = 0,
      iL = columns.length;

    for(;i<iL;i++) {
      var column = columns[i];

      if(column.widget){
        column.render = function(o){
          var fieldEl = o.cell.select('.' + Fancy.FIELD_CLS),
            field,
            renderTo = o.cell.dom,
            column = o.column;

          var itemComfig = {
            vtype: column.vtype,
            style: {
              'padding': '0px',
              'margin-top': '-10px',
              'margin-left': '-1px'
            },
            label: false,
            renderTo: renderTo,
            value: o.value,
            emptyText: column.emptyText
          };

          if(fieldEl.length){
            field = Fancy.getWidget(fieldEl.dom.id);

            if(field.get() != o.value){
              field.set(o.value);
            }
          }
          else {
            var width = o.column.width,
              column = o.column,
              index = column.index;

            switch(o.column.type){
              case 'number':
              case 'currency':
                Fancy.apply(itemComfig, {
                  spin: column.spin,
                  min: column.min,
                  max: column.max,
                  events: [{
                    change: function(field, value){
                      grid.set(o.rowIndex, index, value);
                      grid.updater.updateRow();
                    }
                  }]
                });

                field = new Fancy.NumberField(itemComfig);
                break;
              case 'string':
              case 'image':
                Fancy.apply(itemComfig, {
                  events: [{
                    change: function(field, value){
                      grid.set(o.rowIndex, index, value);
                      grid.updater.updateRow();
                    }
                  }]
                });

                field = new Fancy.StringField(itemComfig);
                break;
              case 'combo':
                Fancy.apply(itemComfig, {
                  displayKey: o.column.displayKey,
                  valueKey: o.column.displayKey,
                  padding: false,
                  checkValidOnTyping: true,
                  data: o.column.data,
                  events: [{
                    change: function(field, value){
                      grid.set(o.rowIndex, index, value);
                      grid.updater.updateRow();
                    }
                  }]
                });

                field = new Fancy.Combo(itemComfig);
                break;
            }

            switch(o.column.type){
              case 'number':
              case 'string':
              case 'currency':
              case 'image':
                field.setInputSize({
                  width: width + 1,
                  height: 33
                });
                break;
              case 'combo':
                field.size({
                  width: width + 1,
                  height: 33
                });
                break;
            }


          }

          return o;
        };
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigSorting: function(config){
    var defaults = config.defaults || {};

    if(defaults.sortable){
      config._plugins.push({
        type: 'grid.sorter'
      });

      return config;
    }

    Fancy.each(config.columns, function(column){
      if(column.sortable){
        config._plugins.push({
          type: 'grid.sorter'
        });
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigSelection: function(config){
    var initSelection = false,
      selectionConfig = {
        type: 'grid.selection'
      },
      disabled = false;

    if(config.trackOver || config.columnTrackOver || config.cellTrackOver){
      initSelection = true;
    }

    if(config.selModel){
      initSelection = true;
      var checkOnly = false;
      var memory = false;
      var memoryPerformance = true;
      var selectLeafsOnly = false;
      var keyNavigation = true;
      var allowDeselect = false;
      var mouseMoveSelection = true;

      if(Fancy.isObject(config.selModel)){
        checkOnly = !!config.selModel.checkOnly;

        if(!config.selModel.type){
          throw new Error('FancyGrid Error 5: Type for selection is not set');
        }

        if(config.selModel.mouseMoveSelection !== undefined){
          mouseMoveSelection = config.selModel.mouseMoveSelection;
        }

        if(config.selModel.memoryPerfomance !== undefined){
          memoryPerformance = config.selModel.memoryPerfomance;
        }

        memory = config.selModel.memory === true;
        if(config.selModel.disabled){
          disabled = true;
        }

        if(config.selModel.selectLeafsOnly){
          selectLeafsOnly = true;
        }

        if(config.selModel.allowDeselect !== undefined){
          allowDeselect = true;
        }

        if(config.selModel.keyNavigation !== undefined){
          keyNavigation = config.selModel.keyNavigation;
        }

        config.selModel = config.selModel.type;
      }

      if(config.selModel === 'rows'){
        config.multiSelect = true;
      }

      config.selection = config.selection || {};
      config.selection.selModel = config.selModel;
      config.selection[config.selModel] = true;
      config.selection.checkOnly = checkOnly;
      config.selection.memory = memory;
      config.selection.memoryPerformance = memoryPerformance;
      config.selection.disabled = disabled;
      config.selection.selectLeafsOnly = selectLeafsOnly;
      config.selection.keyNavigation = keyNavigation;
      config.selection.allowDeselect = allowDeselect;
      config.selection.mouseMoveSelection = mouseMoveSelection;
    }

    if(config.selection){
      initSelection = true;

      if(Fancy.isObject(config.selection)){
        Fancy.apply(selectionConfig, config.selection);
      }
    }

    if(initSelection === true){
      config._plugins.push(selectionConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigEdit: function(config){
    var defaults = config.defaults || {},
      editPluginConfig = {
        type: 'grid.edit'
      },
      included = false,
      editable = defaults.editable;

    if(config.clicksToEdit !== undefined){
      editPluginConfig.clicksToEdit = config.clicksToEdit;
    }

    if(editable){
      if(!included){
        config._plugins.push(editPluginConfig);
      }

      config._plugins.push({
        type: 'grid.celledit'
      });

      included = true;
    }

    if(config.rowEdit){
      config._plugins.push({
        type: 'grid.rowedit'
      });
    }

    Fancy.each(config.columns, function(column){
      if(column.index === undefined && column.key === undefined){
        column.editable = false;
      }

      switch(column.type){
        case 'image':
          column.sortable = false;
          break;
        case 'sparklineline':
        case 'sparklinebar':
        case 'sparklinetristate':
        case 'sparklinediscrete':
        case 'sparklinebullet':
        case 'sparklinepie':
        case 'sparklinebox':
          column.editable = false;
          column.sortable = false;
          break;
      }

      if(column.editable && included === false){
        config._plugins.push(editPluginConfig);

        config._plugins.push({
          type: 'grid.celledit'
        });
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigExpander: function(config){
    if(config.expander){
      var expanderConfig = config.expander;

      Fancy.apply(expanderConfig, {
        type: 'grid.expander'
      });

      config.expanded = {};

      if(config.grouping){
        expanderConfig.expanded = false;
      }

      config._plugins.push(expanderConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigGrouping: function(config){
    if(config.grouping){
      var groupConfig = config.grouping;

      Fancy.apply(groupConfig, {
        type: 'grid.grouping'
      });

      config.expanded = {};

      config._plugins.push(groupConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigSummary: function(config){
    if(config.summary){
      var summaryConfig = config.summary;

      if(summaryConfig === true){
        summaryConfig = {};
      }

      Fancy.apply(summaryConfig, {
        type: 'grid.summary'
      });

      config._plugins.push(summaryConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigContextMenu: function(config){
    if(config.contextmenu){
      var menuConfig = config.contextmenu;

      if(Fancy.isArray(config.contextmenu)){
        Fancy.each(config.contextmenu, function (value) {
          if(value === 'export'){
            config.exporter = true;
          }
        });
      }

      if(menuConfig === true){
        menuConfig = {};
      }

      if(Fancy.isArray(menuConfig)){
        menuConfig = {
          items: menuConfig
        };
      }

      Fancy.apply(menuConfig, {
        type: 'grid.contextmenu'
      });

      config._plugins.push(menuConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigExporter: function(config){
    if(config.exporter){
      var exporterConfig = config.exporter;

      if(exporterConfig === true){
        exporterConfig = {};
      }

      Fancy.apply(exporterConfig, {
        type: 'grid.exporter'
      });

      config._plugins.push(exporterConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigFilter: function(config, originalConfig){
    var columns = config.columns,
      isFilterable = false,
      isHeaderFilter = false,
      /*
       * Detects if at least one header cell with filter under group header cell
       */
      isInGroupHeader = false,
      filterConfig = {
        type: 'grid.filter'
      };

    if(config.filter){
      if(config.filter === true){
        isFilterable = true;
        config.filter = {};
      }

      Fancy.apply(filterConfig, config.filter);
    }

    Fancy.each(columns, function(column){
      if(column.filter){
        isFilterable = true;
        if(column.filter.header){
          isHeaderFilter = true;

          if(column.grouping){
            isInGroupHeader = true;
          }
        }
      }
    });

    filterConfig.header = isHeaderFilter;
    filterConfig.groupHeader = isInGroupHeader;

    if(isFilterable){
      config._plugins.push(filterConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigSearch: function(config){
    var searchConfig = {
        type: 'grid.search'
      },
      isSearchable = false;

    if(config.searching){
      isSearchable = true;
      Fancy.apply(searchConfig, config.searching);
    }

    if(isSearchable){
      config._plugins.push(searchConfig);
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigGroupHeader: function(config){
    var columns = config.columns,
      i = 0,
      iL = columns.length,
      groups = [],
      isGrouped = false,
      _columns = [];

    Fancy.each(columns, function(column){
      if(column.columns){
        isGrouped = true;
        groups.push(column);
      }
    });

    if(isGrouped){
      i = 0;
      for(;i<iL;i++){
        var column = columns[i];

        if(column.columns){
          var j = 0,
            jL = column.columns.length,
            groupName = column.text || column.title || '  ';

          for(;j<jL;j++){
            if(column.locked){
              column.columns[j].locked = true;
            }

            if(column.rightLocked){
              column.columns[j].rightLocked = true;
            }
            column.columns[j].grouping = groupName;

            if(column.defaults){
              Fancy.applyIf(column.columns[j], column.defaults);

              if(column.defaults.width && column.columns[j].flex){
                delete column.columns[j].width;
              }
            }
          }

          _columns = _columns.concat(column.columns);

          isGrouped = true;
          groups.push(column);
        }
        else{
          _columns = _columns.concat( columns.slice(i, i+1) );
        }
      }

      config.columns = _columns;

      config._plugins.push({
        type: 'grid.groupheader',
        groups: groups
      });

      config.isGroupedHeader = true;
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigPaging: function(config, originalConfig){
    var me = this,
      lang = config.lang,
      paging = config.paging,
      barType = 'bbar';

    if(!paging){
      return config;
    }

    if(paging.barType !== undefined){
      switch(paging.barType){
        case 'bbar':
        case 'tbar':
        case 'both':
          barType = paging.barType;
          break;
        case false:
        case 'none':
          barType = 'none';
          break;
        default:
          throw new Error('[FancyGrid Error]: - not supported bar type for paging');
      }
    }

    config._plugins.push({
      i18n: originalConfig.i18n,
      type: 'grid.paging',
      barType: barType
    });

    if(barType === 'both'){
      config['tbar'] = me.generatePagingBar(paging, lang);
      config['bbar'] = me.generatePagingBar(paging, lang);
    }
    else if(barType === 'none'){}
    else {
      config[barType] = me.generatePagingBar(paging, lang);
    }

    return config;
  },
  /*
   * @param {Object|Boolean} paging
   * @param {Object} lang
   * @return {Array}
   */
  generatePagingBar: function(paging, lang){
    var me = this,
      bar = [],
      disabledCls = 'fancy-bar-button-disabled',
      style = {
        "float": 'left',
        'margin-right': '5px',
        'margin-top': '3px'
      };

    bar.push({
      imageCls: 'fancy-paging-first',
      disabledCls: disabledCls,
      role: 'first',
      handler: function(button){
        me.paging.firstPage();
      },
      style: {
        'float': 'left',
        'margin-left': '5px',
        'margin-right': '5px',
        'margin-top': '3px'
      }
    });

    bar.push({
      imageCls: 'fancy-paging-prev',
      disabledCls: disabledCls,
      role: 'prev',
      handler: function(){
        me.paging.prevPage();
      },
      style: style
    });

    bar.push('|');

    bar.push({
      type: 'text',
      text: lang.paging.page
    });

    bar.push({
      type: 'number',
      label: false,
      padding: false,
      style: {
        "float": 'left',
        'margin-left': '-1px',
        'margin-right': '8px',
        'margin-top': '4px'
      },
      role: 'pagenumber',
      min: 1,
      width: 30,
      listeners: [{
        enter: function(field){
          if (parseInt(field.getValue()) === 0) {
            field.set(1);
          }

          var page = parseInt(field.getValue()) - 1,
            setPage = me.paging.setPage(page);

          if (page !== setPage) {
            field.set(setPage);
          }
        }
      },{
        up: function(field, value){
          var pages = me.store.pages;

          if(Number(value) > pages ){
            field.set(pages);
          }
        }
      }]
    });

    bar.push({
      type: 'text',
      text: '',
      role: 'ofText'
    });

    bar.push('|');

    bar.push({
      imageCls: 'fancy-paging-next',
      disabledCls: disabledCls,
      role: 'next',
      style: style,
      handler: function(){
        me.paging.nextPage();
      }
    });

    bar.push({
      imageCls: 'fancy-paging-last',
      disabledCls: disabledCls,
      role: 'last',
      style: style,
      handler: function(){
        me.paging.lastPage();
      }
    });

    if(Fancy.isObject(paging) && paging.refreshButton === true){
      bar.push('|');

      bar.push({
        imageCls: 'fancy-paging-refresh',
        disabledCls: disabledCls,
        role: 'refresh',
        style: style,
        handler: function(){
          me.paging.refresh();
        }
      });
    }

    if(paging && Fancy.isArray(paging.pageSizeData)){
      var pageSizeData = paging.pageSizeData,
        sizes = [],
        i = 0,
        iL = pageSizeData.length,
        value = 0;

      for(;i<iL;i++){
        sizes.push({
          index: i,
          value: pageSizeData[i]
        });

        if(paging.pageSize === pageSizeData[i]){
          value = i;
        }
      }

      var sizeStyle = Fancy.Object.copy(style);

      sizeStyle['margin-top'] = '4px';

      bar.push({
        editable: false,
        width: 50,
        type: 'combo',
        role: 'size',
        style: sizeStyle,
        data: sizes,
        displayKey: 'value',
        valueKey: 'index',
        value: value,
        subSearch: false,
        events: [{
          change: function (field, value) {
            me.scroll(0, 0);
            me.paging.setPageSize(pageSizeData[value]);
          }
        },{
          render: function (combo) {
            me.store.on('changepages', function () {
              if(me.store.pageSize !== Number(combo.input.dom.value)){
                var index;
                Fancy.each(combo.data, function (item) {
                  if(item.value === me.store.pageSize){
                    index = item.index;
                    return true;
                  }
                });

                if(index !== undefined){
                  combo.setValue(index, false);
                }
                //combo.input.dom.value = me.store.pageSize;
              }
            });
          }
        }]
      });
    }

    bar.push('side');

    bar.push({
      type: 'text',
      role: 'info',
      text: ''
    });

    return bar;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigState: function(config){
    if(config.stateful){
      var log = {};

      if(Fancy.isObject(config.stateful)){
        log = config.stateful;
      }

      config._plugins.push({
        type: 'grid.state',
        stateful: true,
        startState: config.state,
        log: log
      });

      var name = config.stateId || this.getStateName(),
        state = localStorage.getItem(name);

      if(state){
        state = JSON.parse(state);

        var stateColumns = state.columns;

        if(stateColumns){
          stateColumns = JSON.parse(stateColumns);

          Fancy.each(stateColumns, function (stateColumn, i) {
            Fancy.each(stateColumn, function (v, p) {
              config.columns[i][p] = v;
            })
          });
        }
      }
    }
    else if(config.state){
      config._plugins.push({
        type: 'grid.state',
        startState: config.state
      });
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigColumnsResizer: function(config){
    var defaults = config.defaults || {};

    if(defaults.resizable){
      config._plugins.push({
        type: 'grid.columnresizer'
      });

      return config;
    }

    var columns = [].concat(config.columns).concat(config.leftColumns).concat(config.rightColumns);

    Fancy.each(columns, function(column){
      if(column.resizable){
        config._plugins.push({
          type: 'grid.columnresizer'
        });
      }
    });

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigTBar: function(config){
    var me = this,
      tbar = config.tbar;

    if(tbar){
      var i = 0,
        iL = tbar.length;

      for(;i<iL;i++){
        if(tbar[i].type === 'search'){
          config.searching = config.searching || {};
          config.filter = config.filter || true;
        }

        switch(tbar[i].action){
          case 'add':
            if(tbar[i].handler === undefined){
              tbar[i].handler = function(){
                me.insert(0, {});
                me.scroll(0);
              };
            }
            break;
          case 'undo':
            if(tbar[i].handler === undefined){
              tbar[i].handler = function(){
                me.undo();
              };
            }
            break;
          case 'undoall':
            if(tbar[i].handler === undefined){
              tbar[i].handler = function(){
                me.undoAll();
              };
            }
            break;
          case 'redo':
            if(tbar[i].handler === undefined){
              tbar[i].handler = function(){
                me.redo();
              };
            }
            break;
          case 'remove':
            if(tbar[i].handler === undefined){
              tbar[i].disabled = true;
              tbar[i].handler = function(){
                Fancy.each(me.getSelection(), function(item){
                  me.remove(item);
                });

                me.selection.clearSelection();
              };

              tbar[i].events = [{
                render: function(){
                  var me = this;
                  setTimeout(function(){
                    var grid = Fancy.getWidget( me.el.parent().parent().parent().select('.' + Fancy.GRID_CLS).dom.id );

                    grid.on('select', function(){
                      var selection = grid.getSelection();

                      if(selection.length === 0){
                        me.disable();
                      }
                      else{
                        me.enable();
                      }
                    });

                    grid.on('clearselect', function(){
                      me.disable();
                    });
                  }, 10);
                }
              }];
            }
            break;
        }
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigChart: function(config){
    var data = config.data,
      chart = data.chart;

    if(Fancy.isObject(chart)){
      chart = [chart];
    }

    if(data && data.chart){
      config._plugins.push({
        type: 'grid.chartintegration',
        chart: chart,
        toChart: data.items? true: (data.proxy? true: false)
      });

      Fancy.each(chart, function(_chart){
        var type = _chart.type;

        switch(type){
          case 'highchart':
          case 'highcharts':
            config._plugins.push({
              type: 'grid.highchart'
            });
            break;
          case undefined:
            throw new Error('[FancyGrid Error] - type of chart is undefined');
            break;
          default:
            throw new Error('[FancyGrid Error] - type of chart ' + type + ' does not exist');
        }
      });
    }

    return config;
  },
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfigSize: function(config, originalConfig){
    var renderTo = config.renderTo,
      length,
      el,
      isPanel = !!( config.title ||  config.subTitle || config.tbar || config.bbar || config.buttons || config.panel),
      panelBodyBorders = config.panelBodyBorders,
      gridWithoutPanelBorders = config.gridWithoutPanelBorders,
      gridBorders = config.gridBorders;

    if(config.width === undefined){
      if(renderTo){
        config.responsive = true;
        el = Fancy.get(renderTo);
        config.width = parseInt(el.width());

        if(config.width < 1 && el.prop('tagName').toLocaleLowerCase() !== 'body'){
          var bootstrapTab = el.closest('.tab-pane');
          if(bootstrapTab){
            bootstrapTab.css({
              display: 'block',
              visibility: 'hidden'
            });

            config.width = parseInt(el.width());

            bootstrapTab.css({
              display: '',
              visibility: ''
            });
          }
          else {
            config.width = el.parent().width()
          }
        }

        if(config.width === 0){
          config.width = parseInt(el.parent().width());
        }
      }
    }
    else if(config.width === 'fit'){
      var width = 0,
        hasLocked = false;

      this.fitWidth = true;

      Fancy.each(config.columns, function(column){
        if(!column.hidden){
          width += column.width;
        }
        if(column.locked){
          hasLocked = true;
        }
      });

      if(config.title || config.subTitle){
        width += panelBodyBorders[1] + panelBodyBorders[3] + gridBorders[1] + gridBorders[3];
      }
      else{
        width += gridWithoutPanelBorders[1] + gridWithoutPanelBorders[3] + gridBorders[1] + gridBorders[3];
      }

      if(hasLocked){
        width--;
      }

      config.width = width;
    }

    if(config.height === undefined){
      if(renderTo){
        config.responsiveHeight = true;
        var height = parseInt(el.height());
        if(height < 50){
          height = parseInt(el.parent().css('height'));
        }

        config.height = height;
      }
    }
    else if(config.height === 'fit'){
      var length = 0,
        headerRows = 1;

      Fancy.each(config.columns, function(column){
        if(column.grouping){
          if(headerRows < 2){
            headerRows = 2;
          }

          if(column.filter && column.filter.header){
            if(headerRows < 3){
              headerRows = 3;
            }
          }
        }

        if(column.filter && column.filter.header){
          if(headerRows < 2){
            headerRows = 2;
          }
        }
      });

      if(Fancy.isArray(config.data)){
        length = config.data.length;
      }
      else if(config.data && Fancy.isArray(config.data.items)){
        length = config.data.items.length;
      }

      var height = length * config.cellHeight;

      if(config.title){
        height += config.titleHeight;
      }

      if(config.tbar || config.tabs){
        height += config.barHeight;
      }

      if(config.bbar){
        height += config.barHeight;
      }

      if(config.buttons){
        height += config.barHeight;
      }

      if(config.subTBar){
        height += config.barHeight;
      }

      if(config.footer){
        height += config.barHeight;
      }

      if(config.header !== false){
        height += config.cellHeaderHeight * headerRows;
      }

      if( isPanel ){
        height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
      }
      else{
        height += gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2] + gridBorders[0] + gridBorders[2];
      }

      if(config.minHeight && height < config.minHeight){
        height = config.minHeight;
      }

      config.heightFit = true;

      config.height = height;
    }

    return config;
  }
});/*
 * @mixin Fancy.grid.mixin.ActionColumn
 */
Fancy.Mixin('Fancy.grid.mixin.ActionColumn', {
  /*
   *
   */
  initActionColumnHandler: function(){
    var me = this;

    me.on('cellclick', me.onCellClickColumnAction, me);
  },
  /*
   * @param {Object} grid
   * @param {Object} o
   */
  onCellClickColumnAction: function(grid, o){
    var me = this,
      column = o.column,
      activeItem,
      columnItems = column.items,
      item;

    if(column.type !== 'action'){
      return;
    }

    activeItem = me.getActiveActionColumnItem(o);

    if(columnItems && activeItem !== undefined){
      item = columnItems[activeItem];
      if(item.handler){
        item.handler(me, o);
      }
    }
  },
  /*
   * @param {Object} o
   * @return {Number}
   */
  getActiveActionColumnItem: function(o){
    var cell = Fancy.get(o.cell),
      target = o.e.target,
      actionEls = cell.select('.' + Fancy.GRID_COLUMN_ACTION_ITEM_CLS),
      i = 0,
      iL = actionEls.length;

    for(;i<iL;i++){
      if(actionEls.item(i).within(target)){
        return i;
      }
    }
  }
});/*
 * @mixin Fancy.grid.mixin.Grid
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var TOUCH_CLS = F.TOUCH_CLS;
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_CLS = F.GRID_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;
  var GRID_LEFT_CLS = F.GRID_LEFT_CLS;
  var GRID_RIGHT_CLS = F.GRID_RIGHT_CLS;
  var GRID_HEADER_CLS = F.GRID_HEADER_CLS;
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var PANEL_BODY_INNER_CLS =  F.PANEL_BODY_INNER_CLS;
  var GRID_UNSELECTABLE_CLS = F.GRID_UNSELECTABLE_CLS;
  var GRID_LEFT_EMPTY_CLS = F.GRID_LEFT_EMPTY_CLS;
  var GRID_RIGHT_EMPTY_CLS = F.GRID_RIGHT_EMPTY_CLS;
  var GRID_COLUMN_SORT_ASC_CLS = F.GRID_COLUMN_SORT_ASC;
  var GRID_COLUMN_SORT_DESC_CLS = F.GRID_COLUMN_SORT_DESC;

  var PANEL_CLS = F.PANEL_CLS;
  var PANEL_TBAR_CLS = F.PANEL_TBAR_CLS;
  var PANEL_SUB_TBAR_CLS = F.PANEL_SUB_TBAR_CLS;
  var PANEL_BBAR_CLS = F.PANEL_BBAR_CLS;
  var PANEL_BUTTONS_CLS = F.PANEL_BUTTONS_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  var activeGrid;

  F.Mixin('Fancy.grid.mixin.Grid', {
    tabScrollStep: 50,
    tpl: [
      '<div class="' + GRID_LEFT_CLS + ' ' + GRID_LEFT_EMPTY_CLS + '"></div>',
      '<div class="' + GRID_CENTER_CLS + '"></div>',
      '<div class="' + GRID_RIGHT_CLS + ' '+GRID_RIGHT_EMPTY_CLS+'"></div>',
      '<div class="fancy-grid-editors"></div>'
    ],
    /*
     *
     */
    initStore: function () {
      var me = this,
        fields = me.getFieldsFromData(me.data),
        modelName = 'Fancy.model.' + F.id(),
        data = me.data,
        remoteSort,
        remoteFilter,
        pageType,
        collapsed = false,
        state = me.state;

      if (me.data.items) {
        data = me.data.items;
      }

      remoteSort = me.data.remoteSort;
      remoteFilter = me.data.remoteFilter;
      pageType = me.data.remotePage;

      if(pageType) {
        pageType = 'server';
      }

      F.define(modelName, {
        extend: F.Model,
        fields: fields
      });

      if (me.grouping && me.grouping.collapsed !== undefined) {
        collapsed = me.grouping.collapsed;
      }

      var storeConfig = {
        widget: me,
        model: modelName,
        data: data,
        paging: me.paging,
        remoteSort: remoteSort,
        remoteFilter: remoteFilter,
        pageType: pageType,
        collapsed: collapsed,
        multiSort: me.multiSort
      };

      if(me.multiSortLimit){
        storeConfig.multiSortLimit = me.multiSortLimit;
      }

      if (state) {
        if (state.filters) {
          storeConfig.filters = state.filters;
        }
      }

      if (data.pageSize) {
        storeConfig.pageSize = data.pageSize;
      }

      me.store = new F.Store(storeConfig);

      me.model = modelName;
      me.fields = fields;

      if (me.store.filters) {
        setTimeout(function () {
          me.filter.filters = me.store.filters;
          me.filter.updateStoreFilters();
        }, 1);
      }
    },
    /*
     *
     */
    initTouch: function () {
      var me = this;

      if (F.isTouch && window.FastClick) {
        if (me.panel) {
          FastClick.attach(me.panel.el.dom);
          me.panel.addCls(TOUCH_CLS);
        }
        else {
          FastClick.attach(me.el.dom);
          me.addCls(TOUCH_CLS);
        }
      }
    },
    /*
     *
     */
    initElements: function () {
      var me = this;

      if (me.header !== false) {

        me.leftHeader = new F.grid.Header({
          widget: me,
          side: 'left'
        });

        me.header = new F.grid.Header({
          widget: me,
          side: 'center'
        });

        me.rightHeader = new F.grid.Header({
          widget: me,
          side: 'right'
        });
      }

      me.leftBody = new F.grid.Body({
        widget: me,
        side: 'left'
      });

      me.body = new F.grid.Body({
        widget: me,
        side: 'center'
      });

      me.rightBody = new F.grid.Body({
        widget: me,
        side: 'right'
      });

      me.leftEl = me.el.select('.' + GRID_LEFT_CLS);
      me.centerEl = me.el.select('.' + GRID_CENTER_CLS);
      me.rightEl = me.el.select('.' + GRID_RIGHT_CLS);
    },
    /*
     * @param {Array} data
     * @return {Array}
     */
    getFieldsFromData: function (data) {
      var me = this,
        items = data.items || data;

      if (data.fields) {
        if(me.isTreeData){
          data.fields.push('$deep');
          data.fields.push('leaf');
          data.fields.push('parentId');
          data.fields.push('expanded');
          data.fields.push('child');
          data.fields.push('filteredChild');
        }

        return data.fields;
      }

      if (!items) {
        throw new Error('FancyGrid Error 4: Data is empty and not set fields of data to build model');
      }

      var itemZero = items[0],
        fields = [];

      for (var p in itemZero) {
        fields.push(p);
      }

      if(me.isTreeData){
        fields.push('$deep');
        fields.push('leaf');
        fields.push('parentId');
        fields.push('expanded');
        fields.push('child');
      }

      return fields;
    },
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = Fancy.get(me.renderTo || document.body),
        el = F.get(document.createElement('div')),
        panelBodyBorders = me.panelBodyBorders;

      if(me.renderOuter){
        el = renderTo;
      }

      if(!renderTo.dom){
        throw new Error('[FancyGrid Error 1] - Could not find renderTo element: ' + me.renderTo);
      }

      el.addCls(
        F.cls,
        me.widgetCls,
        me.cls
      );

      el.attr('id', me.id);

      if (me.panel === undefined && me.shadow) {
        el.addCls('fancy-panel-shadow');
      }

      if (me.columnLines === false) {
        el.addCls('fancy-grid-disable-column-lines');
      }

      if (me.rowLines === false) {
        el.addCls('fancy-grid-disable-row-lines');
      }

      if (me.theme !== 'default' && !me.panel) {
        el.addCls('fancy-theme-' + me.theme);
      }

      var panelBordersWidth = 0,
        panelBorderHeight = 0;

      if (me.panel) {
        panelBordersWidth = panelBodyBorders[1] + panelBodyBorders[3];
      }

      el.css({
        width: (me.width - panelBordersWidth) + 'px',
        height: (me.height - panelBorderHeight) + 'px'
      });

      me.initTpl();
      el.update(me.tpl.getHTML({}));

      if(me.renderOuter){
        me.el = el;
      }
      else {
        me.el = F.get(renderTo.dom.appendChild(el.dom));
      }

      me.setHardBordersWidth();

      me.rendered = true;
    },
    /*
     *
     */
    setHardBordersWidth: function () {
      var me = this,
        borders = me.panel ? me.gridBorders : me.gridWithoutPanelBorders;

      if (me.wrapped) {
        borders = me.gridBorders;
      }

      me.css({
        'border-top-width': borders[0],
        'border-right-width': borders[1],
        'border-bottom-width': borders[2],
        'border-left-width': borders[3]
      })
    },
    /*
     *
     */
    update: function () {
      var me = this,
        s = me.store;

      if (s.loading) {
        return;
      }

      if(me.expander){
        me.expander.reSet();
      }

      me.updater.update();
      me.fire('update');

      if (me.heightFit) {
        me.fitHeight();
      }

      me.setBodysHeight();

      if(me.paging){
        me.paging.update();
      }

      me.scroller.update();
    },
    /*
     * @param {String} side
     * @return {Number}
     */
    getColumnsWidth: function (side) {
      var me = this;

      switch (side) {
        case 'center':
        case undefined:
          return me.getCenterFullWidth();
        case 'left':
          return me.getLeftFullWidth();
        case 'right':
          return me.getRightFullWidth();
      }
    },
    /*
     *
     */
    setSides: function () {
      var me = this,
        leftColumns = me.leftColumns,
        rightColumns = me.rightColumns,
        leftWidth = me.getLeftFullWidth(),
        centerWidth = me.getCenterFullWidth(),
        rightWidth = me.getRightFullWidth(),
        gridBorders = me.gridBorders,
        panelBodyBorders = me.panelBodyBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders;

      if (leftColumns.length > 0) {
        me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
      }

      if (rightColumns.length > 0) {
        me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
      }

      if (me.wrapped) {
        centerWidth = me.width - gridBorders[1] - gridBorders[3];
      }
      else if (me.panel) {
        centerWidth = me.width - gridBorders[1] - gridBorders[3] - panelBodyBorders[1] - panelBodyBorders[3];
      }
      else {
        centerWidth = me.width - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];
      }

      if (leftWidth === 0 && rightWidth === 0) {
      }
      else if (rightWidth === 0) {
        centerWidth -= leftWidth;
      }
      else if (leftWidth === 0) {
        centerWidth -= rightWidth;
      }
      else if (me.width > leftWidth + centerWidth + rightWidth) {
        centerWidth -= leftWidth;
      }
      else {
        centerWidth -= leftWidth + rightWidth;
      }

      me.leftEl.css({
        width: leftWidth + 'px'
      });

      me.centerEl.css({
        left: leftWidth + 'px',
        width: centerWidth + 'px'
      });

      if (me.header) {
        me.el.select('.' + GRID_LEFT_CLS + ' .' + GRID_HEADER_CLS).css({
          width: leftWidth + 'px'
        });

        me.el.select('.' + GRID_CENTER_CLS + ' .' + GRID_HEADER_CLS).css({
          width: centerWidth + 'px'
        });
      }

      me.el.select('.' + GRID_CENTER_CLS + ' .' + GRID_BODY_CLS).css({
        width: centerWidth + 'px'
      });

      if (me.width > leftWidth + centerWidth + rightWidth) {
        me.rightEl.css({
          right: '0px'
        });
      }
      else {
        me.rightEl.css({
          left: '',
          right: '0px'
        });
      }

      me.rightEl.css({
        width: rightWidth
      });

      if (me.header) {
        me.el.select('.' + GRID_RIGHT_CLS + ' .' + GRID_HEADER_CLS).css({
          width: rightWidth + 'px'
        });
      }

      me.startWidths = {
        center: centerWidth,
        left: leftWidth,
        right: rightWidth
      };
    },
    /*
     *
     */
    setColumnsPosition: function () {
      var me = this;

      me.body.setColumnsPosition();
      me.leftBody.setColumnsPosition();
      me.rightBody.setColumnsPosition();
    },
    /*
     * @param {Number} [viewHeight]
     */
    setSidesHeight: function (viewHeight) {
      var me = this,
        s = me.store,
        height = 1,
        cellHeaderHeight = me.cellHeaderHeight;

      if (me.header !== false) {
        height += cellHeaderHeight;
        if (me.filter && me.filter.header) {
          if (me.groupheader) {
            if (me.filter.groupHeader) {
              height += cellHeaderHeight;
            }
          }
          else {
            height += cellHeaderHeight;
          }
        }

        if (me.groupheader) {
          if (!(me.filter && me.filter.header)) {
            height += cellHeaderHeight;
          }
          else {
            height += cellHeaderHeight;
          }
        }
      }

      if (me.grouping) {
        height += me.grouping.groups.length * me.groupRowHeight;
      }

      if (me.expander) {
        height += me.expander.plusHeight;
      }

      if (me.summary) {
        height += me.summary.topOffSet;
      }

      if(me.rowheight && me.rowheight.totalHeight){
        viewHeight = me.rowheight.totalHeight;
      }

      height += viewHeight || (s.getLength() * me.cellHeight - 1);

      if (me.paging && me.summary && me.summary.position === 'bottom') {
        height = me.height;
      }

      me.leftEl.css({
        height: height + 'px'
      });

      me.centerEl.css({
        height: height + 'px'
      });

      me.rightEl.css({
        height: height + 'px'
      });
    },
    /*
     *
     */
    setBodysHeight: function () {
      var me = this;

      me.body.setHeight();
      me.leftBody.setHeight();
      me.rightBody.setHeight();
    },
    /*
     *
     */
    preRender: function () {
      var me = this;

      if (me.title || me.subTitle || me.tbar || me.bbar || me.buttons || me.panel) {
        me.renderPanel();
      }
    },
    /*
     *
     */
    renderPanel: function () {
      var me = this,
        panelConfig = {
          renderTo: me.renderTo,
          renderOuter: me.renderOuter,
          title: me.title,
          subTitle: me.subTitle,
          width: me.width,
          height: me.height,
          titleHeight: me.titleHeight,
          subTitleHeight: me.subTitleHeight,
          barHeight: me.barHeight,
          theme: me.theme,
          shadow: me.shadow,
          style: me.style || {},
          window: me.window,
          modal: me.modal,
          frame: me.frame,
          items: [me],
          draggable: me.draggable,
          resizable: me.resizable,
          minWidth: me.minWidth,
          minHeight: me.minHeight,
          panelBodyBorders: me.panelBodyBorders,
          barContainer: me.barContainer,
          barScrollEnabled: me.barScrollEnabled,
          tabScrollStep: me.tabScrollStep
        },
        panelBodyBorders = me.panelBodyBorders;

      if (me.bbar) {
        panelConfig.bbar = me.bbar;
        me.height -= me.barHeight;
      }

      if (me.tbar) {
        panelConfig.tbar = me.tbar;
        me.height -= me.barHeight;
      }

      if (me.subTBar) {
        panelConfig.subTBar = me.subTBar;
        me.height -= me.barHeight;
      }

      if (me.buttons) {
        panelConfig.buttons = me.buttons;
        me.height -= me.barHeight;
      }

      if (me.footer) {
        panelConfig.footer = me.footer;
        me.height -= me.barHeight;
      }

      me.panel = new F.Panel(panelConfig);

      me.bbar = me.panel.bbar;
      me.tbar = me.panel.tbar;
      me.subTBar = me.panel.subTBar;
      me.buttons = me.panel.buttons;

      if (!me.wrapped) {
        me.panel.addCls('fancy-panel-grid-inside');
      }

      if (me.title) {
        me.height -= me.titleHeight;
      }

      if (me.subTitle) {
        me.height -= me.subTitleHeight;
        me.height += panelBodyBorders[2];
      }

      me.height -= panelBodyBorders[0] + panelBodyBorders[2];

      me.renderTo = me.panel.el.select('.' + PANEL_BODY_INNER_CLS).dom;
    },
    /*
     * @return {Number}
     */
    getBodyHeight: function () {
      var me = this,
        height = me.height,
        rows = 1,
        gridBorders = me.gridBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders;

      if (me.groupheader) {
        rows = 2;
      }

      if (me.filter && me.filter.header) {
        if (me.groupheader) {
          if (me.filter.groupHeader) {
            rows++;
          }
        }
        else {
          rows++;
        }
      }

      if (me.header !== false) {
        height -= me.cellHeaderHeight * rows;
      }

      if (me.panel) {
        height -= gridBorders[0] + gridBorders[2];
      }
      else {
        height -= gridWithoutPanelBorders[0] + gridWithoutPanelBorders[2];
      }

      if (me.summary) {
        height -= me.summary.topOffSet;
        height -= me.summary.bottomOffSet;
      }

      return height;
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        store = me.store,
        docEl = F.get(document);

      store.on('change', me.onChangeStore, me);
      store.on('set', me.onSetStore, me);
      store.on('insert', me.onInsertStore, me);
      store.on('remove', me.onRemoveStore, me);
      store.on('beforesort', me.onBeforeSortStore, me);
      store.on('sort', me.onSortStore, me);
      store.on('beforeload', me.onBeforeLoadStore, me);
      store.on('load', me.onLoadStore, me);
      docEl.on('mouseup', me.onDocMouseUp, me);
      docEl.on('click', me.onDocClick, me);
      docEl.on('mousemove', me.onDocMove, me);
      store.on('servererror', me.onServerError, me);
      store.on('serversuccess', me.onServerSuccess, me);

      if (me.responsive) {
        F.$(window).bind('resize', function () {
          me.onWindowResize();

          if(me.intWindowResize){
            clearInterval(me.intWindowResize);
          }

          me.intWindowResize = setTimeout(function(){
            me.onWindowResize();
            delete me.intWindowResize;

            //Bug fix for Mac
            setTimeout(function () {
              me.onWindowResize();
            }, 300);
          }, 30);
        });
      }

      me.on('activate', me.onActivate, me);
      me.on('deactivate', me.onDeActivate, me);
    },
    /*
     * @param {Object} grid
     * @param {String} errorTitle
     * @param {String} errorText
     * @param {Object} request
     */
    onServerError: function (grid, errorTitle, errorText, request) {
      this.fire('servererror', errorTitle, errorText, request);
    },
    /*
     * @param {Object} grid
     * @param {Array} data
     * @param {Object} request
     */
    onServerSuccess: function (grid, data, request) {
      this.fire('serversuccess', data, request);
    },
    /*
     *
     */
    onChangeStore: function () {
      this.update();
    },
    /*
     * @param {Object} store
     */
    onBeforeLoadStore: function (store) {
      this.fire('beforeload');
    },
    /*
     * @param {Object} store
     * @param {String} id
     * @param {Fancy.Model} record
     */
    onRemoveStore: function (store, id, record) {
      var me = this;

      me.fire('remove', id, record);
    },
    /*
     * @param {Object} store
     * @param {Fancy.Model} record
     */
    onInsertStore: function (store, record) {
      var me = this;

      me.fire('insert', record);
    },
    /*
     * @param {Object} store
     */
    onLoadStore: function (store) {
      var me = this;

      setTimeout(function () {
        me.fire('load');
      }, 1);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onSetStore: function (store, o) {
      var me = this;

      me.fire('set', o);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onBeforeSortStore: function (store, o) {
      this.fire('beforesort', o);
    },
    /*
     * @param {Object} store
     * @param {Object} o
     */
    onSortStore: function (store, o) {
      this.fire('sort', o);
    },
    /*
     * @return {Number}
     */
    getCellsViewHeight: function () {
      var me = this,
        s = me.store,
        plusScroll = 0,
        scrollBottomHeight = 0;

      if (me.grouping) {
        plusScroll += me.grouping.plusScroll;
      }

      if (me.expander) {
        plusScroll += me.expander.plusScroll;
      }

      if (!me.scroller.scrollBottomEl || me.scroller.scrollBottomEl.hasCls(HIDDEN_CLS)) {
      }
      else {
        scrollBottomHeight = me.scroller.cornerSize;
      }

      return (me.cellHeight) * s.dataView.length + scrollBottomHeight + plusScroll;
    },
    /*
     * @param {Object} e
     */
    onDocMouseUp: function (e) {
      this.fire('docmouseup');
    },
    /*
     * @param {Object} e
     */
    onDocClick: function (e) {
      this.fire('docclick', e);
    },
    /*
     * @param {Object} e
     */
    onDocMove: function (e) {
      this.fire('docmove', e);
    },
    /*
     * @return {Number}
     */
    getCenterViewWidth: function () {
      //Realization could be reason of bug
      var me = this,
        elWidth = me.centerEl.width();

      if (elWidth === 0) {
        var columnsWidth = 0,
          columns = me.columns,
          i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];
          if (!column.hidden) {
            columnsWidth += column.width;
          }
        }

        return columnsWidth;
      }

      return elWidth;
    },
    /*
     * @return {Number}
     */
    getCenterFullWidth: function () {
      var me = this,
        centerColumnsWidths = 0,
        columns = me.columns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          centerColumnsWidths += column.width;
        }
      }

      return centerColumnsWidths;
    },
    /*
     * @return {Number}
     */
    getLeftFullWidth: function () {
      var me = this,
        width = 0,
        columns = me.leftColumns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          width += column.width;
        }
      }

      return width;
    },
    /*
     * @return {Number}
     */
    getRightFullWidth: function () {
      var me = this,
        width = 0,
        columns = me.rightColumns,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];
        if (!column.hidden) {
          width += column.width;
        }
      }

      return width;
    },
    /*
     * @param {String} side
     * @return {Array}
     */
    getColumns: function (side) {
      var me = this,
        columns;

      switch (side) {
        case 'left':
          columns = me.leftColumns;
          break;
        case 'center':
          columns = me.columns;
          break;
        case 'right':
          columns = me.rightColumns;
          break;
      }

      return columns;
    },
    /*
     * @param {Array} columns
     * @param {String} side
     */
    setColumns: function(columns, side){
      var me = this;

      switch(side){
        case 'left':
          me.leftColumns = columns;
          break;
        case 'center':
        case undefined:
          me.columns = columns;
          break;
        case 'right':
          me.rightColumns = columns;
          break;
      }
    },
    /*
     * @param {String} side
     * @return {Fancy.grid.Body}
     */
    getBody: function (side) {
      var me = this,
        body;

      switch (side) {
        case 'left':
          body = me.leftBody;
          break;
        case 'center':
          body = me.body;
          break;
        case 'right':
          body = me.rightBody;
          break;
      }

      return body;
    },
    /*
     * @param {String} side
     * @return {Fancy.grid.Header}
     */
    getHeader: function (side) {
      var me = this,
        header;

      switch (side) {
        case 'left':
          header = me.leftHeader;
          break;
        case 'center':
          header = me.header;
          break;
        case 'right':
          header = me.rightHeader;
          break;
      }

      return header;
    },
    /*
     * @param {String|Number} index
     * @param {String} [side]
     * @return {Fancy.Element}
     */
    getHeaderCell: function(index, side){
      var me = this,
        cell,
        header;

      if(F.isString(index)){
        var o = me.getColumnOrderByKey(index);

        header = me.getHeader(o.side);
        cell = header.getCell(o.order);
      }
      else{
        side = side || 'center';
        header = me.getHeader(side);
        cell = header.getCell(index);
      }

      return cell;
    },
    /*
     * @param {Number} rowIndex
     * @return {Array}
     */
    getDomRow: function (rowIndex) {
      var me = this,
        leftBody = me.leftBody,
        body = me.body,
        rightBody = me.rightBody,
        leftColumns = me.leftColumns,
        columns = me.columns,
        rightColumns = me.rightColumns,
        i = 0,
        iL = leftColumns.length,
        cells = [];

      for (; i < iL; i++) {
        cells.push(leftBody.getDomCell(rowIndex, i));
      }

      i = 0;
      iL = columns.length;
      for (; i < iL; i++) {
        cells.push(body.getDomCell(rowIndex, i));
      }

      i = 0;
      iL = rightColumns.length;
      for (; i < iL; i++) {
        cells.push(rightBody.getDomCell(rowIndex, i));
      }

      return cells;
    },
    /*
     *
     */
    initTextSelection: function () {
      var me = this,
        body = me.body,
        leftBody = me.leftBody,
        rightBody = me.rightBody;

      if (me.textSelection === false) {
        me.addCls(GRID_UNSELECTABLE_CLS);

        var fn = function (e) {
          var targetEl = F.get(e.target);
          if (targetEl.hasCls('fancy-field-text-input') || targetEl.hasCls('fancy-textarea-text-input')) {
            return;
          }

          e.preventDefault();
        };

        body.el.on('mousedown', fn);
        leftBody.el.on('mousedown', fn);
        rightBody.el.on('mousedown', fn);
      }
    },
    /*
     * @param {String} type
     * @param {*} value
     */
    setTrackOver: function (type, value) {
      var me = this;

      switch (type) {
        case 'cell':
          me.cellTrackOver = value;
          break;
        case 'column':
          me.columnTrackOver = value;
          break;
        case 'row':
          me.trackOver = value;
          break;
      }
    },
    /*
     * @param {String} type
     */
    setSelModel: function (type) {
      var me = this,
        selection = me.selection;

      selection.cell = false;
      selection.cells = false;
      selection.row = false;
      selection.rows = false;
      selection.column = false;
      selection.columns = false;
      selection[type] = true;

      selection.selModel = type;

      if (type === 'rows') {
        me.multiSelect = true;
      }
      else {
        me.multiSelect = false;
      }

      selection.clearSelection();
    },
    /*
     * @param {Boolean} [returnModel]
     * @return {Array}
     */
    getSelection: function (returnModel) {
      var me = this;

      return me.selection.getSelection(returnModel);
    },
    /*
     *
     */
    clearSelection: function () {
      var me = this,
        selection = me.selection;

      selection.clearSelection();
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        s = me.store,
        docEl = F.get(document);

      docEl.un('mouseup', me.onDocMouseUp, me);
      docEl.un('click', me.onDocClick, me);
      docEl.un('mousemove', me.onDocMove, me);

      me.body.destroy();
      me.leftBody.destroy();
      me.rightBody.destroy();

      me.header.destroy();
      me.leftHeader.destroy();
      me.rightHeader.destroy();

      me.scroller.destroy();

      me.el.destroy();

      if (me.panel) {
        me.panel.el.destroy();
      }

      s.destroy();
    },
    clearData: function(){
      var me = this;

      me.setData([]);
      me.update();
      me.scroller.update();
    },
    /*
     *
     */
    showAt: function () {
      var me = this;

      if (me.panel) {
        me.panel.showAt.apply(me.panel, arguments);
      }
    },
    /*
     *
     */
    show: function () {
      var me = this;

      setTimeout(function () {
        if (me.panel) {
          me.panel.show.apply(me.panel, arguments);
        }
        else {
          me.el.show();
        }
      }, 30);
    },
    /*
     *
     */
    hide: function () {
      var me = this;

      if (me.panel) {
        me.panel.hide.apply(me.panel, arguments);
      }
      else {
        me.el.hide();
      }

      if(me.celledit){
        var editor = me.celledit.activeEditor;

        if(editor){
          editor.hide();
        }
      }
    },
    /*
     *
     */
    initDateColumn: function () {
      var me = this;

      var prepareColumns = function (columns) {
        var i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];

          if (column.type === 'date') {
            column.format = column.format || {};

            var format = {
              type: 'date'
            };

            F.applyIf(format, me.lang.date);

            F.applyIf(column.format, format);
          }
        }

        return columns;
      };

      me.columns = prepareColumns(me.columns);
      me.leftColumns = prepareColumns(me.leftColumns);
      me.rightColumns = prepareColumns(me.rightColumns);
    },
    /*
     *
     */
    stopEditor: function () {
      var me = this;

      me.edit.stopEditor();
    },
    /*
     * @param {String} id
     * @return {Fancy.Model}
     */
    getById: function (id) {
      var me = this;

      return me.store.getById(id);
    },
    /*
     * @param {Number} rowIndex
     * @param {String} key
     * @return {Fancy.Model}
     */
    get: function (rowIndex, key) {
      var me = this,
        store = me.store;

      if (key !== undefined) {
        return store.get(rowIndex, key);
      }
      else if (rowIndex === undefined) {
        return store.get();
      }

      return store.getItem(rowIndex);
    },
    /*
     * @param {Number} id
     * @return {Number}
     */
    getRowById: function (id) {
      return this.store.getRow(id);
    },
    /*
     * @return {Number}
     */
    getTotal: function () {
      return this.store.getTotal();
    },
    /*
     * @return {Number}
     */
    getViewTotal: function () {
      return this.store.getLength();
    },
    /*
     * @return {Array}
     */
    getDataView: function () {
      return this.store.getDataView();
    },
    /*
     * @return {Array}
     */
    getData: function () {
      return this.store.getData();
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectRow: function (rowIndex, value, multi) {
      this.selection.selectRow(rowIndex, value, multi);
      this.activated = true;
    },
    /*
     * @param {Number} rowIndex
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    deSelectRow: function (rowIndex) {
      this.selection.selectRow(rowIndex, false, true);
      this.activated = true;
    },
    /*
     * @param {Number|String} id
     * @param {Boolean} [value]
     * @param {Boolean} [multi]
     */
    selectById: function (rowIndex, value, multi) {
      this.selection.selectById(rowIndex, value, multi);
    },
    /*
     * @param {String} key
     */
    selectColumn: function (key) {
      var me = this,
        side,
        columnIndex,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [];

      var isInSide = function (columns) {
        var i = 0,
          iL = columns.length;

        for (; i < iL; i++) {
          var column = columns[i];
          if (column.index === key) {
            columnIndex = i;
            return true;
          }
        }

        return false;
      };

      if (isInSide(leftColumns)) {
        side = 'left';
      }
      else if (isInSide(columns)) {
        side = 'center';
      }
      else if (isInSide(rightColumns)) {
        side = 'right';
      }

      if (side) {
        me.selection.selectColumn(columnIndex, side);
      }
    },
    /*
     * @param {String} key
     * @return {Object}
     */
    getColumnByIndex: function (key) {
      var me = this,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [],
        _columns = leftColumns.concat(columns).concat(rightColumns),
        i = 0,
        iL = _columns.length;

      for (; i < iL; i++) {
        var column = _columns[i];
        if (column.index === key) {
          return column;
        }
      }
    },
    /*
     * @param {String} key
     * @return {Object}
     */
    getColumnOrderByKey: function (key) {
      var me = this,
        leftColumns = me.leftColumns || [],
        columns = me.columns || [],
        rightColumns = me.rightColumns || [],
        side = '',
        order;

      F.each(columns, function (column, i) {
        if(column.index === key){
          side = 'center';
          order = i;
        }
      });

      if(!side){
        F.each(leftColumns, function (column, i) {
          if(column.index === key){
            side = 'left';
            order = i;
          }
        });

        if(!side){
          F.each(rightColumns, function (column, i) {
            if(column.index === key){
              side = 'right';
              order = i;
            }
          });
        }
      }

      return {
        side: side,
        order: order
      }
    },
    /*
     *
     */
    load: function () {
      var me = this;

      me.store.loadData();
    },
    /*
     *
     */
    save: function () {
      var me = this;

      me.store.save();
    },
    /*
     *
     */
    onWindowResize: function () {
      var me = this,
        renderTo = me.renderTo,
        el;

      if (me.panel) {
        renderTo = me.panel.renderTo;
      }

      if(me.responsive) {
        el = F.get(renderTo);
      }
      else if(me.panel){
        el = me.panel.el;
      }
      else{
        el = F.get(renderTo);
      }

      if(el.hasClass(PANEL_CLS) || el.hasClass(GRID_CLS)){
        el = el.parent();
      }

      var newWidth = el.width();

      if(el.dom === undefined){
        return;
      }

      if(newWidth === 0){
        newWidth = el.parent().width();
      }

      if(me.responsive) {
        me.setWidth(newWidth);
      }
      else if(me.fitWidth){
        //me.setWidthFit();
      }

      if(me.responsiveHeight){
        var height = parseInt(el.height());

        if(height === 0){
          height = parseInt(el.parent().height());
        }

        me.setHeight(height);
      }

      me.setBodysHeight();
      me.updateColumnsWidth();

      me.scroller.scrollDelta(0);
      me.scroller.update();
    },
    updateColumnsWidth: function () {
      var me = this;

      var fn = function (columns, header, side) {
        Fancy.each(columns, function (column, i) {
          if(column.hidden){
            return;
          }

          if(column.flex){
            var cell = header.getCell(i);

            me.fire('columnresize', {
              cell: cell.dom,
              width: column.width,
              column: column,
              side: side
            });
          }
        });
      };

      fn(me.columns, me.header, 'center');
      fn(me.leftColumns, me.leftHeader, 'left');
      fn(me.rightColumns, me.rightHeader, 'right');
    },
    /*
     * @param {Number} width
     */
    setWidth: function (width) {
      var me = this,
        el = me.el,
        gridBorders = me.gridBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders,
        panelBodyBorders = me.panelBodyBorders,
        body = me.body,
        header = me.header;

      //me.scroller.scroll(0, 0);

      var calcColumnsWidth = function (columns) {
        var i = 0,
          iL = columns.length,
          width = 0;

        for (; i < iL; i++) {
          var column = columns[i];

          if (!column.hidden) {
            width += columns[i].width;
          }
        }

        return width;
      };

      var leftColumnWidth = calcColumnsWidth(me.leftColumns),
        rightColumnWidth = calcColumnsWidth(me.rightColumns),
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3],
        gridWidth;

      if (me.wrapped) {
        gridWidth = width;
        newCenterWidth = width - leftColumnWidth - rightColumnWidth;

        newCenterWidth -= gridBorders[1] + gridBorders[3];

        me.css({
          width: gridWidth
        });
      }
      else if (me.panel) {
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - panelBodyBorders[1] - panelBodyBorders[3];
        me.panel.el.width(width);

        newCenterWidth -= gridBorders[1] + gridBorders[3];

        gridWidth = width - panelBodyBorders[1] - panelBodyBorders[3];

        me.css({
          width: gridWidth
        });
      }
      else {
        newCenterWidth = width - leftColumnWidth - rightColumnWidth - gridWithoutPanelBorders[1] - gridWithoutPanelBorders[3];

        el.css('width', width);
      }

      if (newCenterWidth < 100) {
        newCenterWidth = 100;
      }

      el.select('.' + GRID_CENTER_CLS).css('width', newCenterWidth);

      header.css('width', newCenterWidth);
      body.css('width', newCenterWidth);

      if (me.hasFlexColumns) {
        me.reCalcColumnsWidth();
        me.columnresizer.updateColumnsWidth();
      }

      me.scroller.setScrollBars();
    },
    /*
     * @return {Number}
     */
    getWidth: function () {
      var me = this,
        value;

      if (me.panel) {
        value = parseInt(me.panel.css('width'));
      }
      else {
        value = parseInt(me.css('width'));
      }

      return value;
    },
    /*
     * @return {Number}
     */
    getHeight: function () {
      var me = this,
        value;

      if (me.panel) {
        value = parseInt(me.panel.css('height'));
      }
      else {
        value = parseInt(me.css('height'));
      }

      return value;
    },
    /*
     * @param {Number} value
     * @param {Number} changePanelHeight
     */
    setHeight: function (value, changePanelHeight) {
      var me = this,
        gridBorders = me.gridBorders,
        panelBodyBorders = me.panelBodyBorders;

      if (me.panel && changePanelHeight !== false) {
        me.panel.setHeight(value);
      }

      if (me.title) {
        value -= me.titleHeight;
      }

      if (me.subTitle) {
        value -= me.subTitleHeight;
      }

      if (me.footer) {
        value -= me.barHeight;
      }

      if (me.bbar) {
        value -= me.barHeight;
      }

      if (me.tbar) {
        value -= me.barHeight;
      }

      if (me.subTBar) {
        value -= me.barHeight;
      }

      if (me.buttons) {
        value -= me.barHeight;
      }

      var bodyHeight = value;

      if (me.header) {
        bodyHeight -= me.cellHeaderHeight;
        if (me.groupheader) {
          bodyHeight -= me.cellHeaderHeight;
        }
      }

      if (me.panel) {
        bodyHeight -= panelBodyBorders[0] + panelBodyBorders[2];
      }

      bodyHeight -= gridBorders[0] + gridBorders[2];

      if (me.body) {
        me.body.css('height', bodyHeight);
      }

      if (me.leftBody) {
        me.leftBody.css('height', bodyHeight);
      }

      if (me.rightBody) {
        me.rightBody.css('height', bodyHeight);
      }

      me.el.css('height', value);
      me.height = value;

      me.scroller.update();
    },
    /*
     * @param {String} key
     * @param {*} value
     * @param {Boolean} complex
     * @return {Array}
     */
    find: function (key, value, complex) {
      return this.store.find(key, value, complex);
    },
    /*
     * @param {String} key
     * @param {*} value
     * @return {Array}
     */
    findItem: function (key, value) {
      return this.store.findItem(key, value);
    },
    /*
     * @param {Function} fn
     * @param {Object} scope
     */
    each: function (fn, scope) {
      this.store.each(fn, scope);
    },
    /*
     *
     */
    onActivate: function () {
      var me = this,
        doc = F.get(document);

      if(activeGrid && activeGrid.id !== me.id){
        activeGrid.fire('deactivate');
      }

      setTimeout(function () {
        doc.on('click', me.onDeactivateClick, me);
      }, 100);

      activeGrid = me;
    },
    /*
     *
     */
    onDeActivate: function () {
      var me = this,
        doc = F.get(document);

      me.activated = false;
      doc.un('click', me.onDeactivateClick, me);
    },
    /*
     * @param {Object} e
     */
    onDeactivateClick: function (e) {
      var me = this,
        i = 0,
        iL = 20,
        parent = F.get(e.target);

      for (; i < iL; i++) {
        if (!parent.dom) {
          return;
        }

        if (!parent.dom.tagName || parent.dom.tagName.toLocaleLowerCase() === 'body') {
          me.fire('deactivate');
          return;
        }

        if (parent.hasCls === undefined) {
          me.fire('deactivate');
          return;
        }

        if (parent.hasCls(me.widgetCls)) {
          return;
        }

        parent = parent.parent();
      }
    },
    /*
     * @param {Array} keys
     * @param {Array} values
     */
    search: function (keys, values) {
      var me = this;

      me.searching.search(keys, values);
    },
    /*
     *
     */
    stopSelection: function () {
      var me = this;

      if (me.selection) {
        me.selection.stopSelection();
      }
    },
    /*
     * @param {Boolean} value
     */
    enableSelection: function (value) {
      var me = this;

      if (me.selection) {
        me.selection.enableSelection(value);
      }
    },
    /*
     * @param {String|Number} side
     * @param {String|Number} [index]
     */
    hideColumn: function (side, index) {
      if(index === undefined){
        index = side;
        side = 'center';
      }

      var me = this,
        body = me.getBody(side),
        header = me.getHeader(side),
        columns = me.getColumns(side),
        orderIndex,
        i = 0,
        iL = columns.length,
        column,
        centerEl = me.centerEl,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        rightEl = me.rightEl,
        rightHeader = me.rightHeader;

      if(F.isNumber(index)){
        column = columns[index];

        if(column.hidden){
          return;
        }

        orderIndex = index;
        column.hidden = true;
      }
      else {
        for (; i < iL; i++) {
          column = columns[i];

          if (column.index === index) {
            if(column.hidden){
              return;
            }

            orderIndex = i;
            column.hidden = true;
            break;
          }
        }
      }

      header.hideCell(orderIndex);
      body.hideColumn(orderIndex);

      if (me.rowedit) {
        me.rowedit.hideField(orderIndex, side);
      }

      switch (side) {
        case 'left':
          leftEl.animate({width: parseInt(leftEl.css('width')) - column.width}, ANIMATE_DURATION);
          leftHeader.el.animate({width: parseInt(leftHeader.css('width')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({left: parseInt(centerEl.css('left')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({width: parseInt(centerEl.css('width')) + column.width}, ANIMATE_DURATION);
          me.body.el.animate({width: parseInt(me.body.css('width')) + column.width}, ANIMATE_DURATION);
          me.header.el.animate({width: parseInt(me.header.css('width')) + column.width}, ANIMATE_DURATION);
          break;
        case 'right':
          rightEl.animate({width: parseInt(rightEl.css('width')) - column.width}, ANIMATE_DURATION);
          rightHeader.el.animate({width: parseInt(rightHeader.css('width')) - column.width}, ANIMATE_DURATION);
          centerEl.animate({width: parseInt(centerEl.css('width')) + column.width}, ANIMATE_DURATION);
          me.body.el.animate({width: parseInt(me.body.css('width')) + column.width}, ANIMATE_DURATION);
          me.header.el.animate({width: parseInt(me.header.css('width')) + column.width}, ANIMATE_DURATION);
          break;
      }

      if(me.grouping){
        me.grouping.updateGroupRows();
      }

      me.onWindowResize();

      me.fire('columnhide', {
        column: column,
        side: side,
        orderIndex: orderIndex
      });
    },
    /*
     * @param {String|Number} side
     * @param {String|Number} [index]
     */
    showColumn: function (side, index) {
      if(index === undefined){
        index = side;
        side = 'center';
      }

      var me = this,
        body = me.getBody(side),
        header = me.getHeader(side),
        columns = me.getColumns(side),
        orderIndex,
        i = 0,
        iL = columns.length,
        column,
        centerEl = me.centerEl,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        rightEl = me.rightEl,
        rightHeader = me.rightHeader;

      if(F.isNumber(index)){
        column = columns[index];
        if(!column.hidden){
          return;
        }

        orderIndex = index;
        column.hidden = false;
      }
      else {
        for (; i < iL; i++) {
          column = columns[i];

          if (column.index === index) {
            if(!column.hidden){
              return;
            }
            orderIndex = i;
            column.hidden = false;
            break;
          }
        }
      }

      header.showCell(orderIndex);
      body.showColumn(orderIndex);

      if (me.rowedit) {
        me.rowedit.showField(orderIndex, side);
      }

      switch (side) {
        case 'left':
          leftEl.animate({width: parseInt(leftEl.css('width')) + column.width});
          leftHeader.el.animate({width: parseInt(leftHeader.css('width')) + column.width});
          centerEl.animate({left: parseInt(centerEl.css('left')) + column.width});
          centerEl.animate({width: parseInt(centerEl.css('width')) - column.width});
          me.body.el.animate({width: parseInt(me.body.css('width')) - column.width});
          me.header.el.animate({width: parseInt(me.header.css('width')) - column.width});
          break;
        case 'right':
          rightEl.animate({width: parseInt(rightEl.css('width')) + column.width});
          rightHeader.el.animate({width: parseInt(rightHeader.css('width')) + column.width});
          centerEl.animate({width: parseInt(centerEl.css('width')) - column.width});
          me.body.el.animate({width: parseInt(me.body.css('width')) - column.width});
          me.header.el.animate({width: parseInt(me.header.css('width')) - column.width});
          break;
      }

      if(me.grouping){
        me.grouping.updateGroupRows();
      }

      me.onWindowResize();
      me.fire('columnshow', {
        column: column,
        side: side,
        orderIndex: orderIndex
      });
    },
    /*
     * @param {Number} indexOrder
     * @param {String} side
     * @return {Object}
     */
    removeColumn: function (indexOrder, side) {
      var me = this,
        leftEl = me.leftEl,
        leftHeader = me.leftHeader,
        leftBody = me.leftBody,
        centerEl = me.centerEl,
        body = me.body,
        header = me.header,
        rightEl = me.rightEl,
        rightBody = me.rightBody,
        rightHeader = me.rightHeader,
        column;

      if(side === undefined){
        side = 'center';
      }

      if(F.isString(indexOrder)){
        var columns = me.getColumns(side);

        F.each(columns, function(column, i){
          if(column.index === indexOrder){
            indexOrder = i;
            return true;
          }
        });

        if(F.isString(indexOrder) && side === 'center'){
          columns = me.getColumns('left');

          F.each(columns, function(column, i){
            if(column.index === indexOrder){
              indexOrder = i;
              side = 'left';
              return true;
            }
          });

          if(F.isString(indexOrder)){
            columns = me.getColumns('right');

            F.each(columns, function(column, i){
              if(column.index === indexOrder){
                indexOrder = i;
                side = 'right';
                return true;
              }
            });

            if(F.isString(indexOrder)){
              throw new Error('FancyGrid Error 7: Column was not found for method removeColumn');
            }
          }
        }
      }

      switch (side) {
        case 'left':
          column = me.leftColumns[indexOrder];
          me.leftColumns.splice(indexOrder, 1);
          leftHeader.removeCell(indexOrder);
          leftHeader.reSetIndexes();
          leftBody.removeColumn(indexOrder);
          leftEl.css('width', parseInt(leftEl.css('width')) - column.width);
          centerEl.css('left', parseInt(centerEl.css('left')) - column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
          body.css('width', parseInt(body.css('width')) + column.width);
          header.css('width', parseInt(header.css('width')) + column.width);
          break;
        case 'center':
          column = me.columns[indexOrder];
          me.columns.splice(indexOrder, 1);
          header.removeCell(indexOrder);
          header.reSetIndexes();
          body.removeColumn(indexOrder);
          break;
        case 'right':
          column = me.rightColumns[indexOrder];
          me.rightColumns.splice(indexOrder, 1);
          rightHeader.removeCell(indexOrder);
          rightHeader.reSetIndexes();
          rightBody.removeColumn(indexOrder);
          rightEl.css('right', parseInt(rightEl.css('right')) - column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) + column.width);
          header.css('width', parseInt(header.css('width')) + column.width);
          body.css('width', parseInt(body.css('width')) + column.width);
          break;
      }

      if (column.grouping) {
        delete column.grouping;
      }

      if (me.summary) {
        me.summary.removeColumn(indexOrder, side);
      }

      return column;
    },
    /*
     * @param {Object} column
     * @param {Number} index
     * @param {String} side
     * @param {String} fromSide
     */
    insertColumn: function (column, index, side, fromSide) {
      var me = this,
        leftEl = me.leftEl,
        leftBody = me.leftBody,
        leftHeader = me.leftHeader,
        centerEl = me.centerEl,
        body = me.body,
        header = me.header,
        rightEl = me.rightEl,
        rightBody = me.rightBody,
        rightHeader = me.rightHeader;

      side = side || 'center';

      switch (side) {
        case 'center':
          delete column.rightLocked;
          delete column.locked;
          me.columns.splice(index, 0, column);
          header.insertCell(index, column);
          header.reSetIndexes();
          body.insertColumn(index, column);
          break;
        case 'left':
          column.locked = true;
          var extraLeft = 0;
          var extraHeaderWidth = 0;
          if(me.leftColumns.length === 0){
            if(!F.nojQuery){
              extraLeft = 1;
            }
            me.leftEl.removeCls(GRID_LEFT_EMPTY_CLS);
          }

          if(!F.nojQuery){
            extraHeaderWidth = 0;
          }

          me.leftColumns.splice(index, 0, column);
          leftHeader.insertCell(index, column);
          leftHeader.reSetIndexes();
          leftHeader.css('width', parseInt(leftHeader.css('width')) + extraHeaderWidth);
          leftBody.insertColumn(index, column);
          leftEl.css('width', parseInt(leftEl.css('width')) + column.width);
          //leftEl.css('width', parseInt(leftHeader.css('width')));
          centerEl.css('width', parseInt(centerEl.css('width')) - column.width);
          centerEl.css('left', parseInt(centerEl.css('left')) + column.width + extraLeft);
          body.el.css('width', parseInt(body.el.css('width')) - column.width);
          header.el.css('width', parseInt(header.el.css('width')) - column.width);
          break;
        case 'right':
          column.rightLocked = true;

          var extraLeft = 0,
            extraWidth = 0;

          if(me.rightColumns.length === 0){
            if(!F.nojQuery){
              extraLeft = 1;
              extraWidth = 2;
            }
            me.rightEl.removeCls(GRID_RIGHT_EMPTY_CLS);
          }

          me.rightColumns.splice(index, 0, column);
          rightHeader.insertCell(index, column);
          rightHeader.reSetIndexes();
          rightBody.insertColumn(index, column);
          rightEl.css('width', parseInt(rightEl.css('width')) + column.width);
          centerEl.css('width', parseInt(centerEl.css('width')) - column.width - extraLeft);
          body.css('width', parseInt(body.css('width')) - column.width - extraWidth);
          header.css('width', parseInt(header.css('width')) - column.width - extraWidth);
          break;
      }

      if (column.menu) {
        column.menu = true;
      }

      if (me.grouping) {
        switch (side) {
          case 'left':
            if(me.leftColumns.length === 1){
              me.grouping.softRenderGroupedRows('left');
            }
            break;
          case 'right':
            if(me.rightColumns.length === 1){
              me.grouping.softRenderGroupedRows('right');
            }
            break;
        }

        me.grouping.updateGroupRows();
        me.grouping.setCellsPosition(index, side);
      }

      if (column.rowEditor) {
        if (side === 'left') {
          index--;
        }

        me.rowedit.moveEditor(column, index, side, fromSide);
      }

      if (me.summary) {
        me.summary.insertColumn(index, side);
      }

      me.header.destroyMenus();
      me.leftHeader.destroyMenus();
      me.rightHeader.destroyMenus();

      if(me.sorter){
        me.sorter.updateSortedHeader();
      }
    },
    /*
     * @param {Object} column
     * @param {String} side
     * @param {Number} orderIndex
     */
    addColumn: function (column, side, orderIndex) {
      var me = this,
        side = side || 'center';

      if(!column.type){
        column.type = 'string';
      }

      if(!column.width){
        column.width = me.defaultColumnWidth;
      }

      if(orderIndex === undefined){
        var columns = me.getColumns(side);

        orderIndex = columns.length;
      }

      me.insertColumn(column, orderIndex, side);

      me.scroller.update();
    },
    /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
    disableLegend: function (orderIndex, legend) {
      var me = this;

      me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
      me.columns[orderIndex].disabled[legend] = true;

      me.body.updateRows(undefined, orderIndex);
    },
    /*
     * @param {Number} orderIndex
     * @param {String} legend
     */
    enableLegend: function (orderIndex, legend) {
      var me = this;

      me.columns[orderIndex].disabled = me.columns[orderIndex].disabled || {};
      delete me.columns[orderIndex].disabled[legend];

      me.body.updateRows(undefined, orderIndex);
    },
    /*
     *
     */
    fitHeight: function () {
      var me = this,
        s = me.store,
        panelBodyBorders = me.panelBodyBorders,
        gridBorders = me.gridBorders,
        height = s.getLength() * me.cellHeight,
        headerRows = 1,
        columns = me.columns.concat(me.leftColumns || []).concat(me.rightColumns || []);

      Fancy.each(columns, function(column){
        if(column.grouping){
          if(headerRows < 2){
            headerRows = 2;
          }

          if(column.filter && column.filter.header){
            if(headerRows < 3){
              headerRows = 3;
            }
          }
        }

        if(column.filter && column.filter.header){
          if(headerRows < 2){
            headerRows = 2;
          }
        }
      });

      if(me.getCenterFullWidth() > me.getCenterViewWidth() && !me.nativeScroller && !Fancy.isIE){
        height += me.bottomScrollHeight;
      }

      if (me.title) {
        height += me.titleHeight;
      }

      if (me.tbar) {
        height += me.barHeight;
      }

      if (me.summary) {
        height += me.cellHeight;
      }

      if (me.bbar) {
        height += me.barHeight;
      }

      if (me.buttons) {
        height += me.barHeight;
      }

      if (me.subTBar) {
        height += me.barHeight;
      }

      if (me.footer) {
        height += me.barHeight;
      }

      if (me.header !== false) {
        height += me.cellHeaderHeight * headerRows;
      }

      if(me.grouping){
        height += me.grouping.groups.length * me.groupRowHeight;
      }

      if (me.panel) {
        height += panelBodyBorders[0] + panelBodyBorders[2] + gridBorders[0] + gridBorders[2];
      }
      else {
        height += gridBorders[0] + gridBorders[2];
      }

      me.setHeight(height);
    },
    /*
     * @param {String} index
     * @param {Mixed} value
     * @param {String} sign
     * @param {Boolean} [updateHeaderFilter]
     */
    addFilter: function (index, value, sign, updateHeaderFilter) {
      var me = this,
        filter = me.filter.filters[index],
        sign = sign || '';

      if (filter === undefined) {
        filter = {};
      }

      if (F.isDate(value)) {
        var format = this.getColumnByIndex(index).format;

        filter['type'] = 'date';
        filter['format'] = format;
        value = Number(value);
      }

      /*
      if (value === '') {
        delete filter[sign];
      }
      else {
        filter[sign] = value;
      }
      */
      filter[sign] = value;

      me.filter.filters[index] = filter;
      me.filter.updateStoreFilters();

      if(updateHeaderFilter !== false) {
        me.filter.addValuesInColumnFields(index, value, sign);
      }
    },
    /*
     * @param {String} [index]
     * @param {String} [sign]
     * @param {Boolean} [updateHeaderField]
     */
    clearFilter: function (index, sign, updateHeaderField) {
      var me = this,
        s = me.store;

      if (index === undefined || index === null) {
        me.filter.filters = {};
        s.filters = {};
      }
      else if (sign === undefined || sign === null) {
        if(s.filters && s.filters[index]){
          me.filter.filters[index] = {};
          s.filters[index] = {};
        }
      }
      else {
        if (me.filter && me.filter.filters && me.filter.filters[index] && me.filter.filters[index][sign]) {
          delete me.filter.filters[index][sign];
          delete s.filters[index][sign];
        }
      }

      s.changeDataView();
      me.update();

      if (me.filter && updateHeaderField !== false) {
        me.filter.clearColumnsFields(index, sign);
      }

      me.fire('filter', s.filters);

      me.setSidesHeight();
    },
    /*
     * @param {String} text
     */
    showLoadMask: function (text) {
      this.loadmask.showLoadMask(text);
    },
    /*
     *
     */
    hideLoadMask: function () {
      this.loadmask.hideLoadMask();
    },
    /*
     *
     */
    prevPage: function () {
      this.paging.prevPage();
    },
    /*
     *
     */
    nextPage: function () {
      this.paging.nextPage();
    },
    /*
     * @param {Number} value
     */
    setPage: function (value) {
      value--;
      if (value < 0) {
        value = 0;
      }

      this.paging.setPage(value);
    },
    /*
     *
     */
    firstPage: function () {
      this.paging.firstPage();
    },
    /*
     *
     */
    lastPage: function () {
      this.paging.lastPage();
    },
    /*
     * @param {Number} value
     */
    setPageSize: function (value) {
      this.paging.setPageSize(value);
    },
    /*
     * @return {Number}
     */
    getPage: function () {
      return this.store.showPage + 1;
    },
    /*
     * @return {Number}
     */
    getPages: function () {
      return this.store.pages;
    },
    /*
     * @return {Number}
     */
    getPageSize: function () {
      return this.store.pageSize;
    },
    /*
     *
     */
    refresh: function () {
      this.paging.refresh();
    },
    /*
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [animate]
     */
    scroll: function (x, y, animate) {
      var me = this,
        scroller = me.scroller;

      if(y !== undefined && y > 0){
        y = -y;
      }

      scroller.scroll(x, y, animate);

      scroller.scrollBottomKnob();
      scroller.scrollRightKnob();
    },
    /*
     * @return {Array}
     */
    getDataFiltered: function () {
      return this.store.filteredData;
    },
    /*
     *
     */
    reCalcColumnsWidth: function () {
      var me = this;

      if (!me.hasFlexColumns) {
        return;
      }

      var scroller = me.scroller,
        viewWidth = me.getCenterViewWidth(),
        columns = me.columns,
        flex = 0,
        i = 0,
        iL = columns.length,
        widthForFlex = viewWidth,
        flexPerCent;

      if (me.flexScrollSensitive !== false && scroller.isRightScrollable() && !scroller.nativeScroller) {
        widthForFlex -= me.bottomScrollHeight;
      }

      for (; i < iL; i++) {
        var column = columns[i];

        if(column.hidden){
          continue
        }

        if (column.flex) {
          flex += column.flex;
        }
        else {
          widthForFlex -= column.width;
        }
      }

      if (flex === 0) {
        return;
      }

      flexPerCent = widthForFlex / flex;

      i = 0;
      for (; i < iL; i++) {
        var column = columns[i];

        if(column.hidden){
          continue;
        }

        if (column.flex) {
          column.width = Math.floor(column.flex * flexPerCent);

          if(column.minWidth && column.width < column.minWidth){
            column.width = column.minWidth;
          }

          if (column.minWidth && column.width < column.minWidth) {
            column.width = column.minWidth;
          }
          else if (column.width < me.minColumnWidth) {
            column.width = me.minColumnWidth;
          }
        }
      }
    },
    /*
     * @return {Array}
     */
    getDisplayedData: function () {
      var me = this,
        viewTotal = me.getViewTotal(),
        data = [],
        i = 0,
        leftColumns = me.leftColumns,
        columns = me.columns,
        rightColumns = me.rightColumns;

      var fn = function (column) {
        if (column.index === undefined || column.index === '$selected' || column.hidden) {
          return;
        }

        switch(column.type){
          case 'order':
            rowData.push(i + 1);
            break;
          default:
            rowData.push(me.get(i, column.index));
        }
      };

      for (; i < viewTotal; i++) {
        var rowData = [];

        F.each(leftColumns, fn);
        F.each(columns, fn);
        F.each(rightColumns, fn);

        data.push(rowData);
      }

      return data;
    },
    /*
     * @param {Array} data
     */
    setData: function (data) {
      var me = this,
        s = me.store;

      s.setData(data);

      if(s.isTree){
        s.initTreeData();
      }

      me.setSidesHeight();
    },
    /*
     * @params {Object} [o]
     */
    exportToExcel: function (o) {
      var me = this;

      if (me.exporter) {
        me.exporter.exportToExcel(o);
      }
    },
    /*
     * @params {Object} [o]
     */
    getDataAsCsv: function(o){
      var me = this;

      if (me.exporter) {
        return me.exporter.getDataAsCsv(o);
      }
    },
    /*
     * @params {Object} o
     */
    getDataAsCSV: function(o){
      return this.getDataAsCsv(o);
    },
    /*
     * @params {Object} [o]
     */
    exportToCSV: function (o) {
      var me = this;

      if (me.exporter) {
        return me.exporter.exportToCSV(o);
      }
    },
    /*
     * @params {Object} o
     */
    exportToCsv: function (o) {
      return this.exportToCSV(o);
    },
    /*
     *
     */
    enableSelection: function () {
      this.selection.enableSelection()
    },
    /*
     *
     */
    disableSelection: function () {
      this.selection.disableSelection()
    },
    /*
     * @param {Object} o
     */
    setParams: function (o) {
      var me = this,
        s = me.store;

      if(s.proxy){
        s.proxy.params = s.proxy.params || {};

        F.apply(s.proxy.params, o);
      }
    },
    /*
     * @param {String|Object} url
     */
    setUrl: function (url) {
      var me = this,
        s = me.store;

      if(F.isString(url)){
        if (s.proxy && s.proxy.api) {
          if(s.proxy.type === 'rest'){
            for(var p in s.proxy.api){
              s.proxy.api[p] = url;
            }
          }
          else {
            s.proxy.api.read = url;
          }
        }
      }
      else {
        if (s.proxy && s.proxy.api) {
          F.apply(s.proxy.api, url);
        }
      }
    },
    /*
     * @param {Object} cell
     * @return {String}
     */
    getSideByCell: function (cell) {
      var me = this,
        side;

      if(me.centerEl.within(cell)){
        side = 'center';
      }
      else if(me.leftEl.within(cell)){
        side = 'left';
      }
      else if(me.rightEl.within(cell)){
        side = 'right';
      }

      return side;
    },
    /*
     * @param {Fancy.Model|id|Object} item
     * @param {Object} o
     *
     * Used for tree grid
     */
    addChild: function (item, o) {
      var me = this,
        s = me.store;

      if(o === undefined){
        item.$deep = 1;
        if(item.child === undefined){
          item.child = [];
        }

        me.add(item);
      }
      else{
        if(F.isNumber(item)){
          item = me.getById(item);
        }

        var fixParent = false;

        if(item.get('leaf') === true){
          item.set('leaf', false);
          item.set('expanded', true);
          item.set('child', []);

          fixParent = true;
        }

        var $deep = item.get('$deep'),
          child = item.get('child'),
          rowIndex = me.getRowById(item.id) + child.length + 1;

        o.$deep = $deep + 1;
        o.parentId = item.id;

        if(fixParent){
          var parentId = item.get('parentId');
          if(parentId) {
            var parentItem = me.getById(parentId);

            F.each(parentItem.data.child, function (child) {
              if (child.id === item.id) {
                child.leaf = false;
                child.expanded = true;
                child.child = [o];

                return true;
              }
            });
          }
        }

        child.push(new s.model(o));
        item.set('child', child);

        if(item.get('expanded') === true){
          me.insert(rowIndex, o);
        }
      }
    },
    /*
     * {Number|String|Object} id
     */
    expand: function(id){
      var item,
        me = this;

      switch(F.typeOf(id)){
        case 'number':
        case 'string':
          item = me.getById(id);
          break;
      }

      if(item.get('expanded') === true){
        return;
      }

      me.tree.expandRow(item);
    },
    /*
     * {Number|String|Object} id
     */
    collapse: function(id){
      var item,
        me = this;

      switch(F.typeOf(id)){
        case 'number':
        case 'string':
          item = me.getById(id);
          break;
      }

      if(item.get('expanded') === false){
        return;
      }

      me.tree.collapseRow(item);
    },
    /*
     *
     */
    collapseAll: function () {
      var me = this,
        items = me.findItem('$deep', 1);

      F.each(items, function (item) {
        me.collapse(item.id);
      });
    },
    /*
     *
     */
    expandAll: function () {
      var me = this,
        items = me.findItem('expanded', false);

      F.each(items, function (item) {
        me.expand(item.id);
      });

      items = me.findItem('expanded', false);

      if(items.length){
        me.expandAll();
      }
    },
    /*
     * @param {Boolean} copyHeader
     */
    copy: function (copyHeader) {
      var me = this;

      if(me.selection){
        me.selection.copy(copyHeader);
      }
    },
    /*
     * @param {String} key
     * @param {'ASC'|'DESC'} direction
     */
    sort: function (key, direction) {
      var me = this,
        column = me.getColumnByIndex(key),
        o = me.getColumnOrderByKey(key),
        header,
        cell;

      if(!o.side){
        return;
      }

      header = me.getHeader(o.side);
      cell = header.getCell(o.order);

      if(!direction){
        cell.dom.click();
      }
      else{
        direction = direction || 'ASC';
        cell = header.getCell(o.order);

        direction = direction.toLocaleLowerCase();

        switch(direction){
          case 'asc':
            cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
            cell.addCls(GRID_COLUMN_SORT_ASC_CLS);
            break;
          case 'desc':
            cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
            cell.addCls(GRID_COLUMN_SORT_DESC_CLS);
            break;
          case 'drop':
            cell.removeCls(GRID_COLUMN_SORT_ASC_CLS);
            cell.removeCls(GRID_COLUMN_SORT_DESC_CLS);
            break;
          default:
            throw new Error('[FancyGrid Error]: sorting type is not right - ' + direction);
        }

        me.sorter.sort(direction, key, o.side, column, cell);
      }
    },
    /*
     * @param {Number} rowIndex
     */
    flashRow: function (rowIndex) {
      var me = this,
        cells = me.getDomRow(rowIndex);

      F.each(cells, function (cell) {
        cell = F.get(cell);

        cell.addCls('fancy-grid-cell-flash');
      });

      setTimeout(function () {
        F.each(cells, function (cell) {
          cell = F.get(cell);

          cell.addCls('fancy-grid-cell-animation');
        });
      }, 200);

      setTimeout(function () {
        F.each(cells, function (cell) {
          cell = F.get(cell);

          cell.removeCls('fancy-grid-cell-flash');
          cell.removeCls('fancy-grid-cell-animation');
        });
      }, 700);
    },
    /*
     * @param {Number|Object} rowIndex
     * @param {Number} [columnIndex]
     * @param {String} [side]
     */
    flashCell: function (rowIndex, columnIndex, side) {
      var me = this,
        side = side? side: 'center',
        body = me.getBody(side),
        cell = Fancy.isObject(rowIndex)? rowIndex : body.getCell(rowIndex, columnIndex);

      cell.addCls('fancy-grid-cell-flash');

      setTimeout(function () {
        cell.addCls('fancy-grid-cell-animation');
      }, 200);

      setTimeout(function () {
        cell.removeCls('fancy-grid-cell-flash');
        cell.removeCls('fancy-grid-cell-animation');
      }, 700);
    },
    /*
    * @param {Number} rowIndex
     */
    scrollToRow: function(rowIndex){
      var me = this,
        cell = me.body.getCell(rowIndex, 0);

      me.scroller.scrollToCell(cell.dom, false, true);
      me.scroller.update();

      me.flashRow(rowIndex);
    },
    /*
     * @return {Object}
     */
    getStateSorters: function () {
      var me = this,
        o = {},
        state = JSON.parse(localStorage.getItem(me.getStateName()));

      if(!state){
        return;
      }

      if(!state.sorters){
        return {};
      }

      var sorted = JSON.parse(state.sorters);

      F.each(sorted, function (sorter) {
        o[sorter.key] = sorter;
      });

      return o;
    },
    /*
     *
     */
    getStateName: function () {
      var me = this,
        id = me.id,
        url = location.host + '-' + location.pathname;

      if(me.stateId){
        return me.stateId;
      }

      return id + url;
    },
    /*
     *
     */
    setWidthFit: function () {
      var me = this,
        panelBodyBorders = me.panelBodyBorders,
        gridWithoutPanelBorders = me.gridWithoutPanelBorders,
        gridBorders = me.gridBorders,
        width = 0,
        hasLocked = false,
        columns = [].concat(me.leftColumns).concat(me.columns).concat(me.rightColumns);

      Fancy.each(columns, function(column){
        if(!column.hidden){
          width += column.width;
        }
        if(column.locked){
          hasLocked = true;
        }
      });

      if(me.panel){
        width += panelBodyBorders[1] + panelBodyBorders[3] + gridBorders[1] + gridBorders[3];
      }
      else{
        width += gridWithoutPanelBorders[1] + gridWithoutPanelBorders[3] + gridBorders[1] + gridBorders[3];
      }

      if(hasLocked){
        width--;
      }

      me.setWidth(width);
    },
    /*
     * @param {Number|String} index
     * @param {String} value
     * @param {String} [side]
     */
    setColumnTitle: function(index, value, side){
      var me = this,
        side = side || 'center',
        header = me.getHeader(side),
        cell,
        column,
        columns = header.getColumns();

      if(Fancy.isString(index)){
        index = me.getColumnOrderByKey(index).order;
      }

      column = columns[index];
      column.title = value;

      cell = header.getCell(index);
      cell.select('.' + Fancy.GRID_HEADER_CELL_TEXT_CLS).item(0).update(value);

      me.fire('columntitlechange', {
        orderIndex: index,
        index: column.index,
        value: value,
        side: side
      });
    },
    /*
     *
     */
    clearDirty: function () {
      var me = this;

      me.store.clearDirty();
      me.body.clearDirty();
      me.leftBody.clearDirty();
      me.rightBody.clearDirty();
    },
    /*
     * @param {String} bar
     */
    hideBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch(bar){
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if(barEl.css('display') !== 'none'){
        barEl.hide();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight - me.barHeight);
      }
    },
    /*
     * @param {String} bar
     */
    showBar: function (bar) {
      var me = this,
        barCls,
        barEl;

      switch(bar){
        case 'tbar':
          barCls = PANEL_TBAR_CLS;
          break;
        case 'subtbar':
          barCls = PANEL_SUB_TBAR_CLS;
          break;
        case 'bbar':
          barCls = PANEL_BBAR_CLS;
          break;
        case 'buttons':
          barCls = PANEL_BUTTONS_CLS;
          break;
        default:
          throw new Error('FancyGrid Error: bar does not exist');
      }

      barEl = me.panel.el.select('.' + barCls);

      if(barEl.css('display') == 'none'){
        barEl.show();

        var panelHeight = parseInt(me.panel.el.css('height'));
        me.panel.el.css('height', panelHeight + me.barHeight);
      }
    }
  });

})();/*
 * @class Fancy.grid.plugin.Updater
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Updater', {
  extend: Fancy.Plugin,
  ptype: 'grid.updater',
  inWidgetName: 'updater',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.applyConfig(this, config);

    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){},
  /*
   *
   */
  update: function(){
    var w = this.widget;

    w.leftBody.update();
    w.body.update();
    w.rightBody.update();
  },
  /*
   * @param {Number} rowIndex
   */
  updateRow: function(rowIndex){
    var w = this.widget;

    w.leftBody.updateRows(rowIndex);
    w.body.updateRows(rowIndex);
    w.rightBody.updateRows(rowIndex);
  }
});/*
 * @class Fancy.grid.plugin.Scroller
 * @extends Fancy.Plugin
 */
(function(){
  //SHORTCUTS
  var F = Fancy;

  /*
   * CONSTANTS
   */
  var RIGHT_SCROLL_CLS = 'fancy-scroll-right';
  var BOTTOM_SCROLL_CLS = 'fancy-scroll-bottom';
  var TOP_SCROLL_CLS = 'fancy-scroll-top';
  var RIGHT_SCROLL_INNER_CLS = 'fancy-scroll-right-inner';
  var BOTTOM_SCROLL_INNER_CLS = 'fancy-scroll-bottom-inner';
  var TOP_SCROLL_INNER_CLS = 'fancy-scroll-top-inner';
  var NATIVE_SCROLLER_CLS = 'fancy-grid-native-scroller';
  var RIGHT_SCROLL_HOVER_CLS = 'fancy-scroll-right-hover';
  var BOTTOM_SCROLL_HOVER_CLS = 'fancy-scroll-bottom-hover';
  var TOP_SCROLL_HOVER_CLS = 'fancy-scroll-top-hover';
  var RIGHT_SCROLL_ACTIVE_CLS = 'fancy-scroll-right-active';
  var BOTTOM_SCROLL_ACTIVE_CLS = 'fancy-scroll-bottom-active';
  var TOP_SCROLL_ACTIVE_CLS = 'fancy-scroll-top-active';
  var HIDDEN_CLS = F.HIDDEN_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_CENTER_CLS = F.GRID_CENTER_CLS;

  F.define('Fancy.grid.plugin.Scroller', {
    extend: F.Plugin,
    ptype: 'grid.scroller',
    inWidgetName: 'scroller',
    rightKnobDown: false,
    bottomKnobDown: false,
    minRightKnobHeight: 35,
    minBottomKnobWidth: 35,
    cornerSize: 12,
    /*
     * @private
     */
    scrollLeft: 0,
    /*
     * @private
     */
    scrollTop: 0,
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
      this.Super('init', arguments);
      this.ons();
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        mouseWheelEventName = F.getMouseWheelEventName();

      w.once('render', function () {
        me.render();
        w.leftBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        if (w.nativeScroller) {
          w.leftBody.el.on(mouseWheelEventName, me.onMouseWheelLeft, me);
          w.rightBody.el.on(mouseWheelEventName, me.onMouseWheelRight, me);
        }
        w.body.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.rightBody.el.on(mouseWheelEventName, me.onMouseWheel, me);
        w.once('init', me.onGridInit, me);

        if (w.nativeScroller) {
          w.body.el.on('scroll', me.onNativeScrollBody, me);
          w.leftBody.el.on('scroll', me.onNativeScrollLeftBody, me);
          w.rightBody.el.on('scroll', me.onNativeScrollRightBody, me);
        }
        else {
          if (w.panel) {
            w.panel.on('resize', me.onPanelResize, me);
          }

          w.body.el.on('scroll', me.onScrollBodyBugFix, me);
        }
      });

      me.on('render', me.onRender, me);

      w.store.on('change', me.onChangeStore, me);
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        docEl = F.get(document),
        mouseWheelEventName = F.getMouseWheelEventName();

      docEl.un('mouseup', me.onMouseUpDoc, me);
      docEl.un('mousemove', me.onMouseMoveDoc, me);

      leftBody.el.un(mouseWheelEventName, me.onMouseWheel, me);
      body.el.un(mouseWheelEventName, me.onMouseWheel, me);
      rightBody.el.un(mouseWheelEventName, me.onMouseWheel, me);

      if(!w.nativeScroller){
        me.scrollBottomEl.un('mousedown', me.onMouseDownBottomSpin, me);
        me.scrollRightEl.un('mousedown', me.onMouseDownRightSpin, me);
      }

      if (F.isTouch) {
        leftBody.el.un('touchstart', me.onBodyTouchStart, me);
        leftBody.el.un('touchmove', me.onBodyTouchMove, me);

        body.el.un('touchstart', me.onBodyTouchStart, me);
        body.el.un('touchmove', me.onBodyTouchMove, me);

        rightBody.el.un('touchstart', me.onBodyTouchStart, me);
        rightBody.el.un('touchmove', me.onBodyTouchMove, me);

        docEl.un('touchend', me.onMouseUpDoc, me);
      }
    },
    /*
     *
     */
    onGridInit: function () {
      var me = this,
        w = me.widget,
        s = w.store,
        docEl = F.get(document);

      me.setScrollBars();
      docEl.on('mouseup', me.onMouseUpDoc, me);
      docEl.on('mousemove', me.onMouseMoveDoc, me);
      w.on('columnresize', me.onColumnResize, me);

      w.on('lockcolumn', me.onLockColumn, me);
      w.on('rightlockcolumn', me.onRightLockColumn, me);
      w.on('unlockcolumn', me.onUnLockColumn, me);

      s.on('changepages', me.onChangePages, me);

      setTimeout(function () {
        me.update();
      }, 1);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        rightScrollEl = F.get(document.createElement('div')),
        bottomScrollEl = F.get(document.createElement('div')),
        topScrollEl = F.get(document.createElement('div')),
        right = 1;

      if (w.nativeScroller) {
        w.el.addCls(NATIVE_SCROLLER_CLS);
      }
      else {
        rightScrollEl.addCls(RIGHT_SCROLL_CLS);
        bottomScrollEl.addCls(BOTTOM_SCROLL_CLS, HIDDEN_CLS);

        rightScrollEl.update([
          '<div class="' + RIGHT_SCROLL_INNER_CLS + '"></div>'
        ].join(" "));

        rightScrollEl.select('.' + RIGHT_SCROLL_INNER_CLS).css('margin-top', w.knobOffSet);

        bottomScrollEl.update([
          '<div class="' + BOTTOM_SCROLL_INNER_CLS + '"></div>'
        ].join(" "));

        F.get(body.el.append(rightScrollEl.dom));
        me.scrollRightEl = body.el.select('.fancy-scroll-right');

        F.get(body.el.append(bottomScrollEl.dom));
        me.scrollBottomEl = body.el.select('.fancy-scroll-bottom');

        if(w.doubleHorizontalScroll){
          topScrollEl.addCls(TOP_SCROLL_CLS, HIDDEN_CLS);

          topScrollEl.update([
            '<div class="' + TOP_SCROLL_INNER_CLS + '"></div>'
          ].join(" "));

          F.get(body.el.append(topScrollEl.dom));
          me.scrollTopEl = body.el.select('.fancy-scroll-top');
        }
      }

      me.fire('render');
    },
    /*
     *
     */
    onMouseWheel: function (e) {
      var me = this,
        w = me.widget,
        delta = F.getWheelDelta(e.originalEvent || e);

      if (me.isRightScrollable() == false) {
        return;
      }

      if (w.stopProp) {
        e.stopPropagation();
      }

      if (w.nativeScroller) {}
      else {
        if (me.scrollDelta(delta)) {
          e.preventDefault();
        }
        me.scrollRightKnob();
      }
    },
    /*
     *
     */
    onRender: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller !== true) {
        me.scrollRightEl.hover(function () {
          if (me.bottomKnobDown !== true) {
            me.scrollRightEl.addCls(RIGHT_SCROLL_HOVER_CLS);
          }
        }, function () {
          me.scrollRightEl.removeCls(RIGHT_SCROLL_HOVER_CLS);
        });

        me.scrollBottomEl.hover(function () {
          if (me.rightKnobDown !== true) {
            me.scrollBottomEl.addCls(BOTTOM_SCROLL_HOVER_CLS);
          }
        }, function () {
          me.scrollBottomEl.removeCls(BOTTOM_SCROLL_HOVER_CLS);
        });

        if(w.doubleHorizontalScroll){
          me.scrollTopEl.hover(function () {
            if (me.bottomKnobDown !== true) {
              me.scrollTopEl.addCls(TOP_SCROLL_HOVER_CLS);
            }
          }, function () {
            if (me.bottomKnobDown !== true) {
              me.scrollTopEl.removeCls(TOP_SCROLL_HOVER_CLS);
            }
          });
        }

        me.initRightScroll();
        me.initBottomScroll();
      }

      if (F.isTouch) {
        me.initTouch();
      }
    },
    /*
     *
     */
    initTouch: function () {
      var me = this,
        w = me.widget,
        leftBody = w.leftBody,
        body = w.body,
        rightBody = w.rightBody,
        docEl = F.get(document);

      leftBody.el.on('touchstart', me.onBodyTouchStart, me);
      leftBody.el.on('touchmove', me.onBodyTouchMove, me);

      body.el.on('touchstart', me.onBodyTouchStart, me);
      body.el.on('touchmove', me.onBodyTouchMove, me);

      rightBody.el.on('touchstart', me.onBodyTouchStart, me);
      rightBody.el.on('touchmove', me.onBodyTouchMove, me);

      docEl.on('touchend', me.onMouseUpDoc, me);
    },
    /*
     * @param {Object} e
     */
    onBodyTouchStart: function (e) {
      var me = this,
        w = me.widget,
        e = e.originalEvent || e,
        touchXY = e.changedTouches[0];

      if (w.nativeScroller) {
        return;
      }

      me.rightKnobDown = true;
      me.bottomKnobDown = true;

      me.mouseDownXY = {
        x: touchXY.pageX,
        y: touchXY.pageY
      };

      me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
      me.scrollRightEl.addCls(RIGHT_SCROLL_ACTIVE_CLS);

      me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
      me.scrollBottomEl.addCls(BOTTOM_SCROLL_ACTIVE_CLS);

      if(w.doubleHorizontalScroll){
        me.scrollTopEl.addCls(TOP_SCROLL_ACTIVE_CLS);
      }
    },
    /*
     *
     */
    onBodyTouchEnd: function () {
      this.onMouseUpDoc();
    },
    /*
     * @param {Object} e
     */
    onBodyTouchMove: function (e) {
      var me = this,
        e = e.originalEvent,
        touchXY = e.changedTouches[0],
        changed = true;

      if(!me.nativeScroller){
        var scrollLeft = me.scrollLeft,
          scrollTop = me.scrollTop;

        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });

        changed = scrollLeft !== me.scrollLeft || scrollTop !== me.scrollTop;
      }
      else{
        me.onMouseMoveDoc({
          pageX: touchXY.pageX,
          pageY: touchXY.pageY
        });
      }

      if (me.rightKnobDown === true && changed) {
        e.preventDefault();
      }

      if (me.bottomKnobDown === true && changed) {
        e.preventDefault();
      }
    },
    /*
     *
     */
    initRightScroll: function () {
      var me = this;

      me.rightKnob = me.scrollRightEl.select('.' + RIGHT_SCROLL_INNER_CLS);
      me.scrollRightEl.on('mousedown', me.onMouseDownRightSpin, me);
    },
    /*
     *
     */
    initBottomScroll: function () {
      var me = this,
        w = me.widget;

      me.bottomKnob = me.scrollBottomEl.select('.' + BOTTOM_SCROLL_INNER_CLS);
      me.scrollBottomEl.on('mousedown', me.onMouseDownBottomSpin, me);

      if(w.doubleHorizontalScroll){
        me.topKnob = me.scrollTopEl.select('.' + TOP_SCROLL_INNER_CLS);
        me.scrollTopEl.on('mousedown', me.onMouseDownBottomSpin, me);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseDownRightSpin: function (e) {
      var me = this;

      if (F.isTouch) {
        return;
      }

      e.preventDefault();

      me.rightKnobDown = true;
      me.mouseDownXY = {
        x: e.pageX,
        y: e.pageY
      };

      me.rightKnobTop = parseInt(me.rightKnob.css('margin-top'));
      me.scrollRightEl.addCls(RIGHT_SCROLL_ACTIVE_CLS);
    },
    /*
     * @param {Object} e
     */
    onMouseDownBottomSpin: function (e) {
      var me = this,
        targetEl = F.get(e.target);

      e.preventDefault();

      me.bottomKnobDown = true;
      me.mouseDownXY = {
        x: e.pageX,
        y: e.pageY
      };

      me.bottomKnobLeft = parseInt(me.bottomKnob.css('margin-left'));
      me.scrollBottomEl.addCls(BOTTOM_SCROLL_ACTIVE_CLS);

      if(targetEl.hasClass()){
        me.scrollTopEl.addCls(TOP_SCROLL_INNER_CLS);
      }
    },
    /*
     *
     */
    onMouseUpDoc: function () {
      var me = this,
        w = me.widget;

      if (me.rightKnobDown === false && me.bottomKnobDown === false) {
        return;
      }

      me.scrollRightEl.removeCls(RIGHT_SCROLL_ACTIVE_CLS);
      me.scrollBottomEl.removeCls(BOTTOM_SCROLL_ACTIVE_CLS);
      me.rightKnobDown = false;
      me.bottomKnobDown = false;

      if(w.doubleHorizontalScroll){
        me.scrollTopEl.removeCls(TOP_SCROLL_ACTIVE_CLS);
        me.scrollTopEl.removeCls(TOP_SCROLL_HOVER_CLS);
      }
    },
    /*
     * @param {Object} e
     */
    onMouseMoveDoc: function (e) {
      var me = this,
        w = me.widget,
        topScroll = false,
        bottomScroll = false,
        knobOffSet = w.knobOffSet,
        x = e.pageX,
        y = e.pageY,
        deltaX,
        deltaY,
        marginTop,
        marginLeft;

      if (me.rightKnobDown) {
        if (F.isTouch) {
          deltaY = me.mouseDownXY.y - y;
          marginTop = deltaY + me.rightKnobTop;
        }
        else {
          deltaY = y - me.mouseDownXY.y;
          marginTop = deltaY + me.rightKnobTop;
        }

        if (marginTop < me.knobOffSet) {
          marginTop = me.knobOffSet;
        }

        if (me.bodyViewHeight < marginTop + me.rightKnobHeight) {
          marginTop = me.bodyViewHeight - me.rightKnobHeight;
        }

        //if (marginTop < me.rightScrollScale) {
        if (marginTop < 0) {
          marginTop = 0;
        }

        topScroll = me.rightScrollScale * marginTop;

        if(w.doubleHorizontalScroll && me.scrollBottomEl.css('display') !== 'none'){
          if(marginTop < me.cornerSize){
            marginTop = me.cornerSize;
          }
        }

        me.rightKnob.css('margin-top', (marginTop + knobOffSet) + 'px');

        me.scroll(topScroll);
      }

      if (me.bottomKnobDown) {
        if (F.isTouch) {
          deltaX = me.mouseDownXY.x - x;
          deltaY = me.mouseDownXY.y - y;
          marginLeft = deltaX + me.bottomKnobLeft;
        }
        else {
          deltaX = x - me.mouseDownXY.x;
          deltaY = y - me.mouseDownXY.y;
          marginLeft = deltaX + me.bottomKnobLeft;
        }

        if (marginLeft < 1) {
          marginLeft = 1;
        }

        if (me.bodyViewWidth - 2 < marginLeft + me.bottomKnobWidth) {
          marginLeft = me.bodyViewWidth - me.bottomKnobWidth - 2;
        }

        if (me.bottomScrollScale < 0 && marginLeft < 0) {
          marginLeft = 0;
          me.bottomScrollScale = 0;
        }

        me.bottomKnob.css('margin-left', marginLeft + 'px');
        bottomScroll = Math.ceil(me.bottomScrollScale * (marginLeft - 1));

        if(w.doubleHorizontalScroll){
          me.topKnob.css('margin-left', marginLeft + 'px');
        }

        me.scroll(false, bottomScroll);
      }
    },
    /*
     * @param {Number} [viewHeight]
     */
    setScrollBars: function (viewHeight) {
      var me = this,
        w = me.widget;

      //me.checkRightScroll();
      setTimeout(function () {
        me.checkRightScroll(viewHeight);
      }, 1);

      if (!me.checkBottomScroll()) {
        if (me.scrollTop) {
          w.scroll(false, 0);
        }
      }

      if (!w.nativeScroller) {
        me.checkCorner();
        me.setRightKnobSize(viewHeight);
        me.setBottomKnobSize();
      }
    },
    /*
     * @param {Number} [viewHeight]
     */
    checkRightScroll: function (viewHeight) {
      var me = this,
        w = me.widget,
        body = w.body,
        gridBorders = w.gridBorders,
        bodyViewHeight = w.getBodyHeight(),
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - gridBorders[0] - gridBorders[2];

      if (w.nativeScroller) {
        if (bodyViewHeight >= cellsViewHeight) {
          body.el.css('overflow-y', 'hidden');
        }
        else {
          body.el.css('overflow-y', 'scroll');
        }
      }
      else {
        if (bodyViewHeight >= cellsViewHeight) {
          me.scrollRightEl.addCls(HIDDEN_CLS);
        }
        else {
          me.scrollRightEl.removeCls(HIDDEN_CLS);
        }
      }
    },
    /*
     *
     */
    isRightScrollable: function () {
      var w = this.widget;

      if (w.nativeScroller) {
        return w.body.el.css('overflow-y') === 'scroll';
      }

      return !this.scrollRightEl.hasCls(HIDDEN_CLS);
    },
    /*
     * @param {Number} [viewHeight]
     */
    setRightKnobSize: function (viewHeight) {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      var bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0) - 2,
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - (me.corner ? me.cornerSize : 0),
        scrollRightPath = cellsViewHeight - bodyViewHeight,
        percents = 100 - scrollRightPath / (bodyViewHeight / 100),
        knobHeight = bodyViewHeight * (percents / 100),
        knobOffSet = w.knobOffSet;

      if (knobHeight < me.minRightKnobHeight) {
        knobHeight = me.minRightKnobHeight;

        if(w.doubleHorizontalScroll){
          knobHeight += me.minRightKnobHeight;
        }
      }

      if (me.corner === false) {
        bodyViewHeight -= knobOffSet;
      }

      me.rightKnob.stop();
      me.rightKnob.animate({height: knobHeight}, F.ANIMATE_DURATION);
      me.rightKnobHeight = knobHeight;
      me.bodyViewHeight = bodyViewHeight;
      me.rightScrollScale = (cellsViewHeight - bodyViewHeight) / (bodyViewHeight - knobHeight);
    },
    /*
     *
     */
    checkBottomScroll: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        centerViewWidth = w.getCenterViewWidth(),
        centerFullWidth = w.getCenterFullWidth() - 2,
        showBottomScroll;

      if (w.nativeScroller) {
        if (centerViewWidth > centerFullWidth) {
          showBottomScroll = false;
          body.el.css('overflow-x', 'hidden');
        }
        else {
          showBottomScroll = true;
          body.el.css('overflow-x', 'scroll');
        }
      }
      else {
        if (centerViewWidth > centerFullWidth) {
          showBottomScroll = false;
          me.scrollBottomEl.addCls(HIDDEN_CLS);

          if(w.doubleHorizontalScroll){
            me.scrollTopEl.addCls(HIDDEN_CLS);
          }
        }
        else {
          showBottomScroll = true;
          me.scrollBottomEl.removeCls(HIDDEN_CLS);

          if(w.doubleHorizontalScroll){
            me.scrollTopEl.removeCls(HIDDEN_CLS);
          }
        }
      }

      return showBottomScroll;
    },
    /*
     *
     */
    checkCorner: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      me.corner = !me.scrollRightEl.hasCls(HIDDEN_CLS) && !me.scrollBottomEl.hasCls(HIDDEN_CLS);
    },
    /*
     *
     */
    setBottomKnobSize: function () {
      var me = this,
        w = me.widget;

      if (w.nativeScroller) {
        return;
      }

      var centerViewWidth = w.getCenterViewWidth() - (me.corner ? me.cornerSize : 0),
        centerFullWidth = w.getCenterFullWidth() - (me.corner ? me.cornerSize : 0),
        scrollBottomPath = centerFullWidth - centerViewWidth,
        percents = 100 - scrollBottomPath / (centerFullWidth / 100),
        knobWidth = centerViewWidth * (percents / 100) - 2;

      if (knobWidth < me.minBottomKnobWidth) {
        knobWidth = me.minBottomKnobWidth;
      }

      me.bottomKnob.stop();
      me.bottomKnob.animate({width: knobWidth}, F.ANIMATE_DURATION);

      if(w.doubleHorizontalScroll){
        me.topKnob.stop();
        me.topKnob.animate({width: knobWidth}, F.ANIMATE_DURATION);
      }

      me.bottomKnobWidth = knobWidth;
      me.bodyViewWidth = centerViewWidth;
      me.bottomScrollScale = (centerViewWidth - centerFullWidth) / (centerViewWidth - knobWidth - 2 - 1);
    },
    /*
     * @param {Number} y
     * @param {Number} x
     * @param {Boolean} [animate]
     */
    scroll: function (y, x, animate) {
      var me = this,
        w = me.widget,
        scrollInfo;

      if(x > 0){
        x = 0;
      }

      if (w.nativeScroller) {
        if (y !== null && y !== undefined) {
          w.body.el.dom.scrollTop = y;
        }

        if (x !== null && x !== undefined) {
          w.body.el.dom.scrollLeft = Math.abs(x);
          if (w.header) {
            w.header.scroll(x, true);
          }
        }

        w.fire('scroll');
        return
      }

      w.leftBody.scroll(y);
      scrollInfo = w.body.scroll(y, x, animate);
      w.rightBody.scroll(y);

      if (scrollInfo.scrollTop !== undefined) {
        me.scrollTop = Math.abs(scrollInfo.scrollTop);
      }

      if (scrollInfo.scrollLeft !== undefined) {
        me.scrollLeft = Math.abs(scrollInfo.scrollLeft);
      }

      w.fire('scroll');
    },
    /*
     * @param {Number} value
     * @return {Boolean}
     */
    scrollDelta: function (value) {
      var me = this,
        w = me.widget,
        scrollInfo;

      w.leftBody.wheelScroll(value);
      scrollInfo = w.body.wheelScroll(value);
      w.rightBody.wheelScroll(value);

      if(scrollInfo === undefined){
        return;
      }

      me.scrollTop = Math.abs(scrollInfo.newScroll);
      //me.scrollLeft = Math.abs(scrollInfo.scrollLeft);

      w.fire('scroll');

      return scrollInfo.scrolled;
    },
    /*
     *
     */
    scrollRightKnob: function () {
      var me = this,
        w = me.widget,
        bodyScrolled = me.getScroll(),
        newKnobScroll = bodyScrolled / me.rightScrollScale + w.knobOffSet;

      if (!me.rightKnob) {
        return;
      }

      if (w.doubleHorizontalScroll) {
        newKnobScroll += me.cornerSize;
      }

      me.rightKnob.css('margin-top', newKnobScroll + 'px');
    },
    /*
     *
     */
    scrollBottomKnob: function () {
      var me = this,
        w = me.widget,
        scrolled = me.getBottomScroll(),
        newKnobScroll = scrolled / me.bottomScrollScale + w.knobOffSet;

      if (scrolled === 0) {
        newKnobScroll = -1;
      }

      if (!me.bottomKnob) {
        return;
      }

      me.bottomKnob.css('margin-left', -newKnobScroll + 'px');

      if(w.doubleHorizontalScroll){
        me.topKnob.css('margin-left', -newKnobScroll + 'px');
      }
    },
    /*
     * @return {Number}
     */
    getScroll: function () {
      var me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollTop;
      }

      return Math.abs(parseInt(w.body.el.select('.' + GRID_COLUMN_CLS).item(0).css('top')));
    },
    /*
     * @return {Number}
     */
    getBottomScroll: function () {
      var me = this,
        w = me.widget;

      if(w.nativeScroller){
        return w.body.el.dom.scrollLeft;
      }

      return Math.abs(parseInt(w.body.el.select('.' + GRID_COLUMN_CLS).item(0).css('left')));
    },
    /*
     * @param {Number} [viewHeight]
     */
    update: function (viewHeight) {
      var me = this;

      me.setScrollBars(viewHeight);
      me.checkScroll(viewHeight);

      me.scrollRightKnob();
      me.scrollBottomKnob();
    },
    /*
     *
     */
    onChangeStore: function () {
      this.update();
    },
    /*
     *
     */
    onColumnResize: function () {
      var me = this;

      me.setScrollBars();

      setTimeout(function () {
        me.setScrollBars();
      }, Fancy.ANIMATE_DURATION + 20);
    },
    /*
     * @param {Number} [viewHeight]
     */
    checkScroll: function (viewHeight) {
      var me = this,
        w = me.widget,
        rightScrolled = me.getScroll(),
        bodyViewHeight = w.getBodyHeight() - (me.corner ? me.cornerSize : 0),
        cellsViewHeight = (viewHeight || w.getCellsViewHeight()) - (me.corner ? me.cornerSize : 0),
        centerColumnsWidth = w.getCenterFullWidth(),
        viewWidth = w.getCenterViewWidth();

      if(centerColumnsWidth < me.scrollLeft + viewWidth){
        setTimeout(function () {
          var delta = centerColumnsWidth - (me.scrollLeft + viewWidth);

          if(me.scrollLeft + delta < 0){
            w.scroll(me.scrollTop, 0, true);
          }
          else {
            w.scroll(me.scrollTop, (me.scrollLeft + delta), true);
          }
        }, F.nojQuery? 10: F.ANIMATE_DURATION);
        return;
      }

      if (rightScrolled && cellsViewHeight < bodyViewHeight) {
        me.scroll(0);
        if (!w.nativeScroller) {
          me.scrollRightKnob();
        }
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    scrollToCell: function (cell, nativeScroll, firstRowIsVisible) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        cellEl = F.get(cell),
        columnEl = cellEl.parent(),
        rowIndex = Number(cellEl.attr('index')),
        columnIndex = Number(columnEl.attr('index')),
        rightScroll = me.getScroll(),
        passedHeight = cellHeight * (rowIndex + 1),
        bodyViewHeight = w.getBodyHeight(),
        bottomScroll = me.getBottomScroll(),
        side = w.getSideByCell(cell),
        bodyColumnsWidth = w.getColumnsWidth(side),
        bodyViewWidth = parseInt(w.body.el.css('width')),
        passedWidth = 0,
        isCenterBody = columnEl.parent().parent().hasCls(GRID_CENTER_CLS);

      if(w.nativeScroller && !nativeScroll){
        return;
      }

      if (rowIndex === 0 && columnIndex === 0) {
        me.scroll(0, 0);
        me.scrollBottomKnob();
        me.scrollRightKnob();
        return;
      }

      if(w.grouping){
        passedHeight += w.grouping.getSpecialRowsAbove(rowIndex) * w.groupRowHeight;
      }

      if(w.expander){
        passedHeight += w.expander.getBeforeHeight(rowIndex);
      }

      if (firstRowIsVisible) {
        var cellViewsHeight = w.getCellsViewHeight();

        rightScroll = passedHeight - cellHeight;

        if(cellViewsHeight - rightScroll < bodyViewHeight){
          rightScroll -= Math.abs(cellViewsHeight - rightScroll - bodyViewHeight);
        }

        me.scroll(rightScroll);
      }
      else if (passedHeight - rightScroll > bodyViewHeight) {
        rightScroll = passedHeight - bodyViewHeight + 5;
        me.scroll(rightScroll);
      }
      else if(passedHeight - rightScroll < w.cellHeight){
        rightScroll -= cellHeight;
        if(rightScroll < 0){
          rightScroll = 0;
        }
        me.scroll(rightScroll);
      }

      if (isCenterBody) {
        var columns = w.columns,
          i = 0;

        for (; i <= columnIndex; i++) {
          passedWidth += columns[i].width;
        }

        if (passedWidth - bottomScroll > bodyViewWidth) {
          if (!columns[i]) {
            me.scroll(rightScroll, -(bodyColumnsWidth - bodyViewWidth));
          }
          else {
            me.scroll(rightScroll, -(bottomScroll + (passedWidth - bottomScroll) - bodyViewWidth));
          }
        }
        else if(passedWidth - bottomScroll < columns[columnIndex].width){
          bottomScroll = -(passedWidth - columns[columnIndex].width);
          if(bottomScroll > 0){
            bottomScroll = 0;
          }

          me.scroll(rightScroll, bottomScroll);
        }
        else if (bottomScroll !== 0) {
          if (columnIndex === 0) {
            me.scroll(rightScroll, 0);
          }
        }

        me.scrollBottomKnob();
      }

      me.scrollRightKnob();
    },
    /*
     *
     */
    onNativeScrollBody: function(){
      var me = this,
        w = me.widget,
        scrollTop = w.body.el.dom.scrollTop,
        scrollLeft = w.body.el.dom.scrollLeft;

      if(w.header){
        w.header.scroll(-scrollLeft);
      }

      if (w.leftBody){
        w.leftBody.el.dom.scrollTop = scrollTop;
      }

      if (w.rightBody){
        w.rightBody.el.dom.scrollTop = scrollTop;
      }

      if(w.leftColumns.length && w.leftBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        w.body.el.dom.scrollTop = w.leftBody.el.dom.scrollTop;
      }
      else if(w.rightColumns.length && w.rightBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        w.body.el.dom.scrollTop = w.rightBody.el.dom.scrollTop;
      }

      w.fire('nativescroll');
    },
    /*
     *
     */
    onNativeScrollLeftBody: function(){
      var w = this.widget;

      if(w.leftBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     *
     */
    onNativeScrollRightBody: function(){
      var w = this.widget;

      if(w.rightBody.el.dom.scrollTop !== w.body.el.dom.scrollTop){
        this.onNativeScrollBody();
      }
    },
    /*
     * @param {Object} e
     */
    onMouseWheelLeft: function (e) {
      var w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     * @param {Object} e
     */
    onMouseWheelRight: function (e) {
      var w = this.widget,
        delta = F.getWheelDelta(e.originalEvent || e),
        scrollTop = delta * w.cellHeight;

      w.leftBody.el.dom.scrollTop -= scrollTop;
      w.body.el.dom.scrollTop -= scrollTop;
      w.rightBody.el.dom.scrollTop -= scrollTop;
    },
    /*
     *
     */
    onLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onRightLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onUnLockColumn: function () {
      this.update();
      this.widget.setColumnsPosition();
    },
    /*
     *
     */
    onPanelResize: function () {
      var me = this,
        w = me.widget;

      w.scroll(0, 0);
    },
    onChangePages: function () {
      var me = this,
        w = me.widget;

      if(!w.nativeScroller && me.scrollTop){
        setTimeout(function () {
          me.scrollDelta(0);
        }, 1);

      }
    },
    onScrollBodyBugFix: function () {
      var me = this,
        w = me.widget,
        body = w.body,
        scrollLeft = body.el.dom.scrollLeft;

      body.el.dom.scrollLeft = me.scrollLeft;
      w.scroll(me.scrollTop, -me.scrollLeft - scrollLeft);
    }
  });

})();/*
 * @class Fancy.grid.plugin.LoadMask
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.LoadMask', {
  extend: Fancy.Plugin,
  ptype: 'grid.loadmask',
  inWidgetName: 'loadmask',
  cls: 'fancy-loadmask',
  innerCls: 'fancy-loadmask-inner',
  imageCls: 'fancy-loadmask-image',
  textCls: 'fancy-loadmask-text',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
    this.ons();
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
      if(s.loading){
        me.onBeforeLoad();
      }
      w.on('beforeload', me.onBeforeLoad, me);
      w.on('load', me.onLoad, me);
    });
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget,
      wEl = w.el,
      renderTo = wEl,
      width,
      height,
      el = Fancy.get( document.createElement('div')),
      lang = w.lang;

    if(w.panel){
      renderTo = w.panel.el;
    }

    width = renderTo.width();
    height = renderTo.height();

    el.addCls(me.cls);

    if( w.theme !== 'default' ){
      el.addCls('fancy-theme-' + w.theme);
    }

    el.css({
      width: width,
      height: height,
      opacity: 0
    });

    el.update([
      '<div class="'+me.innerCls+'">' +
        '<div class="'+me.imageCls+'"></div>'+
        '<div class="'+me.textCls+'">' + lang.loadingText +'</div>'+
      '</div>'
    ].join(' '));

    me.el = Fancy.get(renderTo.dom.appendChild(el.dom));
    me.innerEl = me.el.select('.' + me.innerCls);
    me.textEl = me.el.select('.'+me.textCls);

    var innerWidth = me.innerEl.width(),
      innerHeight = me.innerEl.height();

    me.innerEl.css({
      left: width/2 - innerWidth/2,
      top: height/2 - innerHeight/2
    });

    if(w.store.loading !== true){
      el.css('display', 'none');
    }
    else{
      el.css('display', 'block');
      me.showLoadMask();
    }
    el.css('opacity', 1);
  },
  /*
   *
   */
  onBeforeLoad: function(){
    this.showLoadMask();
  },
  /*
   *
   */
  onLoad: function(){
    this.hideLoadMask();
  },
  /*
   * @param {String} text
   */
  showLoadMask: function(text){
    var me = this,
      w = me.widget,
      lang = w.lang,
      width = w.getWidth(),
      height = w.getHeight();

    me.el.css('display', 'block');

    me.el.css({
      height: height,
      width: width
    });

    var innerWidth = Math.abs(me.innerEl.width()),
      innerHeight = Math.abs(me.innerEl.height());

    var left = width/2 - innerWidth/2,
      top = height/2 - innerHeight/2;

    me.innerEl.css({
      left: left,
      top: top
    });

    if(text){
      me.textEl.update(text);
      me.el.css('display', 'block');
      return;
    }

    me.loaded = false;

    setTimeout(function(){
      if(me.loaded !== true){
        me.textEl.update(lang.loadingText);

        me.el.css('display', 'block');
      }
    }, 50);
  },
  /*
   *
   */
  hideLoadMask: function(){
    this.loaded = true;
    this.el.css('display', 'none');
  }
});/*
 * @class Fancy.grid.plugin.ColumnResizer
 * @extend Fancy.Plugin
 */
(function () {
  //SHORTCUTS
  var F = Fancy;
  var G = F.get;

  //CONSTANTS
  var FIELD_CLS = F.FIELD_CLS;
  var GRID_RESIZER_LEFT_CLS = F.GRID_RESIZER_LEFT_CLS;
  var GRID_RESIZER_RIGHT_CLS = F.GRID_RESIZER_RIGHT_CLS;
  var GRID_HEADER_CELL_TRIGGER_CLS = F.GRID_HEADER_CELL_TRIGGER_CLS;
  var GRID_HEADER_CELL_TRIGGER_IMAGE_CLS = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  var GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  var GRID_COLUMN_RESIZER_CLS = F.GRID_COLUMN_RESIZER_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  var GRID_STATE_RESIZE_COLUMN_CLS = F.GRID_STATE_RESIZE_COLUMN_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.plugin.ColumnResizer', {
    extend: F.Plugin,
    ptype: 'grid.columnresizer',
    inWidgetName: 'columnresizer',
    /*
     * @param {Object} config
     */
    constructor: function (config) {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this,
        w = me.widget;

      me.Super('init', arguments);

      if(!w.header){
        return;
      }

      w.on('render', function () {
        me.render();
        me.ons();
      });
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget;

      w.on('headercellmousemove', me.onCellMouseMove, me);
      w.on('headercellmousedown', me.onHeaderCellMouseDown, me);
      w.on('docclick', me.onDocClick, me);
      w.on('docmove', me.onDocMove, me);
      w.on('docmouseup', me.onDocMouseUp, me);
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellMouseMove: function (grid, o) {
      var me = this,
        w = me.widget,
        e = o.e,
        cellEl = G(o.cell),
        offsetX = e.offsetX,
        cellWidth = cellEl.width(),
        target = G(e.target),
        isInTrigger = target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS),
        isInTriggerImage = target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS),
        triggerEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0),
        triggerImageEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS).item(0),
        hasFieldInSide = G(e.target).closest('.' + FIELD_CLS).hasCls(FIELD_CLS),
        triggerWidth = parseInt(triggerEl.css('width')),
        triggerImageWidth = parseInt(triggerImageEl.css('width')),
        _width = cellWidth,
        inOffsetX = 7;

      if (isInTrigger) {
        _width = triggerWidth;
      }

      if (isInTriggerImage) {
        _width = triggerImageWidth;
      }

      if (w.startResizing) {
        return;
      }

      if(isInTriggerImage){
        me.removeCellResizeCls(o.cell);
        return;
      }

      if (o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2) {
        inOffsetX += 2;
      }

      if (!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX) {
        if (me.isColumnResizable(o)) {
          if (!hasFieldInSide) {
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if (!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.side === 'center' && o.index === 0 && w.leftColumns.length) {
        o.side = 'left';
        o.index = w.leftColumns.length - 1;
        if (me.isColumnResizable(o)) {
          if (!hasFieldInSide) {
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if (!isInTrigger && !isInTriggerImage && ( (_width - offsetX) < inOffsetX || offsetX < inOffsetX) && o.index !== 0) {
        var isLeft = offsetX < inOffsetX;

        if (me.isColumnResizable(o, isLeft)) {
          if (!hasFieldInSide) {
            me.addCellResizeCls(o.cell);
          }
        }
      }
      else if ((_width - offsetX) < inOffsetX) {
        if (isInTriggerImage) {
          if (triggerImageWidth - offsetX > 2) {
            me.removeCellResizeCls(o.cell);
          }
          else {
            me.addCellResizeCls(o.cell);
          }
        }
        else if (me.isColumnResizable(o)) {
          me.addCellResizeCls(o.cell);
        }
      }
      else {
        me.removeCellResizeCls(o.cell);
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    addCellResizeCls: function (cell) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag;

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      G(cell).addCls(GRID_COLUMN_RESIZER_CLS);
      G(cell).select('.' + GRID_HEADER_CELL_TRIGGER_CLS).addCls(GRID_COLUMN_RESIZER_CLS);
    },
    /*
     * @param {Fancy.Element} cell
     */
    removeCellResizeCls: function (cell) {
      G(cell).removeClass(GRID_COLUMN_RESIZER_CLS);
      G(cell).select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0).removeClass(GRID_COLUMN_RESIZER_CLS);
    },
    /*
     * @param {Object} e
     * @param {Object} o
     */
    onHeaderCellMouseDown: function (e, o) {
      var me = this,
        w = me.widget,
        e = o.e,
        target = G(e.target),
        cellEl = G(o.cell),
        offsetX = e.offsetX,
        cellWidth = cellEl.width(),
        field = cellEl.select('.' + FIELD_CLS),
        isInTrigger = target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS),
        isInTriggerImage = target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS),
        triggerEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_CLS).item(0),
        triggerImageEl = cellEl.select('.' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS).item(0),
        triggerWidth = parseInt(triggerEl.css('width')),
        triggerImageWidth = parseInt(triggerImageEl.css('width')),
        _width = cellWidth,
        inOffsetX = 7;

      if (isInTrigger) {
        _width = triggerWidth;
      }

      if (isInTriggerImage) {
        _width = triggerImageWidth;
        return;
      }

      if (field.length > 0 && field.item(0).within(target.dom)) {
        return;
      }

      if (o.side === 'left' && o.index === w.leftColumns.length - 1 && (_width - offsetX) < inOffsetX + 2) {
        inOffsetX += 2;
      }

      if (!isInTrigger && !isInTriggerImage && o.side === 'right' && o.index === 0 && offsetX < inOffsetX) {
        w.startResizing = true;
        F.apply(me, {
          cell: o.cell,
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index,
          moveLeftResizer: true
        });
      }
      else if (offsetX < 7 && o.side === 'center' && o.index === 0 && w.leftColumns.length) {
        w.startResizing = true;
        o.side = 'left';
        o.index = w.leftColumns.length - 1;
        F.apply(me, {
          cell: me.getCell(o),
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index
        });
      }
      else if (!isInTrigger && !isInTriggerImage && offsetX < inOffsetX && o.index !== 0) {
        w.startResizing = true;
        F.apply(me, {
          cell: me.getPrevCell(o),
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index - 1
        });
      }
      else if ((_width - offsetX) < inOffsetX) {
        w.startResizing = true;
        F.apply(me, {
          cell: o.cell,
          activeSide: o.side,
          clientX: e.clientX,
          columnIndex: o.index
        });
      }

      if (w.startResizing) {
        me.isColumnResizable();
      }
    },
    /*
     * @param {Object} o
     * @param {Boolean} isLeft
     * @return {Boolean}
     */
    isColumnResizable: function (o, isLeft) {
      var me = this,
        w = me.widget,
        columns,
        column,
        index;

      if (o) {
        columns = w.getColumns(o.side);
        index = o.index;
        if (isLeft) {
          index--;

          column = columns[index];
          if(index > 0 && columns[index].hidden){
            index--;
          }
        }
        if (isNaN(index)) {
          return;
        }

        column = columns[index];

        if(index === 0 && column.hidden){
          if(o.side === 'center' && w.leftColumns){}
          else {
            return false;
          }
        }

        if(column.hidden){
          return false;
        }

        return column.resizable === true;
      }
      else {
        columns = w.getColumns(me.activeSide);
        if (columns[me.columnIndex].resizable !== true) {
          w.startResizing = false;
          delete me.cell;
          delete me.activeSide;
          delete me.clientX;
          delete me.columnIndex;
        }
      }
    },
    /*
     * @return {Number}
     */
    getMinColumnWidth: function () {
      var me = this,
        w = me.widget,
        minCellWidth = w.minCellWidth,
        columns,
        column;

      if (me.columnIndex === undefined) {
        return minCellWidth;
      }

      columns = w.getColumns(me.activeSide);
      column = columns[me.columnIndex];

      if (column.minWidth) {
        return column.minWidth;
      }

      return minCellWidth;
    },
    /*
     * @return {Number|false}
     */
    getMaxColumnWidth: function () {
      var me = this,
        w = me.widget,
        columns,
        column;

      if (me.columnIndex === undefined) {
        return false;
      }

      columns = w.getColumns(me.activeSide);
      column = columns[me.columnIndex];

      if (column.maxWidth) {
        return column.maxWidth;
      }

      return false;
    },
    /*
     *
     */
    onDocClick: function () {
      this.widget.startResizing = false;
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} e
     */
    onDocMove: function (grid, e) {
      if (this.widget.startResizing) {
        this.moveResizeEls(e);
      }
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        leftEl = G(document.createElement('div')),
        rightEl = G(document.createElement('div'));

      leftEl.addCls(GRID_RESIZER_LEFT_CLS);
      rightEl.addCls(GRID_RESIZER_RIGHT_CLS);

      me.leftEl = G(w.el.dom.appendChild(leftEl.dom));
      me.rightEl = G(w.el.dom.appendChild(rightEl.dom));
    },
    /*
     * @param {Object} e
     */
    moveResizeEls: function (e) {
      var me = this,
        w = me.widget,
        cellEl = G(me.cell),
        left = parseInt(cellEl.css('left')),
        minWidth = me.getMinColumnWidth(),
        maxWidth = me.getMaxColumnWidth();

      if(w.header.hideMenu){
        w.header.hideMenu();
      }

      w.el.addCls(GRID_STATE_RESIZE_COLUMN_CLS);
      F.get(document.body).addCls(GRID_STATE_RESIZE_COLUMN_CLS);

      switch (me.activeSide) {
        case 'left':
          break;
        case 'center':
          left += parseInt(w.leftEl.css('width'));
          break;
        case 'right':
          left += parseInt(w.leftEl.css('width'));
          left += parseInt(w.centerEl.css('width'));
          break;
      }

      var clientX = e.clientX,
        deltaClientX = clientX - me.clientX,
        cellWidth = cellEl.width() + deltaClientX;

      if (cellWidth < minWidth) {
        cellWidth = minWidth;
      }

      if (maxWidth && cellWidth > maxWidth) {
        cellWidth = maxWidth;
      }

      me.deltaWidth = cellEl.width() - cellWidth;

      if (me.moveLeftResizer) {
        deltaClientX = clientX - me.clientX;
        cellWidth = cellEl.width() - deltaClientX;

        if (cellWidth < minWidth) {
          cellWidth = minWidth;
        }

        me.deltaWidth = cellEl.width() - cellWidth;

        me.leftEl.css({
          display: 'block',
          left: left + deltaClientX + 'px'
        });

        me.rightEl.css({
          display: 'block',
          left: (left + cellEl.width() - 1) + 'px'
        });
      }
      else {
        me.leftEl.css({
          display: 'block',
          left: left + 'px'
        });

        me.rightEl.css({
          display: 'block',
          left: left + cellWidth + 'px'
        });
      }

      me.cellWidth = cellWidth;
    },
    /*
     *
     */
    onDocMouseUp: function () {
      var me = this,
        w = me.widget;

      if (w.startResizing === false) {
        return;
      }

      w.el.removeCls(GRID_STATE_RESIZE_COLUMN_CLS);
      F.get(document.body).removeCls(GRID_STATE_RESIZE_COLUMN_CLS);

      me.leftEl.css({
        display: 'none'
      });

      me.rightEl.css({
        display: 'none'
      });
      me.fixSidesWidth();
      w.startResizing = false;
      me.moveLeftResizer = false;
      delete me.cellWidth;

      w.scroller.update();
    },
    /*
     *
     */
    fixSidesWidth: function () {
      var me = this,
        w = me.widget,
        cellWidth = me.cellWidth,
        index = me.columnIndex,
        delta = me.deltaWidth,
        domColumns,
        domHeaderCells,
        leftEl = w.leftEl,
        centerEl = w.centerEl,
        rightEl = w.rightEl,
        leftHeaderEl = w.leftHeader.el,
        centerHeaderEl = w.header.el,
        rightHeaderEl = w.rightHeader.el,
        centerBodyEl = w.body.el,
        groupMove = {},
        ignoreGroupIndexes = {},
        column,
        newCenterWidth,
        minCenterWidth = me.minCenterWidth;

      if (cellWidth === undefined) {
        return;
      }

      var leftFix = 1;
      if (F.nojQuery) {
        leftFix = 0;
      }

      switch (me.activeSide) {
        case 'left':
          newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

          if (newCenterWidth < minCenterWidth) {
            return;
          }

          column = w.leftColumns[index];

          w.leftColumns[me.columnIndex].width = cellWidth;
          domColumns = w.leftBody.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.leftHeader.el.select('.' + GRID_HEADER_CELL_CLS);
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++) {
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex) {
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++) {
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i);

            domColumnEl.animate({left: parseInt(domColumnEl.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]) {}
            else {
              domHeaderCell.animate({left: parseInt(domHeaderCell.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            }
          }

          leftEl.animate({width: parseInt(leftEl.css('width')) - delta - leftFix}, ANIMATE_DURATION);
          leftHeaderEl.animate({width: parseInt(leftHeaderEl.css('width')) - delta - leftFix + 'px'}, ANIMATE_DURATION);

          if (w.columns.length) {
            //Bug fix for dom fx without jQuery
            centerEl.animate({
              left: parseInt(centerEl.css('left')) - delta - leftFix,
              width: newCenterWidth
            }, ANIMATE_DURATION);
            centerHeaderEl.animate({width: parseInt(centerHeaderEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
            centerBodyEl.animate({width: parseInt(centerBodyEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
          }

          break;
        case 'center':
          column = w.columns[index];
          w.columns[me.columnIndex].width = cellWidth;
          domColumns = w.body.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.header.el.select('.' + GRID_HEADER_CELL_CLS);
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++) {
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex) {
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++) {
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i),
              left = parseInt(domColumnEl.css('left')) - delta - leftFix,
              _left = parseInt(domHeaderCell.css('left')) - delta - leftFix;

            if (domHeaderCell.attr('group-index')) {
              groupMove[domHeaderCell.attr('group-index')] = {};
            }

            domColumnEl.animate({left: left}, ANIMATE_DURATION);

            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]) {}
            else {
              domHeaderCell.animate({left: _left}, ANIMATE_DURATION);
            }
          }

          break;
        case 'right':
          newCenterWidth = parseInt(centerEl.css('width')) + delta + leftFix;

          if (newCenterWidth < minCenterWidth) {
            return;
          }

          column = w.rightColumns[index];

          w.rightColumns[me.columnIndex].width = cellWidth;
          domColumns = w.rightBody.el.select('.' + GRID_COLUMN_CLS);
          domHeaderCells = w.rightHeader.el.select('.' + GRID_HEADER_CELL_CLS);
          var columnEl = domColumns.item(index);
          columnEl.animate({width: cellWidth + 'px'}, ANIMATE_DURATION);
          //Bug fix: jQuery add overflow. It causes bad side effect for column cells.
          columnEl.css('overflow', '');

          var i = me.columnIndex + 1,
            iL = domHeaderCells.length,
            _i = 0,
            _iL = i;

          for (; _i < _iL; _i++) {
            var domHeaderCell = domHeaderCells.item(_i),
              groupIndex = domHeaderCell.attr('group-index');

            if (groupIndex) {
              ignoreGroupIndexes[groupIndex] = true;
            }
          }

          for (; i < iL; i++) {
            var domColumnEl = domColumns.item(i),
              domHeaderCell = domHeaderCells.item(i);

            domColumnEl.animate({left: parseInt(domColumnEl.css('left')) - delta - leftFix}, ANIMATE_DURATION);

            if (domHeaderCell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS) && ignoreGroupIndexes[domHeaderCell.attr('index')]) {}
            else {
              domHeaderCell.animate({left: parseInt(domHeaderCell.css('left')) - delta - leftFix}, ANIMATE_DURATION);
            }
          }

          rightEl.animate({width:  parseInt(rightEl.css('width')) - delta - leftFix}, ANIMATE_DURATION);
          rightHeaderEl.animate({width: parseInt(rightHeaderEl.css('width')) - delta - leftFix + 'px'}, ANIMATE_DURATION);

          if (w.columns.length) {
            centerEl.animate({width: newCenterWidth}, ANIMATE_DURATION);
            centerHeaderEl.animate({width: parseInt(centerHeaderEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
            centerBodyEl.animate({width: parseInt(centerBodyEl.css('width')) + delta + leftFix}, ANIMATE_DURATION);
          }
          break;
      }


      var cellEl = G(me.cell),
        groupName = cellEl.attr('group-index'),
        groupCell;

      cellEl.animate({width: cellWidth + 'px'}, ANIMATE_DURATION);

      if (groupName) {
        groupCell = w.el.select("[index='" + groupName + "']");
        groupCell.animate({width: parseInt(groupCell.css('width')) - delta - leftFix}, ANIMATE_DURATION);
      }
      else {
          for (var p in groupMove) {
            groupCell = w.el.select("[index='" + p + "']");
            //groupCell.animate({left: parseInt(groupCell.css('left')) - (groupMove[p].delta || 0) - leftFix}, ANIMATE_DURATION);
            groupCell.css('left', parseInt(groupCell.css('left')) - (groupMove[p].delta || 0) - leftFix);
          }
      }

      w.fire('columnresize', {
        cell: cellEl.dom,
        width: cellWidth,
        column: column,
        side: me.activeSide
      });

      if (/sparkline/.test(column.type)) {
        switch (me.activeSide) {
          case 'left':
            w.leftBody.updateRows(undefined, index);
            break;
          case 'center':
            w.body.updateRows(undefined, index);
            break;
          case 'right':
            w.rightBody.updateRows(undefined, index);
            break;
        }
      }
    },
    /*
     * @param {Object} o
     * @return {Fancy.Element}
     */
    getPrevCell: function (o) {
      var me = this,
        w = me.widget,
        header;

      switch (o.side) {
        case 'left':
          header = w.leftHeader;
          break;
        case 'center':
          header = w.header;
          break;
        case 'right':
          header = w.rightHeader;
          break;
      }

      var cell = header.el.select('.' + GRID_HEADER_CELL_CLS).item(o.index - 1).dom,
        cellEl = F.get(cell);

      if(cellEl.css('display') === 'none' && o.index !== 0){
        o.cell = cell;
        o.index--;
        return me.getPrevCell(o);
      }

      return cell;
    },
    /*
     * @param {Object} o
     * @return {HTMLElement}
     */
    getCell: function (o) {
      var me = this,
        w = me.widget,
        header;

      switch (o.side) {
        case 'left':
          header = w.leftHeader;
          break;
        case 'center':
          header = w.header;
          break;
        case 'right':
          header = w.rightHeader;
          break;
      }

      return header.el.select('.' + GRID_HEADER_CELL_CLS).item(o.index).dom;
    },
    /*
     * @param {String} side
     */
    updateColumnsWidth: function (side) {
      var me = this,
        w = me.widget,
        side = side || 'center',
        header = w.getHeader(side),
        columns = w.getColumns(side),
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];

        if(column.hidden){
          continue;
        }

        me.setColumnWidth(i, column.width, side);
      }

      header.setCellsPosition();
    },
    /*
     * @param {Number} index
     * @param {Number} width
     * @param {String} side
     */
    setColumnWidth: function (index, width, side) {
      var me = this,
        w = me.widget,
        columns = w.getColumns(side),
        header = w.getHeader(side),
        body = w.getBody(side),
        columnEl = G(body.getDomColumn(index)),
        headerCellEl = header.getCell(index),
        nextHeaderCellEl,
        nextColumnEl,
        left = parseInt(columnEl.css('left'));

      columnEl.css('width', width);
      headerCellEl.css('width', width);

      if (columns[index + 1]) {
        left += width;

        nextColumnEl = G(body.getDomColumn(index + 1));
        nextColumnEl.css('left', left);

        nextHeaderCellEl = header.getCell(index + 1);
        nextHeaderCellEl.css('left', left);
      }
    }
  });

})();/*
 * @class Fancy.grid.plugin.Licence
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Licence', {
  extend: Fancy.Plugin,
  ptype: 'grid.licence',
  inWidgetName: 'licence',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
    this.ons();
  },
  /*
   *
   */
  ons: function(){
    var me = this,
      w = me.widget;

    w.once('render', function() {
      me.render();
    });
  },
  /*
   *
   */
  render: function(){
    var me = this,
      w = me.widget,
      body = w.body,
      licenceEl = Fancy.get(document.createElement('div'));

    if(/fancygrid/.test(location.host) && !w.watermark){
      return;
    }

    if( me.checkLicence() === true && !w.watermark){
      return;
    }

    licenceEl.css({
      position: 'absolute',
      'z-index': 2,
      width: '30px',
      height: '30px'
    });

    if(w.nativeScroller){
      licenceEl.css({
        top: '2px',
        left: '2px'
      });
    }
    else{
      licenceEl.css({
        right: '4px',
        bottom: '0px'
      });
    }

    licenceEl.update('<a href="http://www.fancygrid.com" title="JavaScript Grid - FancyGrid" style="background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAPklEQVR42mNgGLGAo+/4f1IwTN+i8y/+k4JHLR61eNTiUYuHgcUjD5AbZORG0ajFoxaPWjxq8RC2eBQMWwAAuxzh7E9tdUsAAAAASUVORK5CYII=);color: #60B3E2;font-size: 25px;line-height: 30px;text-decoration: none;">&nbsp;&nbsp;&nbsp;&nbsp;</a>');

    Fancy.get(body.el.append(licenceEl.dom));

    me.licenceEl = licenceEl;

    if(w.watermark){
      me.configWatermark();
    }

    me.showConsoleText();
  },
  showConsoleText: function(){
    if(!window.console || !console.log){
      return;
    }

    if(!Fancy.isChrome){
      return;
    }

    console.log("%cFancy%cGrid%c %cTrial%c Version!",
      'color:#A2CFE8;font-size: 14px;font-weight: bold;',
      'color:#088EC7;font-size: 14px;font-weight: bold;',
      'font-weight:bold;color: #515151;font-size: 12px;',
      'color: red;font-weight: bold;font-size: 14px;',
      'font-weight:bold;color: #515151;font-size: 12px;'
    );

    console.log("%cPurchase license for legal usage!\nSales email: sales@fancygrid.com", 'font-weight:bold;color: #515151;font-size: 12px;');
  },
  /*
   *
   */
  configWatermark: function(){
    var me = this,
      w = me.widget,
      watermark = w.watermark;

    if(watermark.text){
      var link = me.licenceEl.firstChild();

      link.css('background-image', 'none');
      link.css('font-size', '11px');
      link.update(watermark.text);
      me.licenceEl.css('width', 'initial');
    }

    if(watermark.style){
      me.licenceEl.css(watermark.style);
    }
  },
  /*
   * @return {Boolean}
   */
  checkLicence: function(){
    var me = this,
      keyWord = 'FancyGrid';

    if(!Fancy.LICENSE && !FancyGrid.LICENSE){
      return false;
    }

    var hostCode = String(me.md5(location.host.replace(/^www\./, ''), keyWord)),
      i,
      iL,
      license,
      LICENSE = Fancy.LICENSE || FancyGrid.LICENSE || [],
      UNIVERSAL = me.md5('UNIVERSAL', keyWord),
      SAAS = me.md5('SAAS', keyWord),
      INTERNAL = me.md5('INTERNAL', keyWord),
      OEM = me.md5('OEM', keyWord),
      ENTERPRISE = me.md5('ENTERPRISE', keyWord);

    i = 0;
    iL = LICENSE.length;

    for(;i<iL;i++){
      license = String(LICENSE[i]);

      switch (license){
        case hostCode:
        case UNIVERSAL:
        case SAAS:
        case INTERNAL:
        case OEM:
        case ENTERPRISE:
          return true;
      }
    }

    return false;
  },
  /*
   * @param {String} string
   * @param {String} key
   * @param {String} raw
   * @return {String}
   */
  md5: function(string, key, raw){
      /*
       * Add integers, wrapping at 2^32. This uses 16-bit operations internally
       * to work around bugs in some JS interpreters.
       */
      var safe_add = function(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
          msw = (x >> 16) + (y >> 16) + (lsw >> 16);

        return (msw << 16) | (lsw & 0xFFFF);
      };

      /*
       * Bitwise rotate a 32-bit number to the left.
       */
      var bit_rol = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
      };

      /*
       * These functions implement the four basic operations the algorithm uses.
       */
      var md5_cmn = function(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      };

      var md5_ff = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
      };

      var md5_gg = function(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
      };

      var md5_hh = function(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      };

      var md5_ii = function(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
      };

      /*
       * Calculate the MD5 of an array of little-endian words, and a bit length.
       */
      var binl_md5 = function(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i,
          olda,
          oldb,
          oldc,
          oldd,
          a = 1732584193,
          b = -271733879,
          c = -1732584194,
          d = 271733878;

        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;

          a = md5_ff(a, b, c, d, x[i], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }

        return [a, b, c, d];
      };

      /*
       * Convert an array of little-endian words to a string
       */
      var binl2rstr = function(input) {
        var i,
          output = '';

        for (i = 0; i < input.length * 32; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }

        return output
      };

      /*
       * Convert a raw string to an array of little-endian words
       * Characters >255 have their high-byte silently ignored.
       */
      var rstr2binl = function (input) {
        var i,
          output = [];

        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }

        for (i = 0; i < input.length * 8; i += 8) {
          output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }

        return output;
      };

      /*
       * Calculate the MD5 of a raw string
       */
      var rstr_md5 = function(s){
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
      };

      /*
       * Calculate the HMAC-MD5, of a key and some data (raw strings)
       */
      var rstr_hmac_md5 = function (key, data) {
        var i,
          bkey = rstr2binl(key),
          ipad = [],
          opad = [],
          hash;

        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
          bkey = binl_md5(bkey, key.length * 8);
        }

        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
      };

      /*
       * Convert a raw string to a hex string
       */
      var rstr2hex = function(input){
        var hex_tab = '0123456789abcdef',
          output = '',
          x,
          i;

        for (i = 0; i < input.length; i += 1) {
          x = input.charCodeAt(i);
          output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
        }
        return output
      };

      /*
       * Encode a string as utf-8
       */
      var str2rstr_utf8 = function(input){
        return unescape(encodeURIComponent(input));
      };

      /*
       * Take string arguments and return either raw or hex encoded strings
       */
      var raw_md5 = function(s) {
        return rstr_md5(str2rstr_utf8(s));
      };

      var hex_md5 = function(s) {
        return rstr2hex(raw_md5(s));
      };

      var raw_hmac_md5 = function(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
      };

      var hex_hmac_md5 = function(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
      };

      var md5 = function(string, key, raw) {
        if (!key) {
          if (!raw) {
            return hex_md5(string);
          }
          return raw_md5(string);
        }
        if (!raw) {
          return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
      };

    return md5(string, key, raw);
  }
});/*
 * @mixin Fancy.grid.body.mixin.Updater
 */
(function() {
  //SHORTCUTS
  var F = Fancy;

  // CONSTANTS
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_EVEN_CLS = F.GRID_CELL_EVEN_CLS;
  var GRID_CELL_SELECTED_CLS = F.GRID_CELL_SELECTED_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_COLUMN_TEXT_CLS = F.GRID_COLUMN_TEXT_CLS;
  var GRID_COLUMN_ELLIPSIS_CLS = F.GRID_COLUMN_ELLIPSIS_CLS;
  var GRID_COLUMN_ORDER_CLS = F.GRID_COLUMN_ORDER_CLS;
  var GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  var GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  var GRID_CELL_DIRTY_CLS = F.GRID_CELL_DIRTY_CLS;
  var GRID_CELL_DIRTY_EL_CLS = F.GRID_CELL_DIRTY_EL_CLS;
  var GRID_PSEUDO_CELL_CLS = F.GRID_PSEUDO_CELL_CLS;
  var GRID_EMPTY_CLS =  F.GRID_EMPTY_CLS;
  var GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  var GRID_COLUMN_SPARKLINE_BULLET_CLS = F.GRID_COLUMN_SPARKLINE_BULLET_CLS;
  var GRID_COLUMN_CHART_CIRCLE_CLS = F.GRID_COLUMN_CHART_CIRCLE_CLS;
  var GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS =  F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  var GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;
  var GRID_COLUMN_PROGRESS_CLS = F.GRID_COLUMN_PROGRESS_CLS;
  var GRID_COLUMN_PROGRESS_BAR_CLS = F.GRID_COLUMN_PROGRESS_BAR_CLS;
  var GRID_COLUMN_H_BAR_CLS = F.GRID_COLUMN_H_BAR_CLS;
  var GRID_COLUMN_ROW_DRAG_CLS = F.GRID_COLUMN_ROW_DRAG_CLS;

  F.ns('Fancy.grid.body.mixin');

  /*
   * @mixin Fancy.grid.body.mixin.Updater
   */
  F.grid.body.mixin.Updater = function () {};

  F.grid.body.mixin.Updater.prototype = {
    /*
     *
     */
    update: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      me.checkDomColumns();

      if (s.loading) {
        return;
      }

      me.checkDomCells();
      me.updateRows();

      me.showEmptyText();
    },
    /*
     *
     */
    checkDomColumns: function () {
      var me = this,
        w = me.widget,
        numExistedColumn = me.el.select('.' + GRID_COLUMN_CLS).length,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length;

      if (iL <= numExistedColumn) {
        return;
      }

      for (; i < iL; i++) {
        var column = columns[i],
          width = column.width,
          el = F.get(document.createElement('div'));

        if (column.hidden) {
          el.css('display', 'none');
        }

        el.addCls(GRID_COLUMN_CLS);
        el.attr('grid', w.id);

        if (column.index === '$selected') {
          el.addCls(GRID_COLUMN_SELECT_CLS);
        }
        else {
          switch (column.type) {
            case 'order':
              el.addCls(GRID_COLUMN_ORDER_CLS);
              break;
            case 'rowdrag':
              el.addCls(GRID_COLUMN_ROW_DRAG_CLS);
              break;
          }
        }

        if (column.cls) {
          el.addCls(column.cls);
        }

        if (column.type === 'text') {
          el.addCls(GRID_COLUMN_TEXT_CLS);
        }

        el.css({
          width: width + 'px'
        });
        el.attr('index', i);

        if (column.cellAlign) {
          el.css('text-align', column.cellAlign);
        }

        if (column.ellipsis === true) {
          switch (column.type) {
            case 'string':
            case 'text':
            case 'number':
            case 'date':
            case 'combo':
              el.addCls(GRID_COLUMN_ELLIPSIS_CLS);
              break;
          }
        }

        me.el.dom.appendChild(el.dom);
      }

      me.fire('adddomcolumns');
    },
    /*
     * @param {number} indexOrder
     */
    checkDomCells: function (indexOrder) {
      var me = this,
        w = me.widget,
        body = w.body,
        s = w.store,
        i = 0,
        iL = s.dataView.length,
        j = 0,
        jL,
        columns,
        column;

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      jL = columns.length;

      var columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        dataLength = s.getLength(),
        cellTpl = me.cellTpl;

      if (w.cellWrapper) {
        cellTpl = me.cellWrapperTpl;
      }

      if (indexOrder !== undefined) {
        j = indexOrder;
        jL = indexOrder;
      }

      for (; j < jL; j++) {
        column = columns[j];
        var columnDom = columsDom.item(j);
        i = 0;
        var delta = dataLength - columnDom.select('.' + GRID_CELL_CLS).length;
        i = iL - delta;
        for (; i < iL; i++) {
          var cellHTML = cellTpl.getHTML({});

          var el = F.get(document.createElement('div'));
          el.css({
            height: w.cellHeight + 'px'
          });
          el.addCls(GRID_CELL_CLS);
          el.attr('index', i);

          if (i % 2 !== 0 && w.striped) {
            el.addCls(GRID_CELL_EVEN_CLS)
          }
          el.update(cellHTML);
          columnDom.dom.appendChild(el.dom);

          if(body.el.select('.' + GRID_CELL_CLS + '.' + GRID_CELL_SELECTED_CLS + '[index="'+i+'"]').length){
            el.addCls(GRID_CELL_SELECTED_CLS);
          }
        }

        if (w.nativeScroller && (me.side === 'left' || me.side === 'right')) {
          columnDom.select('.' + GRID_PSEUDO_CELL_CLS).destroy();

          var cellHTML = cellTpl.getHTML({
            cellValue: '&nbsp;'
          });

          var el = F.get(document.createElement('div'));
          el.css({
            height: w.cellHeight + 'px'
          });
          el.addCls(GRID_PSEUDO_CELL_CLS);

          el.update(cellHTML);
          columnDom.dom.appendChild(el.dom);
        }
      }
    },
    /*
     * @param {Number} rowIndex
     * @param {Number} columnIndex
     */
    updateRows: function (rowIndex, columnIndex) {
      var me = this,
        w = me.widget,
        i = 0,
        columns,
        iL;

      if (rowIndex === undefined) {
        me.clearDirty();
      }
      else {
        me.clearDirty(rowIndex);
      }

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      iL = columns.length;

      if (columnIndex !== undefined) {
        i = columnIndex;
        iL = columnIndex + 1;
      }

      for (; i < iL; i++) {
        var column = columns[i];

        switch (column.type) {
          case 'string':
          case 'number':
          case 'combo':
          case 'action':
          case 'text':
          case 'date':
          case 'currency':
            me.renderUniversal(i, rowIndex);
            break;
          case 'tree':
            me.renderTree(i, rowIndex);
            break;
          case 'order':
            me.renderOrder(i, rowIndex);
            break;
          case 'expand':
            me.renderExpand(i, rowIndex);
            break;
          case 'select':
            me.renderSelect(i, rowIndex);
            break;
          case 'color':
            me.renderColor(i, rowIndex);
            break;
          case 'checkbox':
            me.renderCheckbox(i, rowIndex);
            break;
          case 'switcher':
            me.renderCheckbox(i, rowIndex, true);
            break;
          case 'image':
            me.renderImage(i, rowIndex);
            break;
          case 'sparklineline':
            me.renderSparkLine(i, rowIndex, 'line');
            break;
          case 'sparklinebar':
            me.renderSparkLine(i, rowIndex, 'bar');
            break;
          case 'sparklinetristate':
            me.renderSparkLine(i, rowIndex, 'tristate');
            break;
          case 'sparklinediscrete':
            me.renderSparkLine(i, rowIndex, 'discrete');
            break;
          case 'sparklinebullet':
            me.renderSparkLine(i, rowIndex, 'bullet');
            break;
          case 'sparklinepie':
            me.renderSparkLine(i, rowIndex, 'pie');
            break;
          case 'sparklinebox':
            me.renderSparkLine(i, rowIndex, 'box');
            break;
          case 'circle':
            me.renderCircle(i, rowIndex);
            break;
          case 'progressdonut':
            me.renderProgressDonut(i, rowIndex);
            break;
          case 'progressbar':
            me.renderProgressBar(i, rowIndex);
            break;
          case 'hbar':
            me.renderHBar(i, rowIndex);
            break;
          case 'grossloss':
            me.renderGrossLoss(i, rowIndex);
            break;
          case 'rowdrag':
            me.renderRowDrag(i, rowIndex);
            break;
          default:
            throw new Error('[FancyGrid error] - not existed column type ' + column.type);
            break;
        }
      }

      me.removeNotUsedCells();
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderUniversal: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        lang = w.lang,
        emptyValue = w.emptyValue,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        currencySign = lang.currencySign;

      if (column.index !== undefined) {
        key = column.index;
      }
      else {
        key = column.type === 'action' ? 'none' : undefined;
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          id = s.getId(j),
          inner = cellsDomInner.item(j),
          cell = cellsDom.item(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j),
            inner: inner,
            cell: cell
          },
          value,
          dirty = false;

        if (s.changed[o.id] && s.changed[o.id][column.index]) {
          dirty = true;
        }

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        switch (column.type) {
          case 'currency':
            if (value !== '') {
              value = currencySign + value;
            }
            o.value = value;
            break;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        switch (value) {
          case '':
          case undefined:
            value = emptyValue;
            break;
        }

        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        if (dirty && w.dirtyEnabled) {
          me.enableCellDirty(cell);
        }

        cell.css(o.style);

        if (!o.column.widget) {
          inner.update(value);
        }

        if(o.column.autoHeight){
          cell.css('height', '');
          var cellHeight = parseInt(cell.css('height')) + 4;

          if(cellHeight < w.cellHeight){
            cellHeight = w.cellHeight;
          }

          w.rowheight.add(id, cellHeight);
        }
      }
    },
    /*
     * @param {Number} i
     */
    renderOrder: function (i) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j = 0,
        jL = s.getLength(),
        plusValue = 0;

      if (w.paging) {
        plusValue += s.showPage * s.pageSize;
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          },
          value = j + 1 + plusValue;

        o.value = value;

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        var cell = cellsDom.item(j);
        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        cell.css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     */
    renderRowDrag: function (i) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j = 0,
        jL = s.getLength(),
        plusValue = 0;

      if (w.paging) {
        plusValue += s.showPage * s.pageSize;
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          },
          value = '<svg style="opacity: 0;" viewBox="0 0 6 14"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2h2V0H0v2zm0 4h2V4H0v2zm0 3.999h2V8H0v1.999zM0 14h2v-2H0v2zM4 0v2h2V0H4zm0 6h2V4H4v2zm0 3.999h2V8H4v1.999zM4 14h2v-2H4v2z"></path></svg>';

        o.value = value;

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        var cell = cellsDom.item(j);
        if (w.cellStylingCls) {
          me.clearCls(cell);
        }

        if (o.cls) {
          cell.addCls(o.cls);
        }

        cell.css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderTree: function (i, rowIndex) {
      //TODO:
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        key = column.index;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var cellInnerEl = cellsDomInner.item(j),
          dataItem = w.get(j),
          value = dataItem.get(key),
          deep = Number(dataItem.get('$deep')) - 1,
          expanderCls = 'fancy-grid-tree-expander';

        if(dataItem.get('leaf')){
          expanderCls = 'fancy-grid-tree-expander-leaf';
        }

        if(dataItem.get('expanded')){
          expanderCls += ' fancy-grid-tree-expander-expanded';
        }

        var marginLeft = deep * 15;
        var nodeImg = '';

        if(column.render){
          var o = column.render({
            item: dataItem,
            data: dataItem.data,
            deep: deep,
            leaf: dataItem.get('leaf'),
            rowIndex: rowIndex,
            column: column,
            value: value
          });

          if(o.nodeImgCls){
            nodeImg = '<div class="fancy-grid-tree-expander-node '+(o.nodeImgCls)+'"></div>';
          }

          if(o.value !== undefined){
            value = o.value;
          }
        }

        if(dataItem.get('leaf')){
          marginLeft -= 8;
        }

        cellsDomInner.item(j).update([
          '<div class="' + expanderCls + '" style="margin-left: ' + marginLeft + 'px;"></div>' + nodeImg + '<div class="fancy-grid-tree-expander-text">' + value + '</div>'
        ].join(''));
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderExpand: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var cellInnerEl = cellsDomInner.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          dataItem = w.get(j),
          dataItemId = dataItem.id;

        if (isCheckBoxInside === false) {
          cellsDomInner.item(j).update('');

          checkBox = new F.CheckBox({
            renderTo: cellsDomInner.item(j).dom,
            renderId: true,
            value: false,
            label: false,
            expander: true,
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              change: function (checkbox, value) {
                rowIndex = checkbox.el.parent().parent().attr('index');

                if (value) {
                  w.expander.expand(rowIndex);
                }
                else {
                  w.expander.collapse(rowIndex);
                }
              }
            }]
          });
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);

          if (w.expander._expandedIds[dataItemId]) {
            checkBox.set(true, false);
          }
          else {
            checkBox.set(false, false);
          }
        }

        var data = s.get(j),
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j)
          };

        if(column.render){
          if(column.render(o).hidden === true){
            checkBox.hide();
          }
          else{
            checkBox.show();
          }
        }
      }
    },
    /*
     * @param {Fancy.Element} cell
     */
    clearCls: function (cell) {
      var w = this.widget;

      F.each(w.cellStylingCls, function (cls) {
        cell.removeCls(cls);
      });
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderColor: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        o.value = value;

        var cell = cellsDom.item(j);
        cell.css(o.style);

        var cellInner = cell.select('.' + GRID_CELL_INNER_CLS);
        cellInner.update('<div class="fancy-grid-color-cell" style="background: ' + value + ';"></div>');
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCombo: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          o = {
            rowIndex: j,
            value: value,
            style: {}
          };

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCheckbox: function (i, rowIndex, isSwitcher) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        widgetName = 'CheckBox';

      if(isSwitcher){
        widgetName = 'Switcher';
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          value = s.get(j, key),
          cellInnerEl = cellsDomInner.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          dirty = false,
          id = s.getId(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column,
            id: id,
            item: s.getItem(j),
            value: value
          };



        if (s.changed[o.id] && s.changed[o.id][column.index]) {
          dirty = true;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (isCheckBoxInside === false) {

          if (!o.stopped) {
            var editable = true;

            if (w.rowEdit) {
              editable = false;
            }

            cellsDomInner.item(j).update('');

            new F[widgetName]({
              renderTo: cellsDomInner.item(j).dom,
              renderId: true,
              value: value,
              label: false,
              editable: editable,
              style: {
                padding: '0px',
                display: 'inline-block'
              },
              events: [{
                beforechange: function (checkbox) {
                  if (column.index === '$selected') {
                    return;
                  }

                  if (column.editable !== true) {
                    checkbox.canceledChange = true;
                  }
                }
              }, {
                change: function (checkbox, value) {
                  if (column.index === '$selected') {
                    return;
                  }

                  w.celledit.checkBoxChangedValue = value;
                }
              }]
            });
          }
          else {
            cellsDomInner.item(j).update(value);
          }
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);
          if (o.stopped) {
            checkBox.destroy();
            cellsDomInner.item(j).update(value);
          }
          else {
            checkBox.set(value, false);
          }
        }

        if (dirty && w.dirtyEnabled) {
          var cell = cellsDom.item(j);
          me.enableCellDirty(cell);
        }
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderSelect: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          id = s.get(j, 'id'),
          cellInnerEl = cellsDomInner.item(j),
          checkBox = cellInnerEl.select('.fancy-field-checkbox'),
          checkBoxId,
          isCheckBoxInside = checkBox.length !== 0,
          editable = true;

        if (w.selection.memory) {
          if (w.selection.memory.all && !w.selection.memory.except[id]) {
            value = true;
            w.selection.domSelectRow(j);
          }
          else if (w.selection.memory.selected[id]) {
            value = true;
            w.selection.domSelectRow(j);
          }
          else {
            value = false;
            w.selection.domDeSelectRow(j);
          }
        }
        else{
          if(cellInnerEl.parent().hasClass(GRID_CELL_SELECTED_CLS)){
            value = true;
          }
        }

        if(w.selection.disabled){
          editable = false;
        }

        if (isCheckBoxInside === false) {
          cellsDomInner.item(j).update('');

          new F.CheckBox({
            renderTo: cellsDomInner.item(j).dom,
            renderId: true,
            value: value,
            label: false,
            stopIfCTRL: true,
            editable: editable,
            disabled: !editable,
            style: {
              padding: '0px',
              display: 'inline-block'
            }
          });
        }
        else {
          checkBoxId = checkBox.dom.id;
          checkBox = F.getWidget(checkBoxId);
          checkBox.set(value, false);
        }
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderImage: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          data = s.get(j),
          o = {
            rowIndex: j,
            value: value,
            data: data,
            style: {}
          },
          attr = '';

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (o.attr) {
          for (var p in o.attr) {
            attr += p + '="' + o.attr[p] + '"';
          }
        }

        value = '<img ' + attr + ' src="' + o.value + '">';

        cellsDom.item(j).css(o.style);
        cellsDomInner.item(j).update(value);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     * @param {String} type
     */
    renderSparkLine: function (i, rowIndex, type) {
      var me = this,
        w = me.widget,
        cellHeight = w.cellHeight,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        columnWidth = column.width,
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        _sparkConfig = column.sparkConfig || {};

      columnDom.addCls(GRID_COLUMN_SPARKLINE_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkHeight = cellHeight - 1,
        sparkWidth = columnWidth - 20,
        widthName;

      switch (type) {
        case 'line':
        case 'pie':
        case 'box':
          widthName = 'width';
          break;
        case 'bullet':
          widthName = 'width';
          sparkHeight -= 11;
          columnDom.addCls(GRID_COLUMN_SPARKLINE_BULLET_CLS);
          break;
        case 'discrete':
          widthName = 'width';
          sparkWidth = columnWidth;
          sparkHeight -= 2;
          break;
        case 'bar':
        case 'tristate':
          widthName = 'barWidth';
          break;
      }

      for (; j < jL; j++) {
        var value = s.get(j, key),
          data = s.get(j),
          o = {
            rowIndex: j,
            value: value,
            data: data,
            style: {}
          };

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        if (F.isArray(column.values)) {
          var k = 0,
            kL = column.values.length;

          value = [];

          for (; k < kL; k++) {
            value.push(s.get(j, column.values[k]));
          }
        }

        cellsDom.item(j).css(o.style);
        var innerDom = cellsDomInner.item(j).dom,
          sparkConfig = {
            type: type,
            fillColor: 'transparent',
            height: sparkHeight
          };

        F.apply(sparkConfig, _sparkConfig);

        if (type === 'bar' || type === 'tristate') {
          sparkWidth = columnWidth - 20;
          sparkWidth = sparkWidth / value.length;
        }

        sparkConfig[widthName] = sparkWidth;

        F.$(innerDom).sparkline(value, sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderProgressDonut: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      columnDom.addCls(GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);
        var sparkConfig = column.sparkConfig || {},
          renderTo = cellsDomInner.item(j).dom;

        F.apply(sparkConfig, {
          renderTo: renderTo,
          value: value
        });

        if (!sparkConfig.size && !sparkConfig.height && !sparkConfig.width) {
          sparkConfig.size = w.cellHeaderHeight - 3 * 2;
        }

        F.get(renderTo).update('');

        new F.spark.ProgressDonut(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderGrossLoss: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL;

      columnDom.addCls(GRID_COLUMN_GROSSLOSS_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkConfig = column.sparkConfig || {};

      if (sparkConfig.showOnMax) {
        sparkConfig.maxValue = Math.max.apply(Math, s.getColumnData(key, column.smartIndexFn));
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          column: column
        });

        new F.spark.GrossLoss(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderProgressBar: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        maxValue = 100;

      columnDom.addCls(GRID_COLUMN_PROGRESS_CLS);

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      var sparkConfig = column.sparkConfig || {};
      if (sparkConfig.percents === false) {
        maxValue = Math.max.apply(Math, s.getColumnData(key));
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        var _renderTo = F.get(cellsDomInner.item(j).dom);

        if (_renderTo.select('.' + GRID_COLUMN_PROGRESS_BAR_CLS).length) {
          var spark = F.getWidget(_renderTo.select('.' + GRID_COLUMN_PROGRESS_BAR_CLS).item(0).attr('id'));
          spark.value = value;
          spark.maxValue = maxValue;
          spark.update();
          continue;
        }

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          column: column,
          maxValue: maxValue
        });

        new F.spark.ProgressBar(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderHBar: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDom = columnDom.select('.' + GRID_CELL_CLS),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        sparkConfig = column.sparkConfig || {},
        disabled = column.disabled || {};

      columnDom.addCls(GRID_COLUMN_H_BAR_CLS);

      var values = {},
        i = 0,
        iL,
        kL,
        maxItemValue = Number.MIN_VALUE;

      if (F.isArray(column.index)) {
        iL = column.index.length;
        for (; i < iL; i++) {
          var _key = column.index[i];

          if (disabled[_key]) {
            continue;
          }

          values[_key] = s.getColumnData(_key);

          var _maxItemValue = Math.max.apply(Math, values[_key]);
          if (_maxItemValue > maxItemValue) {
            maxItemValue = _maxItemValue;
          }

          kL = values[_key].length;
        }
      }
      else {
        var data = s.getColumnData(column.index),
          fields = [];

        iL = data.length;

        for (; i < iL; i++) {
          var n = 0,
            nL = data[i].length;

          for (; n < nL; n++) {
            if (disabled[n]) {
              continue;
            }

            values[n] = values[n] || [];
            values[n].push(data[i][n]);
          }
        }

        for (var p in values) {
          var _maxItemValue = Math.max.apply(Math, values[p]);
          fields.push(p);

          if (_maxItemValue > maxItemValue) {
            maxItemValue = _maxItemValue;
          }

          kL = values[p].length;
        }

        if (!column.fields) {
          column.fields = fields;
        }
      }

      var sum = [],
        k = 0;

      for (; k < kL; k++) {
        sum[k] = 0;
        for (var p in values) {
          if (column.fields && disabled[column.index + '.' + p]) {
            continue;
          }
          else if (disabled[p]) {
            continue;
          }

          sum[k] += values[p][k];
        }
      }

      maxValue = Math.max.apply(Math, sum);

      sparkConfig.maxItemValue = maxItemValue;

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {},
            column: column
          },
          value;

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.format) {
          o.value = me.format(o.value, column.format);
          value = o.value;
        }

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        cellsDom.item(j).css(o.style);

        var _renderTo = F.get(cellsDomInner.item(j).dom);

        if (_renderTo.select('.fancy-spark-hbar').length) {
          var spark = F.getWidget(_renderTo.select('.fancy-spark-hbar').item(0).attr('id'));
          spark.maxValue = maxValue;
          spark.maxItemValue = maxItemValue;
          spark.update(data);
          continue;
        }

        F.apply(sparkConfig, {
          renderTo: cellsDomInner.item(j).dom,
          value: value,
          data: data,
          column: column,
          maxValue: maxValue,
          height: w.cellHeight - 1
        });

        new F.spark.HBar(sparkConfig);
      }
    },
    /*
     * @param {Number} i
     * @param {Number} rowIndex
     */
    renderCircle: function (i, rowIndex) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        column = columns[i],
        key = column.index,
        columsDom = me.el.select('.' + GRID_COLUMN_CLS),
        columnDom = columsDom.item(i),
        cellsDomInner = columnDom.select('.' + GRID_CELL_CLS + ' .' + GRID_CELL_INNER_CLS),
        j,
        jL,
        cellHeight = w.cellHeight - 4;

      columnDom.addCls(GRID_COLUMN_CHART_CIRCLE_CLS);

      function pieChart(percentage, size) {
        //http://jsfiddle.net/da5LN/62/

        var svgns = "http://www.w3.org/2000/svg";
        var chart = document.createElementNS(svgns, "svg:svg");
        chart.setAttribute("width", size);
        chart.setAttribute("height", size);
        chart.setAttribute("viewBox", "0 0 " + size + " " + size);

        var back = document.createElementNS(svgns, "circle");
        back.setAttributeNS(null, "cx", size / 2);
        back.setAttributeNS(null, "cy", size / 2);
        back.setAttributeNS(null, "r", size / 2);
        var color = "#F0F0F0";
        if (size > 50) {
          color = "F0F0F0";
        }

        if (percentage < 0) {
          color = '#F9DDE0';
        }

        back.setAttributeNS(null, "fill", color);
        chart.appendChild(back);

        var path = document.createElementNS(svgns, "path");
        var unit = (Math.PI * 2) / 100;
        var startangle = 0;
        var endangle = percentage * unit - 0.001;
        var x1 = (size / 2) + (size / 2) * Math.sin(startangle);
        var y1 = (size / 2) - (size / 2) * Math.cos(startangle);
        var x2 = (size / 2) + (size / 2) * Math.sin(endangle);
        var y2 = (size / 2) - (size / 2) * Math.cos(endangle);
        var big = 0;
        if (endangle - startangle > Math.PI) {
          big = 1;
        }
        var d = "M " + (size / 2) + "," + (size / 2) +
          " L " + x1 + "," + y1 +
          " A " + (size / 2) + "," + (size / 2) +
          " 0 " + big + " 1 " +
          x2 + "," + y2 +
          " Z";

        path.setAttribute("d", d); // Set this path
        if (percentage < 0) {
          path.setAttribute("fill", '#EA7369');
        }
        else {
          path.setAttribute("fill", '#44A4D3');
        }
        chart.appendChild(path);

        var front = document.createElementNS(svgns, "circle");
        front.setAttributeNS(null, "cx", (size / 2));
        front.setAttributeNS(null, "cy", (size / 2));
        front.setAttributeNS(null, "r", (size * 0.25));
        front.setAttributeNS(null, "fill", "#fff");
        chart.appendChild(front);
        return chart;
      }

      if (rowIndex !== undefined) {
        j = rowIndex;
        jL = rowIndex + 1;
      }
      else {
        j = 0;
        jL = s.getLength();
      }

      for (; j < jL; j++) {
        var value,
          data = s.get(j),
          o = {
            rowIndex: j,
            data: data,
            style: {}
          };

        if (column.smartIndexFn) {
          value = column.smartIndexFn(data);
        }
        else {
          value = s.get(j, key);
        }

        o.value = value;

        if (column.render) {
          o = column.render(o);
          value = o.value;
        }

        var innerDom = cellsDomInner.item(j).dom;

        if (innerDom.innerHTML === '') {

          innerDom.appendChild(pieChart(value, cellHeight));
        }
      }
    },
    /*
     *
     */
    removeNotUsedCells: function () {
      var me = this,
        w = me.widget,
        store = w.store,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS),
        i = 0,
        iL = columnsDom.length;

      for (; i < iL; i++) {
        var columnDom = columnsDom.item(i),
          cellsDom = columnDom.select('.' + GRID_CELL_CLS),
          j = store.getLength(),
          jL = cellsDom.length;

        for (; j < jL; j++) {
          cellsDom.item(j).remove();
        }
      }
    },
    /*
     * @param {String|Object} format
     * @return {Function|String|Object}
     */
    getFormat: function (format) {
      var me = this,
        w = me.widget,
        lang = w.lang;

      switch (format) {
        case 'number':
          return function (value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, lang.thousandSeparator);
          };
          break;
        case 'date':
          return function (value) {
            var date = F.Date.parse(value, lang.date.read, format.mode);
            value = F.Date.format(date, lang.date.write, format.mode);

            return value;
          };
          break;
      }

      switch (format.type) {
        case 'date':
          return function (value) {
            if (!value || value.length === 0) {
              return '';
            }
            var date = F.Date.parse(value, format.read, format.mode);
            value = F.Date.format(date, format.write, undefined, format.mode);


            return value;
          };
          break;
      }

      if (format.inputFn) {
        return format.inputFn;
      }
    },
    /*
     * @param {String} value
     * @param {*} format
     * @return {String}
     */
    format: function (value, format) {
      switch (F.typeOf(format)) {
        case 'string':
          value = this.getFormat(format)(value);
          break;
        case 'function':
          value = format(value);
          break;
        case 'object':
          if (format.inputFn) {
            value = format.inputFn(value);
          }
          else {
            value = this.getFormat(format)(value);
          }

          break;
      }

      return value;
    },
    /*
     * @param {Fancy.Element} cell
     */
    enableCellDirty: function (cell) {
      if (cell.hasCls(GRID_CELL_DIRTY_CLS)) {
        return;
      }

      cell.addCls(GRID_CELL_DIRTY_CLS);
      cell.append('<div class="' + GRID_CELL_DIRTY_EL_CLS + '"></div>');
    },
    /*
     * @param {Number} rowIndex
     */
    clearDirty: function (rowIndex) {
      var me = this;

      if (rowIndex !== undefined) {
        me.el.select('.' + GRID_CELL_CLS + '[index="' + rowIndex + '"] .' + GRID_CELL_DIRTY_EL_CLS).destroy();
        me.el.select('.' + GRID_CELL_DIRTY_CLS + '[index="' + rowIndex + '"]').removeCls(GRID_CELL_DIRTY_CLS);

        return;
      }

      me.el.select('.' + GRID_CELL_DIRTY_EL_CLS).destroy();
      me.el.select('.' + GRID_CELL_DIRTY_CLS).removeCls(GRID_CELL_DIRTY_CLS);
    },
    /*
     *
     */
    showEmptyText: function () {
      var me = this,
        w = me.widget,
        s = w.store;

      if (me.side !== 'center') {
        return;
      }

      if (me.emptyTextEl) {
        me.emptyTextEl.destroy();
        delete me.emptyTextEl;
      }

      if (s.dataView.length === 0) {
        var el = F.get(document.createElement('div'));

        el.addCls(GRID_EMPTY_CLS);
        el.update(w.emptyText);

        me.emptyTextEl = F.get(me.el.dom.appendChild(el.dom));
      }
    }
  };

})();/**
 * @class Fancy.grid.Body
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  /*
   * Constants
   */
  var GRID_CELL_CLS = F.GRID_CELL_CLS;
  var GRID_CELL_INNER_CLS = F.GRID_CELL_INNER_CLS;
  var GRID_COLUMN_CLS = F.GRID_COLUMN_CLS;
  var GRID_BODY_CLS = F.GRID_BODY_CLS;
  var GRID_CELL_WRAPPER_CLS = F.GRID_CELL_WRAPPER_CLS;
  var GRID_COLUMN_SELECT_CLS = F.GRID_COLUMN_SELECT_CLS;
  var GRID_COLUMN_ELLIPSIS_CLS = F.GRID_COLUMN_ELLIPSIS_CLS;
  var GRID_COLUMN_ORDER_CLS = F.GRID_COLUMN_ORDER_CLS;
  var GRID_COLUMN_TEXT_CLS = F.GRID_COLUMN_TEXT_CLS;

  var GRID_COLUMN_SPARKLINE_CLS = F.GRID_COLUMN_SPARKLINE_CLS;
  var GRID_COLUMN_SPARKLINE_BULLET_CLS = F.GRID_COLUMN_SPARKLINE_BULLET_CLS;
  var GRID_COLUMN_CHART_CIRCLE_CLS = F.GRID_COLUMN_CHART_CIRCLE_CLS;
  var GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS =  F.GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS;
  var GRID_COLUMN_GROSSLOSS_CLS = F.GRID_COLUMN_GROSSLOSS_CLS;
  var GRID_COLUMN_PROGRESS_CLS = F.GRID_COLUMN_PROGRESS_CLS;
  var GRID_COLUMN_PROGRESS_BAR_CLS = F.GRID_COLUMN_PROGRESS_BAR_CLS;
  var GRID_COLUMN_H_BAR_CLS = F.GRID_COLUMN_H_BAR_CLS;
  var GRID_COLUMN_ROW_DRAG_CLS = F.GRID_COLUMN_ROW_DRAG_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.Body', {
    extend: F.Widget,
    mixins: [
      F.grid.body.mixin.Updater
    ],
    cls: GRID_BODY_CLS,
    cellTpl: [
      '<div class="' + GRID_CELL_INNER_CLS + '">{cellValue}</div>'
    ],
    cellWrapperTpl: [
      '<div class="' + GRID_CELL_WRAPPER_CLS + '">',
      '<div class="' + GRID_CELL_INNER_CLS + '">{cellValue}</div>',
      '</div>'
    ],
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function () {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.Super('init', arguments);
      me.addEvents('adddomcolumns');

      me.initTpl();
      me.render();
      me.ons();
    },
    /*
     *
     */
    initTpl: function () {
      var me = this;

      me.cellTpl = new F.Template(me.cellTpl);
      me.cellWrapperTpl = new F.Template(me.cellWrapperTpl);
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        id = w.id;

      w.on('afterrender', me.onAfterRender, me);

      var columnSelector = '.' + GRID_COLUMN_CLS + '[grid="' + id + '"]',
        cellSelector = columnSelector + ' div.' + GRID_CELL_CLS;

      me.el.on('click', me.onCellClick, me, cellSelector);
      me.el.on('dblclick', me.onCellDblClick, me, cellSelector);
      me.el.on('mouseenter', me.onCellMouseEnter, me, cellSelector);
      me.el.on('mouseleave', me.onCellMouseLeave, me, cellSelector);
      me.el.on('mousedown', me.onCellMouseDown, me, cellSelector);

      me.el.on('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      me.el.on('mouseleave', me.onColumnMouseLeave, me, columnSelector);

      me.el.on('contextmenu', me.onContextMenu, me, cellSelector);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        renderTo,
        el = F.get(document.createElement('div'));

      el.addCls(GRID_BODY_CLS);
      renderTo = w.el.select('.fancy-grid-' + me.side).dom;
      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     *
     */
    onAfterRender: function () {
      this.update();
      this.setHeight();
    },
    /*
     * @param {Number} scrollLeft
     * @param {Boolean} animate
     */
    setColumnsPosition: function (scrollLeft, animate) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length,
        columnsWidth = 0,
        bodyDomColumns = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]'),
        scrollLeft = scrollLeft || me.scrollLeft || 0;

      columnsWidth += scrollLeft;

      for (; i < iL; i++) {
        var column = columns[i],
          columnEl = bodyDomColumns.item(i);

        if(animate) {
          columnEl.animate({
            left: columnsWidth + 'px'
          }, F.ANIMATE_DURATION);
        }
        else{
          columnEl.css({
            left: columnsWidth + 'px'
          });
        }

        if (!column.hidden) {
          columnsWidth += column.width;
        }
      }
    },
    /*
     * @param {Number} delta
     * @return {Object}
     */
    wheelScroll: function (delta) {
      var me = this,
        w = me.widget,
        knobOffSet = w.knobOffSet,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]');

      if (columnsDom.length === 0) {
        return;
      }

      var oldScrollTop = parseInt(columnsDom.item(0).css('top')),
        i = 0,
        iL = columnsDom.length,
        bodyViewHeight = w.getBodyHeight(),
        cellsViewHeight = w.getCellsViewHeight(),
        scrollRightPath = cellsViewHeight - bodyViewHeight + knobOffSet,
        o = {
          oldScroll: parseInt(columnsDom.item(0).css('top')),
          newScroll: parseInt(columnsDom.item(0).css('top')) + 30 * delta,
          deltaScroll: 30 * delta
        };

      if(scrollRightPath < 0 ){
        scrollRightPath = 0;
      }

      for (; i < iL; i++) {
        var columnEl = columnsDom.item(i),
          topValue = parseInt(columnEl.css('top')) + 30 * delta;

        if (topValue > 0) {
          topValue = 0;
          o.newScroll = 0;
        }
        else if (Math.abs(topValue) > scrollRightPath) {
          topValue = -scrollRightPath - knobOffSet;
          o.newScroll = topValue;
        }

        if(topValue > 0){
          topValue = 0;
        }



        columnEl.css('top', topValue + 'px');
      }

      o.scrolled = oldScrollTop !== parseInt(columnsDom.item(0).css('top'));

      return o;
    },
    /*
     * @param {Number} y
     * @param {Number} x
     * @param {Boolean} [animate]
     * @return {Object}
     */
    scroll: function (y, x, animate) {
      var me = this,
        w = me.widget,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS + '[grid="' + w.id + '"]'),
        i = 0,
        iL = columnsDom.length,
        o = {};

      if (y !== false && y !== null && y !== undefined) {
        o.scrollTop = y;
        for (; i < iL; i++) {
          var columnEl = columnsDom.item(i);
          columnEl.css('top', -y + 'px');
        }
      }

      if (x !== false && x !== null && x !== undefined) {
        o.scrollLeft = x;
        if (w.header) {
          w.header.scroll(x, animate);
        }
        me.scrollLeft = x;
        w.body.setColumnsPosition(x, animate);

        if (me.side === 'center') {
          if (w.grouping) {
            w.grouping.scrollLeft(x);
          }

          if (w.summary) {
            w.summary.scrollLeft(x);
          }
        }
      }

      return o;
    },
    /*
     *
     */
    setHeight: function () {
      var height = this.widget.getBodyHeight();

      this.css('height', height + 'px');
    },
    /*
     * @param {Object} e
     */
    onCellClick: function (e) {
      var me = this,
        w = me.widget;

      w.fire('cellclick', me.getEventParams(e));
      w.fire('rowclick', me.getEventParams(e));
      w.fire('columnclick', me.getColumnEventParams(e));
      if (w.activated === false) {
        w.activated = true;
        w.fire('activate');
      }
    },
    /*
     * @param {Object} e
     */
    onCellDblClick: function (e) {
      var me = this,
        w = me.widget;

      w.fire('celldblclick', me.getEventParams(e));
      w.fire('rowdblclick', me.getEventParams(e));
      w.fire('columndblclick', me.getColumnEventParams(e));
    },
    /*
     * @param {Object} e
     * @return {false|Object}
     */
    getEventParams: function (e) {
      var me = this,
        w = me.widget,
        s = w.store,
        columns = me.getColumns(),
        cell = e.currentTarget,
        cellEl = F.get(e.currentTarget),
        columnEl = cellEl.parent();

      if (cellEl.parent().dom === undefined) {
        return false;
      }

      if (s.getLength() === 0) {
        return false;
      }

      var columnIndex = parseInt(columnEl.attr('index')),
        rowIndex = parseInt(cellEl.attr('index')),
        column = columns[columnIndex],
        key = column.index,
        value = s.get(rowIndex, key),
        id = s.getId(rowIndex),
        data = s.get(rowIndex),
        item = s.getById(id);

      if (column.smartIndexFn) {
        value = column.smartIndexFn(data);
      }

      return {
        e: e,
        id: id,
        side: me.side,
        cell: cell,
        column: column,
        rowIndex: rowIndex,
        columnIndex: columnIndex,
        value: value,
        data: data,
        item: item
      };
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnEventParams: function (e) {
      var me = this,
        w = me.widget,
        s = w.store,
        cellEl = F.get(e.currentTarget),
        columnEl = cellEl.parent(),
        columnIndex = parseInt(columnEl.attr('index')),
        columns = me.getColumns(),
        column = columns[columnIndex],
        config = {
          e: e,
          side: me.side,
          columnIndex: columnIndex,
          column: column,
          columnDom: columnEl.dom,
          cell: cellEl.dom
        };

      if (w.columnClickData) {
        config.data = s.getColumnData(column.index, column.smartIndexFn);
      }

      return config;
    },
    /*
     * @param {Object} e
     * @return {Object}
     */
    getColumnHoverEventParams: function (e) {
      var me = this,
        columnEl = F.get(e.currentTarget),
        columnIndex = parseInt(columnEl.attr('index')),
        columns = me.getColumns(),
        column = columns[columnIndex];

      return {
        e: e,
        side: me.side,
        columnIndex: columnIndex,
        column: column,
        columnDom: columnEl.dom,
        cell: e.target
      };
    },
    /*
     * @return {Array}
     */
    getColumns: function () {
      return this.widget.getColumns(this.side);
    },
    /*
     * @param {Object} e
     */
    onCellMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery && prevCellOver) {
        if (me.fixZeptoBug) {
          if (params.rowIndex !== prevCellOver.rowIndex || params.columnIndex !== prevCellOver.columnIndex || params.side !== prevCellOver.side) {
            w.fire('cellleave', prevCellOver);
            if (params.rowIndex !== prevCellOver.rowIndex) {
              w.fire('rowleave', prevCellOver);
            }
          }
        }
      }

      if (!prevCellOver) {
        w.fire('rowenter', params);
      }
      else {
        if (params.rowIndex !== me.prevCellOver.rowIndex) {
          w.fire('rowenter', params);
        }
      }

      w.fire('cellenter', params);

      me.prevCellOver = params;
    },
    /*
     * @param {Object} e
     */
    onCellMouseDown: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        columnParams = {
          e: params.e,
          side: params.side,
          columnDom: F.get(params.cell).parent().dom,
          column: params.column,
          columnIndex: params.columnIndex,
          cell: params.cell
        };

      //right click
      if((e.button === 2 && e.buttons === 2) || e.which === 3){
        return;
      }

      w.fire('beforecellmousedown', params);
      w.fire('cellmousedown', params);
      w.fire('columnmousedown', columnParams);
      if (w.activated === false) {
        w.activated = true;
        w.fire('activate');
      }
    },
    /*
     * @param {Object} e
     */
    onCellMouseLeave: function (e) {
      var me = this,
        w = me.widget,
        params = me.getEventParams(e),
        prevCellOver = me.prevCellOver;

      if (F.nojQuery) {
        if (prevCellOver === undefined) {
          return;
        }

        me.fixZeptoBug = params;
        return;
      }

      w.fire('rowleave', prevCellOver);
      w.fire('cellleave', prevCellOver);
      delete me.prevCellOver;
    },
    /*
     * @param {Object} e
     */
    onColumnMouseEnter: function (e) {
      var me = this,
        w = me.widget,
        params = me.getColumnHoverEventParams(e),
        prevColumnOver = me.prevColumnOver;

      if (!prevColumnOver) {
        w.fire('columnenter', params);
      }
      else if (me.prevCellOver) {
        if (params.rowIndex !== me.prevCellOver.rowIndex) {
          w.fire('rowenter', params);
        }
      }

      me.prevColumnOver = params;
    },
    /*
     * @param {Object} e
     */
    onColumnMouseLeave: function (e) {
      var me = this,
        w = me.widget;

      w.fire('columnleave', me.prevColumnOver);
      delete me.prevColumnOver;
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {Fancy.Element}
     */
    getCell: function (row, column) {
      var me = this,
        w = me.widget;

      return this.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]');
    },
    /*
     * @param {Number} row
     * @param {Number} column
     * @return {HTMLElement}
     */
    getDomCell: function (row, column) {
      var me = this,
        w = me.widget,
        dom = me.el.select('.' + GRID_COLUMN_CLS + '[index="' + column + '"][grid="' + w.id + '"] .' + GRID_CELL_CLS + '[index="' + row + '"]').dom;

      return dom;
    },
    /*
     * @param {Number} index
     * @return {HTMLElement}
     */
    getDomColumn: function (index) {
      var me = this,
        w = me.widget;

      return me.el.select('.' + GRID_COLUMN_CLS + '[index="' + index + '"][grid="' + w.id + '"]').dom;
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        el = me.el,
        cellSelector = 'div.' + GRID_CELL_CLS,
        columnSelector = 'div.' + GRID_COLUMN_CLS;

      el.un('click', me.onCellClick, me, cellSelector);
      el.un('dblclick', me.onCellDblClick, me, cellSelector);
      el.un('mouseenter', me.onCellMouseEnter, me, cellSelector);
      el.un('mouseleave', me.onCellMouseLeave, me, cellSelector);
      el.un('mousedown', me.onCellMouseDown, me, cellSelector);

      el.un('mouseenter', me.onColumnMouseEnter, me, columnSelector);
      el.un('mouseleave', me.onColumnMouseLeave, me, columnSelector);
    },
    /*
     * @param {Number} orderIndex
     */
    hideColumn: function (orderIndex) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS),
        columnEl = columnEls.item(orderIndex),
        i = 0,
        iL = columns.length,
        left = 0,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      columnEl.hide();

      for (; i < iL; i++) {
        var column = columns[i],
          columnEl = columnEls.item(i),
          columnLeft = parseInt(columnEl.css('left'));

        if(column.hidden){
          continue;
        }

        if(columnLeft !== left){
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     */
    showColumn: function (orderIndex) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS),
        columnEl = columnEls.item(orderIndex),
        left = 0,
        i = 0,
        iL = columns.length,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      columnEl.show();

      for (; i < iL; i++) {
        var columnEl = columnEls.item(i),
          columnLeft = parseInt(columnEl.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if(columnLeft !== left) {
          columnEl.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }
    },
    /*
     * @param {Number} orderIndex
     */
    removeColumn: function (orderIndex) {
      var me = this,
        columns = me.el.select('.' + GRID_COLUMN_CLS),
        column = columns.item(orderIndex),
        columnWidth = parseInt(column.css('width')),
        i = orderIndex + 1,
        iL = columns.length;

      column.destroy();

      for (; i < iL; i++) {
        var _column = columns.item(i),
          left = parseInt(_column.css('left')) - columnWidth;

        _column.attr('index', i - 1);
        _column.css('left', left);
      }
    },
    /*
     * @param {Number} index
     * @param {Object} column
     */
    insertColumn: function (index, column) {
      var me = this,
        w = me.widget,
        _columns = me.getColumns(),
        columns = me.el.select('.' + GRID_COLUMN_CLS),
        width = column.width,
        el = F.get(document.createElement('div')),
        i = index,
        iL = columns.length,
        left = 0,
        j = 0,
        jL = index,
        passedLeft;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      for (; j < jL; j++) {
        if(!_columns[j].hidden){
          left += _columns[j].width;
        }
      }

      passedLeft = left;

      for (; i < iL; i++) {
        if(_columns[i].hidden){
          continue;
        }

        var _column = columns.item(i);
        left = parseInt(_column.css('left')) + column.width;

        _column.css('left', left);
        _column.attr('index', i + 1);
      }

      el.addCls(GRID_COLUMN_CLS);
      el.attr('grid', w.id);

      if (column.index === '$selected') {
        el.addCls(GRID_COLUMN_SELECT_CLS);
      }
      else {
        switch (column.type) {
          case 'order':
            el.addCls(GRID_COLUMN_ORDER_CLS);
            break;
          case 'rowdrag':
            el.addCls(GRID_COLUMN_ROW_DRAG_CLS);
            break;
        }
      }

      if (column.cls) {
        el.addCls(column.cls);
      }

      if (column.type === 'text') {
        el.addCls(GRID_COLUMN_TEXT_CLS);
      }

      el.css({
        width: width + 'px'
      });
      el.attr('index', index);

      if (column.cellAlign) {
        el.css('text-align', column.cellAlign);
      }

      if (column.ellipsis === true) {
        switch (column.type) {
          case 'string':
          case 'text':
          case 'number':
          case 'date':
          case 'combo':
            el.addCls(GRID_COLUMN_ELLIPSIS_CLS);
            break;
        }
      }

      var scrolled = w.scroller.getScroll();
      el.css('top', -scrolled);

      if (index === 0 && columns.length) {
        el.css('left', '0px');
        me.el.dom.insertBefore(el.dom, columns.item(index).dom);
      }
      else if (index !== 0 && columns.length) {
        if(index === columns.length){
          el.css('left', left + 'px');
          me.el.dom.appendChild(el.dom);
        }
        else {
          el.css('left', passedLeft + 'px');
          me.el.dom.insertBefore(el.dom, columns.item(index).dom);
        }
      }
      else{
        el.css('left', left + 'px');
        me.el.dom.appendChild(el.dom);
      }

      me.checkDomCells();
      me.updateRows(undefined, index);
    },
    reSetIndexes: function () {
      var me = this,
        columnsDom = me.el.select('.' + GRID_COLUMN_CLS);

      columnsDom.each(function(el, i){
        el.attr('index', i);
      });
    },
    /*
     *
     */
    clearColumnsStyles: function(){
      var me = this,
        cells = me.el.select('div.' + GRID_CELL_CLS);

      cells.each(function(cell){
        cell.css('color', '');
        cell.css('background-color', '');
      });
    },
    /*
     *
     */
    updateColumnsSizes: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        left = 0;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i) {
        if(column.hidden){
          return;
        }

        var el = me.el.select('.' + GRID_COLUMN_CLS + '[index="'+i+'"]');
        if(Fancy.nojQuery){
          //Bug: zepto dom module does not support for 2 animation params.
          //It is not fix
          //el.animate({'width': column.width}, ANIMATE_DURATION);
          //el.animate({'left': left}, ANIMATE_DURATION);
          el.css({
            width: column.width,
            left: left
          });
        }
        else{
          el.animate({
            width: column.width,
            left: left
          }, ANIMATE_DURATION);

          el.css('overflow', '');
        }

        left += column.width;
      });
    },
    reSetColumnsAlign: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = this.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i){
        var column = columns[i];

        columnEl.css('text-align', column.cellAlign || '');
      });
    },
    reSetColumnsCls: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i){
        var column = columns[i],
          clss = columnEl.attr('class').split(' ');

        F.each(clss, function (cls) {
          switch(cls){
            case GRID_COLUMN_CLS:
              break;
            case column.cls:
              break;
            case spark[column.type]:
              break;
            default:
              columnEl.removeCls(cls);
          }
        });

        if(column.cls){
          columnEl.addCls(column.cls);
        }

        if(column.ellipsis){
          columnEl.addCls(GRID_COLUMN_ELLIPSIS_CLS);
        }

        switch(column.type){
          case 'order':
            columnEl.addCls(GRID_COLUMN_ORDER_CLS);
            break;
          case 'select':
            columnEl.addCls(GRID_COLUMN_SELECT_CLS);
            break;
          case 'rowdrag':
            columnEl.addCls(GRID_COLUMN_ROW_DRAG_CLS);
            break;
        }
      });
    },
    onContextMenu: function (e) {
      var me = this,
        w = me.widget;

      w.fire('contextmenu', me.getEventParams(e));
    },
    updateColumnsVisibility: function () {
      var me = this,
        columns = me.getColumns(),
        columnEls = me.el.select('.' + GRID_COLUMN_CLS);

      columnEls.each(function(columnEl, i) {
        var column = columns[i];

        if(column.hidden){
          columnEl.hide();
        }
        else if(columnEl.css('display') === 'none'){
          columnEl.show();
        }
      });
    }
  });

  var spark = {
    sparklineline: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebar: GRID_COLUMN_SPARKLINE_CLS,
    sparklinetristate: GRID_COLUMN_SPARKLINE_CLS,
    sparklinediscrete: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebullet: GRID_COLUMN_SPARKLINE_CLS,
    sparklinepie: GRID_COLUMN_SPARKLINE_CLS,
    sparklinebox: GRID_COLUMN_SPARKLINE_CLS,
    circle: GRID_COLUMN_CHART_CIRCLE_CLS,
    progressdonut: GRID_COLUMN_SPARK_PROGRESS_DONUT_CLS,
    grossloss: GRID_COLUMN_GROSSLOSS_CLS,
    progressbar: GRID_COLUMN_PROGRESS_CLS,
    hbar: GRID_COLUMN_H_BAR_CLS
  }

})();/**
 * @class Fancy.grid.Header
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_HEADER_CLS = F.GRID_HEADER_CLS;
  var GRID_HEADER_CELL_CLS = F.GRID_HEADER_CELL_CLS;
  var GRID_HEADER_CELL_CONTAINER_CLS = F.GRID_HEADER_CELL_CONTAINER_CLS;
  var GRID_HEADER_CELL_TEXT_CLS = F.GRID_HEADER_CELL_TEXT_CLS;
  var GRID_HEADER_CELL_TRIGGER_CLS  = F.GRID_HEADER_CELL_TRIGGER_CLS;
  var GRID_HEADER_CELL_TRIGGER_IMAGE_CLS  = F.GRID_HEADER_CELL_TRIGGER_IMAGE_CLS;
  var GRID_HEADER_CELL_TRIGGER_DISABLED_CLS = F.GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_1_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
  var GRID_HEADER_CELL_GROUP_LEVEL_2_CLS = F.GRID_HEADER_CELL_GROUP_LEVEL_2_CLS;
  var GRID_HEADER_CELL_SELECT_CLS = F.GRID_HEADER_CELL_SELECT_CLS;
  var GRID_HEADER_CELL_FILTER_FULL_CLS = F.GRID_HEADER_CELL_FILTER_FULL_CLS;
  var GRID_HEADER_CELL_FILTER_SMALL_CLS = F.GRID_HEADER_CELL_FILTER_SMALL_CLS;
  var GRID_HEADER_CELL_TRIPLE_CLS =  F.GRID_HEADER_CELL_TRIPLE_CLS;
  var GRID_HEADER_CELL_CHECKBOX_CLS = F.GRID_HEADER_CELL_CHECKBOX_CLS;
  var GRID_COLUMN_SORT_ASC = F.GRID_COLUMN_SORT_ASC;
  var GRID_COLUMN_SORT_DESC = F.GRID_COLUMN_SORT_DESC;
  var FIELD_CHECKBOX_CLS = F.FIELD_CHECKBOX_CLS;

  var ANIMATE_DURATION = F.ANIMATE_DURATION;

  F.define('Fancy.grid.Header', {
    extend: F.Widget,
    cls: GRID_HEADER_CLS,
    mixins: [
      'Fancy.grid.header.mixin.Menu'
    ],
    cellTpl: [
      '<div class="' + GRID_HEADER_CELL_CLS + ' {cls}" style="display:{display};width:{columnWidth}px;height: {height};left: {left};" {groupIndex} index="{index}">',
        '<div class="' + GRID_HEADER_CELL_CONTAINER_CLS + '" style="height: {height};">',
          '<span class="' + GRID_HEADER_CELL_TEXT_CLS + '">{columnName}</span>',
          '<span class="' + GRID_HEADER_CELL_TRIGGER_CLS + '">',
            '<div class="' + GRID_HEADER_CELL_TRIGGER_IMAGE_CLS + '"></div>',
          '</span>',
        '</div>',
      '</div>'
    ],
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

      me.initTpl();
      me.render();

      me.renderHeaderCheckBox();

      me.setAlign();
      me.setCellsPosition();
      me.ons();
    },
    /*
     *
     */
    initTpl: function () {
      this.cellTpl = new F.Template(this.cellTpl);
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        w = me.widget,
        el = me.el,
        headerCellSelector = 'div.' + GRID_HEADER_CELL_CLS;

      w.on('render', me.onAfterRender, me);
      w.on('docmove', me.onDocMove, me);
      el.on('click', me.onTriggerClick, me, 'span.' + GRID_HEADER_CELL_TRIGGER_CLS);
      el.on('click', me.onCellClick, me, headerCellSelector);
      el.on('mousemove', me.onCellMouseMove, me, headerCellSelector);
      el.on('mousedown', me.onCellMouseDown, me, headerCellSelector);
      el.on('mousedown', me.onMouseDown, me);
      el.on('dblclick', me.onCellTextDBLClick, me, '.' + GRID_HEADER_CELL_TEXT_CLS);
    },
    /*
     *
     */
    render: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        renderTo,
        el = F.get(document.createElement('div')),
        html = '',
        i = 0,
        iL = columns.length,
        numRows = 1,
        groups = {},
        passedWidth = 0,
        isFilterHeader = w.filter && w.filter.header,
        cellFilterGroupType = 'full',
        cellHeight = w.cellHeaderHeight;

      if (w.groupheader) {
        if (isFilterHeader && !w.filter.groupHeader) {
          cellFilterGroupType = 'small';
        }
        else {
          numRows = 2;
        }
      }

      if (isFilterHeader) {
        numRows++;
      }

      for (; i < iL; i++) {
        var column = columns[i],
          title = column.title || column.header,
          height = cellHeight,
          cls = '',
          groupIndex = '';

        if (numRows !== 1) {
          if (!column.grouping) {
            height = (numRows * cellHeight) + 'px';
          }
          else {
            if (!groups[column.grouping]) {
              groups[column.grouping] = {
                width: 0,
                title: column.grouping,
                left: passedWidth
              };
            }

            if (isFilterHeader && w.filter.groupHeader) {
              height = (2 * cellHeight) + 'px';
            }
            else {
              height = cellHeight + 'px';
            }

            if (!column.hidden) {
              groups[column.grouping].width += column.width;
            }

            groupIndex = 'group-index="' + column.grouping + '"';

            cls = GRID_HEADER_CELL_GROUP_LEVEL_1_CLS;
          }
        }

        passedWidth += column.width;

        if (column.index === '$selected') {
          cls += ' ' + GRID_HEADER_CELL_SELECT_CLS;
        }

        if (!column.menu) {
          cls += ' ' + GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
        }

        if (column.filter && column.filter.header) {
          switch (cellFilterGroupType) {
            case 'small':
              cls += ' ' + GRID_HEADER_CELL_FILTER_SMALL_CLS;
              break;
            case 'full':
              cls += ' ' + GRID_HEADER_CELL_FILTER_FULL_CLS;
              break;
          }
        }

        if(F.isNumber(height)){
          height += 'px';
        }

        var cellConfig = {
          cls: cls,
          columnName: title,
          columnWidth: column.width,
          index: i,
          height: height,
          left: 'initial',
          groupIndex: groupIndex,
          display: column.hidden ? 'none' : ''
        };

        html += me.cellTpl.getHTML(cellConfig);
      }

      el.css({
        height: cellHeight * numRows + 'px',
        width: me.getColumnsWidth()
      });

      el.addCls(me.cls);

      if (w.groupheader) {
        el.addCls('fancy-grid-header-grouped');
        html += me.getGroupingCellsHTML(groups);
      }

      el.update(html);

      renderTo = w.el.select('.fancy-grid-' + me.side).dom;
      me.el = F.get(renderTo.appendChild(el.dom));
    },
    /*
     * @param {Number} index
     * @param {Object} column
     */
    insertCell: function (index, column) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        columns = me.getColumns(),
        cls = '',
        title = column.title || column.header,
        cellHeight,
        groupIndex = '',
        left = 0;

      if(cells.length){
        cellHeight = parseInt(cells.item(0).css('height'));
      }
      else{
        var _cells = w.header.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');
        //cellHeight = parseInt(_cells.item(0).css('height'));
        //cellHeight = parseInt(w.header.el.css('height'));
      }

      cellHeight = parseInt(w.header.el.css('height'));

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      if (w.groupheader) {
        //cellHeight = w.cellHeight * 2;
        var groupUpCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        //BUG: possible bug for dragging column
        if (index !== w.columns.length - 1) {
          groupUpCells.each(function (cell) {
            var left = parseInt(cell.css('left') || 0) + column.width;

            cell.css('left', left);
          });
        }
      }

      if (column.index === '$selected') {
        cls += ' ' + GRID_HEADER_CELL_SELECT_CLS;
      }

      if (!column.menu) {
        cls += ' ' + GRID_HEADER_CELL_TRIGGER_DISABLED_CLS;
      }

      var j = 0,
        jL = index;

      for (; j < jL; j++) {
        if(!columns[j].hidden){
          left += columns[j].width;
        }
      }

      if(me.side === 'center'){
        left += w.scroller.scrollLeft || 0;
      }

      var cellHTML = me.cellTpl.getHTML({
        cls: cls,
        columnName: title,
        columnWidth: column.width,
        index: index,
        height: String(cellHeight) + 'px',
        left: String(left) + 'px',
        groupIndex: groupIndex
      });

      if (index === 0 && cells.length) {
        F.get(cells.item(0).before(cellHTML));
      }
      else if (index !== 0 && cells.length) {
        if(index === cells.length) {
          me.el.append(cellHTML);
        }
        else{
          F.get(cells.item(index).before(cellHTML));
        }
      }
      else{
        me.el.append(cellHTML);
      }

      //var i = index,
      var i = 0,
        iL = columns.length,
        width = 0,
        left = 0;

      if(me.side === 'center'){
        left -= w.scroller.scrollLeft;
      }

      cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      for (; i < iL; i++) {
        var column = columns[i];

        if (column.hidden) {
          continue;
        }

        var cell = cells.item(i);

        cell.css('left', left);
        left += column.width;
        width += column.width;
      }

      var oldWidth = parseInt(me.css('width'));

      if(oldWidth > width){
        width = oldWidth;
      }

      //me.css('width', parseInt(me.css('width')) + column.width);
      me.css('width', width);
    },
    /*
     *
     */
    setAlign: function () {
      var me = this,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];

        if (column.align) {
          me.getDomCell(i).css('text-align', column.align);
        }
      }
    },
    onAfterRender: function () {},
    /*
     * @param {Boolean} [animate]
     */
    setCellsPosition: function (animate) {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        cellsWidth = 0,
        cellsDom = me.el.select('.' + GRID_HEADER_CELL_CLS);

      cellsWidth += me.scrollLeft || 0;

      F.each(columns, function (column, i) {
        var cellEl = cellsDom.item(i),
          top = '0px';

        if (column.grouping) {
          top = w.cellHeaderHeight + 'px';
        }

        if(animate && !F.nojQuery){
          cellEl.animate({
            top: top,
            left: cellsWidth + 'px'
          }, F.ANIMATE_DURATION);
        }
        else {
          cellEl.css({
            top: top,
            left: cellsWidth + 'px'
          });
        }

        if (!column.hidden) {
          cellsWidth += column.width;
        }
      });

      if (w.groupheader) {
        var groupCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

        groupCells.each(function (groupCell) {
          var groupName = groupCell.attr('index');

          var underGroupCells = me.el.select('[group-index="' + groupName + '"]'),
            groupCellLeft = me.scrollLeft || 0,
            groupCellWidth = 0;

          F.each(columns, function (column) {
            if (column.grouping === groupName) {
              return true;
            }

            if(!column.hidden){
              groupCellLeft += column.width;
            }
          });

          F.each(columns, function (column) {
            if (column.grouping === groupName && !column.hidden) {
              groupCellWidth += column.width;
            }
          });

          if(animate && !F.nojQuery){
            groupCell.animate({
              left: groupCellLeft,
              width: groupCellWidth
            }, ANIMATE_DURATION);
          }
          else{
            groupCell.css({
              left: groupCellLeft,
              width: groupCellWidth
            });
          }
        });
      }
    },
    /*
     *
     */
    fixGroupHeaderSizing: function () {
      var me = this,
        w = me.widget,
        CELL_HEADER_HEIGHT = w.cellHeaderHeight,
        columns = me.getColumns(),
        cellsDom = me.el.select('.' + GRID_HEADER_CELL_CLS),
        left = 0,
        groups = {},
        groupsWidth = {},
        groupsLeft = {},
        rows = me.calcRows();

      if(me.side === 'center'){
        left = w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i) {
        var cell = cellsDom.item(i),
          grouping = column.grouping,
          top = '0px',
          height = CELL_HEADER_HEIGHT * rows;

        groups[grouping] = true;

        if(grouping){
          if(groupsWidth[grouping] === undefined){
            groupsWidth[grouping] = column.width;
            groupsLeft[grouping] = left;
          }
          else{
            groupsWidth[grouping] += column.width;
          }

          cell.addCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS);
          top = CELL_HEADER_HEIGHT + 'px';
          height = CELL_HEADER_HEIGHT;

          if(column.filter && column.filter.header){
            height = CELL_HEADER_HEIGHT * 2;
            setTimeout(function () {
              cell.addCls(GRID_HEADER_CELL_FILTER_FULL_CLS);
            }, 30);
          }
        }
        else{
          cell.removeCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS);
          if(column.filter && column.filter.header){
            setTimeout(function () {
              cell.addCls(GRID_HEADER_CELL_FILTER_SMALL_CLS);
            }, 30);
            cell.addCls(GRID_HEADER_CELL_FILTER_SMALL_CLS);
          }
        }

        if(w.groupheader && height === CELL_HEADER_HEIGHT && !grouping && !column.filter){
          height = CELL_HEADER_HEIGHT * 2;
        }

        //TODO: case for ungroup all cells over column drag with filtering

        cell.css({
          top: top,
          height: height
        });

        left += column.width;
      });

      for(var p in groupsWidth){
        var groupCell = me.el.select('[index="'+p+'"]');

        groupCell.css({
          left: groupsLeft[p],
          width: groupsWidth[p]
        });
      }

      var groupCells = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS);

      groupCells.each(function (cell) {
        var groupName = cell.attr('index');

        if(!groups[groupName]){
          cell.destroy();
        }
      });
    },
    /*
     * @return {Number}
     */
    getColumnsWidth: function () {
      var me = this,
        columns = me.getColumns(),
        cellsWidth = 0,
        i = 0,
        iL = columns.length;

      for (; i < iL; i++) {
        var column = columns[i];

        cellsWidth += column.width;
      }

      return cellsWidth;
    },
    /*
     * @return {Array}
     */
    getColumns: function () {
      var me = this,
        w = me.widget,
        columns;

      switch (me.side) {
        case 'left':
          columns = w.leftColumns;
          break;
        case 'center':
          columns = w.columns;
          break;
        case 'right':
          columns = w.rightColumns;
          break;
      }

      return columns;
    },
    /*
     * @param {Number} index
     * @return {Fancy.Element}
     */
    getDomCell: function (index) {
      return this.el.select('.' + GRID_HEADER_CELL_CLS).item(index);
    },
    /*
     * @param {Event} e
     */
    onCellClick: function (e) {
      var me = this,
        w = me.widget,
        columndrag = w.columndrag,
        cell = e.currentTarget,
        target = F.get(e.target),
        index = parseInt(F.get(cell).attr('index')),
        columns = me.getColumns(),
        column = columns[index];

      if(columndrag && columndrag.status === 'dragging'){
        return;
      }

      if (target.hasCls(GRID_HEADER_CELL_TRIGGER_CLS)) {
        return
      }

      if (target.hasCls(GRID_HEADER_CELL_TRIGGER_IMAGE_CLS)) {
        return
      }

      if (F.get(cell).hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS)) {
        return;
      }

      if(me.textDBLClick){
        return;
      }

      if(column.titleEditable){
        setTimeout(function(){
          if(me.textDBLClick){
            setTimeout(function(){
              delete me.textDBLClick;
            }, 400);
          }
          else{
            w.fire('headercellclick', {
              e: e,
              side: me.side,
              cell: cell,
              index: index
            });
          }

        }, 300);
      }
      else {
        w.fire('headercellclick', {
          e: e,
          side: me.side,
          cell: cell,
          index: index
        });
      }
    },
    /*
     * @param {Event} e
     */
    onCellMouseMove: function (e) {
      var me = this,
        w = me.widget,
        cell = e.currentTarget,
        cellEl = F.get(cell),
        isGroupCell = cellEl.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_2_CLS),
        index = parseInt(F.get(cell).attr('index'));

      if (isGroupCell) {
        return;
      }

      w.fire('headercellmousemove', {
        e: e,
        side: me.side,
        cell: cell,
        index: index
      });
    },
    /*
     * @param {Event} e
     */
    onMouseDown: function (e) {
      var targetEl = F.get(e.target);

      if (targetEl.prop("tagName") === 'INPUT') {
      }
      else {
        e.preventDefault();
      }
    },
    /*
     * @param {Event} e
     */
    onCellMouseDown: function (e) {
      var w = this.widget,
        cell = e.currentTarget,
        index = parseInt(F.get(cell).attr('index'));

      w.fire('headercellmousedown', {
        e: e,
        side: this.side,
        cell: cell,
        index: index
      });
    },
    /*
     * @param {Number} value
     * @param {Boolean} [animate]
     */
    scroll: function (value, animate) {
      this.scrollLeft = value;
      this.setCellsPosition(animate);
    },
    /*
     * @param {Array} groups
     * @return {String}
     */
    getGroupingCellsHTML: function (groups) {
      var me = this,
        w = me.widget,
        html = '';

      F.each(groups, function (group, p) {
        html += me.cellTpl.getHTML({
          cls: GRID_HEADER_CELL_GROUP_LEVEL_2_CLS,
          columnName: group.title,
          columnWidth: group.width,
          index: p,
          height: w.cellHeaderHeight + 'px',
          left: group.left + 'px',
          groupIndex: ''
        });
      });

      return html;
    },
    /*
     *
     */
    destroy: function () {
      var me = this,
        el = me.el,
        cellSelector = 'div.' + GRID_HEADER_CELL_CLS;

      el.un('click', me.onCellClick, me, cellSelector);
      el.un('mousemove', me.onCellMouseMove, me, cellSelector);
      el.un('mousedown', me.onCellMouseDown, me, cellSelector);
      el.un('mousedown', me.onMouseDown, me);
    },
    /*
     * @param {Number} index
     * @return {Fancy.Element}
     */
    getCell: function (index) {
      return this.el.select('.' + GRID_HEADER_CELL_CLS + '[index="' + index + '"]');
    },
    /*
     * @param {Event} e
     */
    onTriggerClick: function (e) {
      var me = this,
        target = F.get(e.currentTarget),
        cell = target.parent().parent(),
        index = parseInt(cell.attr('index')),
        columns = me.getColumns(),
        column = columns[index];

      e.stopPropagation();

      me.showMenu(cell, index, column, columns);
    },
    /*
     * @param {Number} orderIndex
     */
    hideCell: function (orderIndex) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth = parseInt(cell.css('width')),
        i = 0,
        iL = cells.length,
        columns = me.getColumns();

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.animate({
          width: groupCellWidth - cellWidth
        }, ANIMATE_DURATION);
      }

      cell.hide();

      var groups = {},
        left = 0,
        scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          cellLeft = parseInt(_cell.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }

        if(cellLeft !== left){
          _cell.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }

      F.each(groups, function (value, group) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + group + '"]').item(0),
          left = 0;

        if(me.side === 'center'){
          scrollLeft = w.scroller.scrollLeft;
          left -= scrollLeft;
        }

        F.each(columns, function (column, i) {
          if(column.hidden){
            return;
          }

          if(column.grouping === group){
            return true;
          }

          left += column.width;
        });

        groupCell.animate({
          left: left
        }, ANIMATE_DURATION);
      });
    },
    /*
     * @param {Number} orderIndex
     */
    showCell: function (orderIndex) {
      var me = this,
        w = me.widget,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth,
        left = 0,
        i = 0,
        iL = cells.length,
        columns = me.getColumns();

      cell.show();

      cellWidth = parseInt(cell.css('width'));

      if (cell.hasCls(GRID_HEADER_CELL_GROUP_LEVEL_1_CLS)) {
        var groupIndex = cell.attr('group-index'),
          groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + groupIndex + '"]').item(0),
          groupCellWidth = parseInt(groupCell.css('width'));

        groupCell.animate({
          width: groupCellWidth + cellWidth
        }, ANIMATE_DURATION);
      }

      var scrollLeft = 0;

      if(me.side === 'center'){
        scrollLeft = w.scroller.scrollLeft;
        left -= scrollLeft;
      }

      var groups = {};

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          cellLeft = parseInt(_cell.css('left')),
          column = columns[i];

        if(column.hidden){
          continue;
        }

        if (column.grouping) {
          if (columns[orderIndex].grouping !== column.grouping) {
            groups[column.grouping] = true;
          }
        }

        if(cellLeft !== left){
          _cell.animate({
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      }

      F.each(groups, function (value, group) {
        var groupCell = me.el.select('.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + '[index="' + group + '"]').item(0),
          left = 0;

        if(me.side === 'center'){
          scrollLeft = w.scroller.scrollLeft;
          left -= scrollLeft;
        }

        F.each(columns, function (column) {
          if(column.hidden){
            return;
          }

          if(column.grouping === group){
            return true;
          }

          left += column.width;
        });

        groupCell.animate({
          left: left
        }, ANIMATE_DURATION);
      });
    },
    /*
     * @param {Number} orderIndex
     */
    removeCell: function (orderIndex) {
      var me = this,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')'),
        cell = cells.item(orderIndex),
        cellWidth = parseInt(cell.css('width')),
        i = orderIndex + 1,
        iL = cells.length,
        groupCells = {},
        isGroupCell = false;

      if (cell.attr('group-index')) {
        isGroupCell = cell.attr('group-index');
        groupCells[isGroupCell] = true;
      }

      cell.destroy();

      for (; i < iL; i++) {
        var _cell = cells.item(i),
          left = parseInt(_cell.css('left')) - cellWidth;

        if (_cell.attr('group-index')) {
          groupCells[_cell.attr('group-index')] = true;
        }

        _cell.attr('index', i - 1);

        _cell.css('left', left);
      }

      for (var p in groupCells) {
        var groupCell = me.el.select('[index="' + p + '"]'),
          newCellWidth = parseInt(groupCell.css('width')) - cellWidth,
          newCellLeft = parseInt(groupCell.css('left')) - cellWidth;

        if (isGroupCell && groupCell) {
          groupCell.css('width', newCellWidth);

          if (groupCell.attr('index') !== isGroupCell) {
            groupCell.css('left', newCellLeft);
          }
        }
        else {
          groupCell.css('left', newCellLeft);
        }
      }

      if (isGroupCell) {
        if (me.el.select('[group-index="' + isGroupCell + '"]').length === 0) {
          var groupCell = me.el.select('[index="' + isGroupCell + '"]');

          groupCell.destroy();
        }
      }

      if (me.side !== 'center') {
        me.css('width', parseInt(me.css('width')) - cellWidth);
      }
    },
    /*
     *
     */
    renderHeaderCheckBox: function () {
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        i = 0,
        iL = columns.length,
        cells = me.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      for (; i < iL; i++) {
        var column = columns[i];

        if(F.isObject(column.headerCheckBox)){
          var el = column.headerCheckBox.el,
            elId = el.attr('id');

          var el = F.get(elId);

          if(!el.dom){
            column.headerCheckBox = true;
          }
        }

        if (column.headerCheckBox === true && column.type !== 'select') {
          var cell = cells.item(i),
            headerCellContainer = cell.firstChild(),
            textEl = cell.select('.' + GRID_HEADER_CELL_TEXT_CLS),
            text = textEl.dom.innerHTML,
            //label = !text ? false : text,
            label = column.title ? column.title : false,
            labelWidth = 0;

          switch(column.type) {
            case 'checkbox':
            case 'switcher':
              cell.addCls(GRID_HEADER_CELL_CHECKBOX_CLS);
              break;
            case 'select':
              cell.addCls(GRID_HEADER_CELL_SELECT_CLS);
              break;
          }

          textEl.update('');

          if (label.length) {
            labelWidth = label.width * 15;
          }

          column.headerCheckBox = new F.CheckBox({
            renderTo: headerCellContainer.dom,
            renderId: true,
            labelWidth: labelWidth,
            value: false,
            label: label,
            labelAlign: 'right',
            style: {
              padding: '0px',
              display: 'inline-block'
            },
            events: [{
              change: function (checkbox, value) {
                var i = 0,
                  iL = w.getViewTotal();

                for (; i < iL; i++) {
                  w.set(i, column.index, value);
                }
              }
            }]
          });
        }
      }
    },
    /*
     *
     */
    reSetIndexes: function () {
      var cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function (cell, i) {
        cell.attr('index', i);
      })
    },
    /*
     *
     */
    reSetGroupIndexes: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function (cell, i) {
        var column = columns[i],
          grouping = column.grouping;

        if(cell.attr('group-index') && !grouping){
          cell.removeAttr('group-index');
        }
        else if(grouping && cell.attr('group-index') !== grouping){
          cell.attr('group-index', grouping);
        }
      });
    },
    /*
     *
     */
    updateTitles: function(){
      var me = this,
        columns = me.getColumns();

      F.each(columns, function (column, i) {
        if(column.headerCheckBox){
          return;
        }

        me.el.select('div.' + GRID_HEADER_CELL_CLS + '[index="'+i+'"] .' + GRID_HEADER_CELL_TEXT_CLS).update(column.title || '');
      });
    },
    /*
     *
     */
    updateCellsSizes: function(){
      var me = this,
        w = me.widget,
        columns = me.getColumns(),
        left = 0;

      if(me.side === 'center'){
        left = -w.scroller.scrollLeft;
      }

      F.each(columns, function (column, i){
        if(column.hidden){
          return;
        }

        var cell = me.el.select('div.' + GRID_HEADER_CELL_CLS + '[index="'+i+'"]'),
          currentLeft = parseInt(cell.css('left')),
          currentWidth = parseInt(cell.css('width'));

        if(currentLeft === left && currentWidth === column.width){
          left += column.width;
          return;
        }

        if(Fancy.nojQuery){
          //Bug fix for dom fx without jQuery
          //It is not fix.
          //cell.animate({width: column.width}, ANIMATE_DURATION);
          //cell.animate({left: left}, ANIMATE_DURATION);
          cell.css({
            width: column.width,
            left: left
          });
        }
        else {
          cell.animate({
            width: column.width,
            left: left
          }, ANIMATE_DURATION);
        }

        left += column.width;
      });
    },
    /*
     * @return {Number}
     */
    calcRows: function(){
      var me = this,
        w = me.widget,
        columns = w.columns.concat(w.leftColumns).concat(w.rightColumns),
        rows = 1;

      Fancy.each(columns, function(column){
        if(column.grouping){
          if(rows < 2){
             rows = 2;
          }

          if(column.filter && column.filter.header){
            if(rows < 3){
              rows = 3;
            }
          }
        }

        if(column.filter && column.filter.header){
          if(rows < 2){
            rows = 2;
          }
        }
      });

      if(w.groupheader && rows === 2){
        var tripleCells = w.el.select('.' + GRID_HEADER_CELL_TRIPLE_CLS);
        if(tripleCells.length){
          //TODO: redo this case to decrease header height
          //Also needs to work with case of 1 row
          rows = 3;
        }
      }

      return rows;
    },
    /*
     *
     */
    reSetColumnsAlign: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i){
        var column = columns[i];

        cell.css('text-align', column.align || '');
      });
    },
    /*
     * Bug Fix: Empty method that is rewritten in HeaderMenu mixin
     */
    destroyMenus: function () {},
    onDocMove: function () {
      var me = this,
        w = me.widget;

      if(w.el.css('display') === 'none' || (w.panel && w.panel.el && w.panel.el.css('display') === 'none') && me.hideMenu){
        me.hideMenu();
      }
    },
    /*
     *
     */
    reSetColumnsCls: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i){
        var column = columns[i];

        if(column.menu){
          cell.removeCls(GRID_HEADER_CELL_TRIGGER_DISABLED_CLS);
        }
        else{
          cell.addCls(GRID_HEADER_CELL_TRIGGER_DISABLED_CLS);
        }
      });
    },
    updateCellsVisibility: function () {
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      cells.each(function(cell, i) {
        var column = columns[i];

        if(column.hidden){
          cell.hide();
        }
        else if(cell.css('display') === 'none'){
          cell.show();
        }
      });
    },
    reSetCheckBoxes: function(){
      var me = this,
        columns = me.getColumns(),
        cells = this.el.select('.' + GRID_HEADER_CELL_CLS + ':not(.' + GRID_HEADER_CELL_GROUP_LEVEL_2_CLS + ')');

      F.each(columns, function (column, i) {
        var cell = cells.item(i),
          checkBoxEl = cell.select('.' + FIELD_CHECKBOX_CLS);

        if(checkBoxEl.length){
          var checkBox = F.getWidget(checkBoxEl.item(0).attr('id'));
          cell.removeCls(GRID_HEADER_CELL_CHECKBOX_CLS);
          cell.removeCls(GRID_HEADER_CELL_SELECT_CLS);
          switch(column.type){
            case 'select':
              cell.addCls(GRID_HEADER_CELL_SELECT_CLS);
              break;
            case 'checkbox':
              cell.addCls(GRID_HEADER_CELL_CHECKBOX_CLS);
              break;
            default:
              if(!column.headerCheckBox){
                checkBox.destroy();
              }
          }
        }
      });

      me.renderHeaderCheckBox();
    },
    onCellTextDBLClick: function (e) {
      var me = this,
        w = me.widget,
        targetEl = Fancy.get(e.target),
        cell = targetEl.parent().parent(),
        index = cell.attr('index'),
        columns = me.getColumns(),
        column = columns[index],
        oldValue = column.title;

      if(!column.titleEditable){
        return;
      }

      me.textDBLClick = true;

      if(me.activeEditColumnField){
        me.activeEditColumnField.destroy();
        delete me.activeEditColumnField;
      }

      me.activeEditColumnField = new Fancy.StringField({
        renderTo: me.el.dom,
        label: false,
        theme: w.theme,
        padding: '0px 0px 0px',
        width: column.width + 1,
        value: column.title || '',
        inputHeight: w.cellHeaderHeight + 1,
        events: [{
          enter: function (field) {
            field.destroy();
          }
        }, {
          esc: function (field) {
            w.setColumnTitle(column.index, oldValue, me.side);
            field.destroy();
            delete me.activeEditColumnField;
          }
        }, {
          input: function (field, value) {
            w.setColumnTitle(column.index, value, me.side);
            delete me.activeEditColumnField;
          }
        },{
          render: function(field){
            field.focus();
            delete me.activeEditColumnField;
          }
        }],
        style: {
          position: 'absolute',
          top: -1,
          left: parseInt(cell.css('left')) - 1
        }
      });

      w.once('scroll', function(){
        if(me.activeEditColumnField){
          me.activeEditColumnField.destroy();
          delete me.activeEditColumnField;
        }
      });
    }
  });

})();