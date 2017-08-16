/*
 * @class Fancy.DateRangeField
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.DateRange', 'Fancy.DateRangeField'], {
  extend: Fancy.Widget,
  type: 'field.daterange',
  picker: true,
  format: 'm/d/Y',
  dateImage: true,
  theme: 'default',
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

    me.addEvents('changedatefrom', 'changedateto', 'change');

    me.preRender();
    me.render();
    me.initDateFields();
  },
  fieldCls: 'fancy fancy-date-range',
  width: 100,
  /*
   *
   */
  render: function(){
    var me = this,
      renderTo = me.renderTo || document.body,
      el = Fancy.get( document.createElement('div') );

    el.addClass(me.cls);

    me.el = Fancy.get(Fancy.get(renderTo).dom.appendChild(el.dom));
  },
  /*
   *
   */
  preRender: function(){},
  /*
   *
   */
  initDateFields: function(){
    var me = this,
      theme = me.theme;

    me.dateField1 = new Fancy.DateField({
      renderTo: me.el.dom,
      label: false,
      dateImage: me.dateImage,
      width: me.width/2,
      padding: false,
      theme: theme,
      style: {
        position: 'absolute',
        bottom: '2px',
        left: '3px'
      },
      format: me.format,
      events: [{
        showpicker: me.onShowPicker1,
        scope: me
      },{
        change: me.onChangeDate1,
        scope: me
      }, {
        focus: me.onFocus1,
        scope: me
      },{
        enter: me.onEnter,
        scope: me
      }]
    });

    me.dateField1.setInputSize({
      width: me.width/2
    });

    me.dateField2 = new Fancy.DateField({
      renderTo: me.el.dom,
      label: false,
      dateImage: me.dateImage,
      width: me.width/2,
      padding: false,
      theme: theme,
      style: {
        position: 'absolute',
        bottom: '2px',
        right: '2px'
      },
      format: me.format,
      events: [{
        showpicker: me.onShowPicker2,
        scope: me
      }, {
        change: me.onChangeDate2,
        scope: me
      },{
        focus: me.onFocus2,
        scope: me
      },{
        keydown: me.onEnter,
        scope: me
      }]
    });

    me.dateField2.setInputSize({
      width: me.width/2
    });

  },
  /*
   *
   */
  onFocus1: function(){
    var me = this;

    me.dateField2.hidePicker();
  },
  /*
   *
   */
  onFocus2: function(){
    var me = this;

    me.dateField1.hidePicker();
  },
  /*
   *
   */
  onShowPicker1: function(){
    var me = this;

    me.dateField2.hidePicker();
  },
  /*
   *
   */
  onShowPicker2: function(){
    var me = this;

    me.dateField1.hidePicker();
  },
  /*
   * @param {Object} field
   * @param {Date} date
   */
  onChangeDate1: function(field, date){
    var me = this,
      date = Fancy.Date.parse(date, field.format.edit, field.format.mode);

    me.fire('changedatefrom', date);
    me.fire('change');
  },
  /*
   * @param {Object} field
   * @param {Date} date
   */
  onChangeDate2: function(field, date){
    var me = this,
      date = Fancy.Date.parse(date, field.format.edit, field.format.mode);

    me.fire('changedateto', date);
    me.fire('change');
  },
  /*
   *
   */
  onEnter: function(){
    var me = this;

    me.dateField1.hidePicker();
    me.dateField2.hidePicker();
  }
});