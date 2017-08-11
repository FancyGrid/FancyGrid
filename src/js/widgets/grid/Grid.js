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
  widgetCls: 'fancy-grid',
  cellCls: 'fancy-grid-cell',
  pseudoCellCls: 'fancy-grid-pseudo-cell',
  cellInnerCls: 'fancy-grid-cell-inner',
  cellEvenCls: 'fancy-grid-cell-even',
  clsASC: 'fancy-grid-column-sort-ASC',
  clsDESC: 'fancy-grid-column-sort-DESC',
  clsSparkColumn: 'fancy-grid-column-sparkline',
  clsSparkColumnBullet: 'fancy-grid-column-sparkline-bullet',
  clsSparkColumnCircle: 'fancy-grid-column-chart-circle',
  clsSparkColumnDonutProgress: 'fancy-grid-column-spark-progress-donut',
  clsColumnGrossLoss: 'fancy-grid-column-grossloss',
  clsColumnProgress: 'fancy-grid-column-progress',
  clsGroupRow: 'fancy-grid-group-row',
  clsCollapsedRow: 'fancy-grid-group-row-collapsed',
  rowOverCls: 'fancy-grid-cell-over',
  expandRowOverCls: 'fancy-grid-expand-row-over',
  cellOverCls: 'fancy-grid-cell-over',
  cellSelectedCls: 'fancy-grid-cell-selected',
  expandRowSelectedCls: 'fancy-grid-expand-row-selected',
  columnCls: 'fancy-grid-column',
  columnOverCls: 'fancy-grid-column-over',
  columnSelectedCls: 'fancy-grid-column-selected',
  filterHeaderCellCls: 'fancy-grid-header-filter-cell',
  cellHeaderDoubleCls: 'fancy-grid-header-cell-double',
  cellHeaderTripleCls: 'fancy-grid-header-cell-triple',
  rowEditCls: 'fancy-grid-row-edit',
  rowEditButtonCls: 'fancy-grid-row-edit-buttons',
  clsSparkColumnHBar: 'fancy-grid-column-h-bar',
  header: true,
  shadow: true,
  striped: true,
  columnLines: true,
  textSelection: false,
  width: 200,
  height: 200,
  minWidth: 200,
  minHeight: 200,
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
        // TODO: Find out is lang required ot not.
        var lang = config.lang;

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
      'scroll',
      'remove',
      'set',
      'update',
      'sort',
      'beforeload', 'load',
      'select',
      'clearselect',
      'activate', 'deactivate',
      'beforeedit',
      'startedit',
      'changepage',
      'dropitems',
      'collapse', 'expand',
      'filter'
    );

    if(Fancy.fullBuilt !== true && Fancy.MODULELOAD !== false && Fancy.MODULESLOAD !== false && me.fullBuilt !== true && me.neededModules !== true){
      if(me.wtype !== 'datepicker' && me.wtype !== 'monthpicker') {
        me.loadModules();
        return;
      }
    }

    me.initStore();

    //me.Super('init', arguments);
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

    //if(me.searching){
      //requiredModules.search = true;
    //}

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

    if(me.trackOver || me.columnTrackOver || me.cellTrackOver || me.selection){
      requiredModules['selection'] = true;
    }

    var _columns = columns.concat(leftColumns).concat(rightColumns),
      i = 0,
      iL = _columns.length;

    for(;i<iL;i++){
      var column = _columns[i];

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
    }

    if(Fancy.isArray(me.tbar)){
      var i = 0,
        iL = me.tbar.length;

      for(;i<iL;i++){
        switch(me.tbar[i].action){
          case 'add':
          case 'remove':
            requiredModules.edit = true;
            break;
        }
      }
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
  lockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, me.leftColumns.length, 'left');
  },
  rightLockColumn: function(indexOrder, side){
    var me = this;

    if(me.columns.length === 1){
      return false;
    }

    var removedColumn = me.removeColumn(indexOrder, side);

    me.insertColumn(removedColumn, 0, 'right');
  },
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
  }
});

FancyGrid.get = function(id){
  var gridId = Fancy.get(id).select('.fancy-grid').dom.id;

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