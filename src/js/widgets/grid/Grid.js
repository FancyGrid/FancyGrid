/**
 * @class Fancy.Grid
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.Grid', 'FancyGrid'], {
  extend: Fancy.Widget,
  mixins: [
    'Fancy.grid.mixin.Grid',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.grid.mixin.PrepareConfig',
    'Fancy.grid.mixin.ActionColumn',
    Fancy.grid.mixin.Edit
  ],
  plugins: [{
    type: 'grid.updater'
  },{
    type: 'grid.scroller'
  },{
    type: 'grid.licence'
  }],
  type: 'grid',
  theme: 'default',
  i18n: 'en',
  emptyText: '',
  prefix: 'fancy-grid-',
  cls: '',
  widgetCls: Fancy.GRID_CLS,
  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  rowLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
  minColumnWidth: 30,
  emptyValue: '&nbsp;',
  frame: true,
  draggable: false,
  activated: false,
  multiSort: false,
  tabEdit: true,
  dirtyEnabled: true,
  barScrollEnabled: true,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    var fn = function(params){
      if(params){
        Fancy.apply(config, params);
      }

      config = me.prepareConfig(config, me);
      Fancy.applyConfig(me, config);

      me.Super('const', arguments);
    };

    var preInit = function(){
      var i18n = config.i18n || me.i18n;

      if( Fancy.loadLang(i18n, fn) === true ){
        fn({
          //lang: Fancy.i18n[i18n]
        });
      }
    };

    if(!Fancy.modules['grid'] && !Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false){
      if(Fancy.nojQuery){
        Fancy.loadModule('dom', function(){
          Fancy.loadModule('grid', function(){
            preInit();
          });
        });
      }
      else{
        Fancy.loadModule('grid', function(){
          preInit();
        });
      }
    }
    else{
      preInit();
    }
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.initId();
    me.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
    me.addEvents(
      'headercellclick', 'headercellmousemove', 'headercellmousedown',
      'docmouseup', 'docclick', 'docmove',
      'init',
      'columnresize', 'columnclick', 'columndblclick', 'columnenter', 'columnleave', 'columnmousedown',
      'cellclick', 'celldblclick', 'cellenter', 'cellleave', 'cellmousedown', 'beforecellmousedown',
      'rowclick', 'rowdblclick', 'rowenter', 'rowleave', 'rowtrackenter', 'rowtrackleave',
      'columndrag',
      'scroll', 'nativescroll',
      'remove',
      'set',
      'update',
      'beforesort', 'sort',
      'beforeload', 'load', 'servererror', 'serversuccess',
      'select',
      'clearselect',
      'activate', 'deactivate',
      'beforeedit',
      'startedit',
      'changepage',
      'dropitems',
      'collapse', 'expand',
      'lockcolumn', 'rightlockcolumn', 'unlockcolumn',
      'filter',
      'contextmenu'
    );

    Fancy.loadStyle();

    if(Fancy.fullBuilt !== true && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(me.wtype !== 'datepicker' && me.wtype !== 'monthpicker') {
        me.loadModules();
        return;
      }
    }

    me.initStore();

    me.initPlugins();

    me.ons();

    me.initDateColumn();
    me.fire('beforerender');
    me.preRender();
    me.render();
    me.initElements();
    me.initActionColumnHandler();
    me.fire('render');
    me.fire('afterrender');
    me.setSides();
    me.setSidesHeight();
    me.setColumnsPosition();
    me.update();
    me.initTextSelection();
    me.initTouch();

    setTimeout(function(){
      me.inited = true;
      me.fire('init');

      me.setBodysHeight();
    }, 1);
  },
  /*
   *
   */
  loadModules: function(){
    var me = this,
      requiredModules = {},
      columns = me.columns || [],
      leftColumns = me.leftColumns || [],
      rightColumns = me.rightColumns || [];

    Fancy.modules = Fancy.modules || {};

    if(Fancy.nojQuery){
      requiredModules.dom = true;
    }

    if(Fancy.isTouch){
      requiredModules.touch = true;
    }

    if(me.summary){
      requiredModules.summary = true;
    }

    if(me.exporter){
      requiredModules.exporter = true;
      requiredModules.excel = true;
    }

    if(me.paging){
      requiredModules.paging = true;
    }

    if(me.filter || me.searching){
      requiredModules.filter = true;
    }

    if(me.data && me.data.proxy){
      requiredModules.edit = true;
    }

    if(me.clicksToEdit){
      requiredModules.edit = true;
    }

    if(Fancy.isObject(me.data)){
      if(me.data.proxy){
        requiredModules['server-data'] = true;
        if(Fancy.nojQuery){
          requiredModules['ajax'] = true;
        }
      }

      if(me.data.chart){
        requiredModules['chart-integration'] = true;
      }
    }

    if(me.expander){
      requiredModules['expander'] = true;
    }

    if(me.isGroupedHeader){
      requiredModules['grouped-header'] = true;
    }

    if(me.grouping){
      requiredModules['grouping'] = true;
    }

    if(me.summary){
      requiredModules['summary'] = true;
    }

    if(me.exporter){
      requiredModules['exporter'] = true;
      requiredModules['excel'] = true;
    }

    if(me.trackOver || me.columnTrackOver || me.cellTrackOver || me.selection){
      requiredModules['selection'] = true;
    }

    if(me.contextmenu){
      requiredModules['menu'] = true;
    }

    var containsMenu = function (item) {
      if(item.menu){
        requiredModules['menu'] = true;
        return true;
      }
    };

    Fancy.each(me.events, function (e) {
      for(var p in e){
        if(p === 'contextmenu'){
          requiredModules.menu = true;
        }
      }
    });

    Fancy.each(me.controls, function (c) {
      if(c.event === 'contextmenu'){
        requiredModules.menu = true;
      }
    });
    
    Fancy.each(me.tbar, containsMenu);
    Fancy.each(me.bbar, containsMenu);
    Fancy.each(me.buttons, containsMenu);
    Fancy.each(me.subTBar, containsMenu);

    var _columns = columns.concat(leftColumns).concat(rightColumns);

    Fancy.each(_columns, function(column){
      if(column.draggable === true){
        requiredModules['column-drag'] = true;
      }

      if(column.sortable === true){
        requiredModules.sort = true;
      }

      if(column.editable === true){
        requiredModules.edit = true;
      }

      if(column.menu === true){
        requiredModules.menu = true;
      }

      if(column.filter){
        requiredModules.filter = true;
      }

      switch(column.type){
        case 'select':
          me.checkboxRowSelection = true;
          requiredModules['selection'] = true;
          break;
        case 'combo':
          if(column.data && column.data.proxy){
            requiredModules['ajax'] = true;
          }
          break;
        case 'progressbar':
        case 'progressdonut':
        case 'grossloss':
        case 'hbar':
          requiredModules.spark = true;
          break;
        case 'tree':
          requiredModules.tree = true;
          break;
        case 'date':
          requiredModules.date = true;
          requiredModules.selection = true;
          break;
      }
    });

    if(Fancy.isArray(me.tbar)){
      Fancy.each(me.tbar, function(item){
        switch(item.action){
          case 'add':
          case 'remove':
            requiredModules.edit = true;
            break;
        }
      });
    }

    if(me.gridToGrid){
      requiredModules.dd = true;
    }

    me.neededModules = {
      length: 0
    };

    for(var p in requiredModules){
      if(Fancy.modules[p] === undefined) {
        me.neededModules[p] = true;
        me.neededModules.length++;
      }
    }

    if(me.neededModules.length === 0){
      me.neededModules = true;
      me.init();
      return;
    }

    var onLoad = function(name){
      delete me.neededModules[name];
      me.neededModules.length--;

      if(me.neededModules.length === 0){
        me.neededModules = true;
        me.init();
      }
    };

    if(me.neededModules.dom){
      Fancy.loadModule('dom', function (name) {
        delete me.neededModules[name];
        me.neededModules.length--;

        if(me.neededModules.length === 0){
          me.neededModules = true;
          me.init();
        }
        else{
          for (var p in me.neededModules) {
            if (p === 'length') {
              continue;
            }

            Fancy.loadModule(p, onLoad);
          }
        }
      });
    }
    else {
      for (var p in me.neededModules) {
        if (p === 'length') {
          continue;
        }

        Fancy.loadModule(p, onLoad);
      }
    }
  },
  /*
   * @param {Number} indexOrder
   * @param {String} side
   */
  lockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, me.leftColumns.length, 'left');

    me.fire('lockcolumn');
  },
  /*
   * @param {Number} indexOrder
   * @param {String} side
   */
  rightLockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, 0, 'right');

    me.fire('rightlockcolumn');
  },
  /*
   * @param {Number} indexOrder
   * @param {String} side
   */
  unLockColumn: function(indexOrder, side){
    var me = this,
      removedColumn;

    switch(side){
      case 'left':
        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, 0, 'center', 'left');
        break;
      case 'right':
        removedColumn = me.removeColumn(indexOrder, side);
        me.insertColumn(removedColumn, me.columns.length, 'center', 'right');
        break;
    }

    if(side === 'left' && me.grouping && me.leftColumns.length === 0){
      me.grouping.insertGroupEls();
    }

    me.fire('unlockcolumn');
  },
  /*
   * @param {String} fromSide
   * @param {String} toSide
   * @param {Number} fromIndex
   * @param {Number} toIndex
   * @param {Object} [grouping]
   */
  moveColumn: function (fromSide, toSide, fromIndex, toIndex, grouping) {
    var me = this,
      removedColumn;

    if(grouping){
      var i = 0,
        iL = grouping.end - grouping.start + 1,
        groupIndex = grouping.cell.attr('index'),
        toHeader = me.getHeader(toSide),
        groupCellHTML = grouping.cell.dom.outerHTML;

      for(;i<iL;i++){
        me.moveColumn(fromSide, toSide, grouping.end - i, toIndex);
      }

      var toColumns = me.getColumns(toSide);
      var cells = toHeader.el.select('.' + Fancy.GRID_HEADER_CELL_CLS);

      i = toIndex;
      iL = i + (grouping.end - grouping.start + 1);

      for(;i<iL;i++){
        var column = toColumns[i],
          cell =  cells.item(i);

        column.grouping = groupIndex;
        cell.attr('group-index', groupIndex);
      }

      toHeader.el.append(groupCellHTML);

      toHeader.fixGroupHeaderSizing();

      return;
    }

    if(fromSide === 'center'){
      removedColumn = me.removeColumn(fromIndex, 'center');
      switch(toSide){
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'center');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'center');
          break;
      }
    }
    else if(fromSide === 'left'){
      removedColumn = me.removeColumn(fromIndex, 'left');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'left');
          break;
        case 'right':
          me.insertColumn(removedColumn, toIndex, 'right', 'left');
          break;
      }
    }
    else if(fromSide === 'right'){
      removedColumn = me.removeColumn(fromIndex, 'right');
      switch(toSide){
        case 'center':
          me.insertColumn(removedColumn, toIndex, 'center', 'right');
          break;
        case 'left':
          me.insertColumn(removedColumn, toIndex, 'left', 'right');
          break;
      }
    }

    if(me.groupheader){
      me.header.fixGroupHeaderSizing();

      if(me.leftColumns){
        me.leftHeader.fixGroupHeaderSizing();
      }

      if(me.rightColumns){
        me.rightHeader.fixGroupHeaderSizing();
      }
    }
  }
});

/*
 * @param {String} id
 */
FancyGrid.get = function(id){
  var el = Fancy.get(id);

  if(!el.dom){
    return;
  }

  var gridEl = el.select('.' + Fancy.GRID_CLS).item(0);

  if(!gridEl.dom){
    return;
  }

  var gridId = gridEl.dom.id;

  return Fancy.getWidget(gridId);
};

FancyGrid.defineTheme = Fancy.defineTheme;
FancyGrid.defineController = Fancy.defineController;
FancyGrid.addValid = Fancy.addValid;

if(!Fancy.nojQuery && Fancy.$){
  Fancy.$.fn.FancyGrid = function(o){
    o.renderTo = $(this.selector)[0].id;
    return new Fancy.Grid(o);
  };
}