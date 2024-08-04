/**
 * @class Fancy.Number
 * @singleton
 */
Fancy.Number = {
  /**
   * @param {Number} value
   * @return {Boolean}
   */
  isFloat(value){
    return Number(value) === value && value % 1 !== 0;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  getPrecision(value){
    return (value + '').split('.')[1].length + 1;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  correctFloat(value){
    return parseFloat(value.toPrecision(14));
  },
  /**
   * @param {Number} value
   * @param {Number|String} [sep]
   * @param {Number} [precision]
   * @return {String}
   */
  format(value, sep, precision){
    let dot,
      result;

    if(sep === undefined){
      sep = ',';
    }

    if(Fancy.isNumber(sep)){
      precision = sep;
      sep = ',';
    }

    if(sep === ''){
      dot = '.';
    }
    else if(sep === ','){
      dot = '.';
    }
    else{
      dot = ',';
    }

    const splitted = value.toString().split('.');
    splitted[0] = splitted[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);

    if(splitted[1] === undefined){
      splitted[1] = '';
    }

    if(precision !== undefined){
      if(precision === 0){
        result = splitted[0];
      }
      else{
        var delta = precision - splitted[1].length;
        if(delta > 0){
          var i = 0;
          for(;i<delta;i++){
            splitted[1] += '0';
          }
        }
        else if(delta < 0){
          splitted[1] = splitted[1].substring(0, precision);
        }

        result = splitted[0] + dot + splitted[1];
      }
    }
    else{
      result = splitted[0];
      if(splitted[1].length){
        result += dot + splitted[1];
      }
    }

    return result;
  },
  currencyFormat(value, decimalSeparator, thousandSeparator, precision) {
    const splitted = value.toString().split(decimalSeparator);
    precision = precision || 0;

    splitted[0] = splitted[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    if(splitted[1]){
      if(precision > 0){
        if (splitted[1].length < precision){
          var end = '',
            i = splitted[1].length;

          for (; i < precision; i++) {
            end += '0';
          }

          return splitted[0] + decimalSeparator + splitted[1] + end;
        }
        else {
          splitted[1] = String(splitted[1]).substring(0, precision);
        }
      }

      return splitted[0] + decimalSeparator + splitted[1];
    }

    if(precision > 0 && splitted[0] !== ''){
      var end = '',
        i = 0;

      for (; i < precision; i++) {
        end += '0';
      }

      return splitted[0] + decimalSeparator + end;
    }

    return splitted[0];
  }
};
