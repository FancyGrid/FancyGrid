/*
 *  @mixin Fancy.store.mixin.Reader
 */
Fancy.Mixin('Fancy.store.mixin.Reader', {
  readerType: 'json',
  readerRootProperty: 'data',
  /*
   *
   */
  initReader: function(){
    var me = this,
      proxy = me.proxy;

    if(proxy.reader){
      me.configReader(proxy.reader);
    }
  },
  /*
   * @param {String|Object} reader
   */
  configReader: function(reader){
    var me = this;

    switch(Fancy.typeOf(reader)){
      case 'string':

        switch(reader){
          case 'json':
            me.readerType = reader;
            break;
          default:
            throw new Error('[FancyGrid Error] - reader ' + reader + ' does not exist');
        }

        break;
      case 'object':

        switch(reader.type){
          case undefined:
            me.readerType = 'json';
            break;
          case 'json':
            me.readerType = reader.type;
            break;
          default:
            throw new Error('[FancyGrid Error] - reader ' + reader.type + ' does not exist');
        }

        if(reader.root){
          me.readerRootProperty = reader.root;
        }

        break;
    }
  }
});