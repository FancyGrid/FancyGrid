/**
 * @class Fancy.Date
 * @singleton
 */
Fancy.Date = {
  daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  dayIndexes: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  /**
   * @param {String} date
   * @param {String} format
   * @param {String} lang
   * @return {String}
   */
  format: function(date, format, lang, mode) {
    var value = '',
      h,
      _i,
      D,
      l,
      N,
      w,
      F,
      M,
      t,
      g,
      H,
      u,
      U,
      d,
      m,
      mode = mode || '';

    mode = mode.toLocaleLowerCase();

    if(lang === undefined){
      lang = Fancy.i18n.en;
    }
    else if(Fancy.isString(lang)){
      lang = Fancy.i18n[lang];
    }

    var i = 0,
      iL = format.length;

    for(;i<iL; i++){
      var c = format[i];

      switch (c) {
        case 'i':
          _i = date.getMinutes();

          if (_i < 10) {
            value += '0' + _i;
          } else {
            value += _i;
          }

          break;
        case 's':
          _i = date.getSeconds();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'ss'){
              if (_i < 10) {
                value += '0' + _i;
              } else {
                value += _i;
              }

              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if (_i < 10) {
              value += '0' + _i;
            } else {
              value += _i;
            }
          }
          break;
        case 'S':
          _i = date.getSeconds();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'SS'){
              if (_i < 10) {
                value += '0' + _i;
              } else {
                value += _i;
              }

              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
          }
          break;
        case 'a':
          h = date.getHours();

          if (h < 13) {
            value += lang.date.am;
          } else {
            value += lang.date.pm;
          }

          break;
        case 'A':
          h = date.getHours();

          if (h < 13) {
            value += lang.date.AM;
          } else {
            value += lang.date.PM;
          }

          break;
        case 'T':
          value += 'T';
          break;
        case 'n':
          value += date.getMonth();
          break;
        case 'j':
          value += date.getDate();
          break;
        case 'm':
          m = date.getMonth() + 1;

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'mm'){
              if (m < 10) {
                m = '0' + m;
              }
              value += m;
              i++;
            }
            else if(format.substr(i, 2) === 'mi'){
              _i = date.getMinutes();

              if (_i < 10) {
                value += '0' + _i;
              } else {
                value += _i;
              }
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if (m < 10) {
              m = '0' + m;
            }
            value += m;
          }
          break;
        case 'd':
          d = date.getDate();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'dd'){
              if (d < 10) {
                d = '0' + d;
              }

              value += d;
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if (d < 10) {
              d = '0' + d;
            }

            value += d;
          }
          break;
        case 'Y':
          if(mode === 'sql'){
            if(format.substr(i, 4) === 'YYYY'){
              value += date.getFullYear();
              i += 3;
            }
            else if(format.substr(0, 2) === 'YY'){
              String(date.getFullYear()).substr(2, value.length);
              i += 1;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value += date.getFullYear();
          }
          break;
        case 'y':
          if(mode === 'sql'){
            if(format.substr(i, 4) === 'yyyy'){
              value += date.getFullYear();
              i += 3;
            }
            else if(format.substr(0, 2) === 'yy'){
              String(date.getFullYear()).substr(2, value.length);
              i += 1;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value += String(date.getFullYear()).substr(2, value.length);
          }
          break;
        case 'D':
          D = date.getDay();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'DD'){
              value += lang.date.days[D].substr(0, 3);
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value += lang.date.days[D].substr(0, 3);
          }
          break;
        case 'l':
          l = date.getDay();

          value += lang.date.days[l];
          break;
        case 'N':
          N = date.getDay();

          if (N === 0) {
            N = 7;
          }

          value += N;
          break;
        case 'w':
          w = date.getDay();

          value += w;
          break;
        case 'F':
          F = date.getMonth();
          value += lang.date.months[F];
          break;
        case 'M':
          M = date.getMonth();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'MM'){
              value += lang.date.months[M].substr(0, 3);
              i += 1;
            }
            else if(format.substr(i, 2) === 'MI'){
              _i = date.getMinutes();

              if (_i < 10) {
                value += '0' + _i;
              } else {
                value += _i;
              }

              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value += lang.date.months[M].substr(0, 3);
          }
          break;
        case 't':
          if(mode === 'sql'){
            value += ' ';
          }
          else{
            t = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
            value += t;
          }
          break;
        case 'T':
          if(mode === 'sql'){
            value += ' ';
          }
          else{
            throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
          }
          break;
        case 'g':
          g = date.getHours() % 12;

          value += g;
          break;
        case 'G':
          g = date.getHours();

          value += g;
          break;
        case 'h':
          h = date.getHours();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'hh'){
              if (h > 12) {
                value += h - 12;
              } else if (h > 9 && h < 13) {
                value += h;
              } else {
                value += '0' + h;
              }

              i += 1;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if (h > 12) {
              value += h - 12;
            } else if (h > 9 && h < 13) {
              value += h;
            } else {
              value += '0' + h;
            }
          }
          break;
        case 'H':
          H = date.getHours();

          if(mode === 'sql'){
            if(format.substr(i, 2) === 'HH'){
              if(H < 10){
                value += '0' + H;
              } else {
                value += H;
              }

              i += 1;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if(H < 10){
              value += '0' + H;
            } else {
              value += H;
            }
          }
          break;
        case 'u':
          u = date.getMilliseconds();

          value += u;
          break;
        case 'U':
          U = Number(date) / 1000;

          value += U;
          break;
        default:
          value += c;
      }
    }

    return value;
  },
  /**
   * @param {String} value
   * @param {String} format
   * @return {Date}
   */
  parse: function(value, format, mode){
    var date,
      now = new Date(),
      year = now.getFullYear(),
      month = now.getMonth(),
      day = now.getDate(),
      hour = 0,
      minute = 0,
      second = 0,
      millisecond = 0,
      mode = mode || '';

    mode = mode.toLocaleLowerCase();

    var i = 0,
      iL = format.length;

    for(;i<iL;i++){
      var c = format[i],
        j,
        jL,
        l;

      switch (c) {
        case 'n':
          var n;

          if (value[1] === '0' || value[1] === '1' || value[1] === '2') {
            n = value[0] + value[1];
            value = value.substr(2, value.length);
          }
          else {
            n = value[0];
            value = value.substr(1, value.length);
          }

          month = Number(n);
          break;
        case 'j':
          if (Fancy.isNumber(parseInt(value[1]))) {
            j = value[0] + value[1];
            value = value.substr(2, value.length);
          }
          else {
            j = value[0];
            value = value.substr(1, value.length);
          }

          day = Number(j);
          break;
        case 'h':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'hh'){
              var h;
              if(!isNaN(Number(value[1]))){
                h = value[0] + value[1];
                value = value.substr(2, value.length);
                i += 1;
              }
              else {
                h = value[0];
                value = value.substr(1, value.length);
              }

              hour = Number(h);
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            var h;
            if (value[1] === '0' || value[1] === '1' || value[1] === '2') {
              h = value[0] + value[1];
              value = value.substr(2, value.length);
            }
            else {
              h = value[0];
              value = value.substr(1, value.length);
            }

            hour = Number(h);
          }
          break;
        case 'a':
          if (value[1] === 'm') {
            hour += 12;
          }

          value = value.substr(2, value.length);
          break;
        case 'A':
          if (value[1] === 'M') {
            hour += 12;
          }

          value = value.substr(2, value.length);
          break;
        case 'i':
          minute = value[0] + value[1];
          value = value.substr(2, value.length);
          break;
        case 's':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'ss'){
              second = value[0] + value[1];
              value = value.substr(2, value.length);
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else{
            second = value[0] + value[1];
            value = value.substr(2, value.length);
          }
          break;
        case 'S':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'SS'){
              second = value[0] + value[1];
              value = value.substr(2, value.length);
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else{
            second = value[0] + value[1];
            value = value.substr(2, value.length);
          }
          break;
        case 'u':
          millisecond = value[0] + value[1] + value[2];

          value = value.substr(3, value.length);
          break;
        case 'm':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'mm'){
              switch (value[0]) {
                case '0':
                case '1':
                case '2':
                case '3':
                  if (isNaN(parseInt(value[1]))) {
                    month = Number(value[0]) - 1;
                    value = value.substr(1, value.length);
                  }
                  else {
                    month = Number(value[0] + value[1]) - 1;
                    value = value.substr(2, value.length);
                  }

                  i += 1;
                  break;
                default:
                  month = Number(value[0]) - 1;
                  value = value.substr(1, value.length);
              }
            }
            else if(format.substr(i, 2) === 'mi'){
              minute = value[0] + value[1];
              value = value.substr(2, value.length);
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            switch (value[0]) {
              case '0':
              case '1':
              case '2':
              case '3':
                if (isNaN(parseInt(value[1]))) {
                  month = Number(value[0]) - 1;
                  value = value.substr(1, value.length);
                }
                else {
                  month = Number(value[0] + value[1]) - 1;
                  value = value.substr(2, value.length);
                }
                break;
              default:
                month = Number(value[0]) - 1;
                value = value.substr(1, value.length);
            }
          }
          break;
        case 'd':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'dd'){
              if (isNaN(parseInt(value[1]))) {
                day = Number(value[0]);
                value = value.substr(1, value.length);
              }
              else {
                day = Number(value[0] + value[1]);
                value = value.substr(2, value.length);
              }
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            if (isNaN(parseInt(value[1]))) {
              day = Number(value[0]);
              value = value.substr(1, value.length);
            }
            else {
              day = Number(value[0] + value[1]);
              value = value.substr(2, value.length);
            }
          }
          break;
        case 'Y':
          if(mode === 'sql'){
            if(format.substr(i, 4) === 'YYYY'){
              year = Number(value[0] + value[1] + value[2] + value[3]);
              value = value.substr(4, value.length);
              i += 3;
            }
            else if(format.substr(0, 2) === 'YY'){
              year = Number(value[0] + value[1]);
              value = value.substr(2, value.length);
              i += 1;

              if(year < 51){
                year = Number('20' + year);
              }
              else{
                year = Number('19' + year);
              }
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else{
            year = Number(value[0] + value[1] + value[2] + value[3]);
            value = value.substr(4, value.length);
          }
          break;
        case 'y':
          if(mode === 'sql'){
            if(format.substr(i, 4) === 'yyyy'){
              year = Number(value[0] + value[1] + value[2] + value[3]);
              value = value.substr(4, value.length);
              i += 3;
            }
            else if(format.substr(0, 2) === 'yy'){
              year = Number(value[0] + value[1]);
              value = value.substr(2, value.length);
              i += 1;

              if(year < 51){
                year = Number('20' + year);
              }
              else{
                year = Number('19' + year);
              }
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            year = Number(value[0] + value[1]);
            if (year < 51) {
              year = Number('20' + year);
            }
            else {
              year = Number('19' + year);
            }

            value = value.substr(2, value.length);
          }
          break;
        case 'D':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'DD'){
              if (isNaN(parseInt(value[1]))) {
                day = Number(value[0]);
                value = value.substr(1, value.length);
              }
              else {
                day = Number(value[0] + value[1]);
                value = value.substr(2, value.length);
              }
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value = value.substr(3, value.length);
          }
          break;
        case 'l':
          l = value[0] + value[1] + value[2];
          j = 0;
          jL = 7;

          for (; j < jL; j++) {
            var d = lang.days[j];

            if (l === d.substr(0, 3)) {
              value = value.substr(d.length, value.length);
              break;
            }
          }

          break;
        case 'N':
          value = value.substr(1, value.length);
          break;
        case 'w':
          value = value.substr(1, value.length);
          break;
        case 'F':
          l = value[0] + value[1] + value[2];
          j = 0;
          jL = 7;

          for (; j < jL; j++) {
            var m = lang.months[j];

            if (l === m.substr(0, 3)) {
              value = value.substr(m.length, value.length);
              break;
            }
          }

          break;
        case 'M':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'MM'){
              switch (value[0]) {
                case '0':
                case '1':
                case '2':
                case '3':
                  if (isNaN(parseInt(value[1]))) {
                    month = Number(value[0]) - 1;
                    value = value.substr(1, value.length);
                  }
                  else {
                    month = Number(value[0] + value[1]) - 1;
                    value = value.substr(2, value.length);
                  }

                  i += 1;
                  break;
                default:
                  month = Number(value[0]) - 1;
                  value = value.substr(1, value.length);
              }
            }
            else if(format.substr(i, 2) === 'MI'){
              minute = value[0] + value[1];
              value = value.substr(2, value.length);
              i++;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else{
            value = value.substr(3, value.length);
          }
          break;
        case 't':
          if(mode === 'sql'){
            value = value.substr(1, value.length);
          }
          else{
            value = value.substr(2, value.length);
          }
          break;
        case 'T':
          if(mode === 'sql'){
            value = value.substr(1, value.length);
          }
          else{
            throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
          }
          break;
        case 'G':
          if (Fancy.isNumber(parseInt(value[1]))) {
            hour = Number(value[0] + value[1]);
            value = value.substr(2, value.length);
          } else {
            hour = Number(value[0]);
            value = value.substr(1, value.length);
          }

          break;
        case 'g':
          value = value.substr(1, value.length);
          break;
        case 'H':
          if(mode === 'sql'){
            if(format.substr(i, 2) === 'HH'){
              var h;
              if(!isNaN(Number(value[1]))){
                h = value[0] + value[1];
                value = value.substr(2, value.length);
                i += 1;
              }
              else {
                h = value[0];
                value = value.substr(1, value.length);
              }

              hour = Number(h);
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else{
            hour = Number(value[0] + value[1]);
            value = value.substr(2, value.length);
          }
          break;
        default:
          value = value.substr(1, value.length);
      }
    }

    date = new Date(year, month, day, hour, minute, second, millisecond);

    return date;
  },
  /**
   * @param {Date} date
   * @return {Number}
   */
  getDaysInMonth: function(date){
    var m = date.getMonth();

    return m === 1 && Fancy.Date.isLeapYear(date) ? 29 : Fancy.Date.daysInMonth[m];
  },
  /**
   * @param {Date} date
   * @return {Number}
   */
  getFirstDayOfMonth: function(date){
    var day = (date.getDay() - (date.getDate() - 1)) % 7;

    return (day < 0) ? (day + 7) : day;
  },
  /**
   * @param {Date} date
   * @return {Boolean}
   */
  isLeapYear: function(date){
    var year = date.getFullYear();

    return !!((year & 3) === 0 && (year % 100 || (year % 400 === 0 && year)));
  },
  /**
   * @param {String|Number} year
   * @param {String|Number} month
   * @return {Number}
   */
  getMonthNumber: function(year, month){
    return new Date(year, month + 1, 0).getDate();
  }
};/*
 * @class Fancy.DateField
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;

  F.define(['Fancy.form.field.Date', 'Fancy.DateField'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.date',
    picker: true,
    i18n: 'en',
    theme: 'default',
    fieldCls: FIELD_CLS,
    value: '',
    width: 100,
    emptyText: '',
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="' + FIELD_TEXT_CLS + '">',
        '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputWidth}" value="{value}">',
        '<div class="fancy-field-picker-button"></div>',
        '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key', 'showpicker');

      me.initFormat();
      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }

      if (!F.isDate(me.value)) {
        me.initDate();
      }
      else{
        me.date = me.value;
      }

      me.changeInputValue();
      me.initPicker();
    },
    /*
     * @param {String} value
     * @param {String} format
     */
    initDate: function (value, format) {
      var me = this;

      if (value) {
        if (F.typeOf(value) === 'date') {
          me.date = value;
          return;
        }

        var date;
        if (format) {
          date = F.Date.parse(value, format, me.format.mode);
        }
        else {
          date = F.Date.parse(value, me.format.read, me.format.mode);
        }

        if (date.toString === 'Invalid Date') {
          date = F.Date.parse(value, me.format.edit, me.format.mode);
        }

        if (date.toString === 'Invalid Date') {
          return;
        }

        me.date = date;
        return;
      }

      switch (F.typeOf(value)) {
        case 'date':
          me.date = me.value;
          break;
        case 'undefined':
        case 'string':
          if (!me.value) {
            delete me.date;
            return;
          }
          me.date = F.Date.parse(me.value, me.format.read, me.format.mode);
          break;
      }
    },
    /*
     *
     */
    changeInputValue: function () {
      var me = this;

      if (F.typeOf(me.date) !== 'date' || me.date.toString() === 'Invalid Date') {
        me.input.dom.value = '';
        return;
      }

      var value = F.Date.format(me.date, me.format.edit, undefined, me.format.mode);

      if (me.format && me.format.inputFn) {
        value = me.format.inputFn(value);
      }

      if (value === undefined) {
        value = '';
      }

      me.input.dom.value = value;

      me.fire('change', value);
    },
    /*
     *
     */
    initFormat: function () {
      var me = this;

      if (me.format) {
        if (F.isObject(me.format)) {
          F.applyIf(me.format, F.i18n[me.i18n].date);
        }
      }
      else {
        me.format = F.i18n[me.i18n].date;
      }
    },
    /*
     * @param {*} value
     */
    formatValue: function (value) {
      var me = this;

      if (!me.value && value) {
        me.value = value;
      }
      else if (!value && me.value) {
        value = me.value;
      }

      if (!me.value) {
      }
      else if (F.typeOf(me.value) === 'date') {
        me.value = F.Date.format(me.value, me.format.read, undefined, me.format.mode);
        if (value === undefined) {
          var _date = F.Date.parse(me.value, me.format.edit, me.format.mode);
          value = F.Date.format(_date, me.format.edit, undefined, me.format.mode);
        }
        me.acceptedValue = value;
      }
      else {
        var date = F.Date.parse(me.value, me.format.read, me.format.mode);
        me.value = F.Date.format(date, me.format.edit, undefined, me.format.mode);
      }

      if (me.format && me.format.inputFn) {
        value = me.format.inputFn(value);
      }

      if (value === undefined) {
        value = '';
      }

      if (/NaN/.test(value)) {
        value = '';
      }

      me.input.dom.value = value;
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        input = me.el.getByTag('input');

      me.input = input;
      input.on('blur', me.onBlur, me);
      input.on('focus', me.onFocus, me);
      input.on('input', me.onInput, me);
      input.on('keydown', me.onKeyDown, me);
      me.on('key', me.onKey, me);
      me.on('enter', me.onEnter, me);

      me.on('beforehide', me.onBeforeHide, me);

      if (me.format && me.format.inputFn) {
        me.on('key', me.onKeyInputFn);
      }
    },
    /*
     *
     */
    initPicker: function () {
      var me = this;

      if (me.picker === false || me.editable === false) {
        return;
      }

      if (me.dateImage === false) {
        me.el.select('.fancy-field-picker-button').css('display', 'none');
        me.input.on('click', me.onInputClick, me);
      }
      else {
        me.pickerButton = me.el.select('.fancy-field-picker-button');
        me.pickerButton.on('mousedown', me.onPickerButtonMouseDown, me);
        me.input.on('mousedown', me.onInputMouseDown, me);
      }
    },
    /*
     *
     */
    onInputClick: function (e) {
      e.preventDefault();
      this.toggleShowPicker();
    },
    /*
     *
     */
    onInputMouseDown: function (e) {
      var me = this,
        picker = me.picker;

      if(picker && picker.el && picker.el.css('display') !== 'none'){
        e.stopPropagation()
      }
    },
    /*
     * @param {Object} e
     */
    onPickerButtonMouseDown: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      e.preventDefault();
      me.toggleShowPicker();
    },
    /*
     *
     */
    showPicker: function () {
      var me = this,
        el = me.el,
        input = me.input,
        docEl = F.get(document),
        firstShow = false;

      if (me.picker === true) {
        firstShow = true;
        me.renderPicker();
      }
      else{
        if(me.picker.monthPicker){
          me.picker.monthPicker.hide();
          me.picker.monthPicker.panel.css('top', '-300px');
        }
      }

      var offset = input.offset(),
        x = offset.left,
        y = offset.top + el.select('.' + FIELD_TEXT_CLS).height(),
        date = me.date || new Date();

      if (date.toString() === 'Invalid Date') {
        date = new Date();
      }

      me.picker.setDate(date, firstShow);

      F.datepicker.Manager.add(me.picker);

      me.picker.showAt(x, y);

      me.fire('showpicker');

      if (!me.docSpy) {
        me.docSpy = true;
        docEl.on('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    onDocClick: function (e) {
      var me = this,
        datePicker = me.picker,
        monthPicker = datePicker.monthPicker,
        target = e.target;

      if (target.tagName.toLocaleLowerCase() === 'input') {
      }
      else if (F.get(target).hasCls('fancy-field-picker-button')) {
      }
      else if (datePicker.panel.el.within(target)) {
      }
      else if (monthPicker && monthPicker.panel.el.within(target)) {
      }
      else {
        me.hidePicker();
      }
    },
    /*
     *
     */
    hidePicker: function () {
      var me = this;

      if (me.picker !== false && me.picker.hide) {
        me.picker.hide();
      }

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    toggleShowPicker: function () {
      var me = this;

      if (me.picker === true) {
        me.showPicker();
        return;
      }

      if (me.picker.panel.el.css('display') === 'none') {
        me.showPicker();
      }
      else {
        me.hidePicker();
      }
    },
    /*
     *
     */
    renderPicker: function () {
      var me = this;

      if (!F.fullBuilt && !F.modules['grid'] && F.MODULELOAD !== false && F.MODULESLOAD !== false) {
        return;
      }

      me.picker = new F.DatePicker({
        window: true,
        date: me.date,
        format: me.format,
        theme: me.theme,
        minValue: me.min,
        maxValue: me.max,
        events: [{
          changedate: me.onPickerChangeDate,
          scope: me
        }]
      });
    },
    /*
     * @return {String}
     */
    get: function () {
      var me = this;

      if (me.input.dom.value === '') {
        delete me.date;
        delete me.value;

        return '';
      }

      if (me.date) {
        return F.Date.format(me.date, me.format.write, undefined, me.format.mode);
      }
      else {
        return '';
      }
    },
    /*
     * @return {Date}
     */
    getDate: function () {
      return this.date || '';
    },
    /*
     *
     */
    onBeforeHide: function () {
      this.hidePicker();
    },
    /*
     * @param {Object} picker
     * @param {Date} newDate
     * @param {Boolean} hidePicker
     */
    onPickerChangeDate: function (picker, newDate, hidePicker) {
      var me = this;

      if (hidePicker !== false) {
        me.picker.hide();
      }

      me.initDate(newDate);
      me.changeInputValue();
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        input = me.input,
        value = input.dom.value,
        oldValue = me.acceptedValue;

      if (F.Date.parse(value, me.format.edit, me.format.mode).toString() === 'Invalid Date') {
        return;
      }

      me.initDate(value, me.format.edit);

      me.fire('input', value);
      me.fire('change', value, oldValue);
    },
    /*
     * @return {Boolean}
     */
    isValid: function () {
      var me = this;

      return F.Date.parse(me.get(), me.format.edit, me.format.mode).toString() !== 'Invalid Date';
    },
    /*
     * @param {String|Date|Number} value
     */
    set: function (value) {
      var me = this;

      switch (value) {
        case '':
        case undefined:
          delete me.value;
          delete me.date;
          me.changeInputValue();
          return;
          break;
      }

      me.initDate(value);
      me.changeInputValue();
    },
    /*
     * @param {*} oldValue
     * @return {Boolean}
     */
    isEqual: function (oldValue) {
      var me = this,
        oldDate = F.Date.parse(oldValue, me.format.read, me.format.mode),
        value = me.input.dom.value;

      oldValue = F.Date.format(oldDate, me.format.edit, undefined, me.format.mode);

      return oldValue === value;
    },
    onEnter: function () {
      var me = this,
        input = me.input,
        value = input.dom.value,
        oldValue = me.acceptedValue;

      if (value === '') {
        me.initDate();

        me.fire('input', value);
        me.fire('change', value, oldValue);
      }
    }
  });

})();/*
 * @class Fancy.DateRangeField
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  F.define(['Fancy.form.field.DateRange', 'Fancy.DateRangeField'], {
    extend: F.Widget,
    type: 'field.daterange',
    picker: true,
    format: 'm/d/Y',
    dateImage: true,
    theme: 'default',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function(config){
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('changedatefrom', 'changedateto', 'change');

      me.preRender();
      me.render();
      me.initDateFields();
    },
    //Can not find where it is used. Maybe to remove
    fieldCls: F.cls + ' fancy-date-range',
    width: 100,
    /*
     *
     */
    render: function () {
      var me = this,
        renderTo = me.renderTo || document.body,
        el = F.get(document.createElement('div'));

      el.addCls(me.cls);

      me.el = F.get(F.get(renderTo).dom.appendChild(el.dom));
    },
    /*
     *
     */
    preRender: function () {
    },
    /*
     *
     */
    initDateFields: function () {
      var me = this,
        theme = me.theme;

      me.dateField1 = new F.DateField({
        renderTo: me.el.dom,
        label: false,
        dateImage: me.dateImage,
        width: me.width / 2,
        padding: false,
        theme: theme,
        style: {
          position: 'absolute',
          bottom: '2px',
          left: '3px'
        },
        format: me.format,
        events: [{
          showpicker: me.onShowPicker1,
          scope: me
        }, {
          change: me.onChangeDate1,
          scope: me
        }, {
          focus: me.onFocus1,
          scope: me
        }, {
          enter: me.onEnter,
          scope: me
        }]
      });

      me.dateField1.setInputSize({
        width: me.width / 2
      });

      me.dateField2 = new F.DateField({
        renderTo: me.el.dom,
        label: false,
        dateImage: me.dateImage,
        width: me.width / 2,
        padding: false,
        theme: theme,
        style: {
          position: 'absolute',
          bottom: '2px',
          right: '2px'
        },
        format: me.format,
        events: [{
          showpicker: me.onShowPicker2,
          scope: me
        }, {
          change: me.onChangeDate2,
          scope: me
        }, {
          focus: me.onFocus2,
          scope: me
        }, {
          keydown: me.onEnter,
          scope: me
        }]
      });

      me.dateField2.setInputSize({
        width: me.width / 2
      });

    },
    /*
     *
     */
    onFocus1: function () {
      this.dateField2.hidePicker();
    },
    /*
     *
     */
    onFocus2: function () {
      this.dateField1.hidePicker();
    },
    /*
     *
     */
    onShowPicker1: function () {
      this.dateField2.hidePicker();
    },
    /*
     *
     */
    onShowPicker2: function () {
      this.dateField1.hidePicker();
    },
    /*
     * @param {Object} field
     * @param {Date} date
     */
    onChangeDate1: function (field, date) {
      var me = this,
        date = F.Date.parse(date, field.format.edit, field.format.mode);

      me.fire('changedatefrom', date);
      me.fire('change');
    },
    /*
     * @param {Object} field
     * @param {Date} date
     */
    onChangeDate2: function (field, date) {
      var date = F.Date.parse(date, field.format.edit, field.format.mode);

      this.fire('changedateto', date);
      this.fire('change');
    },
    /*
     *
     */
    onEnter: function () {
      this.dateField1.hidePicker();
      this.dateField2.hidePicker();
    }
  });

})();/*
 * @class Fancy.DatePicker
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var PICKER_DATE_CELL_ACTIVE_CLS = F.PICKER_DATE_CELL_ACTIVE_CLS;
  var PICKER_DATE_CLS = F.PICKER_DATE_CLS;
  var PICKER_DATE_CELL_TODAY_CLS = F.PICKER_DATE_CELL_TODAY_CLS;
  var PICKER_DATE_CELL_OUT_RANGE_CLS = F.PICKER_DATE_CELL_OUT_RANGE_CLS;
  var PICKER_DATE_CELL_OUT_MIN_MAX_CLS = 'fancy-date-picker-cell-out-min-max';
  var PICKER_BUTTON_BACK_CLS = F.PICKER_BUTTON_BACK_CLS;
  var PICKER_BUTTON_NEXT_CLS = F.PICKER_BUTTON_NEXT_CLS;
  var PICKER_BUTTON_DATE_CLS = F.PICKER_BUTTON_DATE_CLS;
  var PICKER_BUTTON_DATE_WRAPPER_CLS = F.PICKER_BUTTON_DATE_WRAPPER_CLS;
  var PICKER_BUTTON_TODAY_CLS = F.PICKER_BUTTON_TODAY_CLS;
  var PICKER_BUTTON_TODAY_WRAPPER_CLS = F.PICKER_BUTTON_TODAY_WRAPPER_CLS;

  F.define('Fancy.datepicker.Manager', {
    singleton: true,
    opened: [],
    /*
     * @param {Object} picker
     */
    add: function (picker) {
      this.hide();
      this.opened.push(picker);
    },
    hide: function () {
      var opened = this.opened,
        i = 0,
        iL = opened.length;

      for (; i < iL; i++) {
        opened[i].hide();
      }

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
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      var me = this;

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
    init: function () {
      var me = this;

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
    initFormat: function () {
      var me = this;

      if (me.format) {
      }
      else {
        me.format = F.i18n[me.i18n].date;
      }
    },
    /*
     *
     */
    initMonthPicker: function () {
      var me = this;

      if(me.monthPicker){
        me.monthPicker.setDate(me.date);
        return;
      }

      if (!F.fullBuilt && F.MODULELOAD !== false && F.MODULELOAD !== false && ( me.monthPicker || !F.modules['grid'] )) {
        return;
      }

      me.monthPicker = new F.MonthPicker({
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
      this.data = this.generateData();
    },
    /*
     *
     */
    initDate: function () {
      var me = this;

      if (me.date === undefined || me.date.toString() === 'Invalid Date') {
        me.date = new Date();
      }

      me.showDate = me.date;

      if(me.maxValue && me.showDate > me.maxValue){
        me.showDate = me.maxValue;
      }
      else if(me.minValue && me.showDate < me.minValue){
        me.showDate = me.minValue;
      }
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
        dayIndexes = F.Date.dayIndexes,
        columns = [],
        today = new Date();

      var render = function (o) {
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

        var date = me.date,
          showDate = me.showDate;

        if (today.getMonth() === showDate.getMonth() && today.getFullYear() === showDate.getFullYear()) {
          if (o.value === today.getDate()) {
            if (o.rowIndex === 0) {
              if (o.value < 20) {
                o.cls += ' ' + PICKER_DATE_CELL_TODAY_CLS;
              }
            }
            else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + PICKER_DATE_CELL_TODAY_CLS;
              }
            }
            else {
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
            }
            else if (o.rowIndex === 4 || o.rowIndex === 5) {
              if (o.value > 20) {
                o.cls += ' ' + PICKER_DATE_CELL_ACTIVE_CLS;
              }
            }
            else {
              o.cls += ' ' + PICKER_DATE_CELL_ACTIVE_CLS;
            }
          }
        }

        var _value = o.value;
        var _month = showDate.getMonth();
        var _year = showDate.getFullYear();

        if(Number(_value) > 20 && o.rowIndex < 2){
          _month--;
          if(_month === 0){
            _year--;
            _month = 11;
          }
        }
        else if(Number(_value) < 10 && o.rowIndex > 3 ){
          _month++;
          if(_month === 12){
            _year++;
            _month = 0;
          }
        }

        var _day = new Date(_year, _month, _value),
          isOutMinMax = false;

        if(me.maxValue && me.maxValue < _day){
          isOutMinMax = true;
        }

        if(me.minValue && me.minValue > _day){
          isOutMinMax = true;
        }

        if(isOutMinMax){
          o.cls += ' ' + PICKER_DATE_CELL_OUT_MIN_MAX_CLS;
        }
        else if(o.cell){
          o.cell.removeCls(PICKER_DATE_CELL_OUT_MIN_MAX_CLS);
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
    getDataFields: function () {
      var me = this,
        fields = [],
        format = me.format,
        days = format.days,
        startDay = format.startDay,
        i = startDay,
        iL = days.length,
        dayIndexes = F.Date.dayIndexes;

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
    generateData: function () {
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
        prevDateDaysInMonth = F.Date.getDaysInMonth(prevDate);

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
      this.initTBar();
      this.initBBar();
    },
    /*
     *
     */
    initTBar: function () {
      var me = this,
        tbar = [];

      tbar.push({
        cls: PICKER_BUTTON_BACK_CLS,
        handler: me.onBackClick,
        scope: me,
        style: {}
      });

      tbar.push({
        cls: PICKER_BUTTON_DATE_CLS,
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
    initBBar: function () {
      var me = this,
        bbar = [];

      bbar.push({
        text: me.format.today,
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

      var data = me.generateData();
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

      var data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onUpdate: function () {
      var me = this,
        value = F.Date.format(me.showDate, 'F Y', {
          date: me.format
        });

      var width = value.length * 9 + 35;

      me.tbar[1].setText(value, width);
    },
    /*
     *
     */
    onClickToday: function () {
      var me = this,
        date = new Date();

      me.showDate = date;
      me.date = date;

      var data = me.generateData();
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
        cell = F.get(o.cell);

      if(cell.hasCls(PICKER_DATE_CELL_OUT_MIN_MAX_CLS)){
        return;
      }

      me.date = new Date(year, month, Number(o.value), hour, minute, second, millisecond);

      me.el.select('.' + PICKER_DATE_CELL_ACTIVE_CLS).removeCls(PICKER_DATE_CELL_ACTIVE_CLS);

      cell.addCls(PICKER_DATE_CELL_ACTIVE_CLS);

      me.fire('changedate', me.date);

      if (cell.hasCls(PICKER_DATE_CELL_OUT_RANGE_CLS)) {
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

        var data = me.generateData();

        me.store.setData(data.items);
        me.update();
      }
    },
    /*
     * @param {Object} e
     */
    onMouseWheel: function (e) {
      var delta = F.getWheelDelta(e.originalEvent || e);

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
    onDateClick: function () {
      var me = this;

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
    onMonthCancelClick: function () {
      this.hideMonthPicker();
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

      if(date > 28){
        date = 1;
      }

      me.date = new Date(newYear, newMonth, date, hour, minute, second, millisecond);
      me.showDate = me.date;

      var data = me.generateData();
      me.store.setData(data.items);
      me.update();

      me.fire('changedate', me.date, false);
    },
    /*
     *
     */
    hideMonthPicker: function () {
      var el = this.monthPicker.panel.el;

      if (F.$.fn.animate) {
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
     * @param {Object} e
     */
    onMouseDown: function (e) {
      e.preventDefault();
    },
    /*
     * @param {Date} date
     */
    setDate: function (date, firstShow) {
      var me = this;

      me.date = date;
      if(firstShow && me.showDate){}
      else {
        me.showDate = date;
      }
      me.store.setData(me.generateData().items);
      me.update();
    }
  });

})();/*
 * @class Fancy.MonthPicker
 * @extends Fancy.Grid
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var PICKER_MONTH_CELL_ACTIVE_CLS = F.PICKER_MONTH_CELL_ACTIVE_CLS;
  var PICKER_MONTH_CLS = F.PICKER_MONTH_CLS;
  var PICKER_BUTTON_BACK_CLS = F.PICKER_BUTTON_BACK_CLS;
  var PICKER_BUTTON_NEXT_CLS = F.PICKER_BUTTON_NEXT_CLS;
  var PICKER_MONTH_ACTION_BUTTONS_CLS = F.PICKER_MONTH_ACTION_BUTTONS_CLS;

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
    constructor: function (config) {
      var me = this;

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
    init: function () {
      var me = this;

      me.Super('init', arguments);
      me.addEvents('cancelclick', 'okclick');

      me.addEvents('changedate');
      me.on('cellclick', me.onCellClick, me);

      me.panel.addCls(PICKER_MONTH_CLS);
    },
    /*
     *
     */
    initData: function () {
      this.data = this.generateData();
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
    initLang: function () {
      var me = this;

      if (me.lang) {
        return;
      }

      me.lang = F.Object.copy(F.i18n[me.i18n]);
    },
    /*
     *
     */
    initColumns: function () {
      var me = this;

      var renderMonth = function (o) {
        var date = me.date,
          month = date.getMonth();

        if (me.lang.date.months[month].substr(0, 3) === o.value) {
          o.cls = PICKER_MONTH_CELL_ACTIVE_CLS;
        }

        return o;
      };

      var renderYear = function (o) {
        var date = me.date,
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
    generateData: function () {
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

      for (; i < iL; i++) {
        years.push(year - 5 + i);
      }

      i = 0;
      iL = 6;

      for (; i < iL; i++) {
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
    initBars: function () {
      this.initTBar();
      this.initBBar();
    },
    /*
     *
     */
    initTBar: function () {
      var me = this,
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
    initBBar: function () {
      var me = this,
        bbar = [],
        lang = me.lang;

      bbar.push({
        type: 'wrapper',
        cls: PICKER_MONTH_ACTION_BUTTONS_CLS,
        items: [{
          text: lang.date.ok,
          handler: me.onClickOk,
          scope: me
        }, {
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
    onBackClick: function () {
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

      var data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onNextClick: function () {
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

      var data = me.generateData();
      me.store.setData(data.items);
      me.update();
    },
    /*
     *
     */
    onClickOk: function () {
      this.fire('okclick');
    },
    /*
     *
     */
    onClickCancel: function () {
      this.fire('cancelclick');
    },
    /*
     * @param {Fancy.Grid} grid
     * @param {Object} o
     */
    onCellClick: function (grid, o) {
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

      body.el.select('.' + PICKER_MONTH_CELL_ACTIVE_CLS).removeCls(PICKER_MONTH_CELL_ACTIVE_CLS);
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
    onMouseWheel: function (e) {
      var delta = F.getWheelDelta(e.originalEvent || e);

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
    onDateClick: function () {
      this.initMonthPicker();
    },
    setDate: function (date) {
      var me = this;

      me.date = date;
      me.showDate = date;

      var data = me.generateData();
      me.store.setData(data.items);
      me.update();
    }
  });

})();