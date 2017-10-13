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
  // Cell cls-s
  cellCls: Fancy.GRID_CELL_CLS,
  cellInnerCls: 'fancy-grid-cell-inner',
  cellEvenCls: 'fancy-grid-cell-even',
  cellOverCls: Fancy.GRID_CELL_OVER_CLS,
  cellSelectedCls: Fancy.GRID_CELL_SELECTED_CLS,
  // Cell Header cls-s
  cellHeaderCls: 'fancy-grid-header-cell',
  cellHeaderSelectCls: 'fancy-grid-header-cell-select',
  cellHeaderDoubleCls: 'fancy-grid-header-cell-double',
  cellHeaderTripleCls: 'fancy-grid-header-cell-triple',
  cellHeaderTriggerCls: 'fancy-grid-header-cell-trigger',
  cellHeaderTriggerImageCls: 'fancy-grid-header-cell-trigger-image',
  cellHeaderGroupLevel1: 'fancy-grid-header-cell-group-level-1',
  cellHeaderGroupLevel2: 'fancy-grid-header-cell-group-level-2',
  filterHeaderCellCls: 'fancy-grid-header-filter-cell',//TODO: rename to cellHeaderFilterCls
  //Column header cls-s sorting
  clsASC: 'fancy-grid-column-sort-ASC',
  clsDESC: 'fancy-grid-column-sort-DESC',
  //Column cls-s
  columnCls: Fancy.GRID_COLUMN_CLS,
  columnOverCls: Fancy.GRID_COLUMN_OVER_CLS,
  columnSelectedCls: Fancy.GRID_COLUMN_SELECTED_CLS,
  columnColorCls: 'fancy-grid-column-color',
  columnTextCls: 'fancy-grid-column-text',
  columnWithEllipsisCls: 'fancy-grid-column-ellipsis',
  columnOrderCls: 'fancy-grid-column-order',
  columnSelectCls: Fancy.GRID_COLUMN_SELECT_CLS,
  columnResizerCls: 'fancy-grid-column-resizer',
  //Column spark cls-s
  columnSparkCls: 'fancy-grid-column-sparkline',
  columnSparkBulletCls: 'fancy-grid-column-sparkline-bullet',
  columnSparkCircleCls: 'fancy-grid-column-chart-circle',
  columnSparkDonutProgressCls: 'fancy-grid-column-spark-progress-donut',
  columnGrossLossCls: 'fancy-grid-column-grossloss',
  columnProgressCls: 'fancy-grid-column-progress',
  columnSparkHBarCls: 'fancy-grid-column-h-bar',
  //Row cls-s
  clsGroupRow: 'fancy-grid-group-row',//TODO: rename to rowGroupCls
  clsCollapsedRow: 'fancy-grid-group-row-collapsed',//TODO: rename to rowCollapsedCls
  clsSummaryContainer: 'fancy-grid-summary-container',//TODO: rename to ???
  clsSummaryRow: 'fancy-grid-summary-row',//TODO: rename to rowSummaryCls
  rowSummaryBottomCls: 'fancy-grid-summary-row-bottom',
  rowEditCls: 'fancy-grid-row-edit',
  rowEditButtonCls: 'fancy-grid-row-edit-buttons',

  pseudoCellCls: 'fancy-grid-pseudo-cell',
  rowOverCls: Fancy.GRID_ROW_OVER_CLS,

  expandRowCls: 'fancy-grid-expand-row',//TODO: rename to rowExpandCls
  expandRowOverCls: 'fancy-grid-expand-row-over',//TODO: rename to rowExpandOverCls
  expandRowSelectedCls: 'fancy-grid-expand-row-selected', //TODO: rename to rowExpandSelectedCls

  leftEmptyCls: 'fancy-grid-left-empty',
  rightEmptyCls: 'fancy-grid-right-empty',

  centerCls: 'fancy-grid-center',
  leftCls: 'fancy-grid-left',
  rightCls: 'fancy-grid-right',

  headerCls: Fancy.GRID_HEADER_CLS,

  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
  minColumnWidth: 30,
  emptyValue: '&nbsp;',
  frame: true,
  keyNavigation: false,
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
      Fancy.loadModule('grid', function(){
        preInit();
      });
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
      'filter'
    );

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

    var _columns = columns.concat(leftColumns).concat(rightColumns);

    Fancy.each(_columns, function(column){
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

    for(var p in me.neededModules){
      if(p === 'length'){
        continue;
      }

      Fancy.loadModule(p, onLoad);
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
  }
});

/*
 * @param {String} id
 */
FancyGrid.get = function(id){
  var gridId = Fancy.get(id).select('.' + Fancy.GRID_CLS).dom.id;

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