/**
 * @class Fancy.MixinClass
 * @constructor
 */
Fancy.MixinClass = function(){};

Fancy.MixinClass.prototype = {
  /**
   * generate unique id for class
   */
  initId: function(){
    var me = this,
      prefix = me.prefix || Fancy.prefix;

    me.id = me.id || Fancy.id(null, prefix);

    Fancy.addWidget(me.id, me);
  },
  /*
   * Initialize plugins if they are presented in class
   */
  initPlugins: function(){
    var me = this,
      widget = me,
      plugin,
      objectPlugin,
      pluginConfig;

    me.plugins = me.plugins || [];

    if(me._plugins){
      me.plugins = me.plugins.concat(me._plugins);
    }

    if(me.plugins !== undefined){
      me.$plugins = me.plugins;
      delete me.plugins;
    }

    if(me.$plugins === undefined){
      return;
    }

    var i = 0,
      plugins = me.$plugins,
      iL = plugins.length,
      inWidgetName,
      types = {};

    for(;i<iL;i++){
      pluginConfig = plugins[i];
      pluginConfig.widget = widget;

      var type = pluginConfig.type || pluginConfig.ptype;

      if(types[type] === true){
        continue;
      }

      types[type] = true;
      plugin = Fancy.getPluginByType( type );
      if(plugin === undefined){
        throw new Error('[FancyGrid Error] - some of module was not loaded. Grid plugin does not exist - ' + type);
      }
      objectPlugin = new plugin(pluginConfig);
      inWidgetName = pluginConfig.inWidgetName || objectPlugin.inWidgetName;

      if(inWidgetName !== undefined){
        widget[ inWidgetName ] = objectPlugin;
      }
    }
  }
};