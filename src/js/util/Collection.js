/*
 * @class Fancy.Collection
 * @constructor
 */
Fancy.Collection = function(arr){
  var me = this;

  me.items = [];
  me.keys = [];
  me.map = {};
  me.indexMap = {};
  me.length = 0;

  if( arr ){
    if(arr.length > 0){
      var i = 0,
        iL = arr.length;

      for(;i<iL;i++){
        me.add(i, arr[i]);
      }
    }
    else{
      for(var p in arr){
        me.add(p, arr[p]);
      }
    }
  }
};

Fancy.Collection.prototype = {
  /*
   *
   * @param {String|Number} key
   * @param {*} value
   */
  add: function(key, value){
    var me = this;

    me.items.push(value);
    me.keys.push(key);
    me.map[key] = value;
    me.indexMap[key] = me.length;
    me.length++;
  },
  /*
   * @param {String|Number} key
   */
  remove: function(key){
    var me = this,
      index = me.indexMap[key];

    me.items.splice(index, 1);
    me.keys.splice(index, 1);
    delete me.indexMap[index];
    delete me.map[key];
    me.length--;

    me.updateIndexMap();
  },
  updateIndexMap: function () {
    var me = this,
      i = 0,
      iL = me.keys.length;

    me.indexMap = {};

    for(;i<iL;i++){
      me.indexMap[me.keys[i]] = i;
    }
  },
  /*
   *
   */
  removeAll: function(){
    var me = this;

    me.items = [];
    me.keys = [];
    me.indexMap = {};
    me.map = {};
    me.length = 0;
  },
  /*
   * @param {String|Number} key
   * @return {*}
   */
  get: function(key){
    return this.map[key];
  },
  /*
   *
   * @param {Function} fn
   */
  each: function(fn){
    var me = this,
      i = 0,
      iL = me.length;

    for(;i<iL;i++){
      fn(me.keys[i], me.items[i], i, me.length);
    }
  }
};