/*
 * @mixin Fancy.form.mixin.PrepareConfig
 */
Fancy.Mixin('Fancy.form.mixin.PrepareConfig', {
  /*
   * @param {Object} config
   * @param {Object} originalConfig
   * @return {Object}
   */
  prepareConfig: function(config, originalConfig){
    var me = this;

    config = me.prepareConfigTheme(config, originalConfig);
    config = me.prepareConfigLang(config, originalConfig);
    config = me.prepareConfigDefaults(config);
    config = me.prepareConfigItems(config);
    config = me.prepareConfigFooter(config);

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigDefaults: function(config){
    if( config.defaults ){
      for(var p in config.defaults){
        Fancy.each(config.items, function(item){
          if( item[p] === undefined ){
            item[p] = config.defaults[p];
          }
        });
      }
    }

    return config;
  },
  /*
   * @param {Object} config
   * @return {Object}
   */
  prepareConfigItems: function(config){
    var me = this,
      fn = function(item){
        item.theme = me.theme || '';

        if( item.labelWidth === undefined ){
          item.labelWidth = me.labelWidth;
        }

        if( item.inputWidth === undefined ){
          item.inputWidth = me.inputWidth;
        }

        if( item.type === 'pass' || item.type === 'password' ){
          item.type = 'string';
          item.isPassword = true;
        }

        if(item.items){
          Fancy.each(item.items, fn);
        }
      };

    Fancy.each(config.items, fn);

    return config;
  }
});