/*
 * @class Fancy.ButtonField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Button', 'Fancy.ButtonField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.button',
  pressed: false,
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

    me.addEvents('click');

    me.Super('init', arguments);

    me.preRender();
    me.render();
    me.renderButton();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: 'fancy fancy-field fancy-field-button',
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    //'<div class="fancy-field-text fancy-button">',
    '<div class="fancy-field-text">',
      //'<div class="fancy-button-image"></div>',
      //'<a class="fancy-button-text">{buttonText}</a>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  renderButton: function(){
    var me = this;

    new Fancy.Button({
      renderTo: me.el.select('.fancy-field-text').item(0).dom,
      text: me.buttonText,
      handler: function(){
        if(me.handler){
          me.handler();
        }
      }
    });
  },
  /*
   *
   */
  ons: function(){},
  /*
   *
   */
  onClick: function(){
    var me = this;

    me.fire('click');

    if(me.handler){
      me.handler();
    }
  }
});