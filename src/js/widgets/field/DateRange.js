/*
 * @class Fancy.DateRangeField
 * @extends Fancy.Widget
 */
(function(){
  //SHORTCUTS
  const F = Fancy;

  F.define(['Fancy.form.field.DateRange', 'Fancy.DateRangeField'], {
    extend: F.Widget,
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
      F.apply(this, config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init(){
      const me = this;

      me.addEvents('changedatefrom', 'changedateto', 'change');

      me.preRender();
      me.render();
      me.initDateFields();
    },
    //Can not find where it is used. Maybe to remove
    fieldCls: F.cls + ' fancy-date-range',
    width: 100,
    /*
     *
     */
    render(){
      const me = this,
        renderTo = me.renderTo || document.body,
        el = F.newEl('div');

      el.addCls(me.cls);

      me.el = F.get(F.get(renderTo).dom.appendChild(el.dom));
    },
    /*
     *
     */
    preRender(){},
    /*
     *
     */
    initDateFields(){
      var me = this,
        theme = me.theme,
        value1,
        value2;

      if(F.isArray(me.value)){
        value1 = new Date(Number(me.value[0]));
        value2 = new Date(Number(me.value[1]));
      }

      me.dateField1 = new F.DateField({
        renderTo: me.el.dom,
        label: false,
        dateImage: me.dateImage,
        width: me.width / 2,
        padding: false,
        theme: theme,
        value: value1,
        style: {
          position: 'absolute',
          bottom: '3px',
          left: '3px'
        },
        format: me.format,
        events: [{
          showpicker: me.onShowPicker1,
          scope: me
        }, {
          change: me.onChangeDate1,
          delay: 1,
          scope: me
        },{
          empty: me.onChangeDate1,
          delay: 1,
          scope: me
        }, {
          focus: me.onFocus1,
          scope: me
        }, {
          enter: me.onEnter,
          scope: me
        }]
      });

      me.dateField1.setInputSize({
        width: me.width / 2
      });

      me.dateField2 = new F.DateField({
        renderTo: me.el.dom,
        label: false,
        dateImage: me.dateImage,
        width: me.width / 2,
        padding: false,
        theme: theme,
        value: value2,
        style: {
          position: 'absolute',
          bottom: '3px',
          right: '2px'
        },
        format: me.format,
        events: [{
          showpicker: me.onShowPicker2,
          scope: me
        }, {
          change: me.onChangeDate2,
          scope: me,
          delay: 1
        },{
          empty: me.onChangeDate2,
          scope: me,
          delay: 1
        }, {
          focus: me.onFocus2,
          scope: me
        }, {
          keydown: me.onEnter,
          scope: me
        }]
      });

      me.dateField2.setInputSize({
        width: me.width / 2
      });

    },
    /*
     *
     */
    onFocus1(){
      this.dateField2.hidePicker();
    },
    /*
     *
     */
    onFocus2(){
      this.dateField1.hidePicker();
    },
    /*
     *
     */
    onShowPicker1(){
      this.dateField2.hidePicker();
    },
    /*
     *
     */
    onShowPicker2(){
      this.dateField1.hidePicker();
    },
    /*
     * @param {Object} field
     * @param {Date} date
     */
    onChangeDate1(field, date){
      const me = this;

      if (date) {
        date = F.Date.parse(date, field.format.edit, field.format.mode);
      }

      me.fire('changedatefrom', date);
      me.fire('change');
    },
    /*
     * @param {Object} field
     * @param {Date} date
     */
    onChangeDate2(field, date){
      if (date === undefined) {
        date = '';
      }
      else {
        date = F.Date.parse(date, field.format.edit, field.format.mode);
      }

      this.fire('changedateto', date);
      this.fire('change');
    },
    /*
     *
     */
    onEnter(){
      this.dateField1.hidePicker();
      this.dateField2.hidePicker();
    }
  });

})();
