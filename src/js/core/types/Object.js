/**
 * @class Fancy.Object
 * @singleton
 */
Fancy.Object = {
  /**
   * @param {Object} o
   * @return {Object}
   * TODO: deep copy
   */
  copy: function(o){
    var _o = {};

    for(var p in o){
      _o[p] = o[p];
    }

    return _o;
  },
  /**
   * @param {Object} o
   * @return {Boolean}
   */
  isEmpty: function(o){
    for(var p in o){
      return false;
    }

    return true;
  },
  /**
   * @param {Object} o
   * @return {Array}
   */
  keys: function(o){
    if(Object.keys){
      return Object.keys(o);
    }

    var keys = [];

    for(var p in o){
      keys.push(p);
    }

    return keys;
  }
};