/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  extend: Fancy.Widget,
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

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.Super('init', arguments);

    me.render();
  },
  /*
   *
   */
  render: function(){
    var me = this,
      el = Fancy.get(document.createElement('div'));

    el.addCls(me.widgetCls, me.cls);
    el.update(me.text);

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    if(me.style){
      me.el.css(me.style);
    }

    if(me.hidden){
      me.el.css('display', 'none');
    }
  },
  /*
   * @return {String}
   */
  get: function() {
    return this.el.dom.innerHTML;
  },
  /*
   * @return {String}
   */
  getValue: function () {
    return this.get();
  }
});