/*
 * @class Fancy.Plugin
 */
Fancy.define('Fancy.Plugin', {
  extend: Fancy.Event,
  /*
   * @constructor {Object} config
   */
  constructor: function(){
    this.Super('const', arguments);
    this.init();
  },
  /*
   *
   */
  init(){
    this.initId();
    this.addEvents('beforerender', 'afterrender', 'render', 'show', 'hide', 'destroy');
  },
  /*
   *
   */
  initTpl(){
    const tpl = this.tpl;

    if (!tpl) {
      return;
    }

    this.tpl = new Fancy.Template(tpl);
  }
});
