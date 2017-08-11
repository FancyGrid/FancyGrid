/*
 * @class Fancy.grid.plugin.Updater
 * @extends Fancy.Plugin
 */
Fancy.define('Fancy.grid.plugin.Updater', {
  extend: Fancy.Plugin,
  ptype: 'grid.updater',
  inWidgetName: 'updater',
  /*
   * @param {Object} config
   */
  constructor: function(config){
    var me = this;

    Fancy.applyConfig(me, config);

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){},
  /*
   *
   */
  update: function(){
    var me = this,
      w = me.widget;

    w.leftBody.update();
    w.body.update();
    w.rightBody.update();
  },
  /*
   * @param {Number} rowIndex
   */
  updateRow: function(rowIndex){
    var me = this,
      w = me.widget;

    w.leftBody.updateRows(rowIndex);
    w.body.updateRows(rowIndex);
    w.rightBody.updateRows(rowIndex);
  }
});