/*
 * @class Fancy.TextArea
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  //CONSTANTS
  const FIELD_CLS = F.FIELD_CLS;
  const FIELD_TEXTAREA_CLS = F.FIELD_TEXTAREA_CLS;
  const FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  const FIELD_TEXTAREA_TEXT_CLS = F.FIELD_TEXTAREA_TEXT_CLS;
  const FIELD_TEXTAREA_TEXT_INPUT_CLS = F.FIELD_TEXTAREA_TEXT_INPUT_CLS;
  const FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  const CLEARFIX_CLS = F.CLEARFIX_CLS;

  F.define(['Fancy.form.field.TextArea', 'Fancy.TextArea'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.textarea',
    /*
     * @constructor
     */
    constructor: function(){
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

      me.addEvents('change', 'key');
      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();
    },
    fieldCls: FIELD_CLS + ' ' + FIELD_TEXTAREA_CLS,
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
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '</div>',
      '<div class="' + FIELD_TEXTAREA_TEXT_CLS + '">',
      '<textarea autocomplete="off" placeholder="{emptyText}" type="text" class="' + FIELD_TEXTAREA_TEXT_INPUT_CLS + '" style="{inputWidth}height:{inputHeight}px;">{value}</textarea>',
      '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     *
     */
    ons(){
      const me = this,
        el = me.el,
        input = me.el.getByTag('textarea');

      me.input = input;
      input.on('blur', me.onBlur, me);
      input.on('focus', me.onFocus, me);
      input.on('input', me.onInput, me);
      input.on('keydown', me.onKeyDown, me);
      me.on('key', me.onKey, me);

      if (me.autoHeight) {
        input.on('input', me.onChange, me);
      }

      input.on('mousedown', function(e){
        if(me.disabled){
          e.preventDefault();
        }
      });

      el.on('mouseenter', me.onMouseOver, me);
      el.on('mouseleave', me.onMouseOut, me);

      if (me.tip) {
        el.on('mousemove', me.onMouseMove, me);
      }
    },
    /*
     *
     */
    preRender(){
      const me = this;

      if (me.tpl) {
        me.tpl = new F.Template(me.tpl);
      }

      me.initHeight();
      me.calcSize();
    },
    /*
     *
     */
    initHeight(){
      let me = this,
        height;

      if (me.height){
        height = me.height;
        if (me.maxHeight < me.height){
          //me.maxHeight = me.height;
          setTimeout(() => {
            me.input.css({
              'overflow-y': 'scroll'
            });
          }, 1);
        }
      }
      else if (me.value) {
        let length = me.value.match(/\n/g);

        if (length){
          length = length.length;
        }
        else {
          length = 1;
        }

        height = length * me.lineHeight;
      }
      else {
        height = me.height;
      }

      if (height < me.minHeight) {
        //height = me.minHeight;
      }
      else if (height > me.maxHeight) {
        //height = me.maxHeight;
        setTimeout(() => {
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
    calcSize(){
      let me = this,
        inputWidth,
        padding = me.padding,
        value,
        value1,
        value2,
        value3;

      if (F.isString(padding)) {
        padding = padding.replace(/px/g, '');
        padding = padding.split(' ');
        switch (padding.length){
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
      else if (F.isNumber(padding)){
        padding = [padding, padding, padding, padding];
      }
      else if (padding === false){
        padding = [0, 0, 0, 0];
      }

      if (me.labelAlign === 'top'){
        me.inputHeight -= 40;
      }

      inputWidth = me.width;

      if (me.labelAlign !== 'top' && me.label){
        inputWidth -= me.labelWidth;
      }

      if (me.height === me.inputHeight && me.padding !== false){
        me.inputHeight -= padding[0] + padding[2];
      }

      me.inputWidth = inputWidth - padding[1] - padding[3];
      me.height = me.inputHeight + padding[0] + padding[2];
    },
    /*
     *
     */
    onChange(){
      let me = this,
        value = me.input.dom.value,
        input = me.el.getByTag('textarea'),
        height = value.match(/\n/g).length * me.lineHeight;

      if (height < me.minHeight) {
        height = me.minHeight;
        input.css({
          'overflow-y': 'hidden'
        });
      }
      else if (height > me.maxHeight) {
        height = me.maxHeight;
        input.css({
          'overflow-y': 'scroll'
        });
      }
      else {
        input.css({
          'overflow-y': 'hidden'
        });
      }

      me.height = height;
    }
  });

})();
