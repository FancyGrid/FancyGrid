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
  }
};