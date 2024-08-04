/*
 * @class Fancy.MonthPicker
 * @extends Fancy.Grid
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const PICKER_MONTH_CELL_ACTIVE_CLS = F.PICKER_MONTH_CELL_ACTIVE_CLS;
  const PICKER_MONTH_CLS = F.PICKER_MONTH_CLS;
  const PICKER_BUTTON_BACK_CLS = F.PICKER_BUTTON_BACK_CLS;
  const PICKER_BUTTON_NEXT_CLS = F.PICKER_BUTTON_NEXT_CLS;
  const PICKER_MONTH_ACTION_BUTTONS_CLS = F.PICKER_MONTH_ACTION_BUTTONS_CLS;

  F.define(['Fancy.picker.Month', 'Fancy.MonthPicker'], {
    extend: F.Grid,
    type: 'monthpicker',
    mixins: [
      'Fancy.grid.mixin.Grid',
      F.panel.mixin.PrepareConfig,
      F.panel.mixin.methods,
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
    cellStylingCls: [PICKER_MONTH_CELL_ACTIVE_CLS],
    activeCellCls: PICKER_MONTH_CELL_ACTIVE_CLS,
    buttonBackCls: PICKER_BUTTON_BACK_CLS,
    buttonNextCls: PICKER_BUTTON_NEXT_CLS,
    actionButtonsCls: PICKER_MONTH_ACTION_BUTTONS_CLS,
    defaults: {
      type: 'string',
      width: 76,
      align: 'center',
      cellAlign: 'center'
    },
    gridBorders: [1, 0, 1, 1],
    panelBodyBorders: [0, 0, 0, 0],
    header: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(config){
      const me = this;

      F.apply(me, config);
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
    init(){
      const me = this;

      me.Super('init', arguments);
      me.addEvents('cancelclick', 'okclick');

      me.addEvents('changedate');
      me.on('cellclick', me.onCellClick, me);

      me.panel.addCls(PICKER_MONTH_CLS);
    },
    /*
     *
     */
    initData(){
      this.data = this.generateData();
    },
    /*
     *
     */
    initDate(){
      const me = this;

      if (me.date === undefined) {
        me.date = new Date();
      }

      me.showDate = me.date;
    },
    /*
     *
     */
    initLang(){
      const me = this;

      if (me.lang) {
        return;
      }

      me.lang = F.Object.copy(F.i18n[me.i18n || 'en']);
    },
    /*
     *
     */
    initColumns(){
      const me = this;

      const renderMonth = (o) => {
        const date = me.date,
          month = date.getMonth();

        if (me.lang.date.months[month].substr(0, 3) === o.value) {
          o.cls = PICKER_MONTH_CELL_ACTIVE_CLS;
        }

        return o;
      };

      const renderYear = (o) => {
        const date = me.date,
          year = date.getFullYear();

        if (year === Number(o.value)) {
          o.cls = PICKER_MONTH_CELL_ACTIVE_CLS;
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
      }, {
        index: 'year2',
        render: renderYear,
        width: 77
      }];
    },
    /*
     * @return {Object}
     */
    generateData(){
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

      for (; i < iL; i++){
        years.push(year - 5 + i);
      }

      i = 0;
      iL = 6;

      for (; i < iL; i++){
        data[i] = {};

        data[i]['month1'] = months[i].substr(0, 3);
        data[i]['month2'] = months[6 + i].substr(0, 3);

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
    initBars(){
      this.initTBar();
      this.initBBar();
    },
    /*
     *
     */
    initTBar(){
      const me = this,
        tbar = [];

      tbar.push('side');
      tbar.push({
        cls: PICKER_BUTTON_BACK_CLS,
        handler: me.onBackClick,
        scope: me
      });

      tbar.push({
        width: 30,
        cls: PICKER_BUTTON_NEXT_CLS,
        handler: me.onNextClick,
        scope: me
      });

      me.tbar = tbar;
    },
    /*
     *
     */
    initBBar(){
      const me = this,
        bbar = [],
        lang = me.lang;

      bbar.push({
        type: 'wrapper',
        cls: PICKER_MONTH_ACTION_BUTTONS_CLS,
        items: [{
          text: lang.date.ok,
          i18n: me.i18n,
          handler: me.onClickOk,
          scope: me
        }, {
          text: lang.date.cancel,
          i18n: me.i18n,
          handler: me.onClickCancel,
          scope: me
        }]
      });

      me.bbar = bbar;
    },
    /*
     *
     */
    onBackClick(){
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

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onNextClick(){
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

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onClickOk(){
      this.fire('okclick');
    },
    /*
     *
     */
    onClickCancel(){
      this.fire('cancelclick');
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellClick(grid, o){
      var me = this,
        date = me.date,
        year = date.getFullYear(),
        month = date.getMonth(),
        _date = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds(),
        cell = F.get(o.cell),
        body;

      if (o.side === 'center') {
        body = me.body;
        year = Number(o.value);
      }
      else {
        body = me.leftBody;
        month = o.rowIndex + o.columnIndex * 6;
      }

      body.el.select(`.${PICKER_MONTH_CELL_ACTIVE_CLS}`).removeCls(PICKER_MONTH_CELL_ACTIVE_CLS);
      cell.addCls(PICKER_MONTH_CELL_ACTIVE_CLS);

      if (_date > 28) {
        _date = 1;
      }

      me.showDate = new Date(year, month, _date, hour, minute, second, millisecond);
      me.date = me.showDate;

      me.fire('changedate', me.date);
    },
    /*
     * @param {Object} e
     */
    onMouseWheel(e){
      const delta = F.getWheelDelta(e.originalEvent || e);

      if (delta < 0) {
        this.onBackClick();
      }
      else {
        this.onNextClick();
      }
    },
    setDate(date){
      const me = this;

      me.date = date;
      me.showDate = date;

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();
    }
  });

})();
