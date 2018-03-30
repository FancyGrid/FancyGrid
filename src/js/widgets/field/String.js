/*
 * @class Fancy.StringField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.String', 'Fancy.StringField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.string',
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

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab','change', 'key', 'empty');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    if( me.isPassword ){
      me.input.attr({
        "type": "password"
      });

      if(me.showPassTip) {
        me.el.select('.fancy-field-text').item(0).append('<div class="fancy-field-pass-tip">abc</div>');
        me.passTipEl = me.el.select('.fancy-field-pass-tip').item(0);

        me.passTipEl.on('mousedown', function (e) {
          e.preventDefault();
        });

        me.passTipEl.on('click', function () {
          if(me.input.attr('type') !== 'password'){
            me.passTipEl.update('abc');
            me.input.attr('type', 'password');
            me.passTipEl.css('line-height', '22px');
          }
          else {
            me.passTipEl.update('***');
            me.input.attr('type', '');
            me.passTipEl.css('line-height', '28px');
          }
        });
      }
    }

    if( me.hidden ){
      me.css('display', 'none');
    }

    if( me.style ){
      me.css(me.style);
    }
  },
  fieldCls: Fancy.FIELD_CLS,
  value: '',
  width: 100,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ]
});