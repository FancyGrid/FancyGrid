/*
 * @class Fancy.EmptyField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Empty', 'Fancy.EmptyField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.empty',
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

    me.addEvents();

    me.Super('init', arguments);

    me.preRender();
    me.render();

    if( me.style ){
      me.css(me.style);
    }
  },
  /*
   *
   */
  ons: function(){},
  fieldCls: Fancy.FIELD_CLS + ' ' + Fancy.FIELD_EMPTY_CLS,
  width: 100,
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});