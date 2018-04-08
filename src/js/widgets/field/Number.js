/*
 * @class Fancy.NumberField
 * @extends Fancy.Widget
 */
(function() {
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = Fancy.CLEARFIX_CLS;
  var FIELD_CLS = Fancy.FIELD_CLS;
  var FIELD_LABEL_CLS = Fancy.FIELD_LABEL_CLS;
  var FIELD_ERROR_CLS = Fancy.FIELD_ERROR_CLS;
  var FIELD_TEXT_CLS = Fancy.FIELD_TEXT_CLS;
  var FIELD_TEXT_INPUT_CLS = Fancy.FIELD_TEXT_INPUT_CLS;
  var FIELD_SPIN_CLS = Fancy.FIELD_SPIN_CLS;
  var FIELD_SPIN_UP_CLS = Fancy.FIELD_SPIN_UP_CLS;
  var FIELD_SPIN_DOWN_CLS = Fancy.FIELD_SPIN_DOWN_CLS;

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
    constructor: function (config) {
      Fancy.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key', 'empty');

      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      me.initSpin();
    },
    fieldCls: FIELD_CLS,
    value: '',
    width: 100,
    emptyText: '',
    step: 1,
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '<input placeholder="{emptyText}" class="'+FIELD_TEXT_INPUT_CLS+'" style="{inputWidth}" value="{value}">',
      '<div class="'+FIELD_SPIN_CLS+'">',
      '<div class="'+FIELD_SPIN_UP_CLS+'"></div>',
      '<div class="'+FIELD_SPIN_DOWN_CLS+'"></div>',
      '</div>',
      '<div class="'+FIELD_ERROR_CLS+'" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    onInput: function () {
      var me = this,
        input = me.input,
        value = me.get(),
        oldValue = me.acceptedValue;

      if (me.isValid()) {
        var _value = input.dom.value,
          _newValue = '',
          i = 0,
          iL = _value.length;

        for (; i < iL; i++) {
          switch (_value[i]) {
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

        if (!isNaN(Number(_newValue))) {
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
    isNumber: function (value) {
      if (value === '' || value === '-') {
        return true;
      }

      return Fancy.isNumber(+value);
    },
    /*
     * @param {Number|String} value
     * @return {Boolean}
     */
    checkMinMax: function (value) {
      var me = this;

      if (value === '' || value === '-') {
        return true;
      }

      value = +value;

      return value >= me.min && value <= me.max;
    },
    /*
     * @param {Number} value
     */
    setMin: function (value) {
      this.min = value;
    },
    /*
     * @param {Number} value
     */
    setMax: function (value) {
      this.max = value;
    },
    /*
     *
     */
    initSpin: function () {
      var me = this;

      if (me.spin !== true) {
        return;
      }

      me.el.select('.' + FIELD_SPIN_CLS).css('display', 'block');

      me.el.select('.' + FIELD_SPIN_UP_CLS).on('mousedown', me.onMouseDownSpinUp, me);
      me.el.select('.' + FIELD_SPIN_DOWN_CLS).on('mousedown', me.onMouseDownSpinDown, me);
    },
    /*
     * @param {Object} e
     */
    onMouseDownSpinUp: function (e) {
      var me = this,
        docEl = Fancy.get(document),
        timeInterval = 700,
        time = new Date();

      if(me.disabled){
        return;
      }

      e.preventDefault();

      me.mouseDownSpinUp = true;

      me.spinUp();

      me.spinInterval = setInterval(function () {
        me.mouseDownSpinUp = false;
        if (new Date() - time > timeInterval) {
          if (timeInterval === 700) {
            timeInterval = 150;
          }

          time = new Date();
          me.spinUp();
          timeInterval--;
          if (timeInterval < 20) {
            timeInterval = 20;
          }
        }
      }, 20);

      docEl.once('mouseup', function () {
        clearInterval(me.spinInterval);
      });

      me.focus();
    },
    /*
     * @param {Object} e
     */
    onMouseDownSpinDown: function (e) {
      var me = this,
        docEl = Fancy.get(document),
        timeInterval = 700,
        time = new Date();

      if(me.disabled){
        return;
      }

      e.preventDefault();

      me.mouseDownSpinDown = true;

      me.spinDown();

      me.spinInterval = setInterval(function () {
        me.mouseDownSpinDown = false;

        if (new Date() - time > timeInterval) {
          if (timeInterval === 700) {
            timeInterval = 150;
          }

          time = new Date();
          me.spinDown();
          timeInterval--;
          if (timeInterval < 20) {
            timeInterval = 20;
          }
        }
      }, 20);

      docEl.once('mouseup', function () {
        clearInterval(me.spinInterval);
      });

      me.focus();
    },
    /*
     *
     */
    spinUp: function () {
      var me = this,
        newValue = +me.get() + me.step;

      if (Fancy.Number.isFloat(me.step)) {
        newValue = Fancy.Number.correctFloat(newValue);
      }

      if (isNaN(newValue)) {
        newValue = me.min || 0;
      }

      if (me.max !== undefined && newValue > me.max) {
        newValue = me.max;
      }
      else if (newValue < me.min) {
        newValue = me.min;
      }

      me.set(newValue);
    },
    /*
     *
     */
    spinDown: function () {
      var me = this,
        newValue = +me.get() - me.step;

      if (Fancy.Number.isFloat(me.step)) {
        newValue = Fancy.Number.correctFloat(newValue);
      }

      if (isNaN(newValue)) {
        newValue = me.min || 0;
      }

      if (me.min !== undefined && newValue < me.min) {
        newValue = me.min;
      }
      else if (newValue > me.max) {
        newValue = me.max;
      }

      me.set(newValue);
    }
  });

})();