/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  widgetCls: 'fancy-bar-text',
  cls: '',
  text: '',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    var me = this,
      config = config || {};

    Fancy.apply(me, config);

    me.init();
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addClass(me.widgetCls);
    el.addClass(me.cls);
    el.update(me.text);

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }
  }
});