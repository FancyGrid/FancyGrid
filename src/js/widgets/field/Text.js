/*
 * @class Fancy.TextField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Text', 'Fancy.TextField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.text',
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
  fieldCls: Fancy.FIELD_CLS + ' fancy-field-field-text',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-text-value">{value}</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   * @param {*} value
   */
  set: function(value){
    this.el.select('.fancy-field-text-value').item(0).update(value);
  }
});