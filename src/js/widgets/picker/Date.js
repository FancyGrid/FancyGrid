/*
 * @class Fancy.DatePicker
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const PICKER_DATE_CELL_ACTIVE_CLS = F.PICKER_DATE_CELL_ACTIVE_CLS;
  const PICKER_DATE_CLS = F.PICKER_DATE_CLS;
  const PICKER_DATE_CELL_TODAY_CLS = F.PICKER_DATE_CELL_TODAY_CLS;
  const PICKER_DATE_CELL_OUT_RANGE_CLS = F.PICKER_DATE_CELL_OUT_RANGE_CLS;
  const PICKER_DATE_CELL_OUT_MIN_MAX_CLS = 'fancy-date-picker-cell-out-min-max';
  const PICKER_BUTTON_BACK_CLS = F.PICKER_BUTTON_BACK_CLS;
  const PICKER_BUTTON_NEXT_CLS = F.PICKER_BUTTON_NEXT_CLS;
  const PICKER_BUTTON_DATE_CLS = F.PICKER_BUTTON_DATE_CLS;
  const PICKER_BUTTON_DATE_WRAPPER_CLS = F.PICKER_BUTTON_DATE_WRAPPER_CLS;
  const PICKER_BUTTON_TODAY_CLS = F.PICKER_BUTTON_TODAY_CLS;
  const PICKER_BUTTON_TODAY_WRAPPER_CLS = F.PICKER_BUTTON_TODAY_WRAPPER_CLS;

  F.define('Fancy.datepicker.Manager', {
    singleton: true,
    opened: [],
    /*
     * @param {Object} picker
     */
    add(picker){
      this.hide();
      this.opened.push(picker);
    },
    hide(){
      this.opened.forEach(opened => {
        opened.hide();
      });

      this.opened = [];
    }
  });

  F.define(['Fancy.picker.Date', 'Fancy.DatePicker'], {
    extend: F.Grid,
    type: 'datepicker',
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
    i18n: 'en',
    cellTrackOver: true,
    cellStylingCls: [PICKER_DATE_CELL_OUT_RANGE_CLS, PICKER_DATE_CELL_TODAY_CLS, PICKER_DATE_CELL_ACTIVE_CLS],
    activeCellCls: PICKER_DATE_CELL_ACTIVE_CLS,
    todayCellCls: PICKER_DATE_CELL_TODAY_CLS,
    pickerDateCls: PICKER_DATE_CLS,
    outRangeCellCls: PICKER_DATE_CELL_OUT_RANGE_CLS,
    buttonBackCls: PICKER_BUTTON_BACK_CLS,
    buttonDateCls: PICKER_BUTTON_DATE_CLS,
    buttonDateWrapperCls: PICKER_BUTTON_DATE_WRAPPER_CLS,
    buttonNextCls: PICKER_BUTTON_NEXT_CLS,
    buttonTodayCls: PICKER_BUTTON_TODAY_CLS,
    buttonTodayWrapperCls: PICKER_BUTTON_TODAY_WRAPPER_CLS,
    defaults: {
      type: 'string',
      width: 44,
      align: 'center',
      cellAlign: 'center'
    },
    gridBorders: [1, 0, 1, 1],
    panelBodyBorders: [0, 0, 0, 0],
    barScrollEnabled: false,
    cellHeight: 32,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(config){
      const me = this;

      F.apply(me, config);

      me.initFormat();
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

      me.onUpdate();

      me.addEvents('changedate');

      me.on('update', me.onUpdate, me);
      me.on('cellclick', me.onCellClick, me);

      me.addCls(PICKER_DATE_CLS);
      me.el.on('mousewheel', me.onMouseWheel, me);

      me.panel.el.on('mousedown', me.onMouseDown, me);
    },
    /*
     *
     */
    initFormat(){
      const me = this;

      if (!me.format) {
        me.format = F.i18n[me.i18n].date;
      }
    },
    /*
     *
     */
    initMonthPicker(){
      const me = this;

      if (me.monthPicker) {
        me.monthPicker.setDate(me.date);
        return;
      }

      if (!F.fullBuilt && F.MODULELOAD !== false && me.monthPicker && !F.modules['grid']){
        return;
      }

      const config = {
        theme: me.theme,
        date: me.date,
        renderTo: me.panel.el.dom,
        i18n: me.i18n,
        style: {
          position: 'absolute',
          top: `-${me.panel.el.height()}px`,
          left: '0px'
        },
        events: [{
          cancelclick: me.onMonthCancelClick,
          scope: me
        }, {
          okclick: me.onMonthOkClick,
          scope: me
        }]
      };

      const themeConfig = F.themes[me.theme].config;

      if (themeConfig.datePickerHeight) {
        config.height = themeConfig.datePickerHeight;
      }

      me.monthPicker = new F.MonthPicker(config);
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

      if (me.date === undefined || me.date.toString() === 'Invalid Date') {
        me.date = new Date();
      }

      me.showDate = me.date;

      if (me.maxValue && me.showDate > me.maxValue) {
        me.showDate = me.maxValue;
      }
      else if(me.minValue && me.showDate < me.minValue) {
        me.showDate = me.minValue;
      }
    },
    /*
     *
     */
    initColumns(){
      var me = this,
        format = me.format,
        days = format.days,
        startDay = format.startDay,
        i = startDay,
        iL = days.length,
        dayIndexes = F.Date.dayIndexes,
        columns = [],
        today = new Date();

      const render = function (o) {
        o.cls = '';

        switch (o.rowIndex) {
          case 0:
            if (Number(o.value) > 20) {
              o.cls += ' ' + PICKER_DATE_CELL_OUT_RANGE_CLS;
            }
            break;
          case 4:
          case 5:
            if (Number(o.value) < 15) {
              o.cls += ' ' + PICKER_DATE_CELL_OUT_RANGE_CLS;
            }
            break;
        }

        const date = me.date,
          showDate = me.showDate;

        if (today.getMonth() === showDate.getMonth() && today.getFullYear() === showDate.getFullYear()) {
          if (o.value === today.getDate()) {
            if (o.rowIndex === 0) {
              if (o.value < 20) {
                o.cls += ' ' + PICKER_DATE_CELL_TODAY_CLS;
              }
            } else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + PICKER_DATE_CELL_TODAY_CLS;
              }
            } else {
              o.cls += ' ' + PICKER_DATE_CELL_TODAY_CLS;
            }
          }
        }

        if (date.getMonth() === showDate.getMonth() && date.getFullYear() === showDate.getFullYear()) {
          if (o.value === date.getDate()) {
            if (o.rowIndex === 0) {
              if (o.value < 20) {
                o.cls += ' ' + PICKER_DATE_CELL_ACTIVE_CLS;
              }
            } else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + PICKER_DATE_CELL_ACTIVE_CLS;
              }
            } else {
              o.cls += ' ' + PICKER_DATE_CELL_ACTIVE_CLS;
            }
          }
        }

        const _value = o.value;
        let _month = showDate.getMonth();
        let _year = showDate.getFullYear();

        if (Number(_value) > 20 && o.rowIndex < 2) {
          _month--;
          if (_month === 0) {
            _year--;
            _month = 11;
          }
        } else if (Number(_value) < 10 && o.rowIndex > 3) {
          _month++;
          if (_month === 12) {
            _year++;
            _month = 0;
          }
        }

        let _day = new Date(_year, _month, _value),
          isOutMinMax = false;

        if (me.maxValue && me.maxValue < _day) {
          isOutMinMax = true;
        }

        if (me.minValue && me.minValue > _day) {
          isOutMinMax = true;
        }

        if (isOutMinMax) {
          o.cls += ' ' + PICKER_DATE_CELL_OUT_MIN_MAX_CLS;
        } else if (o.cell) {
          o.cell.removeCls(PICKER_DATE_CELL_OUT_MIN_MAX_CLS);
        }

        return o;
      };

      let charIndex = 0;

      switch(me.i18n){
        case 'zh-CN':
        case 'zh-TW':
          charIndex = 2;
          break;
      }

      for (; i < iL; i++){
        columns.push({
          index: dayIndexes[i],
          title: days[i][charIndex].toLocaleUpperCase(),
          render: render
        });
      }

      i = 0;
      iL = startDay;

      for(;i<iL;i++){
        columns.push({
          index: dayIndexes[i],
          title: days[i][0].toLocaleUpperCase(),
          render: render
        });
      }

      me.columns = columns;
    },
    /*
     * @return {Array}
     */
    getDataFields(){
      var me = this,
        fields = [],
        format = me.format,
        days = format.days,
        startDay = format.startDay,
        i = startDay,
        iL = days.length,
        dayIndexes = F.Date.dayIndexes;

      for (; i < iL; i++){
        fields.push(dayIndexes[i]);
      }

      i = 0;
      iL = startDay;

      for (; i < iL; i++){
        fields.push(dayIndexes[i]);
      }

      return fields;
    },
    /*
     *
     */
    generateData(){
      var me = this,
        format = me.format,
        startDay = format.startDay,
        date = me.showDate,
        daysInMonth = F.Date.getDaysInMonth(date),
        firstDayOfMonth = F.Date.getFirstDayOfMonth(date),
        data = [],
        fields = me.getDataFields(),
        i = 0,
        iL = daysInMonth,
        keyPlus = 0;

      for (; i < iL; i++){
        let key = i + firstDayOfMonth - startDay + keyPlus;
        if (key < 0){
          key = 7 - startDay;
          keyPlus = key + 1;
        }

        if (key === 0){
          key = 7;
          keyPlus = key;
        }

        data[key] = i + 1;
      }

      var month = date.getMonth(),
        year = date.getFullYear(),
        _date = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds();

      if (month === 0){
        month = 11;
        year--;
      }
      else {
        month--;
      }

      var prevDate = new Date(year, month, _date, hour, minute, second, millisecond),
        prevDateDaysInMonth = F.Date.getDaysInMonth(prevDate);

      i = 7;

      while (i--){
        if (data[i] === undefined){
          data[i] = prevDateDaysInMonth;
          prevDateDaysInMonth--;
        }
      }

      var i = 28,
        iL = 42,
        nextMonthDay = 1;

      for (; i < iL; i++){
        if (data[i] === undefined){
          data[i] = nextMonthDay;
          nextMonthDay++;
        }
      }

      var _data = [],
        i = 0,
        iL = 6;

      for (; i < iL; i++){
        _data[i] = data.splice(0, 7);
      }

      return {
        fields: fields,
        items: _data
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

      tbar.push({
        cls: PICKER_BUTTON_BACK_CLS,
        handler: me.onBackClick,
        scope: me,
        style: {}
      });

      tbar.push({
        cls: PICKER_BUTTON_DATE_CLS,
        i18n: me.i18n,
        wrapper: {
          cls: PICKER_BUTTON_DATE_WRAPPER_CLS
        },
        handler: me.onDateClick,
        scope: me,
        text: '                       '
      });

      tbar.push('side');

      tbar.push({
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
        bbar = [];

      bbar.push({
        text: me.format.today,
        i18n: me.i18n,
        cls: PICKER_BUTTON_TODAY_CLS,
        wrapper: {
          cls: PICKER_BUTTON_TODAY_WRAPPER_CLS
        },
        handler: me.onClickToday,
        scope: me
      });

      me.bbar = bbar;
    },
    /*
     *
     */
    onBackClick(){
      var me = this,
        date = me.showDate,
        month = date.getMonth(),
        year = date.getFullYear(),
        _date = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds();

      if (month === 0) {
        month = 11;
        year--;
      }
      else {
        month--;
      }

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
        month = date.getMonth(),
        year = date.getFullYear(),
        _date = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds();

      if (month === 11) {
        month = 0;
        year++;
      }
      else {
        month++;
      }

      me.showDate = new Date(year, month, _date, hour, minute, second, millisecond);

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onUpdate(){
      var me = this,
        value = F.Date.format(me.showDate, 'F Y', {
          date: me.format
        }),
        width = value.length * 9 + 35;

      switch (me.i18n) {
        case 'zh-CN':
        case 'zh-TW':
        case 'ja':
        case 'ko':
          width = value.length * 10 + 35;
          break;
      }

      me.tbar[1].setText(value, width);
    },
    /*
     *
     */
    onClickToday(){
      const me = this,
        date = new Date();

      me.showDate = date;
      me.date = date;

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellClick(grid, o){
      var me = this,
        date = me.showDate,
        year = date.getFullYear(),
        month = date.getMonth(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds(),
        day,
        cell = F.get(o.cell);

      if (cell.hasCls(PICKER_DATE_CELL_OUT_MIN_MAX_CLS)) {
        return;
      }

      me.date = new Date(year, month, Number(o.value), hour, minute, second, millisecond);

      me.el.select(`.${PICKER_DATE_CELL_ACTIVE_CLS}`).removeCls(PICKER_DATE_CELL_ACTIVE_CLS);

      cell.addCls(PICKER_DATE_CELL_ACTIVE_CLS);

      me.fire('changedate', me.date);

      if (cell.hasCls(PICKER_DATE_CELL_OUT_RANGE_CLS)) {
        day = Number(o.value);
        if (o.rowIndex < 3){
          if (month === 0){
            year--;
            month = 11;
          }
          else {
            month--;
          }
        }
        else {
          if (month === 11){
            year++;
            month = 11;
          }
          else {
            month++;
          }
        }

        me.date = new Date(year, month, day, hour, minute, second, millisecond);
        me.showDate = me.date;

        const data = me.generateData();

        me.store.setData(data.items);
        me.update();
      }
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
    /*
     *
     */
    onDateClick(){
      const me = this;

      me.initMonthPicker();

      me.monthPicker.panel.css('display', 'block');
      if (F.$.fn.animate) {
        me.monthPicker.panel.el.animate({
          top: '0px'
        });
      }
      else {
        me.monthPicker.panel.css({
          top: '0px'
        });
      }
    },
    /*
     *
     */
    onMonthCancelClick(){
      this.hideMonthPicker();
    },
    /*
     *
     */
    onMonthOkClick(){
      var me = this,
        monthPickerDate = me.monthPicker.date,
        newMonth = monthPickerDate.getMonth(),
        newYear = monthPickerDate.getFullYear(),
        date = me.date.getDate(),
        hour = me.date.getHours(),
        minute = me.date.getMinutes(),
        second = me.date.getSeconds(),
        millisecond = me.date.getMilliseconds();

      me.hideMonthPicker();

      if(date > 28){
        date = 1;
      }

      me.date = new Date(newYear, newMonth, date, hour, minute, second, millisecond);
      me.showDate = me.date;

      const data = me.generateData();
      me.store.setData(data.items);
      me.update();

      me.fire('changedate', me.date, false);
    },
    /*
     *
     */
    hideMonthPicker(){
      const el = this.monthPicker.panel.el;

      if (F.$.fn.animate) {
        el.animate({
          top: '-' + el.css('height')
        }, {
          complete: () => {
            el.css('display', 'none');
          }
        });
      }
      else {
        el.css('display', 'none');
      }
    },
    /*
     * @param {Object} e
     */
    onMouseDown(e){
      e.preventDefault();
    },
    /*
     * @param {Date} date
     */
    setDate(date, firstShow){
      const me = this;

      me.date = date;
      if(firstShow && me.showDate){}
      else {
        me.showDate = date;
      }
      me.store.setData(me.generateData().items);
      me.update();
    }
  });

})();
