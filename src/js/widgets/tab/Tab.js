/**
 * @class Fancy.toolbar.Tab
 * @extends Fancy.Button
 */
Fancy.define('Fancy.toolbar.Tab', {
  extend: Fancy.Button,
  /*
   * @constructor
   * @param config
   */
  constructor: function(config){
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
  },
  cls: Fancy.BUTTON_CLS + ' ' + Fancy.TAB_TBAR_CLS,
  /*
   *
   */
  render: function(){
    this.Super('render', arguments);
  }
});