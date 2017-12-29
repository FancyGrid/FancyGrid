/*
 * @mixin Fancy.store.mixin.Writer
 */
Fancy.Mixin('Fancy.store.mixin.Writer', {
  writerType: 'string',
  writeAllFields: false,
  /*
   *
   */
  initWriter: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.writer){
      me.configWriter(proxy.writer);
    }
  },
  /*
   * @param writer
   */
  configWriter: function(writer){
    var me = this;

    if(writer.allFields){
      me.writeAllFields = writer.allFields;
      writer.writeAllFields = writer.allFields;
    }

    switch(Fancy.typeOf(writer)){
      case 'string':

        switch(writer){
          case 'json':
          case 'string':
            me.writerType = writer;
            break;
          default:
            throw new Error('[FancyGrid Error] - writer ' + writer.type + ' does not exist');
        }

        break;
      case 'object':

        switch(writer.type){
          case undefined:
            me.writerType = 'string';
            break;
          case 'json':
          case 'string':
            me.writerType = writer.type;
            break;
          default:
            throw new Error('[FancyGrid Error] - writer ' + writer + ' does not exist');
        }

        if(writer.writeFields){
          me.writeFields = true;
        }

        if(writer.root){
          me.writerRootProperty = writer.root;
        }

        break;
    }
  },
  /*
   * @param {String} id
   * @param {String} key
   * @param {*} value
   */
  prepareWriterJSONParams: function(id, key, value){
    var me = this,
      params = me.params || {},
      data = {};

    data.id = id;

    if(me.writeAllFields){
      Fancy.applyIf(data, me.getById(id).data);
    }
    else if(value === undefined && Fancy.isObject(key)){
      Fancy.applyIf(data, key);
    }
    else if(value === undefined && Fancy.isArray(key)){
      data = key;
    }
    else{
      data[key] = value;
    }

    if(me.rootProperty){
      params[me.rootProperty] = data;
    }
    else{
      return data;
    }

    return params;
  }
});