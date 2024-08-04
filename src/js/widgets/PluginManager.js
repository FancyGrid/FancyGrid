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
  addPlugin(ptype, plugin){
    this.ptypes.add(ptype, plugin);
  },
  /*
   * @param {String} ptype
   * @return {Object}
   */
  getPlugin(ptype){
    return this.ptypes.get(ptype);
  }
});

/*
 * @param {String} ptype
 * @param {Object} plugin
 */
Fancy.addPluginByType = (ptype, plugin) => {
  Fancy.PluginManager.addPlugin(ptype, plugin);
};

/*
 * @param {String} ptype
 * @return {Object}
 */
Fancy.getPluginByType = (ptype) => {
  return Fancy.PluginManager.getPlugin(ptype);
};
