/*
 * @class Fancy.Separator
 */
Fancy.define('Fancy.Separator', {
  cls: Fancy.SEPARATOR_CLS,
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.init();
  },
  /*
   *
   */
  init: function(){
    this.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addCls(me.cls);
    el.update('<div></div>');

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }
  }
});