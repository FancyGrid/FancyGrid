/*
 * @class Fancy.PluginManager
 * @singleton
 */
Fancy.define('Fancy.PluginManager', {
  singleton: true,
  /*
   * @constructor
   */
  constructor: function(){
    this.ptypes = new Fancy.Data();
  },
  /*
   * @param {String} ptype
   * @param {Object} plugin
   */
  addPlugin: function(ptype, plugin){
    this.ptypes.add(ptype, plugin);
  },
  /*
   * @param {String} ptype
   * @return {Object}
   */
  getPlugin: function(ptype){
    return this.ptypes.get(ptype);
  }
});

/*
 * @param {String} ptype
 * @param {Object} plugin
 */
Fancy.addPluginByType = function(ptype, plugin){
  Fancy.PluginManager.addPlugin(ptype, plugin);
};

/*
 * @param {String} ptype
 * @return {Object}
 */
Fancy.getPluginByType = function(ptype){
  return Fancy.PluginManager.getPlugin(ptype);
};