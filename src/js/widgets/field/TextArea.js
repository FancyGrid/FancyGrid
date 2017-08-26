/*
 * @class Fancy.TextArea
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.TextArea', 'Fancy.TextArea'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.textarea',
  /*
   * @constructor
   */
  constructor: function(){
    var me = this;

    me.Super('const', arguments);
  },
  /*
   *
   */
  init: function(){
    var me = this;

    me.addEvents('change', 'key');
    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();
  },
  fieldCls: 'fancy fancy-field fancy-textarea',
  value: '',
  width: 250,
  height: 100,
  labelWidth: 60,
  inputWidth: 180,
  minHeight: 100,
  maxHeight: 210,
  lineHeight: 12.5,
  emptyText: '',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-textarea-text">',
      //'<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="fancy-textarea-text-input" style="{inputWidth}height:{height}px;">{value}</textarea>',
      '<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="fancy-textarea-text-input" style="{inputWidth}height:{inputHeight}px;">{value}</textarea>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  ons: function(){
    var me = this,
      input = me.el.getByTag('textarea');

    me.input = input;
    input.on('blur', me.onBlur, me);
    input.on('focus', me.onFocus, me);
    input.on('input', me.onInput, me);
    input.on('keydown', me.onKeyDown, me);
    me.on('key', me.onKey, me);

    if( me.autoHeight ){
      input.on('input', me.onChange, me);
    }
  },
  /*
   *
   */
  preRender: function(){
    var me = this;

    if(me.tpl) {
      me.tpl = new Fancy.Template(me.tpl);
    }

    me.initHeight();
    me.calcSize();
  },
  /*
   *
   */
  initHeight: function(){
    var me = this,
      height;

    if(me.height){
      height = me.height;
      if(me.maxHeight < me.height){
        me.maxHeight = me.height;
        setTimeout(function(){
          me.input.css({
            'overflow-y': 'scroll'
          });
        }, 1);
      }
    }
    else if(me.value){
      var length = me.value.match(/\n/g);

      if(length){
        length = length.length;
      }
      else{
        length = 1;
      }

      height = length * me.lineHeight;
    }
    else{
      height = me.height;
    }

    if( height < me.minHeight ){
      height = me.minHeight;
    }
    else if(height > me.maxHeight){
      height = me.maxHeight;
      setTimeout(function(){
        me.input.css({
          'overflow-y': 'scroll'
        });
      }, 1);
    }

    me.height = height;
    me.inputHeight = height;
  },
  /*
   *
   */
  calcSize: function(){
    var me = this,
      inputWidth = me.inputWidth,
      padding = me.padding,
      value,
      value1,
      value2,
      value3;

    if(Fancy.isString(padding)){
      padding = padding.replace(/px/g, '');
      padding = padding.split(' ');
      switch(padding.length){
        case 1:
          value = Number(padding[0]);
          padding = [value, value, value, value];
          break;
        case 2:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);

          padding = [value1, value2, value1, value2];
          break;
        case 3:
          value1 = Number(padding[0]);
          value2 = Number(padding[1]);
          value3 = Number(padding[2]);

          padding = [value1, value2, value3, value1];
          break;
        case 4:
          padding = [Number(padding[0]), Number(padding[1]), Number(padding[2]), Number(padding[3])];
          break;
      }
    }
    else if(Fancy.isNumber(padding)){
      padding = [padding, padding, padding, padding];
    }
    else if(padding === false){
      padding = [0, 0, 0, 0];
    }

    if(me.labelAlign === 'top'){
      me.inputHeight -= 40;
    }

    inputWidth = me.width;

    if(me.labelAlign !== 'top' && me.label){
      inputWidth -= me.labelWidth;
    }

    if(me.height === me.inputHeight && me.padding !== false){
      me.inputHeight -= padding[0] + padding[2];
    }

    me.inputWidth = inputWidth -  padding[1] - padding[3];
    me.height = me.inputHeight + padding[0] + padding[2];
  },
  /*
   *
   */
  onChange: function(){
    var me = this,
      value = me.input.dom.value,
      input = me.el.getByTag('textarea'),
      height = value.match(/\n/g).length * me.lineHeight;

    if( height < me.minHeight ){
      height = me.minHeight;
      input.css({
        'overflow-y': 'hidden'
      });
    }
    else if(height > me.maxHeight){
      height = me.maxHeight;
      input.css({
        'overflow-y': 'scroll'
      });
    }
    else{
      input.css({
        'overflow-y': 'hidden'
      });
    }

    me.height = height;
  }
});