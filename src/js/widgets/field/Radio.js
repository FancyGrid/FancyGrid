/*
 * @class Fancy.Radio
 * @extends Fancy.Widget
 */
Fancy.define(['Fancy.form.field.Radio', 'Fancy.Radio'], {
  mixins: [
    Fancy.form.field.Mixin
  ],
  extend: Fancy.Widget,
  type: 'field.radio',
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

    me.addEvents('focus', 'blur', 'input', 'up', 'down', 'change', 'key');
    me.Super('init', arguments);

    var itemsHTML = '',
      items = me.items,
      i = 0,
      iL = items.length;

    if( me.column ){
      me.cls += ' fancy-field-radio-column';
      itemsHTML += '<div style="margin-left: '+ ( me.labelWidth )+'px;">';
    }

    for(;i<iL;i++){
      var item = items[i],
        marginLeft = '',
        itemCls = 'fancy-field-text';

      if( !me.column && i !== 0 ){
        marginLeft = 'margin-left:10px;';
      }

      if( item.value === me.value ){
        itemCls += ' fancy-field-radio-on';
      }

      itemsHTML += [
        '<div class="'+itemCls+'" value='+item.value+'>',
          '<div class="fancy-field-radio-input" style="float:left;'+marginLeft+'"></div>',
          '<div style="float:left;margin:7px 0px 0px 0px;">'+item.text+'</div>',
        '</div>'
      ].join("");
    }

    if( me.column ){
      itemsHTML += '</div>';
    }

    me.itemsHTML = itemsHTML;

    me.preRender();
    me.render();
    me.acceptedValue = me.value;
    me.set(me.value);

    me.ons();
  },
  labelText: '',
  labelWidth: 60,
  value: false,
  checkedCls: 'fancy-field-radio-on',
  fieldCls: 'fancy fancy-field fancy-field-radio',
  tpl: [
    '<div class="fancy-field-label" style="{labelWidth}{labelDisplay}">',
      '{label}',
      '<div class="fancy-field-error" style="{errorTextStyle}"></div>',
    '</div>',
    '{itemsHTML}',
    '<div class="fancy-clearfix"></div>'
  ],
  /*
   *
   */
  ons: function(){
    var me = this,
      el = me.el;

    el.$dom.delegate('.fancy-field-text', 'click', function(){
      me.set(Fancy.get(this).attr('value'));
    });

    el.on('mousedown', me.onMouseDown, me);
  },
  /*
   *
   */
  onClick: function(){
    var me = this,
      checkedCls = me.checkedCls;

    me.addClass(checkedCls);
    me.toggleClass(checkedCls);

    me.value = me.hasClass(checkedCls);

    me.fire('change', me.value);
  },
  /*
   *
   */
  onMouseDown: function(e){

    e.preventDefault();
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  set: function(value, fire){
    var me = this,
      el = me.el,
      checkedCls = me.checkedCls,
      radioEls = el.select('.fancy-field-text');

    radioEls.removeClass(checkedCls);

    el.select('[value='+value+']').addClass(checkedCls);

    me.value = value;
    if(fire !== false){
      me.fire('change', me.value);
    }
  },
  /*
   * @param {*} value
   * @param {Boolean} onInput
   */
  setValue: function(value, onInput){
    this.set(value, onInput);
  },
  /*
   * @return {*} value
   */
  getValue: function(){
    var me = this;

    return me.value;
  },
  /*
   * @return {*} value
   */
  get: function(){

    return this.getValue();
  },
  /*
   *
   */
  clear: function(){
    this.set(false);
  }
});