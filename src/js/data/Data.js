/*
 * @class Fancy.Data
 */
Fancy.define('Fancy.Data', {
  /*
   * @constructor
   * @param {Array} data
   */
  constructor: function(data){
    const me = this;

    me.map = {};

    if(data){
      var i = 0,
        iL = data.length,
        map = me.map;

      for(;i<iL;i++){
        map[i] = data[i];
      }
    }

    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @param {*} value
   */
  add(key, value){
    this.map[key] = value;
    this.length++;
  },
  /*
   * @param {String|Number} key
   * @return {*}
   */
  get(key){
    return this.map[key];
  }
});
