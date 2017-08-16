/*
 * @class Fancy.DatePicker
 */
(function () {

  Fancy.define('Fancy.datepicker.Manager', {
    singleton: true,
    opened: [],
    add: function (picker) {
      this.hide();

      this.opened.push(picker);
    },
    hide: function () {
      var me = this,
        opened = me.opened,
        i = 0,
        iL = opened.length;

      for (; i < iL; i++) {
        opened[i].hide();
      }

      me.opened = [];
    }
  });

  Fancy.define(['Fancy.picker.Date', 'Fancy.DatePicker'], {
    extend: Fancy.Grid,
    type: 'datepicker',
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
    i18n: 'en',
    cellTrackOver: true,
    cellStylingCls: ['fancy-date-picker-cell-out-range', 'fancy-date-picker-cell-today', 'fancy-date-picker-cell-active'],
    activeCellCls: 'fancy-date-picker-cell-active',
    todayCellCls: 'fancy-date-picker-cell-today',
    outRangeCellCls: 'fancy-date-picker-cell-out-range',
    defaults: {
      type: 'string',
      width: 44,
      align: 'center',
      cellAlign: 'center'
    },
    gridBorders: [1, 0, 1, 1],
    panelBodyBorders: [0, 0, 0, 0],
    barScrollEnabled: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      var me = this,
        config = config || {};

      Fancy.apply(me, config);

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
    init: function () {
      var me = this;

      me.Super('init', arguments);

      me.onUpdate();

      me.addEvents('changedate');

      me.on('update', me.onUpdate, me);
      me.on('cellclick', me.onCellClick, me);

      me.addClass('fancy-date-picker');
      me.el.on('mousewheel', me.onMouseWheel, me);

      me.panel.el.on('mousedown', me.onMouseDown, me);
    },
    /*
     *
     */
    initFormat: function () {
      var me = this;

      if (me.format) {
      }
      else {
        me.format = Fancy.i18n[me.i18n].date;
      }
    },
    /*
     *
     */
    initMonthPicker: function () {
      var me = this;

      if (!Fancy.fullBuilt && Fancy.MODULELOAD !== false && Fancy.MODULELOAD !== false && ( me.monthPicker || !Fancy.modules['grid'] )) {
        return;
      }

      me.monthPicker = new Fancy.MonthPicker({
        date: me.date,
        renderTo: me.panel.el.dom,
        style: {
          position: 'absolute',
          top: '-' + me.panel.el.height() + 'px',
          left: '0px'
        },
        events: [{
          cancelclick: me.onMonthCancelClick,
          scope: me
        }, {
          okclick: me.onMonthOkClick,
          scope: me
        }]
      });
    },
    /*
     *
     */
    initData: function () {
      var me = this;

      me.data = me.setData();
    },
    /*
     *
     */
    initDate: function () {
      var me = this;

      if (me.date === undefined) {
        me.date = new Date();
      }

      me.showDate = me.date;
    },
    /*
     *
     */
    initColumns: function () {
      var me = this,
        format = me.format,
        days = format.days,
        startDay = format.startDay,
        i = startDay,
        iL = days.length,
        dayIndexes = Fancy.Date.dayIndexes,
        columns = [],
        today = new Date();

      var render = function (o) {
        o.cls = '';

        switch (o.rowIndex) {
          case 0:
            if (Number(o.value) > 20) {
              o.cls += ' fancy-date-picker-cell-out-range';
            }
            break;
          case 4:
          case 5:
            if (Number(o.value) < 15) {
              o.cls += ' fancy-date-picker-cell-out-range';
            }
            break;
        }

        var date = me.date,
          showDate = me.showDate;

        if (today.getMonth() === showDate.getMonth() && today.getFullYear() === showDate.getFullYear()) {
          if (o.value === today.getDate()) {
            if (o.rowIndex === 0) {
              if (o.value < 20) {
                o.cls += ' ' + me.todayCellCls;
              }
            }
            else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + me.todayCellCls;
              }
            }
            else {
              o.cls += ' ' + me.todayCellCls;
            }
          }
        }

        if (date.getMonth() === showDate.getMonth() && date.getFullYear() === showDate.getFullYear()) {
          if (o.value === date.getDate()) {
            if (o.rowIndex === 0) {
              if (o.value < 20) {
                o.cls += ' ' + me.activeCellCls;
              }
            }
            else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + me.activeCellCls;
              }
            }
            else {
              o.cls += ' ' + me.activeCellCls;
            }
          }
        }

        return o;
      };

      for (; i < iL; i++) {
        columns.push({
          index: dayIndexes[i],
          title: days[i][0].toLocaleUpperCase(),
          render: render
        });
      }

      i = 0;
      iL = startDay;

      for (; i < iL; i++) {
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
    getDataFields: function () {
      var me = this,
        fields = [],
        format = me.format,
        days = format.days,
        startDay = format.startDay,
        i = startDay,
        iL = days.length,
        dayIndexes = Fancy.Date.dayIndexes;

      for (; i < iL; i++) {
        fields.push(dayIndexes[i]);
      }

      i = 0;
      iL = startDay;

      for (; i < iL; i++) {
        fields.push(dayIndexes[i]);
      }

      return fields;
    },
    /*
     *
     */
    setData: function () {
      var me = this,
        format = me.format,
        startDay = format.startDay,
        date = me.showDate,
        daysInMonth = Fancy.Date.getDaysInMonth(date),
        firstDayOfMonth = Fancy.Date.getFirstDayOfMonth(date),
        data = [],
        fields = me.getDataFields(),
        i = 0,
        iL = daysInMonth,
        keyPlus = 0;

      for (; i < iL; i++) {
        var key = i + firstDayOfMonth - startDay + keyPlus;
        if (key < 0) {
          key = 7 - startDay;
          keyPlus = key + 1;
        }

        if (key === 0) {
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

      if (month === 0) {
        month = 11;
        year--;
      }
      else {
        month--;
      }

      var prevDate = new Date(year, month, _date, hour, minute, second, millisecond),
        prevDateDaysInMonth = Fancy.Date.getDaysInMonth(prevDate);

      i = 7;

      while (i--) {
        if (data[i] === undefined) {
          data[i] = prevDateDaysInMonth;
          prevDateDaysInMonth--;
        }
      }

      var i = 28,
        iL = 42,
        nextMonthDay = 1;

      for (; i < iL; i++) {
        if (data[i] === undefined) {
          data[i] = nextMonthDay;
          nextMonthDay++;
        }
      }

      var _data = [],
        i = 0,
        iL = 6;

      for (; i < iL; i++) {
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
    initBars: function () {
      var me = this;

      me.initTBar();
      me.initBBar();
    },
    /*
     *
     */
    initTBar: function () {
      var me = this,
        tbar = [];

      tbar.push({
        cls: 'fancy-picker-button-back',
        handler: me.onBackClick,
        scope: me,
        style: {}
      });

      tbar.push({
        cls: 'fancy-picker-button-date',
        wrapper: {
          cls: 'fancy-picker-button-date-wrapper'
        },
        handler: me.onDateClick,
        scope: me,
        text: '                       '
        //text: '     '
      });

      tbar.push('side');

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
    initBBar: function () {
      var me = this,
        bbar = [];

      bbar.push({
        text: me.format.today,
        cls: 'fancy-picker-button-today',
        wrapper: {
          cls: 'fancy-picker-button-today-wrapper'
        },
        handler: me.onClickToday,
        scope: me
      });

      me.bbar = bbar;
    },
    /*
     *
     */
    onBackClick: function () {
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

      var data = me.setData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onNextClick: function () {
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

      var data = me.setData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onUpdate: function () {
      var me = this,
        value = Fancy.Date.format(me.showDate, 'F Y', {
          date: me.format
        });

      me.tbar[1].setText(value);
    },
    /*
     *
     */
    onClickToday: function () {
      var me = this,
        date = new Date();

      me.showDate = date;
      me.date = date;

      var data = me.setData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellClick: function (grid, o) {
      var me = this,
        date = me.showDate,
        year = date.getFullYear(),
        month = date.getMonth(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        millisecond = date.getMilliseconds(),
        day,
        activeCellCls = me.activeCellCls,
        cell = Fancy.get(o.cell);

      me.date = new Date(year, month, Number(o.value), hour, minute, second, millisecond);

      me.el.select('.' + activeCellCls).removeClass(activeCellCls);

      cell.addClass(activeCellCls);

      me.fire('changedate', me.date);

      if (cell.hasClass(me.outRangeCellCls)) {
        day = Number(o.value);
        if (o.rowIndex < 3) {
          if (month === 0) {
            year--;
            month = 11;
          }
          else {
            month--;
          }
        }
        else {
          if (month === 11) {
            year++;
            month = 11;
          }
          else {
            month++;
          }
        }

        me.date = new Date(year, month, day, hour, minute, second, millisecond);
        me.showDate = me.date;

        var data = me.setData();

        me.store.setData(data.items);
        me.update();
      }
    },
    /*
     * @param {Object} e
     */
    onMouseWheel: function (e) {
      var me = this,
        delta = Fancy.getWheelDelta(e.originalEvent || e);

      if (delta < 0) {
        me.onBackClick();
      }
      else {
        me.onNextClick();
      }
    },
    /*
     *
     */
    onDateClick: function () {
      var me = this;

      me.initMonthPicker();

      me.monthPicker.panel.css('display', 'block');
      if (Fancy.$.fn.animate) {
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
    onMonthCancelClick: function () {
      var me = this;

      me.hideMonthPicker();
    },
    /*
     *
     */
    onMonthOkClick: function () {
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

      me.date = new Date(newYear, newMonth, date, hour, minute, second, millisecond);
      me.showDate = me.date;

      var data = me.setData();
      me.store.setData(data.items);
      me.update();

      me.fire('changedate', me.date, false);
    },
    /*
     *
     */
    hideMonthPicker: function () {
      var me = this,
        el = me.monthPicker.panel.el;

      if (Fancy.$.fn.animate) {
        el.animate({
          top: '-' + el.css('height')
        }, {
          complete: function () {
            el.css('display', 'none');
          }
        });
      }
      else {
        el.css('display', 'none');
      }
    },
    /*
     *
     */
    onMouseDown: function (e) {
      e.preventDefault();
    },
    /*
     * @param {Date} date
     */
    setDate: function (date) {
      var me = this;

      me.date = date;
      me.showDate = date;
      me.store.setData(me.setData().items);
      me.update();
    }
  });

})();