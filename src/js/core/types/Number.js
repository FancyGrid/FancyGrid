/**
 * @class Fancy.Number
 * @singleton
 */
Fancy.Number = {
  /**
   * @param {Number} value
   * @return {Boolean}
   */
  isFloat: function(value){
    return Number(value) === value && value % 1 !== 0;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  getPrecision: function(value){
    return (value + "").split(".")[1].length + 1;
  },
  /**
   * @param {Number} value
   * @return {Number}
   */
  correctFloat: function(value){
    return parseFloat(value.toPrecision(14));
  },
  /**
   * @param {Number} value
   * @param {Number|String} [sep]
   * @param {Number} [presition]
   * @return {String}
   */
  format: function (value, sep, precision) {
    var dot,
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

    var splitted = value.toString().split('.');
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
  }
};