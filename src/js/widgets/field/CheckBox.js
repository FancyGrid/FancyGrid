/*
 * @class Fancy.CheckBox
 * @extends Fancy.Widget
 */
(function() {
  /*
   * CONSTANTS
   */
  var CLEARFIX_CLS = Fancy.CLEARFIX_CLS;
  var FIELD_CLS = Fancy.FIELD_CLS;
  var FIELD_LABEL_CLS = Fancy.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = Fancy.FIELD_TEXT_CLS;
  var FIELD_CHECKBOX_CLS = Fancy.FIELD_CHECKBOX_CLS;
  var FIELD_CHECKBOX_INPUT_CLS = Fancy.FIELD_CHECKBOX_INPUT_CLS;
  var FIELD_CHECKBOX_DISABLED_CLS = Fancy.FIELD_CHECKBOX_DISABLED_CLS;
  var FIELD_INPUT_LABEL_CLS =  Fancy.FIELD_INPUT_LABEL_CLS;
  var FIELD_CHECKBOX_ON_CLS = Fancy.FIELD_CHECKBOX_ON_CLS;

  Fancy.define(['Fancy.form.field.CheckBox', 'Fancy.CheckBox'], {
    mixins: [
      Fancy.form.field.Mixin
    ],
    extend: Fancy.Widget,
    type: 'field.checkbox',
    disabled: false,
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      Fancy.applyConfig(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents(
        'focus', 'blur', 'input',
        'up', 'down',
        'beforechange', 'change',
        'key'
      );

      me.Super('init', arguments);

      me.preRender();
      me.render({
        labelWidth: me.labelWidth,
        labelDispay: me.labelText ? '' : 'none',
        label: me.label
      });

      if (me.expander) {
        me.addCls('fancy-checkbox-expander');
      }

      if(me.disabled){
        me.addCls(FIELD_CHECKBOX_DISABLED_CLS);
      }

      me.acceptedValue = me.value;
      me.set(me.value, false);

      me.ons();
    },
    labelText: '',
    labelWidth: 60,
    value: false,
    editable: true,
    stopIfCTRL: false,
    checkedCls: FIELD_CHECKBOX_ON_CLS,
    fieldCls: FIELD_CLS + ' ' + FIELD_CHECKBOX_CLS,
    tpl: [
      '<div class="'+FIELD_LABEL_CLS+'" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="'+FIELD_TEXT_CLS+'">',
      '<div class="'+FIELD_CHECKBOX_INPUT_CLS+'"></div>',
      '</div>',
      '<div class="'+FIELD_INPUT_LABEL_CLS+'" style="{inputLabelDisplay}">',
        '{inputLabel}',
      '</div>',
      '<div class="'+CLEARFIX_CLS+'"></div>'
    ],
    /*
     *
     */
    ons: function () {
      var me = this,
        el = me.el;

      el.on('click', me.onClick, me);
      el.on('mousedown', me.onMouseDown, me);
    },
    /*
     * @param {Object} e
     */
    onClick: function (e) {
      var me = this,
        el = me.el;

      me.fire('beforechange');

      if (e.ctrlKey && me.stopIfCTRL) {
        return
      }

      if (me.editable === false) {
        return;
      }

      if (me.canceledChange === true) {
        me.canceledChange = true;
        return;
      }

      el.toggleCls(me.checkedCls);
      var oldValue = me.value;
      me.value = el.hasCls(me.checkedCls);
      me.fire('change', me.value, oldValue);
    },
    /*
     * @params {Object} e
     */
    onMouseDown: function (e) {

      e.preventDefault();
    },
    /*
     * @params {*} value
     * @params {Boolean} fire
     */
    set: function (value, fire) {
      var me = this,
        el = me.el;

      if (value === '') {
        value = false;
      }

      if (value === true || value === 1) {
        el.addCls(me.checkedCls);
        value = true;
      }
      else if (value === false || value === 0) {
        el.removeClass(me.checkedCls);
        value = false;
      }
      else if (value === undefined) {
        value = false;
      }
      else {
        throw new Error('not right value for checkbox ' + value);
      }

      me.value = value;
      if (fire !== false) {
        me.fire('change', me.value);
      }
    },
    /*
     * @params {*} value
     * @params {Boolean} onInput
     */
    setValue: function (value, onInput) {
      this.set(value, onInput);
    },
    /*
     * @return {*}
     */
    getValue: function () {
      return this.value;
    },
    /*
     * @return {*}
     */
    get: function () {
      return this.getValue();
    },
    /*
     *
     */
    clear: function () {
      this.set(false);
    },
    /*
     *
     */
    toggle: function () {
      this.set(!this.value);
    },
    /*
     *
     */
    enable: function () {
      var me = this;

      me.disabled = false;
      me.removeCls(FIELD_CHECKBOX_DISABLED_CLS);
    },
    /*
     *
     */
    disable: function () {
      var me = this;

      me.disabled = true;
      me.addCls(FIELD_CHECKBOX_DISABLED_CLS);
    },
  });

})();