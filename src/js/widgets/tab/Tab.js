/**
 * @class Fancy.toolbar.Tab
 * @extends Fancy.Button
 */
Fancy.define('Fancy.toolbar.Tab', {
  extend: Fancy.Button,
  /*
   * @constructor
   * @param config
   * @param scope
   */
  constructor: function(config, scope){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);

    Fancy.loadStyle();
  },
  cls: Fancy.BUTTON_CLS + ' ' + Fancy.TAB_TBAR_CLS,
  /*
   *
   */
  render: function(){
    this.Super('render', arguments);
  }
});