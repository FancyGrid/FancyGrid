/*
 * @class Fancy.NumberField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Number', 'Fancy.NumberField'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.number',
  allowBlank: true,
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

    me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key');

    me.Super('init', arguments);

    me.preRender();
    me.render();

    me.ons();

    if( me.hidden ){
      me.css('display', 'none');
    }

    me.initSpin();
  },
  fieldCls: Fancy.fieldCls,
  value: '',
  width: 100,
  emptyText: '',
  step: 1,
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
    '</div>',
    '<div class="fancy-field-text">',
      '<input placeholder="{emptyText}" class="fancy-field-text-input" style="{inputWidth}" value="{value}">',
      '<div class="fancy-field-spin">',
        '<div class="fancy-field-spin-up"></div>',
        '<div class="fancy-field-spin-down"></div>',
      '</div>',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  onInput: function(){
    var me = this,
      input = me.input,
      value = me.get(),
      oldValue = me.acceptedValue;

    if(me.isValid()){
      var _value = input.dom.value,
        _newValue = '',
        i = 0,
        iL = _value.length;

      for(;i<iL;i++){
        switch(_value[i]){
          case '0':
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
          case '-':
          case '+':
          case '.':
            _newValue += _value[i];
            break;
        }
      }

      if(!isNaN(Number(_newValue))){
        me.value = _newValue;
        value = _newValue;
      }
    }

    me.acceptedValue = Number(me.get());
    me.fire('input', value);
    me.fire('change', Number(value), Number(oldValue));
  },
  /*
   * @param {String} value
   * @return {Boolean}
   */
  isNumber: function(value){
    if(value === '' || value === '-'){
      return true;
    }

    return Fancy.isNumber(+value);
  },
  /*
   * @param {Number|String} value
   * @return {Boolean}
   */
  checkMinMax: function(value){
    var me = this;

    if(value === '' || value === '-'){
      return true;
    }

    value = +value;

    return value >= me.min && value <= me.max;
  },
  /*
   * @param {Number} value
   */
  setMin: function(value){
    var me = this;

    me.min = value;
  },
  /*
   * @param {Number} value
   */
  setMax: function(value){
    var me = this;

    me.max = value;
  },
  /*
   *
   */
  initSpin: function(){
    var me = this;

    if(me.spin !== true){
      return;
    }

    me.el.select('.fancy-field-spin').css('display', 'block');

    me.el.select('.fancy-field-spin-up').on('mousedown', me.onMouseDownSpinUp, me);
    me.el.select('.fancy-field-spin-down').on('mousedown', me.onMouseDownSpinDown, me);
  },
  /*
   * @param {Object} e
   */
  onMouseDownSpinUp: function(e){
    var me = this,
      docEl = Fancy.get(document),
      timeInterval = 700,
      time = new Date();

    e.preventDefault();

    me.mouseDownSpinUp = true;

    me.spinUp();

    me.spinInterval = setInterval(function(){
      me.mouseDownSpinUp = false;
      if(new Date() - time > timeInterval){
        if(timeInterval === 700){
          timeInterval = 150;
        }

        time = new Date();
        me.spinUp();
        timeInterval--;
        if(timeInterval < 20){
          timeInterval = 20;
        }
      }
    }, 20);

    docEl.once('mouseup', function(){
      clearInterval(me.spinInterval);
    });
  },
  /*
   * @param {Object} e
   */
  onMouseDownSpinDown: function(e){
    var me = this,
      docEl = Fancy.get(document),
      timeInterval = 700,
      time = new Date();

    e.preventDefault();

    me.mouseDownSpinDown = true;

    me.spinDown();

    me.spinInterval = setInterval(function(){
      me.mouseDownSpinDown = false;

      if(new Date() - time > timeInterval){
        if(timeInterval === 700){
          timeInterval = 150;
        }

        time = new Date();
        me.spinDown();
        timeInterval--;
        if(timeInterval < 20){
          timeInterval = 20;
        }
      }
    }, 20);

    docEl.once('mouseup', function(){
      clearInterval(me.spinInterval);
    });
  },
  /*
   *
   */
  spinUp: function(){
    var me = this,
      newValue = +me.get() + me.step;

    if(Fancy.Number.isFloat(me.step)){
      newValue = Fancy.Number.correctFloat(newValue);
    }

    if( isNaN(newValue) ){
      newValue = me.min || 0;
    }

    if( me.max !== undefined && newValue > me.max ){
      newValue = me.max;
    }
    else if(newValue < me.min){
      newValue = me.min;
    }

    me.set(newValue);
  },
  /*
   *
   */
  spinDown: function(){
    var me = this,
      newValue = +me.get() - me.step;

    if(Fancy.Number.isFloat(me.step)){
      newValue = Fancy.Number.correctFloat(newValue);
    }

    if( isNaN(newValue) ){
      newValue = me.min || 0;
    }

    if( me.min !== undefined && newValue < me.min ){
      newValue = me.min;
    }
    else if(newValue > me.max){
      newValue = me.max;
    }

    me.set(newValue);
  }
});