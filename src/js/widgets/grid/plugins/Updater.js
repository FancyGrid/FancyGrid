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
    Fancy.applyConfig(this, config);

    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){},
  /*
   * @param {String} [type]
   */
  update: function(type){
    var w = this.widget;
    type = type || '';

    w.leftBody.update(type);
    w.body.update(type);
    w.rightBody.update(type);
  },
  /*
   * @param {Number} rowIndex
   */
  updateRow: function(rowIndex){
    var w = this.widget;

    w.leftBody.updateRows(rowIndex);
    w.body.updateRows(rowIndex);
    w.rightBody.updateRows(rowIndex);
  }
});