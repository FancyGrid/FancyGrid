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
  copy(o){
    const _o = {};

    for(const p in o){
      _o[p] = o[p];
    }

    return _o;
  },
  /**
   * @param {Object} o
   * @return {Boolean}
   */
  isEmpty(o){
    for (const p in o) {
      return false;
    }

    return true;
  },
  /**
   * @param {Object} o
   * @return {Array}
   */
  keys(o){
    if (Object.keys) {
      return Object.keys(o);
    }

    const keys = [];

    for (const p in o) {
      keys.push(p);
    }

    return keys;
  }
};
