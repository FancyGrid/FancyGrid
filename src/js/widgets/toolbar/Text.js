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
  init(){
    const me = this;

    me.Super('init', arguments);
    me.render();
    me.ons();
  },
  /*
   *
   */
  render(){
    const me = this,
      el = Fancy.newEl('div');

    el.addCls(me.widgetCls, me.cls);
    el.update(me.text);

    me.el = Fancy.get(me.renderTo.appendChild(el.dom));

    const { style, hidden, id, width } = me;

    if (style) {
      me.el.css(style);
    }

    if (hidden) {
      me.el.css('display', 'none');
    }

    if (id) {
      me.el.attr('id', id);
    }

    if (width) {
      me.el.css('width', width);
    }
  },
  /*
   * @return {String}
   */
  get() {
    return this.el.dom.innerHTML;
  },
  /*
   * @return {String}
   */
  getValue(){
    return this.get();
  },
  /*
   * @param {String} value
   */
  set(value){
    this.el.dom.innerHTML = value;
  },
  /*
   *
   */
  ons(){
    const me = this,
      el = me.el;

    el.on('mouseover', me.onMouseOver, me);
    el.on('mouseout', me.onMouseOut, me);

    if (me.tip) {
      el.on('mousemove', me.onMouseMove, me);
    }
  },
  /*
   *
   */
  onMouseMove(e){
    const me = this;

    if (me.tip && me.tooltip) {
      me.tooltip.show(e.pageX + 15, e.pageY - 25);
    }
  },
  /*
     * @param {Object} e
     */
  onMouseOver(e){
    const me = this;

    me.fire('mouseover');

    if (me.tip) {
      me.renderTip(e);
    }
  },
  /*
   * @param {Object} e
   */
  renderTip(e){
    const me = this;
    let text = '';

    if (me.tooltip) {
      me.tooltip.destroy();
    }

    if (me.tip === true) {
      me.tip = new Fancy.Template(me.tipTpl).getHTML({
        value: me.get()
      });
    }
    else{
      switch (Fancy.typeOf(me.tip)) {
        case 'function':
          text = me.tip(this, me.get, me.label || '');
          break;
        case 'string':
          text = me.tpl.getHTML({
            value: me.get()
          });
          break;
      }
    }

    if (me.tooltip) {
      me.tooltip.update(text);
    }
    else {
      me.tooltip = new Fancy.ToolTip({
        text: text
      });
    }

    me.tooltip.css('display', 'block');
    me.tooltip.show(e.pageX + 15, e.pageY - 25);
  },
  /*
   *
   */
  onMouseOut(){
    const me = this;

    me.fire('mouseout');

    if (me.tooltip) {
      me.tooltip.destroy();
      delete me.tooltip;
    }
  }
});
