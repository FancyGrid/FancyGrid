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
      m;
    mode = mode || '';

    if(date === null || date === undefined){
      return '';
    }

    if(date.toString() === 'Invalid Date'){
      return '';
    }

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
              String(date.getFullYear()).substr(2, 4);
              i += 1;
            }
            else{
              throw new Error('[FancyGrid Error] - Invalid date format: ' + format);
            }
          }
          else {
            value += String(date.getFullYear()).substr(2, 4);
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
      millisecond = 0;
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
};