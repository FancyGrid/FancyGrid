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
  init(){},
  /*
   * @param {String} [type]
   */
  update(type = ''){
    const w = this.widget;

    if (w.leftColumns && w.leftColumns.length) {
      w.leftBody.update(type);
    }

    w.body.update(type);

    if (w.rightColumns && w.rightColumns.length) {
      w.rightBody.update( type );
    }
  },
  /*
   * @param {Number} rowIndex
   */
  updateRow(rowIndex){
    const w = this.widget;

    w.leftBody.updateRows(rowIndex);
    w.body.updateRows(rowIndex);
    w.rightBody.updateRows(rowIndex);
  }
});
