/*
 * @class Fancy.HTMLField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.HTML', 'Fancy.HTMLField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.html',
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

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'esc', 'change', 'key');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    //me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy-field-html',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="" style="">',
      '{value}',
    '</div>'
  ],
  /*
   *
   */
  render(){
    const me = this,
      renderTo = me.renderTo || document.body,
      el = Fancy.newDomEl('div');

    me.fire('beforerender');

    el.innerHTML = me.tpl.getHTML({
      value: me.value,
      height: me.height
    });

    me.el = renderTo.appendChild(el);
    me.el = Fancy.get(me.el);

    me.el.addCls(me.cls, Fancy.cls, me.fieldCls);

    me.acceptedValue = me.value;
    me.fire('afterrender');
    me.fire('render');
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set(value, onInput){
    const me = this;

    me.el.firstChild().update(value);
    if(onInput !== false){
      me.onInput();
    }
  },
  /*
   * @return {String}
   */
  get() {
    return this.el.firstChild().dom.innerHTML;
  }
});
