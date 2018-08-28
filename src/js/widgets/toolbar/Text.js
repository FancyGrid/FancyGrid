/*
 * @class Fancy.bar.Text
 */
Fancy.define('Fancy.bar.Text', {
  extend: Fancy.Widget,
  widgetCls: Fancy.BAR_TEXT_CLS,
  cls: '',
  text: '',
  tipTpl: '{value}',
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
    var me = this;

    me.Super('init', arguments);
    me.render();
    me.ons();
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

    if(me.id){
      me.el.attr('id', me.id);
    }

    if(me.width){
      me.el.css('width', me.width);
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
  },
  /*
   * @param {String} value
   */
  set: function (value) {
    this.el.dom.innerHTML = value;
  },
  /*
   *
   */
  ons: function () {
    var me = this,
      el = me.el;

    el.on('mouseover', me.onMouseOver, me);
    el.on('mouseout', me.onMouseOut, me);

    if(me.tip){
      me.el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   *
   */
  onMouseMove: function(e){
    var me = this;

    if(me.tip && me.tooltip){
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
     * @param {Object} e
     */
  onMouseOver: function(e){
    var me = this;

    me.fire('mouseover');

    if(me.tip){
      me.renderTip(e);
    }
  },
  /*
   * @param {Object} e
   */
  renderTip: function(e){
    var me = this;

    if(me.tooltip){
      me.tooltip.destroy();
    }

    if(me.tip === true) {
      me.tip = new Fancy.Template(me.tipTpl).getHTML({
        value: me.get()
      })
    }

    me.tooltip = new Fancy.ToolTip({
      text: me.tip
    });

    me.tooltip.css('display', 'block');
    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  onMouseOut: function(){
    var me = this;

    me.fire('mouseout');

    if(me.tooltip){
      me.tooltip.destroy();
      delete me.tooltip;
    }
  },
});