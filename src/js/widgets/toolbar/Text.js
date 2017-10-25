/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  extend: Fancy.Widget,
  widgetCls: Fancy.BAR_TEXT_CLS,
  cls: '',
  text: '',
  /*
   * @constructor
   * @param {Object} config
   */
  constructor: function(config){
    Fancy.apply(this, config);
    this.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    this.Super('init', arguments);
    this.render();
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