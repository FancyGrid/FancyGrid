/**
 * @class Fancy.String
 * @singleton
 */
Fancy.String = {
  /**
   * @param {String} tpl
   * @return {String}
   */
  format: function(tpl){
    var arr,
      i,
      iL;

    if(Fancy.typeOf(arguments[1]) === 'array'){
      arr = arguments[1];
    }
    else{
      iL = arguments.length;
      arr = [];
      i = 1;

      for(;i<iL;i++){
        arr[i - 1] = arguments[i];
      }
    }

    return tpl.replace(/\[(\d+)]/g, function(m, i) {
      return arr[i];
    });
  },
  /**
   * @param {String} str
   * @return {String}
   */
  upFirstChar: function(str) {
    return str[0].toLocaleUpperCase() + str.substr(1, str.length);
  },
  /**
   * @param {String} str
   * @return {String}
   */
  trim: function(str) {
    return str.replace(/\s/g, '');
  }
};

