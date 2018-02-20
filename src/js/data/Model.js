/*
 * @class Fancy.Model
 */
Fancy.define('Fancy.Model', {
  /*
   * @constructor
   * @param {Object|Array} data
   */
  constructor: function(data){
    var me = this,
      row = {},
      fields = me.fields || [],
      j = 0,
      jL = fields.length;

    if( Fancy.isArray(data) ){
      for(;j<jL;j++){
        var p = fields[j];
        row[p] = data[j];
      }

      if(row.id === undefined){
        Fancy.idSeed++;
        row.id = Fancy.idSeed + 1000;
      }

      me.data = row;
      me.id = me.data.id;
      //TODO - id
    }
    else{
      if(data.id){
        me.id = data.id;
      }
      else{
        Fancy.idSeed++;
        me.id = Fancy.idSeed + 1000;
        data.id = me.id;
      }

      if( me.fields === undefined ){
        fields = [];
        for(var p in data){
          fields.push(p);
        }
        me.fields = fields;
      }

      jL = fields.length;

      for(;j<jL;j++){
        var p = fields[j];

        if(data[p] === undefined){
          row[p] = '';
        }
        else{
          row[p] = data[p];
        }
      }

      if(!row.id){
        me.fields.push('id');
        if(!data.id){
          data.id = me.id;
        }

        row.id = data.id;
      }

      me.data = row;
    }
  },
  /*
   * @param {String} key
   * @return {Object}
   */
  get: function(key){
    var me = this;

    if(key === undefined){
      return me.data;
    }

    return me.data[key];
  },
  /*
   * @param {String} key
   * @param {*} value
   */
  set: function(key, value){
    var me = this;

    if(value === undefined && Fancy.isObject(key)){
      for(var p in key){
        me.set(p, key[p]);
      }
      return;
    }

    me.data[key] = value;
  }
});