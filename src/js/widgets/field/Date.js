/*
 * @class Fancy.DateField
 * @extends Fancy.Widget
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var CLEARFIX_CLS = F.CLEARFIX_CLS;
  var FIELD_CLS = F.FIELD_CLS;
  var FIELD_LABEL_CLS = F.FIELD_LABEL_CLS;
  var FIELD_TEXT_CLS = F.FIELD_TEXT_CLS;
  var FIELD_ERROR_CLS = F.FIELD_ERROR_CLS;
  var FIELD_TEXT_INPUT_CLS = F.FIELD_TEXT_INPUT_CLS;

  F.define(['Fancy.form.field.Date', 'Fancy.DateField'], {
    mixins: [
      F.form.field.Mixin
    ],
    extend: F.Widget,
    type: 'field.date',
    picker: true,
    i18n: 'en',
    theme: 'default',
    fieldCls: FIELD_CLS,
    value: '',
    width: 100,
    emptyText: '',
    tpl: [
      '<div class="' + FIELD_LABEL_CLS + '" style="{labelWidth}{labelDisplay}">',
        '{label}',
      '</div>',
      '<div class="' + FIELD_TEXT_CLS + '">',
        '<input placeholder="{emptyText}" class="' + FIELD_TEXT_INPUT_CLS + '" style="{inputWidth}" value="{value}">',
        '<div class="fancy-field-picker-button"></div>',
        '<div class="' + FIELD_ERROR_CLS + '" style="{errorTextStyle}"></div>',
      '</div>',
      '<div class="' + CLEARFIX_CLS + '"></div>'
    ],
    /*
     * @constructor
     * @param {Object} config
     */
    constructor: function (config) {
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.addEvents('focus', 'blur', 'input', 'enter', 'up', 'down', 'tab', 'change', 'key', 'showpicker');

      me.initFormat();
      me.Super('init', arguments);

      me.preRender();
      me.render();

      me.ons();

      if (me.hidden) {
        me.css('display', 'none');
      }

      if (me.style) {
        me.css(me.style);
      }

      if (!F.isDate(me.value)) {
        me.initDate();
      }
      else{
        me.date = me.value;
      }

      me.changeInputValue();
      me.initPicker();
    },
    /*
     * @param {String} value
     * @param {String} format
     */
    initDate: function (value, format) {
      var me = this;

      if (value) {
        if (F.typeOf(value) === 'date') {
          me.date = value;
          return;
        }

        var date;
        if (format) {
          date = F.Date.parse(value, format, me.format.mode);
        }
        else {
          date = F.Date.parse(value, me.format.read, me.format.mode);
        }

        if (date.toString === 'Invalid Date') {
          date = F.Date.parse(value, me.format.edit, me.format.mode);
        }

        if (date.toString === 'Invalid Date') {
          return;
        }

        me.date = date;
        return;
      }

      switch (F.typeOf(value)) {
        case 'date':
          me.date = me.value;
          break;
        case 'undefined':
        case 'string':
          if (!me.value) {
            delete me.date;
            return;
          }
          me.date = F.Date.parse(me.value, me.format.read, me.format.mode);
          break;
      }
    },
    /*
     *
     */
    changeInputValue: function () {
      var me = this;

      if (F.typeOf(me.date) !== 'date' || me.date.toString() === 'Invalid Date') {
        me.input.dom.value = '';
        return;
      }

      var value = F.Date.format(me.date, me.format.edit, undefined, me.format.mode);

      if (me.format && me.format.inputFn) {
        value = me.format.inputFn(value);
      }

      if (value === undefined) {
        value = '';
      }

      me.input.dom.value = value;

      me.fire('change', value);
    },
    /*
     *
     */
    initFormat: function () {
      var me = this;

      if (me.format) {
        if (F.isObject(me.format)) {
          F.applyIf(me.format, F.i18n[me.i18n].date);
        }
      }
      else {
        me.format = F.i18n[me.i18n].date;
      }
    },
    /*
     * @param {*} value
     */
    formatValue: function (value) {
      var me = this;

      if (!me.value && value) {
        me.value = value;
      }
      else if (!value && me.value) {
        value = me.value;
      }

      if (!me.value){}
      else if (F.typeOf(me.value) === 'date') {
        me.value = F.Date.format(me.value, me.format.read, undefined, me.format.mode);
        if (value === undefined) {
          var _date = F.Date.parse(me.value, me.format.edit, me.format.mode);
          value = F.Date.format(_date, me.format.edit, undefined, me.format.mode);
        }
        me.acceptedValue = value;
      }
      else {
        var date = F.Date.parse(me.value, me.format.read, me.format.mode);
        me.value = F.Date.format(date, me.format.edit, undefined, me.format.mode);
      }

      if (me.format && me.format.inputFn) {
        value = me.format.inputFn(value);
      }

      if (value === undefined) {
        value = '';
      }

      if (/NaN/.test(value)) {
        value = '';
      }

      me.input.dom.value = value;
    },
    /*
     *
     */
    ons: function () {
      var me = this,
        input = me.el.getByTag('input');

      me.input = input;
      input.on('blur', me.onBlur, me);
      input.on('focus', me.onFocus, me);
      input.on('input', me.onInput, me);
      input.on('keydown', me.onKeyDown, me);
      me.on('key', me.onKey, me);
      me.on('enter', me.onEnter, me);

      me.on('beforehide', me.onBeforeHide, me);

      if (me.format && me.format.inputFn) {
        me.on('key', me.onKeyInputFn);
      }
    },
    /*
     *
     */
    initPicker: function () {
      var me = this;

      if (me.picker === false || me.editable === false) {
        return;
      }

      if (me.dateImage === false) {
        me.el.select('.fancy-field-picker-button').css('display', 'none');
        me.input.on('click', me.onInputClick, me);
      }
      else {
        me.pickerButton = me.el.select('.fancy-field-picker-button');
        me.pickerButton.on('mousedown', me.onPickerButtonMouseDown, me);
        me.input.on('mousedown', me.onInputMouseDown, me);
      }
    },
    /*
     *
     */
    onInputClick: function (e) {
      e.preventDefault();
      this.toggleShowPicker();
    },
    /*
     *
     */
    onInputMouseDown: function (e) {
      var me = this,
        picker = me.picker;

      if(picker && picker.el && picker.el.css('display') !== 'none'){
        e.stopPropagation()
      }
    },
    /*
     * @param {Object} e
     */
    onPickerButtonMouseDown: function (e) {
      var me = this;

      if(me.disabled){
        return;
      }

      e.preventDefault();
      me.toggleShowPicker();
    },
    /*
     *
     */
    showPicker: function () {
      var me = this,
        el = me.el,
        input = me.input,
        docEl = F.get(document),
        firstShow = false;

      if (me.picker === true) {
        firstShow = true;
        me.renderPicker();
      }
      else{
        if(me.picker.monthPicker){
          me.picker.monthPicker.hide();
          me.picker.monthPicker.panel.css('top', '-300px');
        }
      }

      var offset = input.offset(),
        x = offset.left,
        y = offset.top + el.select('.' + FIELD_TEXT_CLS).height(),
        date = me.date || new Date();

      if (date.toString() === 'Invalid Date') {
        date = new Date();
      }

      me.picker.setDate(date, firstShow);

      F.datepicker.Manager.add(me.picker);

      me.picker.showAt(x, y);

      me.fire('showpicker');

      if (!me.docSpy) {
        me.docSpy = true;
        docEl.on('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    onDocClick: function (e) {
      var me = this,
        datePicker = me.picker,
        monthPicker = datePicker.monthPicker,
        target = e.target;

      if (target.tagName.toLocaleLowerCase() === 'input') {}
      else if (F.get(target).hasCls('fancy-field-picker-button')) {}
      else if (datePicker.panel.el.within(target)) {}
      else if (monthPicker && monthPicker.panel.el.within(target)) {}
      else {
        me.hidePicker();
      }
    },
    /*
     *
     */
    hidePicker: function () {
      var me = this;

      if (me.picker !== false && me.picker.hide) {
        me.picker.hide();
      }

      if (me.docSpy) {
        var docEl = F.get(document);
        me.docSpy = false;
        docEl.un('click', me.onDocClick, me);
      }
    },
    /*
     *
     */
    toggleShowPicker: function () {
      var me = this;

      if (me.picker === true) {
        me.showPicker();
        return;
      }

      if (me.picker.panel.el.css('display') === 'none') {
        me.showPicker();
      }
      else {
        me.hidePicker();
      }
    },
    /*
     *
     */
    renderPicker: function () {
      var me = this;

      if (!F.fullBuilt && !F.modules['grid'] && F.MODULELOAD !== false && F.MODULESLOAD !== false) {
        return;
      }

      me.picker = new F.DatePicker({
        window: true,
        date: me.date,
        format: me.format,
        theme: me.theme,
        minValue: me.min,
        maxValue: me.max,
        i18n: me.i18n,
        events: [{
          changedate: me.onPickerChangeDate,
          scope: me
        }]
      });
    },
    /*
     * @return {String}
     */
    get: function () {
      var me = this;

      if (me.input.dom.value === '') {
        delete me.date;
        delete me.value;

        return '';
      }

      if (me.date) {
        return F.Date.format(me.date, me.format.write, undefined, me.format.mode);
      }
      else {
        return '';
      }
    },
    /*
     * @return {Date}
     */
    getDate: function () {
      return this.date || '';
    },
    /*
     *
     */
    onBeforeHide: function () {
      this.hidePicker();
    },
    /*
     * @param {Object} picker
     * @param {Date} newDate
     * @param {Boolean} hidePicker
     */
    onPickerChangeDate: function (picker, newDate, hidePicker) {
      var me = this;

      if (hidePicker !== false) {
        me.picker.hide();
      }

      me.initDate(newDate);
      me.changeInputValue();
    },
    /*
     *
     */
    onInput: function () {
      var me = this,
        input = me.input,
        value = input.dom.value,
        oldValue = me.acceptedValue;

      if (F.Date.parse(value, me.format.edit, me.format.mode).toString() === 'Invalid Date') {
        return;
      }

      me.initDate(value, me.format.edit);

      me.fire('input', value);
      me.fire('change', value, oldValue);
    },
    /*
     * @return {Boolean}
     */
    isValid: function () {
      var me = this;

      return F.Date.parse(me.get(), me.format.edit, me.format.mode).toString() !== 'Invalid Date';
    },
    /*
     * @param {String|Date|Number} value
     */
    set: function (value) {
      var me = this;

      switch (value) {
        case '':
        case undefined:
          delete me.value;
          delete me.date;
          me.changeInputValue();
          return;
      }

      me.initDate(value);
      me.changeInputValue();
    },
    /*
     * @param {*} oldValue
     * @return {Boolean}
     */
    isEqual: function (oldValue) {
      var me = this,
        oldDate = F.Date.parse(oldValue, me.format.read, me.format.mode),
        value = me.input.dom.value;

      oldValue = F.Date.format(oldDate, me.format.edit, undefined, me.format.mode);

      return oldValue === value;
    },
    onEnter: function () {
      var me = this,
        input = me.input,
        value = input.dom.value,
        oldValue = me.acceptedValue;

      if (value === '') {
        me.initDate();

        me.fire('input', value);
        me.fire('change', value, oldValue);
      }
    }
  });

})();