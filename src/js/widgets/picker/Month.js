/*
 * @class Fancy.MonthPicker
 * @extends Fancy.Grid
 */
Fancy.define(['Fancy.picker.Month', 'Fancy.MonthPicker'], {
  extend: Fancy.Grid,
  type: 'monthpicker',
  mixins: [
    'Fancy.grid.mixin.Grid',
    Fancy.panel.mixin.PrepareConfig,
    Fancy.panel.mixin.methods,
    'Fancy.grid.mixin.PrepareConfig',
    'Fancy.grid.mixin.ActionColumn',
    'Fancy.grid.mixin.Edit'
  ],
  width: 308,
  height: 299,
  frame: false,
  //panelBorderWidth: 0,
  cellHeight: 37,
  i18n: 'en',
  cellTrackOver: true,
  cellStylingCls: ['fancy-month-picker-cell-active'],
  activeCellCls: 'fancy-month-picker-cell-active',
  defaults: {
    type: 'string',
    width: 76,
    align: 'center',
    cellAlign: 'center'
  },
  gridBorders: [1,0,1,1],
  panelBodyBorders: [0,0,0,0],
  header: false,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);
    me.initLang();
    me.initColumns();
    me.initDate();
    me.initData();
    me.initBars();

    me.Super('constructor', [me]);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);
    me.addEvents('cancelclick', 'okclick');

    me.addEvents('changedate');
    me.on('cellclick', me.onCellClick, me);

    me.panel.addClass('fancy-month-picker');
  },
  /*
   *
   */
  initData: function(){
    var me = this;

    me.data = me.setData();
  },
  /*
   *
   */
  initDate: function(){
    var me = this;

    if(me.date === undefined){
      me.date = new Date();
    }

    me.showDate = me.date;
  },
  /*
   *
   */
  initLang: function(){
    var me = this;

    if(me.lang){
      return;
    }

    me.lang = Fancy.Object.copy(Fancy.i18n[me.i18n]);
  },
  /*
   *
   */
  initColumns: function(){
    var me = this,
      activeCellCls = me.activeCellCls;

    var renderMonth = function(o){
      var date = me.date,
        month = date.getMonth();

      if(me.lang.date.months[month].substr(0,3) === o.value){
        o.cls = activeCellCls;
      }

      return o;
    };

    var renderYear = function(o){
      var date = me.date,
        year = date.getFullYear();

      if(year === Number(o.value)){
        o.cls = activeCellCls;
      }

      return o;
    };

    me.columns = [{
      index: 'month1',
      render: renderMonth,
      locked: true
    }, {
      index: 'month2',
      render: renderMonth,
      locked: true,
      width: 77
    }, {
      index: 'year1',
      render: renderYear,
      width: 77
    },{
      index: 'year2',
      render: renderYear,
      width: 77
    }];
  },
  /*
   * @return {Object}
   */
  setData: function(){
    var me = this,
      lang = me.lang,
      date = me.showDate,
      year = date.getFullYear(),
      months = lang.date.months,
      data = [],
      i,
      iL,
      years = [];

    i = 0;
    iL = 12;

    for(;i<iL;i++){
      years.push(year - 5 + i);
    }

    i = 0;
    iL = 6;

    for(;i<iL;i++){
      data[i] = {};

      data[i]['month1'] = months[i].substr(0,3);
      data[i]['month2'] = months[6 + i].substr(0,3);

      data[i]['year1'] = years[i];
      data[i]['year2'] = years[6 + i];
    }

    return {
      fields: ['month1', 'month2', 'year1', 'year2'],
      items: data
    };
  },
  /*
   *
   */
  initBars: function(){
    var me = this;

    me.initTBar();
    me.initBBar();
  },
  /*
   *
   */
  initTBar: function(){
    var me = this,
      tbar = [];

    tbar.push('side');
    tbar.push({
      cls: 'fancy-picker-button-back',
      handler: me.onBackClick,
      scope: me
    });

    tbar.push({
      cls: 'fancy-picker-button-next',
      handler: me.onNextClick,
      scope: me
    });

    me.tbar = tbar;
  },
  /*
   *
   */
  initBBar: function(){
    var me = this,
      bbar = [],
      lang = me.lang;

    bbar.push({
      type: 'wrapper',
      cls: 'fancy-month-picker-action-buttons',
      items: [{
        text: lang.date.ok,
        handler: me.onClickOk,
        scope: me
       },{
        text: lang.date.cancel,
        handler: me.onClickCancel,
        scope: me
      }]
    });

    me.bbar = bbar;
  },
  /*
   *
   */
  onBackClick: function(){
    var me = this,
      date = me.showDate,
      year = date.getFullYear(),
      month = date.getMonth(),
      _date = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

    year -= 10;

    me.showDate = new Date(year, month, _date, hour, minute, second, millisecond);

    var data = me.setData();
    me.store.setData(data.items);
    me.update();
  },
  /*
   *
   */
  onNextClick: function(){
    var me = this,
      date = me.showDate,
      year = date.getFullYear(),
      month = date.getMonth(),
      _date = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds();

    year += 10;

    me.showDate = new Date(year, month, _date, hour, minute, second, millisecond);

    var data = me.setData();
    me.store.setData(data.items);
    me.update();
  },
  /*
   *
   */
  onClickOk: function(){
    var me = this;

    me.fire('okclick');
  },
  /*
   *
   */
  onClickCancel: function(){
    var me = this;

    me.fire('cancelclick');
  },
  /*
   * @param {Fancy.Grid} grid
   * @param {Object} o
   */
  onCellClick: function(grid, o){
    var me = this,
      date = me.date,
      year = date.getFullYear(),
      month = date.getMonth(),
      _date = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      second = date.getSeconds(),
      millisecond = date.getMilliseconds(),
      activeCellCls = me.activeCellCls,
      cell = Fancy.get(o.cell),
      body;

    if(o.side === 'center'){
      body = me.body;
      year = Number(o.value);
    }
    else{
      body = me.leftBody;
      month = o.rowIndex + o.columnIndex * 6;
    }

    body.el.select('.' + activeCellCls).removeClass(activeCellCls);
    cell.addClass(activeCellCls);

    me.showDate = new Date(year, month, _date, hour, minute, second, millisecond);
    me.date = me.showDate;

    me.fire('changedate', me.date);
  },
  /*
   * @param {Object} e
   */
  onMouseWheel: function(e){
    var me = this,
      delta = Fancy.getWheelDelta(e.originalEvent || e);

    if(delta < 0){
      me.onBackClick();
    }
    else{
      me.onNextClick();
    }
  },
  /*
   *
   */
  onDateClick: function(){
    var me = this;

    me.initMonthPicker();
  }
});