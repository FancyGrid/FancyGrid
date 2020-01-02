/*
 * @class Fancy.grid.plugin.GroupHeader
 * @extends Fancy.Plugin
 */
Fancy.modules['grouped-header'] = true;
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var GRID_HEADER_CELL_DOUBLE_CLS = F.GRID_HEADER_CELL_DOUBLE_CLS;
  var GRID_HEADER_CELL_TRIPLE_CLS = F.GRID_HEADER_CELL_TRIPLE_CLS;

  Fancy.define('Fancy.grid.plugin.GroupHeader', {
    extend: Fancy.Plugin,
    ptype: 'grid.groupheader',
    inWidgetName: 'groupheader',
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function () {
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      this.Super('init', arguments);

      this.ons();
    },
    /*
     *
     */
    ons: function () {}
  });

})();